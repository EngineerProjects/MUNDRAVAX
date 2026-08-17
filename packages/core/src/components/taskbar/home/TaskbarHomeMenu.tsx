import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./TaskbarHomeMenu.module.css";
import { faGear, faPowerOff, faSearch, faThumbTack, faXmark } from "@fortawesome/free-solid-svg-icons";
import { ReactSVG } from "react-svg";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import { useClassNames, useContextMenu, useInstalledApps, useKeyboardListener, useSettingsManager, useSystemManager, useWindowsManager } from "../../../hooks";
import { App, AppsConfig, closeViewport, Settings } from "../../../features";
import { utilStyles } from "../../../styles";
import { VectorImage } from "../../_utils/vector-image/VectorImage";
import { useTaskbarContext } from "../taskbarSlots";
import { useWindows } from "../../../hooks/windows/windowsContext";
import { Actions, ClickAction, Divider } from "../../actions";
import { pinAppToTaskbar } from "../apps/taskbarPins";

export function TaskbarHomeMenu() {
	const { activeMenu, setActiveMenu, toggleMenu } = useTaskbarContext();
	const active = activeMenu === "home";
	const { systemName, appsConfig, skin } = useSystemManager();
	const windowsManager = useWindowsManager();
	const settingsManager = useSettingsManager();
	const windows = useWindows();
	const [pinnedAppIds, setPinnedAppIds] = useState<string[]>([]);
	const [tabIndex, setTabIndex] = useState(active ? 0 : -1);

	useEffect(() => {
		setTabIndex(active ? 0 : -1);
	}, [active]);

	const classNames = [styles.HomeMenuContainer];
	if (active)
		classNames.push(styles.Active);

	let onlyAltKey = false;
	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key === "Alt") {
			event.preventDefault();
			onlyAltKey = true;
		} else {
			onlyAltKey = false;

			if (active && event.key.length === 1)
				setActiveMenu("search");
		}
	};

	const onKeyUp = (event: KeyboardEvent) => {
		if (event.key === "Alt" && onlyAltKey) {
			event.preventDefault();
			toggleMenu("home");
			onlyAltKey = false;
		} else {
			onlyAltKey = false;
		}
	};

	useKeyboardListener({ onKeyDown, onKeyUp });

	const apps = useInstalledApps();
	const settingsApp = appsConfig.getAppByRole(AppsConfig.APP_ROLES.settings);
	const taskbarAppIds = useMemo(() => {
		const activeAppIds = windows?.map((window) => window.app?.id).filter((id): id is string => id != null) ?? [];
		return new Set([...pinnedAppIds, ...activeAppIds]);
	}, [pinnedAppIds, windows]);
	const homeApps = apps.filter((app) => !taskbarAppIds.has(app.id));
	const { onContextMenu } = useContextMenu({ Actions: (props) => {
		const targetApp = (props.triggerParams as { app?: App }).app;
		const isActive = targetApp ? windows?.some((window) => window.app?.id === targetApp.id) : false;

		return <Actions avoidTaskbar={false} {...props}>
			<ClickAction label="Open" icon={targetApp?.iconUrl as string | undefined} disabled={!targetApp} onTrigger={() => {
				if (targetApp)
					windowsManager?.open(targetApp.id);
			}}/>
			<ClickAction label="Pin to taskbar" icon={faThumbTack} disabled={!targetApp} onTrigger={() => {
				if (targetApp)
					void pinAppToTaskbar(settingsManager, targetApp.id);
			}}/>
			{isActive && <>
				<Divider/>
				<ClickAction label="Close window" icon={faXmark} onTrigger={() => {
					if (!targetApp)
						return;
					const windowId = windowsManager?.getAppWindowId(targetApp.id);
					if (windowId != null)
						windowsManager?.close(windowId);
				}}/>
			</>}
		</Actions>;
	} });

	const appTileClassName = useClassNames([styles.AppTile], "HomeMenu", "AppTile");

	useEffect(() => {
		const settings = settingsManager?.getSettings(Settings.TASKBAR);
		void settings?.get("pins", (pinList: string) => {
			setPinnedAppIds(pinList.split(",").filter(Boolean));
		});
	}, [settingsManager]);

	return <div className={classNames.join(" ")}>
		<div className={useClassNames([styles.HomeMenu], "Taskbar", "Menu", "Home")}>
			<div className={useClassNames([styles.Logo], "HomeMenu", "Logo")}>
				<ReactSVG src={skin.systemIcon}/>
				<h1 className={utilStyles.TextBold}>{systemName}</h1>
			</div>
			<button
				className={useClassNames([styles.SearchBar], "HomeMenu", "SearchBar")}
				tabIndex={tabIndex}
				onClick={() => setActiveMenu("search")}
			>
				<FontAwesomeIcon icon={faSearch}/>
				<span className={utilStyles.TextRegular}>Search</span>
			</button>
			<div className={useClassNames([styles.Section], "HomeMenu", "Section")}>
				<div className={useClassNames([styles.AppGrid], "HomeMenu", "AppGrid")}>
					{homeApps.map(({ name, id, iconUrl }) =>
						<button
							key={id}
							className={appTileClassName}
							tabIndex={tabIndex}
							onClick={() => {
								toggleMenu("home", false);
								windowsManager?.open(id);
							}}
							onContextMenu={(event) => {
								onContextMenu(event as unknown as MouseEvent<HTMLElement, MouseEvent>, { app: appsConfig.getAppById(id) });
							}}
							title={name}
						>
							<VectorImage src={iconUrl ?? ""}/>
							<span className={utilStyles.TextRegular}>{name}</span>
						</button>
					)}
				</div>
			</div>
			<div className={useClassNames([styles.Footer], "HomeMenu", "Footer")}>
				{settingsApp != null &&
					<button tabIndex={tabIndex} title="Settings" onClick={() => {
						toggleMenu("home", false);
						windowsManager?.open(settingsApp.id);
					}}>
						<FontAwesomeIcon icon={faGear}/>
					</button>
				}
				<button tabIndex={tabIndex} title="Shut down" onClick={() => { closeViewport(true, systemName); }}>
					<FontAwesomeIcon icon={faPowerOff}/>
				</button>
			</div>
		</div>
	</div>;
}
