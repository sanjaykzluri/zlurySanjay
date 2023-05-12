import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleAllTaskAccordions } from "../redux/TaskManagement.actions";
import { getRequestKeyFromReqPayload } from "../util/TaskManagement.utils";

export default function TaskExpandCollapseAll() {
	const dispatch = useDispatch();

	const { taskListAndReqPayloadMap, taskListRequestPayload } = useSelector(
		(state) => state.tasks
	);

	const { tasks } = taskListAndReqPayloadMap[
		getRequestKeyFromReqPayload(taskListRequestPayload)
	] || { tasks: [] };

	return (
		<>
			<div className="ml-auto">
				<div
					className="task_management_filter_pill_inactive"
					onClick={() =>
						dispatch(
							toggleAllTaskAccordions(taskListRequestPayload)
						)
					}
				>
					{tasks.some((task) => !task.collapsed)
						? "Collapse All"
						: "Expand All"}
				</div>
			</div>
		</>
	);
}
