import React, { useEffect } from "react";
import { openModal } from "reducers/modal.reducer";
import { useDispatch, useSelector } from "react-redux";
import "modules/TaskManagement/style/TaskManagement.css";
import { checkAndFetchTasks } from "../redux/TaskManagement.actions";
import { getRequestKeyFromReqPayload } from "../util/TaskManagement.utils";
import taskListHeaderNavButton from "modules/TaskManagement/assets/taskListHeaderNavButton.svg";

export default function TaskManagement() {
	const dispatch = useDispatch();
	const { taskListRequestPayload, taskListAndReqPayloadMap } = useSelector(
		(state) => state.tasks
	);
	const { tasks, tasksLoaded, error } = taskListAndReqPayloadMap[
		getRequestKeyFromReqPayload(taskListRequestPayload)
	] || { tasksLoaded: false };

	useEffect(() => {
		if (!tasksLoaded) dispatch(checkAndFetchTasks(taskListRequestPayload));
	}, [tasksLoaded]);

	return (
		<>
			<img
				src={taskListHeaderNavButton}
				height={20}
				width={20}
				id="task_management"
				alt=""
				title="My tasks"
				className="cursor-pointer"
				onClick={() => {
					dispatch(checkAndFetchTasks(taskListRequestPayload));
					dispatch(openModal("taskManagement", { tasks, error }));
				}}
			/>
		</>
	);
}
