import { faFlagCheckered, faList } from "@fortawesome/free-solid-svg-icons";
import { SettingsNavPage } from "../SettingsNavPage";
import { InstalledAppsSettings } from "./InstalledAppsSettings";
import { StartupAppsSettings } from "./StartupAppsSettings";

export function AppsSettings() {
	return <SettingsNavPage
		title="Apps"
		pages={{
			installedApps: {
				title: "Installed apps",
				description: "Launch, pin, or manage installed applications.",
				icon: faList,
				Content: InstalledAppsSettings,
			},
			startupApps: {
				title: "Startup apps",
				description: "Choose what opens automatically when Mundravax starts.",
				icon: faFlagCheckered,
				Content: StartupAppsSettings,
			},
		}}
	/>;
}
