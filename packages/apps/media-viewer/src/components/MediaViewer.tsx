import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./MediaViewer.module.css";
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS, AUDIO_EXTENSIONS, useVirtualRoot, VirtualFile, VirtualFolder, WindowProps, MEDIA_EXTENSIONS } from "@prozilla-os/core";

export interface MediaViewerProps extends WindowProps {
	file?: VirtualFile;
}

const PHOTOS_PATH = "~/Pictures";

function collectImages(folder: VirtualFolder | null): VirtualFile[] {
	if (folder == null)
		return [];

	const images = folder.getFiles(true).filter((file) =>
		file.extension != null && IMAGE_EXTENSIONS.includes(file.extension) && file.source != null
	);

	folder.getSubFolders(true).forEach((subFolder) => {
		images.push(...collectImages(subFolder));
	});

	return images;
}

export function MediaViewer({ file, setTitle }: MediaViewerProps) {
	const virtualRoot = useVirtualRoot();
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const pictureFiles = useMemo(() => collectImages(virtualRoot?.navigateToFolder(PHOTOS_PATH) ?? null), [virtualRoot]);
	const galleryFiles = file != null && file.extension != null && IMAGE_EXTENSIONS.includes(file.extension)
		? [file, ...pictureFiles.filter((pictureFile) => pictureFile.path !== file.path)]
		: pictureFiles;
	const [selectedIndex, setSelectedIndex] = useState(0);
	const selectedFile = galleryFiles[selectedIndex] as VirtualFile | undefined;

	useEffect(() => {
		if (file != null)
			setTitle?.(file.id);
		else
			setTitle?.("Photos");
	}, [file, setTitle]);

	useEffect(() => {
		setSelectedIndex(0);
	}, [file, pictureFiles]);

	useEffect(() => {
		const selectedSource = selectedFile?.source;
		if (selectedFile === undefined || selectedSource == null)
			return;

		if (selectedFile.extension != null && AUDIO_EXTENSIONS.includes(selectedFile.extension)) {
			if (audioRef.current) {
				audioRef.current.src = selectedSource;
				void audioRef.current.play();
			}
		}

		if (selectedFile.extension != null && VIDEO_EXTENSIONS.includes(selectedFile.extension)) {
			if (videoRef.current) {
				videoRef.current.src = selectedSource;
				void videoRef.current.play();
			}
		}

		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.currentTime = 0;
			}
			if (videoRef.current) {
				videoRef.current.pause();
				videoRef.current.currentTime = 0;
			}
		};
	}, [selectedFile]);

	const selectPrevious = () => {
		setSelectedIndex((index) => index <= 0 ? galleryFiles.length - 1 : index - 1);
	};

	const selectNext = () => {
		setSelectedIndex((index) => index >= galleryFiles.length - 1 ? 0 : index + 1);
	};

	if (file == null && galleryFiles.length === 0)
		return <div className={styles.EmptyState}>
			<div className={styles.EmptyStateIcon}/>
			<h2>No photos yet</h2>
			<p>Add images to Pictures and they will appear here.</p>
		</div>;

	if (selectedFile === undefined || selectedFile.extension == null || !MEDIA_EXTENSIONS.includes(selectedFile.extension)) {
		return <p>Invalid file format.</p>;
	}

	const selectedSource = selectedFile.source;

	if (selectedSource == null)
		return <p>File failed to load.</p>;

	if (IMAGE_EXTENSIONS.includes(selectedFile.extension)) {
		return <div className={styles.PhotosApp}>
			<main className={styles.PhotoStage}>
				{galleryFiles.length > 1 &&
					<button className={`${styles.NavButton} ${styles.Previous}`} title="Previous photo" onClick={selectPrevious}>
						‹
					</button>
				}
				<img src={selectedSource} alt={selectedFile.id} draggable="false" />
				{galleryFiles.length > 1 &&
					<button className={`${styles.NavButton} ${styles.Next}`} title="Next photo" onClick={selectNext}>
						›
					</button>
				}
			</main>
			<footer className={styles.PhotoStrip}>
				<div>
					<strong>{selectedFile.id}</strong>
					<span>{selectedIndex + 1} of {galleryFiles.length}</span>
				</div>
				{galleryFiles.length > 1 &&
					<ul>
						{galleryFiles.map((imageFile, index) =>
							<li key={imageFile.path}>
								<button
									className={index === selectedIndex ? styles.ActiveThumbnail : undefined}
									title={imageFile.id}
									onClick={() => { setSelectedIndex(index); }}
								>
									<img src={imageFile.source ?? undefined} alt={imageFile.id} draggable="false" />
								</button>
							</li>
						)}
					</ul>
				}
			</footer>
		</div>;
	} else if (AUDIO_EXTENSIONS.includes(selectedFile.extension)) {
		return <div className={styles.AudioViewer}>
			<audio ref={audioRef} controls>
				<source src={selectedSource} type={`video/${selectedFile.extension}`}/>
				Your browser does not support audio.
			</audio> 
		</div>;
	} else if (VIDEO_EXTENSIONS.includes(selectedFile.extension)) {
		if (selectedFile.extension === "yt") {
			return <div className={styles.VideoViewer}>
				<iframe
					src={selectedSource.replace("watch?v=", "embed/")}
					title={selectedFile.id}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
					allowTransparency={true}
				/>
			</div>;
		} else {
			return <div className={styles.VideoViewer}>
				<video ref={videoRef} controls className={styles.VideoPlayer}>
					<source src={selectedSource} type={`video/${selectedFile.extension}`} />
					Your browser does not support videos.
				</video>
			</div>;
		}
	}

	return <div className={styles.MediaViewer}>
		<img src={selectedSource} alt={selectedFile.id} draggable="false"/>
	</div>;
}
