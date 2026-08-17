import { AppsConfig, browser, calculator, fileExplorer, mail, mediaViewer, settings, terminal, textEditor, codeEditor } from "prozilla-os";
import { NAME } from "./branding.config";

// Note: appCenter and logicSim packages are intentionally kept installed (see packages/apps/)
// but not registered here, so they stay out of the UI without deleting any files.
// Re-register them (or games/skin overrides from the ProzillaOS history) when needed.

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
	],
});
