import { assert, expect, vi } from "vitest";
import { TauriStorage } from "../../../src/features/storage/tauriStorage";
import { test } from "../..";

const { invokeMock } = vi.hoisted(() => ({ invokeMock: vi.fn() }));

vi.mock("@tauri-apps/api/core", () => ({
	invoke: invokeMock,
}));

let storage: TauriStorage | null = null;

test.beforeEach(() => {
	invokeMock.mockReset();
	storage = new TauriStorage();
	vi.useFakeTimers();
});

test.afterEach(() => {
	vi.useRealTimers();
});

test("preload() with no saved file (first run) leaves load() returning null", async () => {
	assert(storage != null);
	invokeMock.mockResolvedValueOnce(null);

	await storage.preload();

	expect(storage.load("drive")).toBeNull();
});

test("preload() failure propagates instead of silently keeping stale data", async () => {
	assert(storage != null);
	invokeMock.mockRejectedValueOnce(new Error("decrypt failed"));

	await expect(storage.preload()).rejects.toThrow("decrypt failed");
});

test("preload() reassembles file content stored on disk back into the tree", async () => {
	assert(storage != null);

	const index = JSON.stringify({
		nam: "root",
		fls: [{ nam: "notes", ext: "txt", fsc: true }],
		_files: ["notes.txt"],
	});

	invokeMock.mockImplementation((command: string, args?: Record<string, unknown>) => {
		if (command === "load_drive") return Promise.resolve(index);
		if (command === "read_drive_file" && args?.path === "notes.txt") return Promise.resolve("hello world");
		return Promise.resolve(null);
	});

	await storage.preload();

	const loaded = JSON.parse(storage.load("drive")!) as { fls: { cnt?: string; fsc?: boolean }[]; _files?: string[] };
	expect(loaded.fls[0].cnt).toBe("hello world");
	expect(loaded.fls[0].fsc).toBeUndefined();
	expect(loaded._files).toBeUndefined();
});

test("store() makes the new value immediately readable, before the debounced write fires", () => {
	assert(storage != null);
	const value = JSON.stringify({ nam: "root", fls: [{ nam: "a", cnt: "pending" }] });

	storage.store("drive", value);

	expect(storage.load("drive")).toBe(value);
	expect(invokeMock).not.toHaveBeenCalled();
});

test("store() shreds content into per-file writes and a stripped index, debounced", async () => {
	assert(storage != null);
	invokeMock.mockResolvedValue(undefined);

	const value = JSON.stringify({
		nam: "root",
		fls: [{ nam: "notes", ext: "txt", cnt: "hello world" }],
	});

	storage.store("drive", value);
	await vi.advanceTimersByTimeAsync(TauriStorage.FLUSH_DELAY_MS);

	expect(invokeMock).toHaveBeenCalledWith("write_drive_file", { path: "notes.txt", content: "hello world" });

	const savedCall = invokeMock.mock.calls.find(([command]) => command === "save_drive");
	assert(savedCall != null);
	const savedIndex = JSON.parse((savedCall[1] as { data: string }).data) as { fls: { cnt?: string; fsc?: boolean }[]; _files: string[] };
	expect(savedIndex.fls[0].cnt).toBeUndefined();
	expect(savedIndex.fls[0].fsc).toBe(true);
	expect(savedIndex._files).toEqual(["notes.txt"]);
});

test("store() debounces writes and only persists the latest value", async () => {
	assert(storage != null);
	invokeMock.mockResolvedValue(undefined);

	storage.store("drive", JSON.stringify({ nam: "root", fls: [{ nam: "a", cnt: "first" }] }));
	storage.store("drive", JSON.stringify({ nam: "root", fls: [{ nam: "a", cnt: "second" }] }));
	storage.store("drive", JSON.stringify({ nam: "root", fls: [{ nam: "a", cnt: "third" }] }));

	await vi.advanceTimersByTimeAsync(TauriStorage.FLUSH_DELAY_MS);

	const writeCalls = invokeMock.mock.calls.filter(([command]) => command === "write_drive_file");
	expect(writeCalls).toHaveLength(1);
	expect(writeCalls[0][1]).toEqual({ path: "a", content: "third" });
});

test("flush() writes immediately instead of waiting out the debounce delay", async () => {
	assert(storage != null);
	invokeMock.mockResolvedValue(undefined);

	storage.store("drive", JSON.stringify({ nam: "root", fls: [{ nam: "a", cnt: "urgent" }] }));
	await storage.flush();

	expect(invokeMock).toHaveBeenCalledWith("write_drive_file", { path: "a", content: "urgent" });
});

test("flush() with nothing pending resolves without writing again", async () => {
	assert(storage != null);
	invokeMock.mockResolvedValue(undefined);

	storage.store("drive", JSON.stringify({ nam: "root", fls: [{ nam: "a", cnt: "value" }] }));
	await storage.flush();
	invokeMock.mockClear();

	await storage.flush();

	expect(invokeMock).not.toHaveBeenCalled();
});

test("clear() removes the index and calls clear_drive", async () => {
	assert(storage != null);
	invokeMock.mockResolvedValue(undefined);

	storage.store("drive", JSON.stringify({ nam: "root", fls: [{ nam: "a", cnt: "something" }] }));
	await storage.clear();

	expect(invokeMock).toHaveBeenCalledWith("clear_drive");
	expect(storage.load("drive")).toBeNull();
});

test("clear() cancels a pending debounced write instead of letting it overwrite the reset", async () => {
	assert(storage != null);
	invokeMock.mockResolvedValue(undefined);

	storage.store("drive", JSON.stringify({ nam: "root", fls: [{ nam: "a", cnt: "stale value" }] }));
	await storage.clear();
	invokeMock.mockClear();

	await vi.advanceTimersByTimeAsync(TauriStorage.FLUSH_DELAY_MS);

	expect(invokeMock).not.toHaveBeenCalled();
});

test("a flush() called after clear() doesn't resend the cleared value", async () => {
	assert(storage != null);
	invokeMock.mockResolvedValue(undefined);

	storage.store("drive", JSON.stringify({ nam: "root", fls: [{ nam: "a", cnt: "stale value" }] }));
	await storage.clear();
	invokeMock.mockClear();

	await storage.flush();

	expect(invokeMock).not.toHaveBeenCalled();
});

test("deletes on-disk files that are no longer present in a subsequent save", async () => {
	assert(storage != null);
	invokeMock.mockResolvedValue(undefined);

	storage.store("drive", JSON.stringify({
		nam: "root",
		fls: [{ nam: "a", cnt: "keep" }, { nam: "b", cnt: "remove me" }],
	}));
	await storage.flush();
	invokeMock.mockClear();

	storage.store("drive", JSON.stringify({
		nam: "root",
		fls: [{ nam: "a", cnt: "keep" }],
	}));
	await storage.flush();

	expect(invokeMock).toHaveBeenCalledWith("delete_drive_file", { path: "b" });
});
