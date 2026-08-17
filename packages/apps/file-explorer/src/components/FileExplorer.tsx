import { ChangeEventHandler, FC, FormEvent, KeyboardEventHandler, useCallback, useEffect, useState } from "react";
import styles from "./FileExplorer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDownAZ, faArrowUp, faCaretLeft, faCaretRight, faCircleInfo, faCopy, faDesktop, faDownload, faFile, faFileLines, faFolder, faHouse, faImage, faList, faPen, faPlus, faScissors, faSearch, faTableCellsLarge, faTerminal, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import { QuickAccessButton } from "./QuickAccessButton";
import { Actions, AppsConfig, ClickAction, CODE_EXTENSIONS, DialogBox, DirectoryList, Divider, DropdownAction, FileEventHandler, FolderEventHandler, ModalProps, ModalsConfig, OnSelectionChangeParams, useAlert, useContextMenu, useHistory, useSystemManager, useVirtualRoot, useWindowedModal, useWindowsManager, utilStyles, VirtualBase, VirtualFile, VirtualFolder, VirtualFolderLink, VirtualRoot, WindowedModal, WindowProps } from "@prozilla-os/core";
import { SELECTOR_MODE } from "../constants/fileExplorer.const";
import { FileProperties } from "./modals/file-properties/FileProperties";
import { JSX } from "react/jsx-runtime";
import { Vector2 } from "@prozilla-os/shared";

export interface FileExplorerProps extends WindowProps {
	path?: string;
	selectorMode?: number;
	Footer?: FC;
	onSelectionChange?: (params: OnSelectionChangeParams) => void;
	onSelectionFinish?: (params: OnSelectionChangeParams) => void;
}

interface NewItemDialogProps extends ModalProps {
	directory: VirtualFolder;
}

interface RenameItemDialogProps extends ModalProps {
	item: VirtualBase;
}

interface FolderPropertiesDialogProps extends ModalProps {
	folder: VirtualFolder;
}

function splitFileId(id: string) {
	const { name, extension } = VirtualFile.splitId(id);
	return { name, extension: extension ?? undefined };
}

function getUniqueFolderName(directory: VirtualFolder, baseName = "New Folder") {
	let name = baseName;
	let index = 2;
	while (directory.hasFolder(name)) {
		name = `${baseName} ${index}`;
		index++;
	}
	return name;
}

function getUniqueFileName(directory: VirtualFolder, baseId: string) {
	const { name: baseName, extension } = splitFileId(baseId);
	let name = baseName;
	let index = 2;
	while (directory.hasFile(name, extension)) {
		name = `${baseName} ${index}`;
		index++;
	}
	return extension != null ? `${name}.${extension}` : name;
}

function NewItemDialog({ directory, modal, ...props }: NewItemDialogProps) {
	const [type, setType] = useState<"folder" | "file">("folder");
	const [name, setName] = useState("New Folder");
	const [error, setError] = useState<string | null>(null);

	const onTypeChange = (newType: "folder" | "file") => {
		setType(newType);
		setName(newType === "folder" ? "New Folder" : "New File.txt");
		setError(null);
	};

	const onSubmit = (event: FormEvent) => {
		event.preventDefault();

		const trimmedName = name.trim();
		if (trimmedName === "") {
			setError("Name is required.");
			return;
		}
		if (trimmedName.includes("/") || trimmedName.includes("\\")) {
			setError("Name cannot contain slashes.");
			return;
		}

		if (type === "folder") {
			if (directory.hasFolder(trimmedName)) {
				setError("A folder with this name already exists.");
				return;
			}

			directory.createFolder(trimmedName);
		} else {
			const { name: fileName, extension } = VirtualFile.splitId(trimmedName);
			if (fileName.trim() === "") {
				setError("File name is required.");
				return;
			}
			if (directory.hasFile(fileName, extension ?? undefined)) {
				setError("A file with this name already exists.");
				return;
			}

			directory.createFile(fileName, extension ?? undefined, (file) => {
				if (file.isFile())
					file.setContent("");
			});
		}

		modal?.close();
	};

	return <WindowedModal modal={modal} {...props}>
		<form className={styles.NewItemDialog} onSubmit={onSubmit}>
			<div className={styles.NewItemType}>
				<button
					type="button"
					className={type === "folder" ? styles.Active : undefined}
					onClick={() => { onTypeChange("folder"); }}
				>
					<FontAwesomeIcon icon={faFolder}/>
					Folder
				</button>
				<button
					type="button"
					className={type === "file" ? styles.Active : undefined}
					onClick={() => { onTypeChange("file"); }}
				>
					<FontAwesomeIcon icon={faFile}/>
					File
				</button>
			</div>
			<label className={styles.NewItemName}>
				<span>Name</span>
				<input
					value={name}
					autoFocus
					onChange={(event) => {
						setName(event.currentTarget.value);
						setError(null);
					}}
				/>
			</label>
			{error != null && <p className={styles.NewItemError}>{error}</p>}
			<div className={styles.NewItemActions}>
				<button type="button" onClick={() => { modal?.close(); }}>Cancel</button>
				<button type="submit">Create</button>
			</div>
		</form>
	</WindowedModal>;
}

