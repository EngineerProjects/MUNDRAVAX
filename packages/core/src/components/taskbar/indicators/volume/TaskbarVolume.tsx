import { faVolumeHigh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./TaskbarVolume.module.css";
import { OutsideClickListener, useClassNames } from "../../../../hooks";
import { TaskbarIndicatorMenu } from "../TaskbarIndicatorMenu";
import { useTaskbarIndicatorState } from "../taskbarIndicatorState";
import { useState } from "react";

export function TaskbarVolume() {
	const [active, setActive] = useTaskbarIndicatorState();
	const [volume, setVolume] = useState(100);

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
					onChange={(event) => { setVolume(parseInt(event.currentTarget.value)); }}
				/>
			</label>
		</TaskbarIndicatorMenu>
	</OutsideClickListener>;
}
