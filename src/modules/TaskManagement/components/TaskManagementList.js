import React from "react";
import {
	handleTaskSearch,
	handleTaskStatusFilter,
	getRequestKeyFromReqPayload,
} from "../util/TaskManagement.utils";
import { useSelector } from "react-redux";
import EmptyTaskList from "./EmptyTaskList";
import TaskAccordion from "./TaskAccordion";

export default function TaskManagementList() {
	const {
		searchQuery,
		taskListRequestPayload,
		taskListAndReqPayloadMap,
		includedStatusesInFilter,
	} = useSelector((state) => state.tasks);

	const { tasks, tasksLoading, error } = taskListAndReqPayloadMap[
		getRequestKeyFromReqPayload(taskListRequestPayload)
	] || { tasksLoading: true };

	return (
		<>
			<div
				className="task_management_list"
				key={includedStatusesInFilter}
			>
				{Array.isArray(tasks) &&
				handleTaskSearch(
					handleTaskStatusFilter(tasks, includedStatusesInFilter),
					searchQuery
				).length > 0 ? (
					handleTaskSearch(
						handleTaskStatusFilter(tasks, includedStatusesInFilter),
						searchQuery
					).map((task, index) => (
						<TaskAccordion task={task} key={index} />
					))
				) : (
					<EmptyTaskList
						searchQuery={searchQuery}
						error={error}
						loading={tasksLoading}
						appliedFilters={
							Array.isArray(taskListRequestPayload.filter_by)
								? taskListRequestPayload.filter_by
								: []
						}
					/>
				)}
			</div>
		</>
	);
}
