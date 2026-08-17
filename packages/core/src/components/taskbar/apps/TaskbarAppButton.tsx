import { memo, MouseEvent } from "react";
import { App } from "../../../features";
import { useClassNames, useContextMenu, useSettingsManager, useWindowsManager } from "../../../hooks";
import { Actions, ClickAction } from "../../actions";
import styles from "./TaskbarAppButton.module.css";
import { VectorImage } from "../../_utils/vector-image/VectorImage";
import { faThumbTack, faXmark } from "@fortawesome/free-solid-svg-icons";
import { unpinAppFromTaskbar } from "./taskbarPins";

export interface TaskbarAppButtonProps {
	app: App;
	active: boolean;
	visible: boolean;
}

export const TaskbarAppButton = memo(({ app, active, visible }: TaskbarAppButtonProps) => {
	const windowsManager = useWindowsManager();
	const settingsManager = useSettingsManager();
	const { onContextMenu } = useContextMenu({ Actions: (props) =>
		<Actions avoidTaskbar={false} {...props}>
			<ClickAction label={active ? "Show" : "Open"} icon={app.iconUrl as string | undefined} onTrigger={() => {
				const windowId = windowsManager?.getAppWindowId(app.id);
				if (active && windowId != null) {
					windowsManager?.focus(windowId);
				} else {
					windowsManager?.open(app.id);
				}
			}}/>
			<ClickAction label="Unpin from taskbar" icon={faThumbTack} disabled={!app.isPinned} onTrigger={() => {
				void unpinAppFromTaskbar(settingsManager, app.id);
			}}/>
			{active && <ClickAction label="Close window" icon={faXmark} onTrigger={() => {
				const windowId = windowsManager?.getAppWindowId(app.id);
				if (windowId != null)
					windowsManager?.close(windowId);
			}}/>}
		</Actions>,
	});

	if (!windowsManager)
		return;

	const classNames = [styles.AppIcon];
	if (active)
		classNames.push(styles.Active);
	if (!visible)
		classNames.push(styles.Hidden);

	return <button
		key={app.id}
		tabIndex={0}
		className={useClassNames(classNames, "Taskbar", "AppIcon")}
		onClick={() => {
			const windowId =  windowsManager.getAppWindowId(app.id);

			if (!active || windowId == null) {
				windowsManager.open(app.id);
			} else if (!windowsManager.isFocused(windowId)) {
				windowsManager.focus(windowId);
			} else {
				windowsManager.setMinimized(windowId);
			}
		}}
		onContextMenu={(event) => {
			if (visible)
				onContextMenu(event as unknown as MouseEvent<HTMLElement, MouseEvent>);
		}}
		title={app.name}
	>
		<VectorImage src={app.iconUrl as string}/>
	</button>;
});
