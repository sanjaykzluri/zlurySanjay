import React from "react";
import TaskAction from "./TaskAction";
import AnimateHeight from "react-animate-height";
import { useDispatch, useSelector } from "react-redux";
import { taskTypes } from "../constants/TaskManagement.constants";
import { pendingActionsOfATask } from "../util/TaskManagement.utils";
import { toggleTaskAccordian } from "../redux/TaskManagement.actions";
import taskAccordionOpen from "modules/TaskManagement/assets/taskAccordionOpen.svg";
import taskAccordionClosed from "modules/TaskManagement/assets/taskAccordionClosed.svg";

export default function TaskAccordion({ task }) {
	const dispatch = useDispatch();

	const { taskListRequestPayload } = useSelector((state) => state.tasks);

	return (
		<>
			<div
				className={`task_accordion${task.collapsed ? "" : "_expanded"}`}
			>
				<div
					className="d-flex align-items-center"
					style={{ gap: "8px" }}
				>
					{task.collapsed ? (
						<img
							onClick={() =>
								dispatch(
									toggleTaskAccordian(
										task._id,
										taskListRequestPayload
									)
								)
							}
							src={taskAccordionClosed}
							height={16}
							width={16}
							alt=""
							className="cursor-pointer"
						/>
					) : (
						<img
							onClick={() =>
								dispatch(
									toggleTaskAccordian(
										task._id,
										taskListRequestPayload
									)
								)
							}
							src={taskAccordionOpen}
							height={16}
							width={16}
							alt=""
							className="cursor-pointer"
						/>
					)}
					<div className="bold-700 font-11">{task.name}</div>
					{task.collapsed && (
						<>
							<div
								className="font-16"
								style={{ color: "#DDDDDD", lineHeight: "16px" }}
							>
								|
							</div>
							<div className="font-9 bold-500 grey-1">
								{`${pendingActionsOfATask(task).length} of ${
									task.actions.length
								} pending`}
							</div>
						</>
					)}
					<div
						className="ml-auto d-flex align-items-center"
						style={{ gap: "4px" }}
					>
						<div
							className="font-8 bold-500"
							style={{ color: taskTypes[task.type].color }}
						>
							{taskTypes[task.type].text}
						</div>
						<img
							src={taskTypes[task.type].img}
							height={16}
							width={16}
							alt=""
						/>
					</div>
				</div>
				<AnimateHeight
					duration={500}
					height={task.collapsed ? 0 : "auto"}
				>
					{Array.isArray(task.actions) && task.actions.length > 0 && (
						<div className="task_actions_container">
							{task.actions.map((action, index) => (
								<TaskAction action={action} key={index} />
							))}
						</div>
					)}
				</AnimateHeight>
			</div>
		</>
	);
}
