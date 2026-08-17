import styles from "../Settings.module.css";
import { Button, useSystemManager, utilStyles } from "@prozilla-os/core";

export function AboutSettings() {
	const { systemName } = useSystemManager();

	return <div className={styles.SettingsPage}>
		<h1 className={styles.PageTitle}>About</h1>
		<section className={styles.SettingsSection}>
			<header className={styles.SettingsSectionHeader}>
				<h2>{systemName}</h2>
				<p>{systemName} is a web-based operating system inspired by Ubuntu Linux and Windows, built with React.</p>
			</header>
			<div className={styles.SettingsSectionBody}>
				<div className={styles.SettingRow}>
					<span>
						<strong>Source code</strong>
						<small>View the original project repository.</small>
					</span>
					<Button
						className={`${styles.Button} ${utilStyles.TextBold}`}
						href="https://github.com/prozilla-os/ProzillaOS"
					>
						View source
					</Button>
				</div>
			</div>
		</section>
	</div>;
}
