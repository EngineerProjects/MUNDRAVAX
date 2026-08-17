import { invoke } from "@tauri-apps/api/core";
import { Storage } from "./storage";
import { sanitizePathSegment } from "../_utils/path.utils";

interface ShredFileNode {
	nam: string;
	ext?: string;
	cnt?: string;
	lnk?: string;
	/** Marks that this node's content lives on disk (see {@link reassembleContent}), not inline. */
	fsc?: boolean;
	[key: string]: unknown;
}

interface ShredFolderNode {
	nam: string;
	fls?: ShredFileNode[];
	fds?: ShredFolderNode[];
	lnk?: string;
	[key: string]: unknown;
}

interface ShredRootNode extends ShredFolderNode {
	/** Manifest of every on-disk content path written by the last save, used to know what to delete on the next one. */
	_files?: string[];
}

function folderSegment(folder: ShredFolderNode): string {
	return sanitizePathSegment(folder.nam);
}

function fileSegment(file: ShredFileNode): string {
	const fileName = file.ext != null ? `${file.nam}.${file.ext}` : file.nam;
	return sanitizePathSegment(fileName);
}

/**
 * Walks a parsed virtual-drive tree, extracting every file's inline text
 * content out into `files` (keyed by its on-disk path) and replacing it with
 * an `fsc` marker on the (mutated in place) tree. Links never carry content
 * and are left untouched.
 */
function shredContent(folder: ShredFolderNode, files: Map<string, string>, segments: string[] = []) {
	if (folder.fls != null) {
		folder.fls = folder.fls.map((file) => {
			if (file.lnk != null || file.cnt == null)
				return file;

			const path = [...segments, fileSegment(file)].join("/");
			files.set(path, file.cnt);

			const { cnt: _cnt, ...rest } = file;
			return { ...rest, fsc: true };
		});
	}

	if (folder.fds != null) {
		folder.fds.forEach((subFolder) => {
			if (subFolder.lnk != null)
				return;

			shredContent(subFolder, files, [...segments, folderSegment(subFolder)]);
		});
	}
}

/**
 * The inverse of {@link shredContent}: reads every `fsc`-marked file's
 * content back from disk (in parallel) and splices it back in as `cnt`,
 * mutating the tree in place so it matches what {@link shredContent} started from.
 */
async function reassembleContent(folder: ShredFolderNode, segments: string[] = []): Promise<void> {
	const reads: Promise<void>[] = [];

	if (folder.fls != null) {
		folder.fls.forEach((file) => {
			if (!file.fsc)
				return;

			const path = [...segments, fileSegment(file)].join("/");
			reads.push(
				invoke<string | null>("read_drive_file", { path }).then((content) => {
					delete file.fsc;
					if (content != null)
						file.cnt = content;
				})
			);
		});
	}

	if (folder.fds != null) {
		folder.fds.forEach((subFolder) => {
			if (subFolder.lnk != null)
				return;

			reads.push(reassembleContent(subFolder, [...segments, folderSegment(subFolder)]));
		});
	}

	await Promise.all(reads);
}

/**
 * A {@link Storage} backend for the Mundravax Tauri shell: persists the
 * virtual drive as a small encrypted index blob (tree structure only) plus
 * one individually-encrypted real file per virtual file's text content,
 * mirroring the virtual folder structure on disk. `load()`/`store()` still
 * present the exact same "one JSON string in, one JSON string out" contract
 * `VirtualRoot` already expects - the split happens entirely inside
 * {@link preload} (reassemble) and {@link flush}/the debounced write (shred).
 */
export class TauriStorage extends Storage {
	static readonly FLUSH_DELAY_MS = 300;

	#value: string | null = null;
	#pendingValue: string | null = null;
	#previousFiles: Set<string> = new Set();
	#writeChain: Promise<void> = Promise.resolve();
	#flushTimeout?: ReturnType<typeof setTimeout>;

	/**
	 * Loads the index from disk and reassembles full file content back into
	 * it. Must be awaited once before the first {@link load}/{@link store}
	 * call — see the preload gate in `<ProzillaOS/>`.
	 */
	async preload(): Promise<void> {
		const indexJson = await invoke<string | null>("load_drive");

		if (indexJson == null) {
			this.#value = null;
			return;
		}

		const root = JSON.parse(indexJson) as ShredRootNode;
		this.#previousFiles = new Set(root._files ?? []);
		delete root._files;

		await reassembleContent(root);

		this.#value = this.encode(JSON.stringify(root)).result;
	}

	override load(_key: string): string | null {
		return this.#value != null ? this.decode(this.#value) : null;
	}

	override store(_key: string, value: string) {
		const { result: encodedValue } = this.encode(value);
		this.#value = encodedValue;
		this.#pendingValue = value;
		this.#scheduleFlush();
	}

	override rename(): this {
		// No-op: the single-file model has no concept of a key to rename.
		return this;
	}

	override async clear(): Promise<this> {
		this.#value = null;
		this.#pendingValue = null;
		this.#previousFiles = new Set();

		if (this.#flushTimeout != null) {
			clearTimeout(this.#flushTimeout);
			this.#flushTimeout = undefined;
		}

		// Wait for the current chain (e.g. a pending save) before clearing,
		// so a reset can't be silently overwritten by an in-flight save.
		this.#writeChain = this.#writeChain.then(() => invoke("clear_drive"));
		await this.#writeChain;
		return this;
	}

	/**
	 * Immediately performs any debounced write instead of waiting out the
	 * delay, then waits for it (and anything already in flight) to finish.
	 * Used to guarantee the latest edit is saved before the app closes.
	 */
	async flush(): Promise<void> {
		if (this.#flushTimeout != null) {
			clearTimeout(this.#flushTimeout);
			this.#flushTimeout = undefined;
			this.#queuePersist();
		}

		await this.#writeChain;
	}

	#scheduleFlush() {
		if (this.#flushTimeout != null)
			clearTimeout(this.#flushTimeout);

		this.#flushTimeout = setTimeout(() => {
			this.#flushTimeout = undefined;
			this.#queuePersist();
		}, TauriStorage.FLUSH_DELAY_MS);
	}

	#queuePersist() {
		const value = this.#pendingValue;
		if (value == null)
			return;

		this.#writeChain = this.#writeChain.then(() => this.#persist(value));
	}

	/**
	 * Shreds `rawValue` into an index + per-file content, and writes them in
	 * a crash-safe order: new/changed content first, then the index that
	 * references it, then anything orphaned - so a crash mid-flush can only
	 * ever leave a stale-but-consistent index, never a dangling reference.
	 */
	async #persist(rawValue: string) {
		const root = JSON.parse(rawValue) as ShredRootNode;
		const files = new Map<string, string>();
		shredContent(root, files);

		const newPaths = new Set(files.keys());
		const toDelete = [...this.#previousFiles].filter((path) => !newPaths.has(path));

		await Promise.all([...files.entries()].map(([path, content]) =>
			invoke("write_drive_file", { path, content })
		));

		root._files = [...newPaths];
		await invoke("save_drive", { data: JSON.stringify(root) });

		await Promise.all(toDelete.map((path) => invoke("delete_drive_file", { path })));

		this.#previousFiles = newPaths;
	}
}

/**
 * There is exactly one virtual drive per Mundravax install, so this backend
 * is a shared singleton rather than something each {@link VirtualDriveStorage}
 * instantiates for itself — it must be preloaded once, before any
 * `VirtualRoot` is constructed.
 */
export const tauriStorage = new TauriStorage();
