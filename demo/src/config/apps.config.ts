import { AppsConfig, appCenter, browser, calculator, codeEditor, fileExplorer, logicSim, mail, mediaViewer, settings, terminal, textEditor } from "prozilla-os";
import { NAME } from "./branding.config";

// Logic Sim is registered but not installed by default. It stays available through Store
// without showing in Home or the taskbar until the user installs it.

export const appsConfig = new AppsConfig({
	apps: [
		fileExplorer.setName("Files")
			.setDescription("Browse and manage your virtual files on ProzillaOS.")
			.setIconUrl("/assets/apps/icons/file-explorer.svg"),
		terminal.setName("Commands")
			.setDescription("A command line tool inspired by the Unix shell that runs entirely in your browser using ProzillaOS. Allows you to interact and manipulate the virtual drive and run silly commands.")
			.setIconUrl("/assets/apps/icons/terminal.svg")
			.setPinnedByDefault(false),
		textEditor.setName("Notes")
			.setDescription("Text editor for reading and writing text documents in a virtual file system using ProzillaOS.")
			.setIconUrl("/assets/apps/icons/text-editor.svg")
			.setPinnedByDefault(false),
		codeEditor.setName("Code")
			.setIconUrl("/assets/apps/icons/code-editor.svg")
			.setPinnedByDefault(false),
		settings.setName("Settings")
			.setDescription(`Configure ${NAME}'s settings and customize your experience.`)
			.setIconUrl("/assets/apps/icons/settings.svg"),
		appCenter.setName("Store")
			.setDescription("Discover and install apps for Mundravax.")
			.setIconUrl("/assets/apps/icons/app-center.svg")
			.setPinnedByDefault(false),
		mediaViewer.setName("Photos")
			.setIconUrl("/assets/apps/icons/media-viewer.svg")
			.setPinnedByDefault(false),
		mail.setName("Mail")
			.setDescription("Read and compose messages in Mundravax.")
			.setIconUrl("/assets/apps/icons/mail.svg")
			.setPinnedByDefault(false)
			.setShowDesktopIcon(true),
		browser.setName("Browser")
			.setDescription("Browse the internet.")
			.setIconUrl("/assets/apps/icons/browser.svg")
			.setShowDesktopIcon(true),
		calculator.setName("Maths")
			.setDescription("Simple calculator app.")
			.setIconUrl("/assets/apps/icons/calculator.svg")
			.setPinnedByDefault(false),
		logicSim.setName("Logic Sim")
			.setDescription("Build and test digital logic circuits.")
			.setIconUrl("/assets/apps/icons/logic-sim.svg")
			.setPinnedByDefault(false)
			.setInstalled(false),
	],
});
