import { Storage } from "../storage/storage";
import { tauriStorage } from "../storage/tauriStorage";
import { VirtualDriveConfig } from "../system/configs";
import { isTauri } from "../_utils";

export class VirtualDriveStorage extends Storage {
	virtualDriveConfig: VirtualDriveConfig;

	/**
	 * The Tauri shell shares one `TauriStorage` singleton (one file on disk);
	 * a plain browser context gets its own private `Storage` (localStorage).
	 */
	#backend: Storage;

	static readonly KEY = "drive";

	constructor(virtualDriveConfig: VirtualDriveConfig) {
		super();
		this.virtualDriveConfig = virtualDriveConfig;
		this.#backend = isTauri() ? tauriStorage : new Storage();
		this.synchronize();

		// Migrate old unused keys
		if (this.virtualDriveConfig.saveData) {
			this.virtualDriveConfig.saveData.migrations?.forEach(([oldKey, newKey]) => this.rename(oldKey, newKey));
		}
	}

	override load(key: string): string | null {
		this.synchronize();
		return this.#backend.load(key);
	}

	override store(key: string, value: string) {
		this.synchronize();
		this.#backend.store(key, value);
	}

	override rename(oldKey: string, newKey: string): this {
		this.#backend.rename(oldKey, newKey);
		return this;
	}

	override async clear(): Promise<this> {
		await this.#backend.clear();
		return this;
	}

	synchronize() {
		if (!this.virtualDriveConfig.saveData)
			return;
		this.enableCompression = this.virtualDriveConfig.saveData.enableCompression;
		this.prefix = this.virtualDriveConfig.saveData.prefix;
		this.#backend.enableCompression = this.enableCompression;
		this.#backend.prefix = this.prefix;
	}

}