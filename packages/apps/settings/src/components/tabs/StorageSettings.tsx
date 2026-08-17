import { round } from "@prozilla-os/shared";
import styles from "../Settings.module.css";
import { Button, ProgressBar, Storage, useVirtualRoot, utilStyles, VirtualDriveStorage } from "@prozilla-os/core";

export function StorageTab() {
	const virtualRoot = useVirtualRoot();

	if (!virtualRoot) {
		return <div className={styles.SettingsPage}>
			<h1 className={styles.PageTitle}>Storage</h1>
			<section className={styles.SettingsSection}>
				<header className={styles.SettingsSectionHeader}>
					<h2>Virtual Drive</h2>
					<p>Virtual Drive is unavailable.</p>
				</header>
			</section>
		</div>;
	}

	const storage = virtualRoot.storage;

	const maxBytes = Storage.MAX_BYTES;
	const usedBytes = storage.getItemByteSize(VirtualDriveStorage.KEY, virtualRoot.toString() ?? "");

	const maxKB = Storage.byteToKilobyte(maxBytes);
	const usedKB = Storage.byteToKilobyte(usedBytes);
	const freeKB = maxKB - usedKB;

	return <div className={styles.SettingsPage}>
		<h1 className={styles.PageTitle}>Storage</h1>
		<section className={styles.SettingsSection}>
			<header className={styles.SettingsSectionHeader}>
				<h2>Virtual Drive</h2>
				<p>{round(maxKB, 1)} KB available for persisted virtual files and settings.</p>
			</header>
			<div className={styles.StoragePanel}>
				<ProgressBar fillPercentage={usedKB / maxKB * 100} className={styles.ProgressBar}/>
				<span className={styles.ProgressBarLabels}>
					<p className={utilStyles.TextLight}>{round(usedKB, 1)} KB used</p>
					<p className={utilStyles.TextLight}>{round(freeKB, 1)} KB free</p>
				</span>
			</div>
		</section>
		<section className={styles.SettingsSection}>
			<header className={styles.SettingsSectionHeader}>
				<h2>Manage data</h2>
				<p>Reset the virtual drive when you want a clean local state.</p>
			</header>
			<div className={styles.SettingsSectionBody}>
				<div className={styles.SettingRow}>
					<span>
						<strong>Reset virtual drive</strong>
						<small>This clears saved virtual files and settings.</small>
					</span>
					<Button
						className={`${styles.Button} ${styles.ButtonDanger} ${utilStyles.TextBold}`}
						onClick={() => { virtualRoot.reset(); }}
					>
						Reset
					</Button>
				</div>
			</div>
		</section>
	</div>;
}
