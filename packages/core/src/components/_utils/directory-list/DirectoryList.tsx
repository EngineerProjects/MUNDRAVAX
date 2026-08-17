import { ForwardedRef, forwardRef, ForwardRefRenderFunction, MouseEventHandler, ReactElement, useEffect, useImperativeHandle, useRef, useState } from "react";
import styles from "./DirectoryList.module.css";
import { ImagePreview } from "./ImagePreview";
import { VirtualFile } from "../../../features/virtual-drive/file";
import { VirtualFolder } from "../../../features/virtual-drive/folder";
import { Interactable } from "../interactable/Interactable";
import { useClassNames } from "../../../hooks/_utils/classNames";
import { removeFromArray, Vector2 } from "@prozilla-os/shared";
import { VirtualBase } from "../../../features/virtual-drive/virtualBase";
import { isEditableTarget } from "../../../features/_utils/keyboard.utils";
import { isValidName } from "../../../features/_utils/path.utils";
import { useWindowedModal } from "../../../hooks/modals/windowedModal";
import { DialogBox } from "../../modals/dialog-box/DialogBox";
import { ModalProps } from "../../modals/ModalView";

interface RenamingState {
	type: "file" | "folder";
	id: string;
}

interface RenameFieldProps {
	item: VirtualFile | VirtualFolder;
	error: string | null;
	onCommit: (value: string) => void;
	onCancel: () => void;
	onEdit: () => void;
}

/**
 * Editable name shown in place of an item's label while it's being renamed.
 * Kept out of the `Interactable` button (which hijacks every click inside it
 * for select/open handling) so the input can be focused, clicked, and
 * double-clicked to select a word without triggering navigation.
 */
function RenameField({ item, error, onCommit, onCancel, onEdit }: RenameFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const initialValue = item.isFolder() ? item.name : item.id;
	const [value, setValue] = useState(initialValue);
	// Guards against the native `blur` fired when this input is unmounted
	// (right after a successful Enter/Escape) from re-triggering onCommit.
	const finalizedRef = useRef(false);

	useEffect(() => {
		const input = inputRef.current;
		if (input == null)
			return;

		input.focus();
		if (item.isFolder()) {
			input.select();
		} else {
			const { name } = VirtualFile.splitId(initialValue);
			input.setSelectionRange(0, name.length);
		}
	}, []);

	useEffect(() => {
		if (error != null)
			finalizedRef.current = false;
	}, [error]);

	return <span className={styles.RenameField}>
		<input
			ref={inputRef}
			value={value}
			onClick={(event) => { event.stopPropagation(); }}
			onMouseDown={(event) => { event.stopPropagation(); }}
			onDoubleClick={(event) => { event.stopPropagation(); }}
			onChange={(event) => {
				setValue(event.currentTarget.value);
				onEdit();
			}}
			onBlur={() => {
				if (finalizedRef.current)
					return;
				finalizedRef.current = true;
				onCommit(value);
			}}
			onKeyDown={(event) => {
				event.stopPropagation();
				if (event.key === "Enter") {
					event.preventDefault();
					finalizedRef.current = true;
					onCommit(value);
				} else if (event.key === "Escape") {
					event.preventDefault();
					finalizedRef.current = true;
					onCancel();
				}
			}}
		/>
		{error != null && <span className={styles.RenameError}>{error}</span>}
	</span>;
}

interface DeleteConfirmDialogProps extends ModalProps {
	count: number;
	onConfirm: () => void;
}

function DeleteConfirmDialog({ count, onConfirm, modal, ...props }: DeleteConfirmDialogProps) {
	return <DialogBox modal={modal} {...props}>
		<p className={styles.DeleteConfirmText}>Are you sure you want to delete {count} item{count === 1 ? "" : "s"}?</p>
		<div className={styles.DeleteConfirmActions}>
			<button type="button" onClick={() => { modal?.close(); }}>Cancel</button>
			<button type="button" data-danger="true" onClick={() => {
				onConfirm();
				modal?.close();
			}}>Delete</button>
		</div>
	</DialogBox>;
}

