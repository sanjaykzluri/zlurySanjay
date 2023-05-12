import React from "react";
import {
	toggleCheckTaskAction,
	toggleShowTaskActionEditModal,
} from "../redux/TaskManagement.actions";
import {
	taskActionEditTypes,
	taskActionStatuses,
} from "../constants/TaskManagement.constants";
import { useDispatch, useSelector } from "react-redux";
import TaskActionStatusPill from "./TaskActionStatusPill";
import TaskActionEllipsisDropdown from "./TaskActionEllipsisDropdown";
import taskActionMarkAsCompleted from "modules/TaskManagement/assets/taskActionMarkAsCompleted.svg";

export default function TaskAction({ action }) {
	const dispatch = useDispatch();
	const { checkedTaskActionIds } = useSelector((state) => state.tasks);

	return (
		<>
			<div className="task_action_row">
				<div className="task_action_checkbox_name_status">
					{/* {action.status !== taskActionStatuses.completed.value && (
						<div
							className="task_action_check_box"
							onClick={() =>
								dispatch(toggleCheckTaskAction(action._id))
							}
						>
							{checkedTaskActionIds.includes(action._id) && (
								<div className="task_action_checked" />
							)}
						</div>
					)} */}
					<div
						className="font-11 bold-400"
						style={
							action.status === taskActionStatuses.completed.value
								? {
										textDecoration: "line-through",
										color: "#A8A8A8",
								  }
								: {}
						}
					>
						{action.name}
					</div>
					<TaskActionStatusPill action={action} />
				</div>
				{action.status !== taskActionStatuses.completed.value && (
					<div
						className="task_action_mark_as_completed"
						onClick={() =>
							dispatch(
								toggleShowTaskActionEditModal(
									action,
									action.is_approval_task
										? taskActionEditTypes.approve.type
										: taskActionEditTypes.completed.type
								)
							)
						}
					>
						<img
							src={taskActionMarkAsCompleted}
							height={16}
							width={16}
							alt=""
						/>
					</div>
				)}
				{action.status !== taskActionStatuses.completed.value && (
					<TaskActionEllipsisDropdown
						action={action}
						taskIsCompleted={
							action.status === taskActionStatuses.completed.value
						}
						isApprovalTask={action.is_approval_task}
					/>
				)}
			</div>
		</>
	);
}
