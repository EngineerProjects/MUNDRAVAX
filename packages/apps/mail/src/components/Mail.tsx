import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "./Mail.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArchive, faInbox, faMagnifyingGlass, faPaperPlane, faPenToSquare, faReply, faStar, faTrash, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { WindowProps } from "@prozilla-os/core";

export type MailProps = WindowProps;

type FolderId = "inbox" | "starred" | "sent" | "archive" | "trash";

interface MailMessage {
	id: string;
	folder: FolderId;
	from: string;
	to: string;
	subject: string;
	preview: string;
	body: string;
	time: string;
	unread?: boolean;
	starred?: boolean;
}

const FOLDERS: { id: FolderId; label: string; icon: IconDefinition; }[] = [
	{ id: "inbox", label: "Inbox", icon: faInbox },
	{ id: "starred", label: "Starred", icon: faStar },
	{ id: "sent", label: "Sent", icon: faPaperPlane },
	{ id: "archive", label: "Archive", icon: faArchive },
	{ id: "trash", label: "Trash", icon: faTrash },
];

const INITIAL_MESSAGES: MailMessage[] = [
	{
		id: "welcome",
		folder: "inbox",
		from: "Mundravax Team",
		to: "you@mundravax.local",
		subject: "Welcome to Mail",
		preview: "Your local mailbox is ready. Real accounts will plug into this interface later.",
		body: "Welcome to Mail.\n\nThis first version is local and focused on the OS experience: inbox, reading, composing, and organizing messages. Real account sync can be added later without changing the main interaction model.",
		time: "10:12",
		unread: true,
		starred: true,
	},
	{
		id: "files",
		folder: "inbox",
		from: "Files",
		to: "you@mundravax.local",
		subject: "Attachments will land here soon",
		preview: "Files and Mail should work together for downloads, documents, and attachments.",
		body: "A useful mail app needs deep Files integration.\n\nThe next step is to let messages attach virtual files, save attachments into Downloads, and open PDFs/images directly from Mail.",
		time: "09:48",
	},
	{
		id: "sent-roadmap",
		folder: "sent",
		from: "you@mundravax.local",
		to: "product@mundravax.local",
		subject: "Mail roadmap",
		preview: "Local UI first, then accounts, notifications, and attachments.",
		body: "Proposed Mail roadmap:\n\n1. Local compose and mailbox UI.\n2. Attach virtual files.\n3. Notify incoming messages.\n4. Add real account providers.",
		time: "Yesterday",
	},
];

export function Mail({ setTitle }: MailProps) {
	const [messages, setMessages] = useState(INITIAL_MESSAGES);
	const [activeFolder, setActiveFolder] = useState<FolderId>("inbox");
	const [selectedId, setSelectedId] = useState(INITIAL_MESSAGES[0].id);
	const [query, setQuery] = useState("");
	const [composing, setComposing] = useState(false);

	useEffect(() => {
		setTitle?.("Mail");
	}, [setTitle]);

	const visibleMessages = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		return messages.filter((message) => {
			const inFolder = activeFolder === "starred" ? message.starred : message.folder === activeFolder;
			const matchesQuery = normalizedQuery === ""
				|| message.subject.toLowerCase().includes(normalizedQuery)
				|| message.from.toLowerCase().includes(normalizedQuery)
				|| message.preview.toLowerCase().includes(normalizedQuery);
			return inFolder && matchesQuery;
		});
	}, [messages, activeFolder, query]);

	const selectedMessage: MailMessage | null = visibleMessages.length > 0
		? visibleMessages.find((message) => message.id === selectedId) ?? visibleMessages[0]
		: null;

	const selectMessage = (message: MailMessage) => {
		setSelectedId(message.id);
		setComposing(false);
		setMessages((currentMessages) => currentMessages.map((currentMessage) =>
			currentMessage.id === message.id ? { ...currentMessage, unread: false } : currentMessage
		));
	};

	const getFormString = (formData: FormData, key: string) => {
		const value = formData.get(key);
		return typeof value === "string" ? value : "";
	};

	const sendDraft = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const to = getFormString(formData, "to").trim();
		const subject = getFormString(formData, "subject").trim() || "(No subject)";
		const body = getFormString(formData, "body").trim();
		if (to === "" || body === "")
			return;

		const draft: MailMessage = {
			id: `sent-${Date.now()}`,
			folder: "sent",
			from: "you@mundravax.local",
			to,
			subject,
			preview: body.split("\n")[0],
			body,
			time: "Now",
		};

		setMessages((currentMessages) => [draft, ...currentMessages]);
		setActiveFolder("sent");
		setSelectedId(draft.id);
		setComposing(false);
	};

	return <div className={styles.Mail}>
		<aside className={styles.Sidebar}>
			<button className={styles.ComposeButton} onClick={() => { setComposing(true); }}>
				<FontAwesomeIcon icon={faPenToSquare}/>
				Compose
			</button>
			<nav>
				{FOLDERS.map((folder) => {
					const count = folder.id === "starred"
						? messages.filter((message) => message.starred).length
						: messages.filter((message) => message.folder === folder.id).length;
					return <button
						key={folder.id}
						className={folder.id === activeFolder ? styles.ActiveFolder : undefined}
						onClick={() => {
							setActiveFolder(folder.id);
							setComposing(false);
						}}
					>
						<FontAwesomeIcon icon={folder.icon}/>
						<span>{folder.label}</span>
						<small>{count}</small>
					</button>;
				})}
			</nav>
		</aside>
		<section className={styles.MessageList}>
			<header>
				<h1>{FOLDERS.find((folder) => folder.id === activeFolder)?.label}</h1>
				<label>
					<FontAwesomeIcon icon={faMagnifyingGlass}/>
					<input value={query} placeholder="Search mail" onChange={(event) => { setQuery(event.currentTarget.value); }}/>
				</label>
			</header>
			<div className={styles.Messages}>
				{visibleMessages.map((message) =>
					<button
						key={message.id}
						className={selectedMessage != null && message.id === selectedMessage.id && !composing ? styles.ActiveMessage : undefined}
						data-unread={message.unread}
						onClick={() => { selectMessage(message); }}
					>
						<div>
							<strong>{message.from}</strong>
							<span>{message.time}</span>
						</div>
						<p>{message.subject}</p>
						<small>{message.preview}</small>
					</button>
				)}
				{visibleMessages.length === 0 && <p className={styles.EmptyList}>No messages here.</p>}
			</div>
		</section>
		<main className={styles.Reader}>
			{composing
				? <form className={styles.Composer} onSubmit={sendDraft}>
					<header>
						<h2>New message</h2>
						<button type="submit">
							<FontAwesomeIcon icon={faPaperPlane}/>
							Send
						</button>
					</header>
					<input name="to" placeholder="To" autoFocus/>
					<input name="subject" placeholder="Subject"/>
					<textarea name="body" placeholder="Write your message..."/>
				</form>
				: selectedMessage != null
					? <article className={styles.MessageReader}>
						<header>
							<div>
								<h2>{selectedMessage.subject}</h2>
								<p>{selectedMessage.from} to {selectedMessage.to}</p>
							</div>
							<button>
								<FontAwesomeIcon icon={faReply}/>
								Reply
							</button>
						</header>
						<div className={styles.MessageBody}>
							{selectedMessage.body.split("\n").map((line, index) =>
								<p key={index}>{line || "\u00A0"}</p>
							)}
						</div>
					</article>
					: <div className={styles.EmptyReader}>Select a message to read.</div>
			}
		</main>
	</div>;
}
