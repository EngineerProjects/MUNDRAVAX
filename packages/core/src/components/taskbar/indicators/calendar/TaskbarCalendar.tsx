import { useEffect, useState } from "react";
import styles from "./TaskbarCalendar.module.css";
import { OutsideClickListener, useClassNames } from "../../../../hooks";
import { TaskbarIndicatorMenu } from "../TaskbarIndicatorMenu";
import { useTaskbarIndicatorState } from "../taskbarIndicatorState";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBellSlash, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function getCalendarDays(viewDate: Date) {
	const year = viewDate.getFullYear();
	const month = viewDate.getMonth();
	const firstDay = new Date(year, month, 1);
	const firstWeekday = (firstDay.getDay() + 6) % 7;
	const startDate = new Date(year, month, 1 - firstWeekday);

	return Array.from({ length: 42 }, (_, index) => {
		const day = new Date(startDate);
		day.setDate(startDate.getDate() + index);
		return day;
	});
}

function sameDay(left: Date, right: Date) {
	return left.getFullYear() === right.getFullYear()
		&& left.getMonth() === right.getMonth()
		&& left.getDate() === right.getDate();
}

export function TaskbarCalendar() {
	const [date, setDate] = useState(new Date());
	const [viewDate, setViewDate] = useState(new Date());
	const [active, setActive] = useTaskbarIndicatorState();
	const calendarDays = getCalendarDays(viewDate);

	useEffect(() => {
		const interval = setInterval(() => {
			setDate(new Date());
		}, active ? 500 : 30000);

		return () => {
			clearInterval(interval);
		};
	}, [active]);

	const changeMonth = (offset: number) => {
		setViewDate((currentDate) => new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
	};

	return <OutsideClickListener onOutsideClick={() => { setActive(false); }}>
		<button className={useClassNames([styles.Button], "Taskbar", "Indicator", "Calendar")} title="Date & Time" tabIndex={0} onClick={() => { setActive(!active); }}>
			<p>
				{date.toLocaleString("en-GB", {
					hour: "numeric",
					minute: "numeric",
					hour12: false,
				})}
			</p>
			<p>
				{date.toLocaleDateString("en-GB", {
					day: "numeric",
					month: "short",
					year: "numeric",
				})}
			</p>
		</button>
		<TaskbarIndicatorMenu active={active} className={styles.Menu}>
			<section className={styles.Notifications}>
				<div className={styles.PanelHeader}>
					<h2>Notifications</h2>
					<button type="button">Clear all</button>
				</div>
				<div className={styles.EmptyNotifications}>
					<FontAwesomeIcon icon={faBellSlash}/>
					<div>
						<strong>No new notifications</strong>
						<span>Alerts from apps will appear here.</span>
					</div>
				</div>
			</section>
			<section className={styles.CalendarPanel}>
				<div className={styles.DateHeader}>
					<p>{date.toLocaleString("en-GB", {
						weekday: "long",
						day: "numeric",
						month: "long",
					})}</p>
					<span>{date.toLocaleString("en-GB", {
						hour: "numeric",
						minute: "numeric",
						second: "numeric",
						hour12: false,
					})}</span>
				</div>
				<div className={styles.MonthHeader}>
					<strong>{viewDate.toLocaleString("en-GB", { month: "long", year: "numeric" })}</strong>
					<div>
						<button type="button" title="Previous month" onClick={() => { changeMonth(-1); }}>
							<FontAwesomeIcon icon={faChevronLeft}/>
						</button>
						<button type="button" title="Next month" onClick={() => { changeMonth(1); }}>
							<FontAwesomeIcon icon={faChevronRight}/>
						</button>
					</div>
				</div>
				<div className={styles.CalendarGrid}>
					{WEEK_DAYS.map((day) =>
						<span key={day} className={styles.WeekDay}>{day}</span>
					)}
					{calendarDays.map((day) => {
						const outsideMonth = day.getMonth() !== viewDate.getMonth();
						const isToday = sameDay(day, date);
						return <button
							type="button"
							key={day.toISOString()}
							className={useClassNames([
								styles.Day,
								outsideMonth ? styles.OutsideMonth : undefined,
								isToday ? styles.Today : undefined,
							])}
						>
							{day.getDate()}
						</button>;
					})}
				</div>
			</section>
		</TaskbarIndicatorMenu>
	</OutsideClickListener>;
}
