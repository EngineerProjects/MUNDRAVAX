import { Settings, SettingsManager } from "../../../features";

export async function getTaskbarPins(settingsManager?: SettingsManager): Promise<string[]> {
	const settings = settingsManager?.getSettings(Settings.TASKBAR);
	const { value } = await (settings?.get("pins") ?? Promise.resolve({ value: null }));
	return value?.split(",").filter(Boolean) ?? [];
}

export async function setTaskbarPins(settingsManager: SettingsManager | undefined, pins: string[]): Promise<void> {
	const settings = settingsManager?.getSettings(Settings.TASKBAR);
	await settings?.set("pins", [...new Set(pins)].join(","));
}

export async function pinAppToTaskbar(settingsManager: SettingsManager | undefined, appId: string): Promise<void> {
	const pins = await getTaskbarPins(settingsManager);
	if (!pins.includes(appId))
		await setTaskbarPins(settingsManager, [...pins, appId]);
}

export async function unpinAppFromTaskbar(settingsManager: SettingsManager | undefined, appId: string): Promise<void> {
	const pins = await getTaskbarPins(settingsManager);
	await setTaskbarPins(settingsManager, pins.filter((id) => id !== appId));
}
