import styles from "../../Settings.module.css";
import { ImagePreview, Settings, useInstalledApps, useListSetting } from "@prozilla-os/core";
import { removeFromArray } from "@prozilla-os/shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import { faSquareCheck } from "@fortawesome/free-solid-svg-icons";

export function StartupAppsSettings() {
	const apps = useInstalledApps();
	const [startup, setStartup] = useListSetting(Settings.APPS, "startup");
	
	const setActive = (appId: string, active: boolean) => {
		const newStartup = [...startup];
		if (active) {
			if (newStartup.includes(appId))
				return;

			newStartup.push(appId);
		} else {
			if (!newStartup.includes(appId))
				return;

			removeFromArray(appId, newStartup);
		}

		setStartup(newStartup);
	};

	return <div className={styles.SettingsSectionBody}>
		{apps.map((app) => {
			const active = startup.includes(app.id);

			return <button
				key={app.id}
				className={styles.SettingRow}
				onClick={(_event) => setActive(app.id, !active)}
			>
				<span className={styles.Label}>
					<ImagePreview className={styles.Icon} source={app.iconUrl as string}/>
					{app.name}
				</span>
				<div className={`${styles.Checkbox} ${active ? styles.Checked : ""}`}>
					{active 
						? <FontAwesomeIcon icon={faSquareCheck}/>
						: <FontAwesomeIcon icon={faSquare}/>
					}
				</div>
			</button>;
		})}
	</div>;
}
