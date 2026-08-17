import { Editor, EditorProps, OnChange } from "@monaco-editor/react";
import { ClickAction, Divider, DropdownAction, HeaderMenu, ModalProps, OnSelectionChangeParams, ToggleAction, useSystemManager, useVirtualRoot, useWindowedModal, VirtualFile, VirtualFolder, WindowProps } from "@prozilla-os/core";
import styles from "./CodeEditor.module.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FileSelectorMode, fileExplorer } from "@prozilla-os/file-explorer";
import { extensionToLanguage } from "../core/_utils/editor.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faCode, faEye, faFile, faFolder, faMagnifyingGlass, faPen, faXmark } from "@fortawesome/free-solid-svg-icons";
import Markdown from "markdown-to-jsx";

export interface CodeEditorProps extends WindowProps {
	file?: VirtualFile;
	path?: string;
}

export function CodeEditor({ file, path, close, setTitle, setTitleBarContent }: CodeEditorProps) {
	const virtualRoot = useVirtualRoot();
	const { modalsConfig } = useSystemManager();
	const [currentFile, setCurrentFile] = useState<VirtualFile | null>(file ?? null);
	const [originalContent, setOriginalContent] = useState<string | null>(file?.content ?? "");
	const [content, setContent] = useState(file?.content ?? "");
	const [unsavedChanges, setUnsavedChanges] = useState(file == null);
	const { openWindowedModal } = useWindowedModal();
	const [lineNumbersEnabled, setLineNumbersEnabled] = useState(true);
	const [minimapEnabled, setMinimapEnabled] = useState(true);
	const [sideBarVisible, setSideBarVisible] = useState(true);
	const [workspaceFolder, setWorkspaceFolder] = useState<VirtualFolder | null>(null);
	const [explorerFolder, setExplorerFolder] = useState<VirtualFolder | null>(null);
	const [previewEnabled, setPreviewEnabled] = useState(false);

	const openFile = useCallback((newFile: VirtualFile) => {
		void newFile.read().then((newContent) => {
			setCurrentFile(newFile);
			setWorkspaceFolder((folder) => folder ?? newFile.parent ?? null);
			setExplorerFolder(newFile.parent ?? null);
			setContent(newContent ?? "");
			setOriginalContent(newContent ?? null);
			setUnsavedChanges(newContent === undefined);
		});
	}, []);

	useEffect(() => {
		if (file) {
			openFile(file);
		} else if (path) {
			const newFile = virtualRoot?.navigateToFile(path) ?? null;
			if (newFile)
				openFile(newFile);
		}
	}, [file, path, virtualRoot, openFile]);

	useEffect(() => {
		setTitle?.("");
	}, [setTitle]);

	const onChange: OnChange = useCallback((value) => {
		setUnsavedChanges(originalContent !== value);
		setContent(value ?? "");
	}, [originalContent]);

	const openNewFile = useCallback(() => {
		setCurrentFile(null);
		setContent("");
		setOriginalContent(null);
		setUnsavedChanges(true);
	}, []);

	const saveFile = useCallback(() => {
		if (currentFile) {
			currentFile.setContent(content);
			openFile(currentFile);
		}
	}, [content, currentFile, openFile]);

	useEffect(() => {
		const onShortcut = (event: KeyboardEvent) => {
			if (!event.ctrlKey)
				return;

			const key = event.key.toLowerCase();
			if (key === "s") {
				event.preventDefault();
				saveFile();
			} else if (event.shiftKey && key === "v" && currentFile?.extension === "md") {
				event.preventDefault();
				setPreviewEnabled((value) => !value);
			}
		};

		document.addEventListener("keydown", onShortcut);

		return () => {
			document.removeEventListener("keydown", onShortcut);
		};
	}, [currentFile?.extension, saveFile]);

	const openFileSelector = useCallback(() => {
		openWindowedModal({
			size: modalsConfig.defaultFileSelectorSize,
			Modal: (props: ModalProps) => <fileExplorer.WindowContent
				selectorMode={FileSelectorMode.Single}
				path={currentFile?.parent?.absolutePath}
				onSelectionFinish={({ files, directory }) => {
					const newFile = files?.length ? directory?.navigateToFile(files[0]) : null; 
					if (newFile)
						openFile(newFile);
					props.modal?.close();
				}}
				{...props}
			/>,
		});
	}, [currentFile?.parent?.absolutePath, modalsConfig.defaultFileSelectorSize, openFile, openWindowedModal]);

	const openFolderSelector = useCallback(() => {
		const FolderPicker = (props: ModalProps) => {
			const [selection, setSelection] = useState<OnSelectionChangeParams>({});
			const selectedFolder = selection.folders?.[0] != null
				? selection.directory?.navigate(selection.folders[0]) as VirtualFolder | undefined
				: null;
			const folderToOpen = selectedFolder ?? selection.directory ?? workspaceFolder ?? null;

			const Footer = () => <div className={styles.PickerFooter}>
				<button
					disabled={folderToOpen == null}
					onClick={() => {
						if (folderToOpen == null)
							return;

						setWorkspaceFolder(folderToOpen);
						setExplorerFolder(folderToOpen);
						props.modal?.close();
					}}
				>
					Open Folder
				</button>
			</div>;

			return <fileExplorer.WindowContent
				selectorMode={FileSelectorMode.Single}
				path={workspaceFolder?.absolutePath ?? "~"}
				Footer={Footer}
				onSelectionChange={setSelection}
				{...props}
			/>;
		};

		openWindowedModal({
			size: modalsConfig.defaultFileSelectorSize,
			Modal: FolderPicker,
		});
	}, [modalsConfig.defaultFileSelectorSize, openWindowedModal, workspaceFolder]);

	const options = useMemo((): EditorProps["options"] => ({
		lineNumbers: lineNumbersEnabled ? "on" : "off",
		minimap: {
			enabled: minimapEnabled,
		},
		fontSize: 13,
		fontLigatures: true,
		scrollBeyondLastLine: false,
		smoothScrolling: true,
		padding: {
			top: 12,
			bottom: 12,
		},
	}), [lineNumbersEnabled, minimapEnabled]);

	const currentFolder = explorerFolder ?? currentFile?.parent ?? workspaceFolder;
	const files = currentFolder?.getFiles(false) ?? [];
	const folders = currentFolder?.getSubFolders(false) ?? [];
	const language = extensionToLanguage(currentFile?.extension);

	const titleBarMenu = useMemo(() => <HeaderMenu>
		<DropdownAction label="File" showOnHover={false}>
			<ClickAction label="New" onTrigger={openNewFile} shortcut={["Control", "e"]}/>
			<ClickAction label="Open" onTrigger={openFileSelector} shortcut={["Control", "o"]}/>
			<ClickAction label="Open Folder" onTrigger={openFolderSelector}/>
			<Divider/>
			<ClickAction label="Save" onTrigger={saveFile} shortcut={["Control", "s"]}/>
			<Divider/>
			<ClickAction label="Exit" onTrigger={close} shortcut={["Control", "q"]}/>
		</DropdownAction>
		<DropdownAction label="View" showOnHover={false}>
			<DropdownAction label="Appearance">
				<ToggleAction label="Show explorer" initialValue={sideBarVisible} onTrigger={() => setSideBarVisible((value) => !value)}/>
				<ToggleAction label="Show line numbers" initialValue={lineNumbersEnabled} onTrigger={() => setLineNumbersEnabled((value) => !value)}/>
				<ToggleAction label="Show minimap" initialValue={minimapEnabled} onTrigger={() => setMinimapEnabled((value) => !value)}/>
			</DropdownAction>
			<ToggleAction label="Markdown preview" shortcut={["Control", "Shift", "v"]} initialValue={previewEnabled} disabled={currentFile?.extension !== "md"} onTrigger={() => setPreviewEnabled((value) => !value)}/>
		</DropdownAction>
	</HeaderMenu>, [close, currentFile?.extension, lineNumbersEnabled, minimapEnabled, openFileSelector, openFolderSelector, openNewFile, previewEnabled, saveFile, sideBarVisible]);

	useEffect(() => {
		setTitleBarContent?.(titleBarMenu);

		return () => {
			setTitleBarContent?.(null);
		};
	}, [setTitleBarContent, titleBarMenu]);

	return <div className={styles.CodeEditor}>
		<div className={styles.Workbench}>
			<div className={styles.ActivityBar}>
				<button className={styles.ActivityButton} title="Explorer" data-active={sideBarVisible} onClick={() => { setSideBarVisible((value) => !value); }}>
					<FontAwesomeIcon icon={faFile}/>
				</button>
				<button className={styles.ActivityButton} title="Search" disabled>
					<FontAwesomeIcon icon={faMagnifyingGlass}/>
				</button>
				<button className={styles.ActivityButton} title="Source" disabled>
					<FontAwesomeIcon icon={faCode}/>
				</button>
			</div>
			{sideBarVisible &&
				<aside className={styles.SideBar}>
					<header className={styles.SideBarHeader}>Explorer</header>
					<section className={styles.Tree}>
						<div className={styles.TreeRoot}>
							<FontAwesomeIcon icon={faChevronRight}/>
							<span>{currentFolder?.name ?? "No folder open"}</span>
						</div>
						{currentFolder == null &&
							<button className={styles.OpenWorkspaceButton} onClick={openFolderSelector}>
								Open Folder
							</button>
						}
						{folders.map((folder: VirtualFolder) =>
							<button key={folder.absolutePath} className={styles.TreeItem} onClick={() => { setExplorerFolder(folder); }}>
								<FontAwesomeIcon icon={faFolder}/>
								<span>{folder.name}</span>
							</button>
						)}
						{files.map((workspaceFile) =>
							<button key={workspaceFile.absolutePath} className={styles.TreeItem} data-active={workspaceFile.absolutePath === currentFile?.absolutePath} onClick={() => { openFile(workspaceFile); }}>
								<FontAwesomeIcon icon={faFile}/>
								<span>{workspaceFile.id}</span>
							</button>
						)}
					</section>
				</aside>
			}
			<main className={styles.EditorPane}>
				<div className={styles.Tabs}>
					<button className={styles.Tab} data-dirty={unsavedChanges}>
						<FontAwesomeIcon icon={previewEnabled ? faEye : faFile}/>
						<span>{currentFile?.id ?? "Untitled"}</span>
						<FontAwesomeIcon icon={faXmark}/>
					</button>
					{currentFile?.extension === "md" &&
						<button className={styles.PreviewToggle} title={previewEnabled ? "Edit Markdown" : "Preview Markdown"} onClick={() => { setPreviewEnabled((value) => !value); }}>
							<FontAwesomeIcon icon={previewEnabled ? faPen : faEye}/>
						</button>
					}
				</div>
				<div className={styles.EditorSurface}>
					{previewEnabled && currentFile?.extension === "md"
						? <article className={styles.MarkdownPreview}>
							<Markdown>{content}</Markdown>
						</article>
						: <Editor
							theme="vs-dark"
							onChange={onChange}
							value={content}
							language={language}
							options={options}
						/>
					}
				</div>
				<footer className={styles.StatusBar}>
					<span>{unsavedChanges ? "Unsaved changes" : "Saved"}</span>
					<span>{previewEnabled ? "Markdown Preview" : language ?? "plaintext"}</span>
					<span>{currentFile?.path ?? "Untitled"}</span>
				</footer>
			</main>
		</div>
	</div>;
}
