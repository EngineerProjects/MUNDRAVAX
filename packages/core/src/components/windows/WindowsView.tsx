import { FC, memo, useCallback, useEffect, useMemo, useState } from "react";
import { WindowProps, WindowView } from "./WindowView";
import { setViewportTitle, setViewportIcon, getViewportParams, Settings } from "../../features";
import { WindowOptions } from "../../features/windows/windowsManager";
import { useClassNames, useSettingsManager, useSystemManager, useWindowsManager } from "../../hooks";
import { useWindows } from "../../hooks/windows/windowsContext";
import { removeDuplicatesFromArray } from "@prozilla-os/shared";

/**
 * Component that renders the windows for all currently active applications.
 */
export const WindowsView: FC = memo(() => {
	const { systemName, tagLine, skin } = useSystemManager();
	const settingsManager = useSettingsManager();
	const windows = useWindows();
	const windowsManager = useWindowsManager();
	const [sortedWindows, setSortedWindows] = useState<WindowProps[]>([]);
	const [maximizedWindows, setMaximizedWindows] = useState<Record<string, boolean>>({});

	// Sort windows
	useEffect(() => {
		if (windows != null)
			setSortedWindows([...windows].sort((windowA: WindowOptions, windowB: WindowOptions) =>
				(windowA.lastInteraction ?? 0) - (windowB.lastInteraction ?? 0)
			));
	}, [windows]);

	useEffect(() => {
		const windowIds = new Set((windows ?? []).map((window) => window.id).filter((id): id is string => id != null));
		setMaximizedWindows((maximizedWindows) => Object.fromEntries(
			Object.entries(maximizedWindows).filter(([windowId]) => windowIds.has(windowId))
		));
	}, [windows]);

	useEffect(() => {
		const resetViewportTitleAndIcon = () => {
			setViewportTitle(`${systemName} | ${tagLine}`);
			setViewportIcon(skin.systemIcon);
		};

		if (sortedWindows.length === 0 || sortedWindows[sortedWindows.length - 1].minimized)
			resetViewportTitleAndIcon();

		window.addEventListener("blur", resetViewportTitleAndIcon);

		return () => {
			window.removeEventListener("blur", resetViewportTitleAndIcon);
		};
	}, [sortedWindows]);

	const activeWindow = sortedWindows[sortedWindows.length - 1];
	const hasActiveMaximizedWindow = useMemo(() => {
		if (sortedWindows.length === 0 || activeWindow.id == null || activeWindow.minimized)
			return false;

		return Boolean(activeWindow.fullscreen || maximizedWindows[activeWindow.id]);
	}, [activeWindow, maximizedWindows, sortedWindows.length]);

	useEffect(() => {
		document.documentElement.classList.toggle("HasActiveMaximizedWindow", hasActiveMaximizedWindow);

		return () => {
			document.documentElement.classList.remove("HasActiveMaximizedWindow");
		};
	}, [hasActiveMaximizedWindow]);

	const onMaximizedChange = useCallback((windowId: string, maximized: boolean) => {
		setMaximizedWindows((windows) => {
			if (windows[windowId] === maximized)
				return windows;

			return { ...windows, [windowId]: maximized };
		});
	}, []);

	// Launch startup apps
	useEffect(() => {
		if (windowsManager?.startupComplete)
			return;

		let startupAppNames: string[] = [];

		// Get app name and params from URL query
		const params = getViewportParams();
		const appName = params.app;
		if (appName)
			startupAppNames.push(appName);
		delete params.app;

		// Get list of app names from settings file
		const settings = settingsManager?.getSettings(Settings.APPS);
		void settings?.get("startup", (value) => {
			if (value !== "") {
				startupAppNames = value.split(",").concat(startupAppNames);
				startupAppNames = removeDuplicatesFromArray(startupAppNames);
			}

			windowsManager?.startup(startupAppNames, params);
		});
	}, [settingsManager, windowsManager]);

	return <div className={useClassNames([], "WindowsView")}>
		{windows?.map((window: WindowProps) => {
			const { id, app, size, position, options, minimized, fullscreen } = window;
			const index = sortedWindows.indexOf(window);
			return <WindowView
				key={id}
				active={index === sortedWindows.length - 1}
				id={id}
				app={app}
				size={size}
				index={index}
				position={position}
				options={options}
				minimized={minimized}
				toggleMinimized={(event?: Event) => {
					event?.preventDefault();
					event?.stopPropagation();
					windowsManager?.setMinimized(id as string, !minimized);
				}}
				onMaximizedChange={onMaximizedChange}
				fullscreen={fullscreen}
			/>;
		})}
	</div>;
});