export interface OnSelectionChangeParams {
	/** The selected files. */
	files?: string[];
	/** The selected folders. */
	folders?: string[];
	/** The directory the selection was made in. */
	directory?: VirtualFolder;
};

export type FileEventHandler = (event: Event, file: VirtualFile) => void;
export type FolderEventHandler = (event: Event, folder: VirtualFolder) => void;

export interface DirectoryListProps {
	/** The directory to display. */
	directory: VirtualFolder;
	/**
	 * Whether this list should respond to global shortcuts (Ctrl+A, Delete).
	 * Used to make sure only the focused window (or the desktop, when no
	 * window is focused) reacts to them when multiple instances exist.
	 * @default true
	 */
	active?: boolean;
	/** Whether to show hidden files and folders. */
	showHidden?: boolean;
	/** `className` prop for folders. */
	folderClassName?: string;
	/** `className` prop for files. */
	fileClassName?: string;
	/** `className` prop for this component. */
	className?: string;
	/** Function that handles context menu interactions on files. */
	onContextMenuFile?: FileEventHandler;
	/** Function that handles context menu interactions on folders. */
	onContextMenuFolder?: FolderEventHandler;
	/** Function that handles file opening events. */
	onOpenFile?: FileEventHandler;
	/** Function that handles folder opening events. */
	onOpenFolder?: FolderEventHandler;
	/** Whether to allow multiple files and folders to be selected at the same time. */
	allowMultiSelect?: boolean;
	/** Function that handles selection changes. */
	onSelectionChange?: (params: OnSelectionChangeParams) => void;
	filter?: string;
	viewMode?: "grid" | "list";
	sortBy?: "name" | "type";
	[key: string]: unknown;
}

export interface DirectoryListHandle {
	/** Starts inline-renaming the given file or folder, in place of its label. */
	startRename: (item: VirtualFile | VirtualFolder) => void;
}

/**
 * Component that displays the contents of a directory.
 */
