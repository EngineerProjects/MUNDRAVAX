import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { useClassNames } from "../../../hooks";
import { useTaskbarContext } from "../taskbarSlots";
import menuStyles from "../TaskbarMenus.module.css";
import styles from "./TaskbarAssistant.module.css";

export const ASSISTANT_NAME = "Muna";

export function TaskbarAssistant() {
	const { toggleMenu } = useTaskbarContext();

	return <div className={useClassNames([styles.AssistantContainer], "Taskbar", "Assistant")}>
		<button
			className={useClassNames([menuStyles.MenuButton, styles.AssistantButton], "Taskbar", "AssistantIcon")}
			title={ASSISTANT_NAME}
			tabIndex={0}
			onClick={() => { toggleMenu("assistant"); }}
		>
			<FontAwesomeIcon icon={faWandMagicSparkles}/>
		</button>
	</div>;
}
