import { FC, ReactNode, useState } from "react";
import styles from "../Settings.module.css";
import { NavButton } from "../NavButton";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

export type Page = {
	title: string,
	description?: string,
	icon?: IconProp,
	Content: FC,
};

export interface SettingsNavPageProps<PageKey extends string> {
	title: string;
	pages: Record<PageKey, Page>;
	children?: ReactNode;
}

export function SettingsNavPage<PageKey extends string>({ title, pages, children }: SettingsNavPageProps<PageKey>) {
	const [pageKey, setPageKey] = useState<PageKey | null>(null);
	const page = pageKey ? pages[pageKey] : null;

	return <div className={styles.SettingsPage}>
		{page != null
			? <>
				<span className={styles.Breadcrumbs}>
					<button className={styles.Label} onClick={(_event) => setPageKey(null)}>{title}</button>
					<p>{page.title}</p>
				</span>
				<section className={styles.SettingsSection}>
					<header className={styles.SettingsSectionHeader}>
						<h2>{page.title}</h2>
						{page.description != null && <p>{page.description}</p>}
					</header>
					<div className={styles.SettingsSectionBody}>
						<page.Content/>
					</div>
				</section>
			</>
			: <>
				<h1 className={styles.PageTitle}>{title}</h1>
				<section className={styles.SettingsSection}>
					<div className={styles.SettingsSectionBody}>
						{Object.keys(pages).map((key) => {
							const page = pages[key as PageKey];
							return <NavButton
								key={key}
								icon={page.icon}
								label={page.title}
								description={page.description}
								onClick={(_event) => setPageKey(key as PageKey)}
							/>;
						})}
					</div>
				</section>
				{children}
			</>
		}
	</div>;
}
