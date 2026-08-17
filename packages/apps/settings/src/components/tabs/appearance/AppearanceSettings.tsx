import styles from "../../Settings.module.css";
import { Settings, SettingsManager, useBoolSetting, useIntSetting, useSetting, useStringSetting } from "@prozilla-os/core";
import { Theme } from "@prozilla-os/skins";
import { Checkbox } from "../../Checkbox";
import { WallpaperSettings } from "./WallpaperSettings";
import { ReactNode } from "react";

const FONT_OPTIONS = [
	{ label: "Outfit", value: "Outfit, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
	{ label: "System", value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
	{ label: "Mono", value: "'Roboto Mono', Consolas, monospace" },
];

function SettingSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
	return <section className={styles.SettingsSection}>
		<header className={styles.SettingsSectionHeader}>
			<h2>{title}</h2>
			{description != null && <p>{description}</p>}
		</header>
		<div className={styles.SettingsSectionBody}>
			{children}
		</div>
	</section>;
}

function SelectRow({ label, description, value, onChange, children }: { label: string; description?: string; value: string | number; onChange: (value: string) => void; children: ReactNode }) {
	return <label className={styles.SettingRow}>
		<span>
			<strong>{label}</strong>
			{description != null && <small>{description}</small>}
		</span>
		<select className={styles.Dropdown} value={value} onChange={(event) => onChange(event.target.value)}>
			{children}
		</select>
	</label>;
}

function ToggleRow({ label, description, active, setActive }: { label: string; description?: string; active: boolean; setActive: (value: boolean) => void }) {
	return <div className={styles.SettingRow}>
		<span>
			<strong>{label}</strong>
			{description != null && <small>{description}</small>}
		</span>
		<Checkbox active={active} setActive={setActive}/>
	</div>;
}

export function AppearanceSettings() {
	const [theme, setTheme] = useIntSetting(Settings.THEME, "theme", Theme.Dark);
	const [showIcons, setShowIcons] = useBoolSetting(Settings.DESKTOP, "show-icons", true);
	const [iconSize, setIconSize] = useIntSetting(Settings.DESKTOP, "icon-size", 1);
	const [iconDirection, setIconDirection] = useIntSetting(Settings.DESKTOP, "icon-direction", 0);
	const [autoHideTaskbar, setAutoHideTaskbar] = useBoolSetting(Settings.TASKBAR, "auto-hide-maximized", false);
	const [fontFamily, setFontFamily] = useStringSetting(SettingsManager.VIRTUAL_PATHS.theme, "font-family", FONT_OPTIONS[0].value);
	const [uiDensity, setUiDensity] = useSetting<number>(SettingsManager.VIRTUAL_PATHS.theme, "ui-density", 0, (value) => parseInt(value), String);

	return <div className={styles.AppearancePage}>
		<h1 className={styles.PageTitle}>Appearance</h1>

		<SettingSection title="Theme" description="Choose the general visual tone of Mundravax.">
			<SelectRow label="Theme" value={theme} onChange={setTheme}>
				{Object.entries(Theme).filter(([_key, value]) => typeof value !== "number").map(([key, value]) =>
					<option key={key} value={key}>{value}</option>
				)}
			</SelectRow>
			<SelectRow label="Font" description="Main interface font." value={fontFamily ?? FONT_OPTIONS[0].value} onChange={setFontFamily}>
				{FONT_OPTIONS.map((font) =>
					<option key={font.label} value={font.value}>{font.label}</option>
				)}
			</SelectRow>
			<SelectRow label="UI density" description="Adjust spacing without changing the whole layout." value={uiDensity} onChange={(value) => setUiDensity(parseInt(value))}>
				<option value={-1}>Compact</option>
				<option value={0}>Comfortable</option>
				<option value={1}>Spacious</option>
			</SelectRow>
		</SettingSection>

		<SettingSection title="Desktop" description="Control the workspace, desktop icons, wallpaper, and taskbar behavior.">
			<ToggleRow label="Show desktop icons" active={showIcons} setActive={setShowIcons}/>
			<SelectRow label="Icon size" value={iconSize} onChange={(value) => setIconSize(parseInt(value))}>
				<option value={0}>Small</option>
				<option value={1}>Medium</option>
				<option value={2}>Large</option>
			</SelectRow>
			<SelectRow label="Icon layout" value={iconDirection} onChange={(value) => setIconDirection(parseInt(value))}>
				<option value={0}>Vertical</option>
				<option value={1}>Horizontal</option>
			</SelectRow>
			<ToggleRow label="Hide taskbar when maximized" active={autoHideTaskbar} setActive={setAutoHideTaskbar}/>
			<WallpaperSettings compact/>
		</SettingSection>
	</div>;
}
