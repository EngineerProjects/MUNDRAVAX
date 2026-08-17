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

test("preload() loads the encrypted blob and load() returns it decoded", async () => {
	assert(storage != null);
	invokeMock.mockResolvedValueOnce("hello");

	await storage.preload();

	expect(invokeMock).toHaveBeenCalledWith("load_drive");
	expect(storage.load("drive")).toBe("hello");
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

test("store() makes the new value immediately readable, before the debounced write fires", () => {
	assert(storage != null);

	storage.store("drive", "pending");

	expect(storage.load("drive")).toBe("pending");
	expect(invokeMock).not.toHaveBeenCalled();
});

test("store() debounces writes and only saves the latest value", async () => {
	assert(storage != null);
	invokeMock.mockResolvedValue(undefined);

	storage.store("drive", "first");
	storage.store("drive", "second");
	storage.store("drive", "third");

	await vi.advanceTimersByTimeAsync(TauriStorage.FLUSH_DELAY_MS);

	expect(invokeMock).toHaveBeenCalledTimes(1);
	expect(invokeMock).toHaveBeenCalledWith("save_drive", { data: "third" });
});

test("flush() writes immediately instead of waiting out the debounce delay", async () => {
	assert(storage != null);
	invokeMock.mockResolvedValue(undefined);

	storage.store("drive", "urgent");
	await storage.flush();

	expect(invokeMock).toHaveBeenCalledWith("save_drive", { data: "urgent" });
});

test("flush() with nothing pending resolves without writing again", async () => {
	assert(storage != null);
	invokeMock.mockResolvedValue(undefined);

	storage.store("drive", "value");
	await storage.flush();
	invokeMock.mockClear();

	await storage.flush();

	expect(invokeMock).not.toHaveBeenCalled();
});

test("clear() removes the value and calls clear_drive", async () => {
	assert(storage != null);
	invokeMock.mockResolvedValue(undefined);

	storage.store("drive", "something");
	await storage.clear();

	expect(invokeMock).toHaveBeenCalledWith("clear_drive");
	expect(storage.load("drive")).toBeNull();
});

test("clear() cancels a pending debounced write instead of letting it overwrite the reset", async () => {
	assert(storage != null);
	invokeMock.mockResolvedValue(undefined);

	storage.store("drive", "stale value");
	await storage.clear();
	invokeMock.mockClear();

	await vi.advanceTimersByTimeAsync(TauriStorage.FLUSH_DELAY_MS);

	expect(invokeMock).not.toHaveBeenCalled();
});

test("a flush() called after clear() doesn't resend the cleared value", async () => {
	assert(storage != null);
	invokeMock.mockResolvedValue(undefined);

	storage.store("drive", "stale value");
	await storage.clear();
	invokeMock.mockClear();

	await storage.flush();

	expect(invokeMock).not.toHaveBeenCalled();
});
