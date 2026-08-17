import { memo, ReactElement, ReactNode, useEffect, useState } from "react";
import { VirtualRootProvider } from "../../hooks/virtual-drive/virtualRootProvider";
import { isTauri } from "../../features/_utils";
import { tauriStorage } from "../../features/storage/tauriStorage";
import { ZIndexManagerProvider } from "../../hooks/z-index/zIndexManagerProvider";
import { WindowsManagerProvider } from "../../hooks/windows/windowsManagerProvider";
import { ModalsManagerProvider } from "../../hooks/modals/modalsManagerProvider";
import { SettingsManagerProvider } from "../../hooks/settings/settingsManagerProvider";
import { ThemeProvider } from "../../hooks/themes/themes";
import { SystemManagerParams } from "../../features/system/systemManager";
import { SystemManagerProvider } from "../../hooks/system/systemManagerProvider";
import { DesktopConfig, DesktopConfigOptions } from "../../features/system/configs/desktopConfig";
import { AppsConfig, AppsConfigOptions } from "../../features/system/configs/appsConfig";
import { MiscConfig, MiscConfigOptions } from "../../features/system/configs/miscConfig";
import { ModalsConfig, ModalsConfigOptions } from "../../features/system/configs/modalsConfig";
import { TaskbarConfig, TaskbarConfigOptions } from "../../features/system/configs/taskbarConfig";
import { TrackingConfig, TrackingConfigOptions } from "../../features/system/configs/trackingConfig";
import { WindowsConfig, WindowsConfigOptions } from "../../features/system/configs/windowsConfig";
import { TrackingManagerProvider } from "../../hooks/tracking/trackingManagerProvider";
import { VirtualDriveConfig, VirtualDriveConfigOptions } from "../../features/system/configs/virtualDriveConfig";
import { Main } from "./Main";
import { Skin } from "@prozilla-os/skins";
import { Settings } from "../../features";
import { useIntSetting, useStringSetting } from "../../hooks";

export interface ProzillaOSProps {
	/** The name of the system. */
	systemName?: string;
	/** The tagline/short description of the system. */
	tagLine?: string;
	/** The system configuration. */
	config?: {
		apps?: Partial<AppsConfigOptions>;
		desktop?: Partial<DesktopConfigOptions>;
		misc?: Partial<MiscConfigOptions>;
		modals?: Partial<ModalsConfigOptions>;
		taskbar?: Partial<TaskbarConfigOptions>;
		tracking?: Partial<TrackingConfigOptions>;
		windows?: Partial<WindowsConfigOptions>;
		virtualDrive?: Partial<VirtualDriveConfigOptions>;
	},
	skin?: Skin;
	children?: ReactNode;
}

/**
 * Main component that contains everything .
 */
export const ProzillaOS = memo(function(props: ProzillaOSProps): ReactElement {
	const { systemName, tagLine, skin, config, children } = props;

	// Tauri's IPC is always async, but `VirtualRootProvider` constructs the
	// virtual drive synchronously during render — so under Tauri, mounting it
	// (and everything below it) must wait for the encrypted drive file to be
	// preloaded once. Plain-web consumers (no Tauri) skip this entirely.
	const [driveReady, setDriveReady] = useState(() => !isTauri());

	useEffect(() => {
		if (!isTauri())
			return;

		let cancelled = false;
		void tauriStorage.preload().then(() => {
			if (!cancelled)
				setDriveReady(true);
		});

		return () => { cancelled = true; };
	}, []);

	const systemParams = {
		systemName,
		tagLine,
		skin,
		appsConfig: new AppsConfig(config?.apps),
		desktopConfig: new DesktopConfig(config?.desktop),
		miscConfig: new MiscConfig(config?.misc),
		modalsConfig: new ModalsConfig(config?.modals),
		taskbarConfig: new TaskbarConfig(config?.taskbar),
		trackingConfig: new TrackingConfig(config?.tracking),
		windowsConfig: new WindowsConfig(config?.windows),
		virtualDriveConfig: new VirtualDriveConfig(config?.virtualDrive),
	} as SystemManagerParams;

	return <SystemManagerProvider {...systemParams}>
		{driveReady && <VirtualRootProvider>
			<ZIndexManagerProvider>
				<TrackingManagerProvider>
					<WindowsManagerProvider>
						<ModalsManagerProvider>
							<SettingsManagerProvider>
								<AppearanceSettingsSync/>
								<ThemeProvider>
									<Main>
										{children}
									</Main>
								</ThemeProvider>
							</SettingsManagerProvider>
						</ModalsManagerProvider>
					</WindowsManagerProvider>
				</TrackingManagerProvider>
			</ZIndexManagerProvider>
		</VirtualRootProvider>}
	</SystemManagerProvider>;
});

function AppearanceSettingsSync() {
	const [fontFamily] = useStringSetting(Settings.THEME, "font-family", "Outfit, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif");
	const [uiDensity] = useIntSetting(Settings.THEME, "ui-density", 0);

	useEffect(() => {
		document.documentElement.style.setProperty("--body-font-family", fontFamily ?? "Outfit, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif");
		document.documentElement.dataset.uiDensity = String(uiDensity);
	}, [fontFamily, uiDensity]);

	return null;
}
