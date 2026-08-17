import { ChangeEventHandler, FC, KeyboardEventHandler, useCallback, useEffect, useState } from "react";
import styles from "./FileExplorer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faCaretLeft, faCaretRight, faCircleInfo, faDesktop, faDownload, faFileLines, faHouse, faImage, faList, faPlus, faSearch, faTableCellsLarge, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import { QuickAccessButton } from "./QuickAccessButton";
import { Actions, ClickAction, CODE_EXTENSIONS, DialogBox, DirectoryList, Divider, FileEventHandler, FolderEventHandler, ModalProps, ModalsConfig, OnSelectionChangeParams, useAlert, useContextMenu, useHistory, useSystemManager, useVirtualRoot, useWindowedModal, useWindowsManager, utilStyles, VirtualFile, VirtualFolder, VirtualFolderLink, VirtualRoot, WindowProps } from "@prozilla-os/core";
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

export function FileExplorer({ app, path: startPath, selectorMode, Footer, onSelectionChange, onSelectionFinish }: FileExplorerProps) {
	const isSelector = selectorMode != null && selectorMode !== SELECTOR_MODE.NONE;

	const virtualRoot = useVirtualRoot();
	const windowsManager = useWindowsManager();
	const { windowsConfig } = useSystemManager();

	const [currentDirectory, setCurrentDirectory] = useState<VirtualFolder | null>(virtualRoot ? virtualRoot.navigateToFolder(startPath ?? "~") : null);
	const [path, setPath] = useState<string>(currentDirectory?.path ?? "");
	const [searchQuery, setSearchQuery] = useState("");
	const [showHidden, setShowHidden] = useState(false);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const { history, stateIndex, pushState, undo, redo, undoAvailable, redoAvailable } = useHistory<string>(currentDirectory?.path ?? "");
	const { alert } = useAlert();

	const { openWindowedModal } = useWindowedModal();
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
			{(props.triggerParams as VirtualFile).isDownloadable() && 
				<ClickAction label="Export" icon={faUpload} onTrigger={(_event, file) => {
					(file as VirtualFile).download();
				}}/>
			}			
			<ClickAction label="Delete" icon={faTrash} onTrigger={(_event, file) => {
				(file as VirtualFile).delete();
			}}/>
			<ClickAction label="Properties" icon={faCircleInfo} onTrigger={(_event, file) => {
				openWindowedModal({
					title: `${(file as VirtualFile).id} ${windowsConfig.titleSeparator} Properties`,
					iconUrl: (file as VirtualFile).getIconUrl(),
					size: new Vector2(400, 500),
					Modal: (props: object) => <FileProperties file={file as VirtualFile} {...props}/>,
				});
			}}/>
		</Actions>,
	});
	const { onContextMenu: onContextMenuFolder } = useContextMenu({ Actions: (props) =>
		<Actions {...props}>
			<ClickAction label="Open" onTrigger={(_event, folder) => {
				changeDirectory((folder as VirtualFolderLink).linkedPath ?? (folder as VirtualFolder).name);
			}}/>
			{/* <ClickAction label={`Open in ${APP_NAMES.TERMINAL}`} icon={APP_ICONS.TERMINAL} onTrigger={(event, folder) => {
				windowsManager?.open(APPS.TERMINAL, { startPath: (folder as VirtualFolder).path });
			}}/> */}
			<Divider/>
			<ClickAction label="Delete" icon={faTrash} onTrigger={(_event, folder) => {
				(folder as VirtualFolder).delete();
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
					onClick={() => {
						openWindowedModal({
							title: "Error",
							iconUrl: app?.iconUrl as string | undefined,
							size: new Vector2(300, 150),
							Modal: (props: JSX.IntrinsicAttributes & ModalProps) =>
								<DialogBox {...props}>
									<p>This folder is protected.</p>
									<button data-type={ModalsConfig.DIALOG_CONTENT_TYPES.closeButton}>Ok</button>
								</DialogBox>,
						});

						// if (currentDirectory.canBeEdited) {
						// 	onNew(event);
						// } else {
							
						// }
					}}
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
					id="main"
					className={styles.Main}
					showHidden={showHidden}
					filter={searchQuery}
					viewMode={viewMode}
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