function RenameItemDialog({ item, modal, ...props }: RenameItemDialogProps) {
	const [name, setName] = useState(item.id);
	const [error, setError] = useState<string | null>(null);

	const onSubmit = (event: FormEvent) => {
		event.preventDefault();

		const trimmedName = name.trim();
		if (trimmedName === "") {
			setError("Name is required.");
			return;
		}
		if (trimmedName.includes("/") || trimmedName.includes("\\")) {
			setError("Name cannot contain slashes.");
			return;
		}

		const parent = item.parent;
		if (parent == null) {
			setError("This item cannot be renamed.");
			return;
		}

		if (item.isFolder()) {
			const existingFolder = parent.findSubFolder(trimmedName);
			if (existingFolder != null && existingFolder !== item) {
				setError("A folder with this name already exists.");
				return;
			}
			item.setName(trimmedName);
		} else if (item.isFile()) {
			const { name: fileName, extension } = splitFileId(trimmedName);
			const existingFile = parent.findFile(fileName, extension);
			if (existingFile != null && existingFile !== item) {
				setError("A file with this name already exists.");
				return;
			}
			item.setName(fileName);
			item.setExtension(extension);
		}

		modal?.close();
	};

	return <WindowedModal modal={modal} {...props}>
		<form className={styles.NewItemDialog} onSubmit={onSubmit}>
			<label className={styles.NewItemName}>
				<span>Name</span>
				<input
					value={name}
					autoFocus
					onChange={(event) => {
						setName(event.currentTarget.value);
						setError(null);
					}}
				/>
			</label>
			{error != null && <p className={styles.NewItemError}>{error}</p>}
			<div className={styles.NewItemActions}>
				<button type="button" onClick={() => { modal?.close(); }}>Cancel</button>
				<button type="submit">Rename</button>
			</div>
		</form>
	</WindowedModal>;
}

function FolderPropertiesDialog({ folder, modal, ...props }: FolderPropertiesDialogProps) {
	return <WindowedModal modal={modal} {...props}>
		<div className={styles.PropertiesDialog}>
			<div>
				<strong>Name</strong>
				<span>{folder.name}</span>
			</div>
			<div>
				<strong>Path</strong>
				<span>{folder.path}</span>
			</div>
			<div>
				<strong>Type</strong>
				<span>File folder</span>
			</div>
			<div>
				<strong>Contains</strong>
				<span>{folder.getItemCount(true)} items</span>
			</div>
			<div className={styles.NewItemActions}>
				<button type="button" onClick={() => { modal?.close(); }}>Close</button>
			</div>
		</div>
	</WindowedModal>;
}