// `forwardRef`'s built-in `PropsWithoutRef<P>` helper collapses `directory`
// (and the rest) to optional because `DirectoryListProps` has a `[key: string]:
// unknown` index signature ("ref" structurally extends that signature's keys,
// so TS routes through `Omit<P, "ref">`, which loses the specific properties).
// The render function is cast to sidestep that inference; the exported const
// is cast right back to the intended, fully-typed shape.
function DirectoryListImpl({ directory, active = true, showHidden = false, folderClassName, fileClassName, className,
	onContextMenuFile, onContextMenuFolder, onOpenFile, onOpenFolder, allowMultiSelect = true, onSelectionChange, filter = "", viewMode = "grid", sortBy = "name", ...props }: DirectoryListProps, handleRef: ForwardedRef<DirectoryListHandle>): ReactElement | null {
	const [folders, setFolders] = useState<VirtualFolder[]>([]);
	const [files, setFiles] = useState<VirtualFile[]>([]);
	const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
	const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
	const [renaming, setRenaming] = useState<RenamingState | null>(null);
	const [renameError, setRenameError] = useState<string | null>(null);

	const { openWindowedModal } = useWindowedModal();

	const ref = useRef<HTMLDivElement>(null);
	const [rectSelectStart, setRectSelectStart] = useState<Vector2 | null>(null);
	const [rectSelectEnd, setRectSelectEnd] = useState<Vector2 | null>(null);
	/** The selection to union new rectangle matches into (non-empty only when the drag started with Ctrl held). */
	const rectSelectBaseRef = useRef<{ folders: string[]; files: string[]; }>({ folders: [], files: [] });

	useEffect(() => {
		onSelectionChange?.({ files: selectedFiles, folders: selectedFolders, directory });
	}, [directory, onSelectionChange, selectedFiles, selectedFolders]);

	const clearSelection = () => {
		setSelectedFolders([]);
		setSelectedFiles([]);
	};

	useEffect(() => {
		clearSelection();
		setRenaming(null);
		setRenameError(null);
	}, [directory]);

	const cancelRename = () => {
		setRenaming(null);
		setRenameError(null);
	};

	const commitRename = (item: VirtualFile | VirtualFolder, rawValue: string) => {
		const trimmedName = rawValue.trim();
		const currentId = item.isFolder() ? item.name : item.id;

		if (trimmedName === "" || trimmedName === currentId) {
			cancelRename();
			return;
		}

		if (!isValidName(trimmedName)) {
			setRenameError("That name isn't valid.");
			return;
		}

		const parent = item.parent;
		if (parent == null) {
			cancelRename();
			return;
		}

		if (item.isFolder()) {
			const existingFolder = parent.findSubFolder(trimmedName);
			if (existingFolder != null && existingFolder !== item) {
				setRenameError("A folder with this name already exists.");
				return;
			}
			item.setName(trimmedName);
		} else {
			const { name, extension } = VirtualFile.splitId(trimmedName);
			const existingFile = parent.findFile(name, extension);
			if (existingFile != null && existingFile !== item) {
				setRenameError("A file with this name already exists.");
				return;
			}
			item.setName(name);
			item.setExtension(extension ?? undefined);
		}

		cancelRename();
	};

	useImperativeHandle(handleRef, () => ({
		startRename: (item) => {
			setRenaming({ type: item.isFolder() ? "folder" : "file", id: item.id });
			setRenameError(null);
		},
	}), []);

	const applyRectSelection = (start: Vector2, end: Vector2) => {
		if (ref.current == null)
			return;

		const left = Math.min(start.x, end.x);
		const right = Math.max(start.x, end.x);
		const top = Math.min(start.y, end.y);
		const bottom = Math.max(start.y, end.y);

		const matchedFolders: string[] = [];
		const matchedFiles: string[] = [];

		ref.current.querySelectorAll<HTMLElement>("[data-id]").forEach((element) => {
			const rect = element.getBoundingClientRect();
			const intersects = rect.left < right && rect.right > left && rect.top < bottom && rect.bottom > top;

			if (!intersects || element.dataset.id == null)
				return;

			if (element.dataset.type === "folder") {
				matchedFolders.push(element.dataset.id);
			} else {
				matchedFiles.push(element.dataset.id);
			}
		});

		const base = rectSelectBaseRef.current;
		setSelectedFolders([...new Set([...base.folders, ...matchedFolders])]);
		setSelectedFiles([...new Set([...base.files, ...matchedFiles])]);
	};

	useEffect(() => {
		// Minimum drag distance (in pixels) before a click is treated as a rectangle select,
		// so a plain click on empty space doesn't briefly flash/apply an empty selection.
		const DRAG_THRESHOLD = 4;

		const onMoveRectSelect = (event: MouseEvent) => {
			if (rectSelectStart == null)
				return;

			const dx = Math.abs(event.clientX - rectSelectStart.x);
			const dy = Math.abs(event.clientY - rectSelectStart.y);
			if (rectSelectEnd == null && dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD)
				return;

			event.preventDefault();
			const end = { x: event.clientX, y: event.clientY } as Vector2;
			setRectSelectEnd(end);
			applyRectSelection(rectSelectStart, end);
		};
		const onStopRectSelect = (event: MouseEvent) => {
			if (rectSelectStart == null)
				return;

			event.preventDefault();
			setRectSelectStart(null);
			setRectSelectEnd(null);
		};

		document.addEventListener("mousemove", onMoveRectSelect);
		document.addEventListener("mouseup", onStopRectSelect);

		return () => {
			document.removeEventListener("mousemove", onMoveRectSelect);
			document.removeEventListener("mouseup", onStopRectSelect);
		};
	});

	useEffect(() => {
		const onUpdate = () => {
			setFolders([...directory.getSubFolders(showHidden)]);
			setFiles([...directory.getFiles(showHidden)]);

			setSelectedFolders((folders) => folders.filter((folder) => directory.hasFolder(folder)));
			setSelectedFiles((files) => files.filter((file) => {
				const { name, extension } = VirtualFile.splitId(file);
				return directory.hasFile(name, extension as string | undefined);
			}));
		};

		onUpdate();
		directory.on(VirtualBase.UPDATE_EVENT, onUpdate);

		return () => {
			directory.off(VirtualBase.UPDATE_EVENT, onUpdate);
		};
	}, [directory, showHidden]);

	const selectFolder = (folder: VirtualFolder, exclusive = false) => {
		if (!allowMultiSelect)
			exclusive = true;
		setSelectedFolders(exclusive ? [folder.id] : [...selectedFolders, folder.id]);
		if (exclusive)
			setSelectedFiles([]);
	};

	const selectFile = (file: VirtualFile, exclusive = false) => {
		if (!allowMultiSelect)
			exclusive = true;
		setSelectedFiles(exclusive ? [file.id] : [...selectedFiles, file.id]);
		if (exclusive)
			setSelectedFolders([]);
	};

	const deselectFolder = (folder: VirtualFolder) => {
		const newFolders = [...selectedFolders];
		removeFromArray(folder.id, newFolders);
		setSelectedFolders(newFolders);
	};

	const deselectFile = (file: VirtualFile) => {
		const newFiles = [...selectedFiles];
		removeFromArray(file.id, newFiles);
		setSelectedFiles(newFiles);
	};

	const onStartRectSelect = (event: MouseEvent) => {
		if (event.button !== 0 || !allowMultiSelect)
			return;

		event.preventDefault();
		rectSelectBaseRef.current = event.ctrlKey
			? { folders: selectedFolders, files: selectedFiles }
			: { folders: [], files: [] };
		setRectSelectStart({ x: event.clientX, y: event.clientY } as Vector2);
	};

	const getRectSelectStyle = () => {
		let x: number, y: number, width: number, height: number = 0;

		if (ref.current == null || rectSelectStart == null || rectSelectEnd == null)
			return { top: 0, left: 0, width: 0, height: 0 };

		const containerRect = ref.current.getBoundingClientRect();

		if (rectSelectStart.x < rectSelectEnd.x) {
			x = rectSelectStart.x;
			width = rectSelectEnd.x - rectSelectStart.x;
		} else {
			x = rectSelectEnd.x;
			width = rectSelectStart.x - rectSelectEnd.x;
		}
		if (rectSelectStart.y < rectSelectEnd.y) {
			y = rectSelectStart.y;
			height = rectSelectEnd.y - rectSelectStart.y;
		} else {
			y = rectSelectEnd.y;
			height = rectSelectStart.y - rectSelectEnd.y;
		}

		x -= containerRect.x;
		y -= containerRect.y;
		

		return { top: y, left: x, width, height };
	};

	const classNames = [styles.DirectoryList];
	const folderClassNames = [styles.FolderButton];
	const fileClassNames = [styles.FileButton];

	if (className)
		classNames.push(className);
	if (viewMode === "list")
		classNames.push(styles.ListView);
	if (folderClassName)
		folderClassNames.push(folderClassName);
	if (fileClassName)
		fileClassNames.push(fileClassName);

	const normalizedFilter = filter.trim().toLowerCase();
	const visibleFolders = normalizedFilter
		? folders.filter((folder) => folder.name.toLowerCase().includes(normalizedFilter))
		: folders;
	const visibleFiles = normalizedFilter
		? files.filter((file) => file.id.toLowerCase().includes(normalizedFilter))
		: files;

	visibleFolders.sort((left, right) => left.name.localeCompare(right.name));
	visibleFiles.sort((left, right) => {
		if (sortBy === "type") {
			const typeCompare = (left.extension ?? "").localeCompare(right.extension ?? "");
			if (typeCompare !== 0)
				return typeCompare;
		}

		return left.id.localeCompare(right.id);
	});

	useEffect(() => {
		if (!allowMultiSelect)
			return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (!active || isEditableTarget(event.target))
				return;
			if (!event.ctrlKey || event.key.toLowerCase() !== "a")
				return;

			event.preventDefault();
			setSelectedFolders(visibleFolders.map((folder) => folder.id));
			setSelectedFiles(visibleFiles.map((file) => file.id));
		};

		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [active, allowMultiSelect, visibleFolders, visibleFiles]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (!active || isEditableTarget(event.target))
				return;
			if (event.key !== "Delete")
				return;
			if (selectedFolders.length === 0 && selectedFiles.length === 0)
				return;

			const foldersToDelete = folders.filter((folder) => selectedFolders.includes(folder.id) && folder.canBeDeleted);
			const filesToDelete = files.filter((file) => selectedFiles.includes(file.id) && file.canBeDeleted);
			const total = foldersToDelete.length + filesToDelete.length;

			if (total === 0)
				return;

			event.preventDefault();

			openWindowedModal({
				title: "Confirm delete",
				size: new Vector2(320, 180),
				single: true,
				Modal: (modalProps: ModalProps) =>
					<DeleteConfirmDialog
						{...modalProps}
						count={total}
						onConfirm={() => {
							foldersToDelete.forEach((folder) => { folder.delete(); });
							filesToDelete.forEach((file) => { file.delete(); });
						}}
					/>,
			});
		};

		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [active, selectedFolders, selectedFiles, folders, files, openWindowedModal]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (!active || isEditableTarget(event.target) || renaming != null)
				return;
			if (event.key !== "F2")
				return;

			const singleFolder = selectedFolders.length === 1 && selectedFiles.length === 0
				? folders.find((folder) => folder.id === selectedFolders[0])
				: null;
			const singleFile = selectedFiles.length === 1 && selectedFolders.length === 0
				? files.find((file) => file.id === selectedFiles[0])
				: null;

			if (singleFolder != null && singleFolder.canBeEdited) {
				event.preventDefault();
				setRenaming({ type: "folder", id: singleFolder.id });
				setRenameError(null);
			} else if (singleFile != null && singleFile.canBeEdited) {
				event.preventDefault();
				setRenaming({ type: "file", id: singleFile.id });
				setRenameError(null);
			}
		};

		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [active, renaming, selectedFolders, selectedFiles, folders, files]);

	folderClassName = useClassNames(folderClassNames, "DirectoryList", "Folder");
	fileClassName = useClassNames(fileClassNames, "DirectoryList", "File");

	const formatFileSize = (file: VirtualFile): string => {
		if (file.content == null)
			return "";

		const bytes = new Blob([file.content]).size;
		if (bytes < 1000)
			return `${bytes} B`;

		return `${Math.round(bytes / 1000)} KB`;
	};

	return <div
		ref={ref}
		className={useClassNames(classNames, "DirectoryList")}
		onClick={clearSelection}
		onMouseDown={onStartRectSelect as unknown as MouseEventHandler}
		{...props}
	>
		{rectSelectStart != null && rectSelectEnd != null
			? <div className={styles.SelectionRect} style={getRectSelectStyle()}/>
			: null
		}
		{viewMode === "list" &&
			<div className={styles.ListHeader}>
				<span>Name</span>
				<span>Date modified</span>
				<span>Type</span>
				<span>Size</span>
			</div>
		}
		{visibleFolders.map((folder) => {
			const isRenaming = renaming?.type === "folder" && renaming.id === folder.id;

			if (isRenaming) {
				return <div
					key={folder.id}
					className={folderClassName}
					data-selected={selectedFolders.includes(folder.id)}
					data-id={folder.id}
					data-type="folder"
				>
					<div className={styles.NameCell}>
						<div className={styles.FolderIcon}>
							<ImagePreview source={folder.getIconUrl()} onError={() => { folder.setIconUrl(null); }}/>
						</div>
						<RenameField
							item={folder}
							error={renameError}
							onCommit={(value) => { commitRename(folder, value); }}
							onCancel={cancelRename}
							onEdit={() => { setRenameError(null); }}
						/>
					</div>
					{viewMode === "list" && <>
						<span className={styles.DetailCell}>-</span>
						<span className={styles.DetailCell}>File folder</span>
						<span className={styles.DetailCell}></span>
					</>}
				</div>;
			}

			return <Interactable
				key={folder.id}
				tabIndex={0}
				className={folderClassName}
				data-selected={selectedFolders.includes(folder.id)}
				data-id={folder.id}
				data-type="folder"
				onContextMenu={(event: MouseEvent) => {
					onContextMenuFolder?.(event, folder);
				}}
				onClick={(event: MouseEvent) => {
					selectFolder(folder, !event.ctrlKey);
				}}
				onDoubleClick={(event: MouseEvent) => {
					onOpenFolder?.(event, folder);
					deselectFolder(folder);
				}}
			>
				<div className={styles.NameCell}>
					<div className={styles.FolderIcon}>
						<ImagePreview source={folder.getIconUrl()} onError={() => { folder.setIconUrl(null); }}/>
					</div>
					<p>{folder.name}</p>
				</div>
				{viewMode === "list" && <>
					<span className={styles.DetailCell}>-</span>
					<span className={styles.DetailCell}>File folder</span>
					<span className={styles.DetailCell}></span>
				</>}
			</Interactable>;
		})}
		{visibleFiles.map((file) => {
			const isRenaming = renaming?.type === "file" && renaming.id === file.id;

			if (isRenaming) {
				return <div
					key={file.id}
					className={fileClassName}
					data-selected={selectedFiles.includes(file.id)}
					data-id={file.id}
					data-type="file"
				>
					<div className={styles.NameCell}>
						<div className={styles.FileIcon}>
							<ImagePreview source={file.getIconUrl()} onError={() => { file.setIconUrl(null); }}/>
						</div>
						<RenameField
							item={file}
							error={renameError}
							onCommit={(value) => { commitRename(file, value); }}
							onCancel={cancelRename}
							onEdit={() => { setRenameError(null); }}
						/>
					</div>
					{viewMode === "list" && <>
						<span className={styles.DetailCell}>-</span>
						<span className={styles.DetailCell}>{file.getType()}</span>
						<span className={styles.DetailCell}>{formatFileSize(file)}</span>
					</>}
				</div>;
			}

			return <Interactable
				key={file.id}
				tabIndex={0}
				className={fileClassName}
				data-selected={selectedFiles.includes(file.id)}
				data-id={file.id}
				data-type="file"
				onContextMenu={(event: MouseEvent) => {
					onContextMenuFile?.(event, file);
				}}
				onClick={(event: MouseEvent) => {
					selectFile(file, !event.ctrlKey);
				}}
				onDoubleClick={(event: MouseEvent) => {
					onOpenFile?.(event, file);
					deselectFile(file);
				}}
			>
				<div className={styles.NameCell}>
					<div className={styles.FileIcon}>
						<ImagePreview source={file.getIconUrl()} onError={() => { file.setIconUrl(null); }}/>
					</div>
					<p>{file.id}</p>
				</div>
				{viewMode === "list" && <>
					<span className={styles.DetailCell}>-</span>
					<span className={styles.DetailCell}>{file.getType()}</span>
					<span className={styles.DetailCell}>{formatFileSize(file)}</span>
				</>}
			</Interactable>;
		})}
	</div>;
}

export const DirectoryList = forwardRef(DirectoryListImpl as unknown as ForwardRefRenderFunction<DirectoryListHandle, object>) as
	(props: DirectoryListProps & { ref?: ForwardedRef<DirectoryListHandle> }) => ReactElement | null;
