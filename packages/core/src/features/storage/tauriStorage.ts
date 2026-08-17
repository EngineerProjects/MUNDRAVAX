import { invoke } from "@tauri-apps/api/core";
import { Storage } from "./storage";

/**
 * A {@link Storage} backend for the Mundravax Tauri shell: persists a single
 * encrypted blob to a real OS app-data file instead of `localStorage`. Since
 * the whole virtual drive is always saved under one key, this class tracks
 * exactly one in-memory value, kept in sync with disk via debounced async
 * writes serialized through a single write chain.
 */
export class TauriStorage extends Storage {
	static readonly FLUSH_DELAY_MS = 300;

	#value: string | null = null;
	#writeChain: Promise<void> = Promise.resolve();
	#flushTimeout?: ReturnType<typeof setTimeout>;

	/**
	 * Loads the current blob from disk into memory. Must be awaited once
	 * before the first {@link load}/{@link store} call — see the preload gate
	 * in `<ProzillaOS/>`.
	 */
	async preload(): Promise<void> {
		this.#value = await invoke<string | null>("load_drive");
	}

	override load(_key: string): string | null {
		return this.#value != null ? this.decode(this.#value) : null;
	}

	override store(_key: string, value: string) {
		const { result: encodedValue } = this.encode(value);
		this.#value = encodedValue;
		this.#scheduleFlush();
	}

	override rename(): this {
		// No-op: the single-file model has no concept of a key to rename.
		return this;
	}

	override async clear(): Promise<this> {
		this.#value = null;

		if (this.#flushTimeout != null)
			clearTimeout(this.#flushTimeout);

		// Wait for the current chain (e.g. a pending save) before clearing,
		// so a reset can't be silently overwritten by an in-flight save.
		this.#writeChain = this.#writeChain.then(() => invoke("clear_drive"));
		await this.#writeChain;
		return this;
	}

	#scheduleFlush() {
		if (this.#flushTimeout != null)
			clearTimeout(this.#flushTimeout);

		this.#flushTimeout = setTimeout(() => {
			const pending = this.#value;
			this.#writeChain = this.#writeChain.then(() => invoke("save_drive", { data: pending }));
		}, TauriStorage.FLUSH_DELAY_MS);
	}
}

/**
 * There is exactly one virtual drive file per Mundravax install, so this
 * backend is a shared singleton rather than something each
 * {@link VirtualDriveStorage} instantiates for itself — it must be preloaded
 * once, before any `VirtualRoot` is constructed.
 */
export const tauriStorage = new TauriStorage();
