import { App } from "@prozilla-os/core";
import { Vector2 } from "@prozilla-os/shared";
import { Skin, MacOsSkin, MinimalSkin, PixelSkin, Windows95Skin } from "@prozilla-os/skins";
import { Mail, type MailProps } from "./components/Mail";

const mail = new App<MailProps>("Mail", "mail", Mail, { size: new Vector2(920, 620) })
	.setIconUrl("https://os.prozilla.dev/assets/apps/icons/mail.svg")
	.setCategory("Productivity")
	.addSkinOverride(MacOsSkin, {
		iconUrl: Skin.assetUrl("/assets/skins/mac/apps/icons/mail.svg"),
	})
	.addSkinOverride(Windows95Skin, {
		iconUrl: Skin.assetUrl("/assets/skins/windows95/apps/icons/mail.svg"),
	})
	.addSkinOverride(MinimalSkin, {
		iconUrl: Skin.assetUrl("/assets/skins/minimal/apps/icons/mail.svg"),
	})
	.addSkinOverride(PixelSkin, {
		iconUrl: Skin.assetUrl("/assets/skins/pixel/apps/icons/mail.png"),
	});

export { mail, MailProps };
