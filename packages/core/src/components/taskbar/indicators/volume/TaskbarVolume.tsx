import { faVolumeHigh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./TaskbarVolume.module.css";
import { OutsideClickListener, useClassNames } from "../../../../hooks";
import { TaskbarIndicatorMenu } from "../TaskbarIndicatorMenu";
import { useTaskbarIndicatorState } from "../taskbarIndicatorState";
import { useEffect, useState } from "react";
import { isTauri } from "../../../../features/_utils/browser.utils";
import { invoke } from "@tauri-apps/api/core";

export function TaskbarVolume() {
	const [active, setActive] = useTaskbarIndicatorState();
	const [volume, setVolume] = useState(100);

	// Reads the real system volume once on mount, when running in the Tauri
	// shell. Not live-subscribed - a change made outside the app (media keys,
	// another app) won't be reflected until this component next mounts.
	useEffect(() => {
		if (!isTauri())
			return;

		invoke<number>("get_volume")
			.then((level) => { setVolume(level); })
			.catch(() => { /* No system volume available - keep the local default. */ });
	}, []);

	const onVolumeChange = (level: number) => {
		setVolume(level);

		if (isTauri())
			void invoke("set_volume", { level }).catch(() => { /* No system volume available - stays local-only. */ });
	};

	return <OutsideClickListener onOutsideClick={() => { setActive(false); }}>
		<button title="Volume" className={useClassNames([], "Taskbar", "Indicator", "Volume")} tabIndex={0} onClick={() => { setActive(!active); }}>
			<FontAwesomeIcon icon={faVolumeHigh}/>
		</button>
		<TaskbarIndicatorMenu active={active} className={styles.Menu}>
			<div className={styles.VolumeHeader}>
				<FontAwesomeIcon icon={faVolumeHigh}/>
				<strong>{volume}%</strong>
			</div>
			<label className={styles.VolumeSlider}>
				<span>Output volume</span>
				<input
					type="range"
					min={0}
					max={100}
					value={volume}
					style={{ "--volume": `${volume}%` }}
					onChange={(event) => { onVolumeChange(parseInt(event.currentTarget.value)); }}
				/>
			</label>
		</TaskbarIndicatorMenu>
	</OutsideClickListener>;
}
