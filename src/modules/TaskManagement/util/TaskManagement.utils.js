import React from "react";
import {
	dateResetTimeZone,
	getNumberOfDaysBtwnTwoDates,
} from "utils/DateUtility";
import {
	taskActionStatuses,
	pendingTaskActionSubStatuses,
} from "../constants/TaskManagement.constants";
import actionFailed from "assets/agents/inactive.svg";

export const pendingActionsOfATask = (task) => {
	const pendingActions = [];
	for (const action of task.actions) {
		if (action.status !== taskActionStatuses.completed.value) {
			pendingActions.push(action);
		}
	}
	return pendingActions;
};

export const getTaskActionPillProps = (action) => {
	if (action.status === taskActionStatuses.completed.value) {
		return taskActionStatuses[action.status].pillProps;
	}
	if (action.status === taskActionStatuses.failed.value) {
		return {
			...taskActionStatuses[action.status].pillProps,
			number: (
				<div
					className="d-flex align-items-center"
					style={{ gap: "2px" }}
				>
					<img src={actionFailed} width={16} height={16} alt="" />
					<div>Action Failed</div>
				</div>
			),
		};
	}
	let currentISODate = dateResetTimeZone(new Date());
	const daysFromDueDate = getNumberOfDaysBtwnTwoDates(
		new Date(currentISODate),
		new Date(dateResetTimeZone(new Date(action.due_date)))
	);
	if (daysFromDueDate === 0) {
		return {
			...taskActionStatuses.pending.pillProps[
				pendingTaskActionSubStatuses.due_today
			],
			number: "Due today",
		};
	} else if (
		new Date(currentISODate) >
		new Date(dateResetTimeZone(new Date(action.due_date)))
	) {
		return {
			...taskActionStatuses.pending.pillProps[
				pendingTaskActionSubStatuses.overdue
			],
			number: `Overdue: ${daysFromDueDate} day${
				daysFromDueDate > 1 ? "s" : ""
			}`,
		};
	} else {
		return {
			...taskActionStatuses.pending.pillProps[
				pendingTaskActionSubStatuses.pending
			],
			number: `Pending in ${daysFromDueDate} day${
				daysFromDueDate > 1 ? "s" : ""
			}`,
		};
	}
};

export const handleTaskSearch = (tasks, searchQuery) => {
	const result = [];
	if (!searchQuery) {
		return [...tasks];
	}

	for (const task of tasks) {
		if (
			task.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
			task.actions.some((action) =>
				action.name?.toLowerCase().includes(searchQuery?.toLowerCase())
			)
		) {
			result.push(task);
		}
	}

	return result;
};

export const handleTaskStatusFilter = (tasks, statuses) => {
	if (!Array.isArray(statuses) || statuses?.length === 0) {
		return tasks;
	}

	const result = [];
	for (const task of tasks) {
		let tempTask = { ...task, actions: [] };
		for (const action of task.actions) {
			if (statuses.includes(action.status)) {
				tempTask.actions.push(action);
			}
		}
		if (tempTask.actions.length > 0) {
			result.push(tempTask);
		}
	}

	return result;
};

export const getRequestKeyFromReqPayload = (reqPayload = {}) => {
	return JSON.stringify(reqPayload).split("").sort().join("");
};

export const removeFiltersWithEmptyFieldValues = (filters) => {
	return Array.isArray(filters)
		? filters.filter(
				(filter) =>
					Array.isArray(filter.field_values) &&
					filter.field_values.length > 0
		  )
		: [];
};