export function FileExplorer({ app, path: startPath, selectorMode, Footer, onSelectionChange, onSelectionFinish, active }: FileExplorerProps) {
	const isSelector = selectorMode != null && selectorMode !== SELECTOR_MODE.NONE;

	const virtualRoot = useVirtualRoot();
	const windowsManager = useWindowsManager();
	const { windowsConfig, appsConfig } = useSystemManager();

	const [currentDirectory, setCurrentDirectory] = useState<VirtualFolder | null>(virtualRoot ? virtualRoot.navigateToFolder(startPath ?? "~") : null);
	const [path, setPath] = useState<string>(currentDirectory?.path ?? "");
	const [searchQuery, setSearchQuery] = useState("");
	const [showHidden, setShowHidden] = useState(false);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [sortBy, setSortBy] = useState<"name" | "type">("name");
	const { history, stateIndex, pushState, undo, redo, undoAvailable, redoAvailable } = useHistory<string>(currentDirectory?.path ?? "");
	const { alert } = useAlert();

	const { openWindowedModal } = useWindowedModal();
	const openNewItemDialog = useCallback(() => {
		if (currentDirectory == null || !currentDirectory.canBeEdited)
			return;

		openWindowedModal({
			title: "New item",
			iconUrl: app?.iconUrl as string | undefined,
			size: new Vector2(360, 260),
			Modal: (props: JSX.IntrinsicAttributes & ModalProps) =>
				<NewItemDialog directory={currentDirectory} {...props}/>,
		});
	}, [app?.iconUrl, currentDirectory, openWindowedModal]);
	const createFolder = useCallback(() => {
		if (currentDirectory == null || !currentDirectory.canBeEdited)
			return;

		currentDirectory.createFolder(getUniqueFolderName(currentDirectory));
	}, [currentDirectory]);
	const createFile = useCallback((baseId: string) => {
		if (currentDirectory == null || !currentDirectory.canBeEdited)
			return;

		const id = getUniqueFileName(currentDirectory, baseId);
		const { name, extension } = splitFileId(id);
		currentDirectory.createFile(name, extension, (file) => {
			if (file.isFile())
				file.setContent("");
		});
	}, [currentDirectory]);
	const openRenameDialog = useCallback((item: VirtualBase) => {
		openWindowedModal({
			title: `Rename ${item.id}`,
			iconUrl: item.getIconUrl(),
			size: new Vector2(340, 220),
			Modal: (props: JSX.IntrinsicAttributes & ModalProps) =>
				<RenameItemDialog item={item} {...props}/>,
		});
	}, [openWindowedModal]);
	const openProperties = useCallback((file: VirtualFile) => {
		openWindowedModal({
			title: `${file.id} ${windowsConfig.titleSeparator} Properties`,
			iconUrl: file.getIconUrl(),
			size: new Vector2(400, 500),
			Modal: (props: object) => <FileProperties file={file} {...props}/>,
		});
	}, [openWindowedModal, windowsConfig.titleSeparator]);
	const openFolderProperties = useCallback((folder: VirtualFolder) => {
		openWindowedModal({
			title: `${folder.name} ${windowsConfig.titleSeparator} Properties`,
			iconUrl: folder.getIconUrl(),
			size: new Vector2(400, 340),
			Modal: (props: JSX.IntrinsicAttributes & ModalProps) =>
				<FolderPropertiesDialog folder={folder} {...props}/>,
		});
	}, [openWindowedModal, windowsConfig.titleSeparator]);
	const openTerminal = useCallback((folder: VirtualFolder | null) => {
		const terminalApp = appsConfig.getAppByRole(AppsConfig.APP_ROLES.terminal);
		if (terminalApp == null || folder == null)
			return;

		windowsManager?.open(terminalApp.id, { path: folder.path });
	}, [appsConfig, windowsManager]);
	const { onContextMenu: onContextMenuBackground } = useContextMenu({ Actions: (props) =>
		<Actions {...props}>
			<DropdownAction label="Sort by" icon={faArrowDownAZ}>
				<ClickAction label="Name" disabled={sortBy === "name"} onTrigger={() => { setSortBy("name"); }}/>
				<ClickAction label="Type" disabled={sortBy === "type"} onTrigger={() => { setSortBy("type"); }}/>
			</DropdownAction>
			<DropdownAction label="New" icon={faPlus}>
				<ClickAction label="Folder" icon={faFolder} disabled={!currentDirectory?.canBeEdited} onTrigger={createFolder}/>
				<ClickAction label="Text document" icon={faFileLines} disabled={!currentDirectory?.canBeEdited} onTrigger={() => { createFile("New Text Document.txt"); }}/>
				<ClickAction label="Markdown document" icon={faFileLines} disabled={!currentDirectory?.canBeEdited} onTrigger={() => { createFile("New Markdown.md"); }}/>
			</DropdownAction>
			<Divider/>
			<ClickAction label="Open in Terminal" icon={faTerminal} disabled={currentDirectory == null} onTrigger={() => { openTerminal(currentDirectory); }}/>
			<ClickAction label="New item..." icon={faPlus} disabled={!currentDirectory?.canBeEdited} onTrigger={openNewItemDialog}/>
			<ClickAction label="Properties" icon={faCircleInfo} disabled={currentDirectory == null} onTrigger={() => {
				if (currentDirectory != null)
					openFolderProperties(currentDirectory);
			}}/>
		</Actions>,
	});
	const { onContextMenu: onContextMenuFile } = useContextMenu({ Actions: (props) =>
		<Actions {...props}>
			<ClickAction label={!isSelector ? "Open" : "Select"} onTrigger={(_event, file) => {
				if (isSelector) {
					onSelectionChange?.({ files: [(file as VirtualFile).id], directory: currentDirectory! });
					onSelectionFinish?.({ files: [(file as VirtualFile).id], directory: currentDirectory! });
					return;
				}
				if (windowsManager != null)	(file as VirtualFile).open(windowsManager);
			}}/>
			<Divider/>
			<ClickAction label="Cut" icon={faScissors} disabled/>
			<ClickAction label="Copy" icon={faCopy} disabled/>
			<ClickAction label="Rename" icon={faPen} disabled={!(props.triggerParams as VirtualFile).canBeEdited} onTrigger={(_event, file) => {
				openRenameDialog(file as VirtualFile);
			}}/>
			{(props.triggerParams as VirtualFile).isDownloadable() && 
				<ClickAction label="Export" icon={faUpload} onTrigger={(_event, file) => {
					(file as VirtualFile).download();
				}}/>
			}
			<ClickAction label="Delete" icon={faTrash} disabled={!(props.triggerParams as VirtualFile).canBeDeleted} onTrigger={(_event, file) => {
				(file as VirtualFile).delete();
			}}/>
			<ClickAction label="Properties" icon={faCircleInfo} onTrigger={(_event, file) => {
				openProperties(file as VirtualFile);
			}}/>
		</Actions>,
	});
	const { onContextMenu: onContextMenuFolder } = useContextMenu({ Actions: (props) =>
		<Actions {...props}>
			<ClickAction label="Open" onTrigger={(_event, folder) => {
				changeDirectory((folder as VirtualFolderLink).linkedPath ?? (folder as VirtualFolder).name);
			}}/>
			<Divider/>
			<ClickAction label="Cut" icon={faScissors} disabled/>
			<ClickAction label="Copy" icon={faCopy} disabled/>
			<ClickAction label="Rename" icon={faPen} disabled={!(props.triggerParams as VirtualFolder).canBeEdited} onTrigger={(_event, folder) => {
				openRenameDialog(folder as VirtualFolder);
			}}/>
			<ClickAction label="Open in Terminal" icon={faTerminal} onTrigger={(_event, folder) => {
				openTerminal(folder as VirtualFolder);
			}}/>
			{/* <ClickAction label={`Open in ${APP_NAMES.TERMINAL}`} icon={APP_ICONS.TERMINAL} onTrigger={(event, folder) => {
				windowsManager?.open(APPS.TERMINAL, { startPath: (folder as VirtualFolder).path });
			}}/> */}
			<ClickAction label="Delete" icon={faTrash} disabled={!(props.triggerParams as VirtualFolder).canBeDeleted} onTrigger={(_event, folder) => {
				(folder as VirtualFolder).delete();
			}}/>
			<ClickAction label="Properties" icon={faCircleInfo} onTrigger={(_event, folder) => {
				openFolderProperties(folder as VirtualFolder);
			}}/>
		</Actions>,
	});
	// const { onContextMenu: onNew } = useContextMenu({
	// 	modalsManager,
	// 	options: {
	// 		"File": () => { currentDirectory.createFile("New File"); },
	// 		"Folder": () => { currentDirectory.createFolder("New Folder"); }
	// 	}
	// });

	const changeDirectory = useCallback((path: string, absolute = false) => {
		if (currentDirectory == null)
			absolute = true;

		const directory = absolute ? virtualRoot?.navigate(path) : currentDirectory?.navigate(path);

		if (directory != null) {
			setCurrentDirectory(directory as VirtualFolder);
			setPath(directory.root ? "/" : directory.path);
			pushState(directory.path);
		}
	}, [currentDirectory, pushState, virtualRoot]);

	useEffect(() => {
		if (history.length === 0)
			return;

		const path = history[stateIndex];
		const directory = virtualRoot?.navigate(path);
		if (directory != null) {
			setCurrentDirectory(directory as VirtualFolder);
			setPath(directory.root ? "/" : directory.path);
		}
	}, [history, stateIndex, virtualRoot]);

	useEffect(() => {
		type Error = { message: string };
		const onError = (error: unknown) => {
			alert({
				title: (error as Error).message,
				text: "You have exceeded the virtual drive capacity. Files and folders will not be saved until more storage is freed.",
				iconUrl: app?.iconUrl as string | undefined,
				size: new Vector2(300, 200),
				single: true,
			});
		};

		virtualRoot?.on(VirtualRoot.ERROR_EVENT, onError);

		return () => {
			virtualRoot?.off(VirtualRoot.ERROR_EVENT, onError);
		};
	}, []);

	useEffect(() => {
		const onToggleHidden = (event: KeyboardEvent) => {
			if (!event.ctrlKey || event.key.toLowerCase() !== "h")
				return;

			event.preventDefault();
			setShowHidden((value) => !value);
		};

		document.addEventListener("keydown", onToggleHidden);

		return () => {
			document.removeEventListener("keydown", onToggleHidden);
		};
	}, []);

	const onPathChange = (event: Event) => {
		setPath((event.target as HTMLInputElement).value);
	};

	const onKeyDown = (event: KeyboardEvent) => {
		let value = (event.target as HTMLInputElement).value;

		if (event.key === "Enter") {
			if (value === "")
				value = "~";

			const directory = virtualRoot?.navigate(value);

			if (directory == null) {
				openWindowedModal({
					title: "Error",
					iconUrl: app?.iconUrl as string | undefined,
					size: new Vector2(300, 150),
					Modal: (props: JSX.IntrinsicAttributes & ModalProps) =>
						<DialogBox {...props}>
							<p>Invalid path: "{value}"</p>
							<button data-type={ModalsConfig.DIALOG_CONTENT_TYPES.closeButton}>Ok</button>
						</DialogBox>,
				});
				return;
			} else if (directory.isFolder()) {
				setCurrentDirectory(directory);
				setPath(directory.root ? "/" : directory.path);
			}
		}
	};

	const itemCount = currentDirectory?.getItemCount(showHidden) ?? 0;

	return (
		<div className={!isSelector ? styles.FileExplorer : `${styles.FileExplorer} ${styles.Selector}`}>
			<div className={styles.Header}>
				<button
					title="Back"
					tabIndex={0}
					className={styles.IconButton}
					onClick={() => { undo(); }}
					disabled={!undoAvailable}
				>
					<FontAwesomeIcon icon={faCaretLeft}/>
				</button>
				<button
					title="Forward"
					tabIndex={0}
					className={styles.IconButton}
					onClick={() => { redo(); }}
					disabled={!redoAvailable}
				>
					<FontAwesomeIcon icon={faCaretRight}/>
				</button>
				<button
					title="Up"
					tabIndex={0}
					className={styles.IconButton}
					onClick={() => { changeDirectory(".."); }}
					disabled={currentDirectory?.isRoot != null && currentDirectory.isRoot}
				>
					<FontAwesomeIcon icon={faArrowUp}/>
				</button>
				<button
					title="New"
					tabIndex={0}
					className={styles.IconButton}
					onClick={openNewItemDialog}
					disabled={!currentDirectory?.canBeEdited}
				>
					<FontAwesomeIcon icon={faPlus}/>
				</button>
				<input
					value={path}
					type="text"
					aria-label="Path"
					className={styles.PathInput}
					tabIndex={0}
					onChange={onPathChange as unknown as ChangeEventHandler}
					onKeyDown={onKeyDown as unknown as KeyboardEventHandler}
					placeholder="Enter a path..."
				/>
				<label className={styles.SearchInput}>
					<FontAwesomeIcon icon={faSearch}/>
					<input
						value={searchQuery}
						type="search"
						aria-label="Search files"
						tabIndex={0}
						onChange={(event) => { setSearchQuery(event.target.value); }}
						placeholder="Search"
					/>
				</label>
			</div>
			<div className={styles.Body}>
				<div className={styles.Sidebar}>
					<QuickAccessButton name={"Home"} onClick={() => { changeDirectory("~"); }} icon={faHouse}/>
					<QuickAccessButton name={"Desktop"} onClick={() => { changeDirectory("~/Desktop"); }} icon={faDesktop}/>
					<QuickAccessButton name={"Downloads"} onClick={() => { changeDirectory("~/Downloads"); }} icon={faDownload}/>
					<QuickAccessButton name={"Pictures"} onClick={() => { changeDirectory("~/Pictures"); }} icon={faImage}/>
					<QuickAccessButton name={"Documents"} onClick={() => { changeDirectory("~/Documents"); }} icon={faFileLines}/>
				</div>
				<DirectoryList
					directory={currentDirectory!}
					active={active}
					id="main"
					className={styles.Main}
					showHidden={showHidden}
					filter={searchQuery}
					viewMode={viewMode}
					sortBy={sortBy}
					onOpenFile={(event, file) => {
						event.preventDefault();
						if (isSelector)
							return void onSelectionFinish?.({ files: [file.id], directory: currentDirectory! });
						const options: Record<string, string> = {};
						if (file.extension === "md" || file.extension != null && CODE_EXTENSIONS.includes(file.extension))
							options.mode = "view";
						windowsManager?.openFile(file, options);
					}}
					onOpenFolder={(_event, folder) => {
						changeDirectory((folder as VirtualFolderLink).linkedPath ?? folder.name);
					}}
					onContextMenuFile={onContextMenuFile as unknown as FileEventHandler}
					onContextMenuFolder={onContextMenuFolder as unknown as FolderEventHandler}
					allowMultiSelect={selectorMode !== SELECTOR_MODE.SINGLE}
					onSelectionChange={onSelectionChange}
					onContextMenu={onContextMenuBackground}
				/>
			</div>
			{!isSelector
				? <span className={styles.Footer}>
					<p className={utilStyles.TextLight}>
						{itemCount === 1
							? itemCount + " item"
							: itemCount + " items"
						}
					</p>
					<div className={styles.ViewButtons}>
						<button
							title="List view"
							tabIndex={0}
							className={viewMode === "list" ? `${styles.ViewButton} ${styles.Active}` : styles.ViewButton}
							onClick={() => { setViewMode("list"); }}
						>
							<FontAwesomeIcon icon={faList}/>
						</button>
						<button
							title="Grid view"
							tabIndex={0}
							className={viewMode === "grid" ? `${styles.ViewButton} ${styles.Active}` : styles.ViewButton}
							onClick={() => { setViewMode("grid"); }}
						>
							<FontAwesomeIcon icon={faTableCellsLarge}/>
						</button>
					</div>
				</span>
				: Footer && <div className={styles.Footer}>
					<Footer/>
				</div>
			}
		</div>
	);
}
