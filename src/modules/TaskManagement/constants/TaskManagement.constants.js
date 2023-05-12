import emptyTypeEmptyTaskList from "assets/green_tick.svg";
import taskActionEditModalApprove from "assets/green_tick.svg";
import errorTypeEmptyTaskList from "assets/agents/inactive.svg";
import adhocType from "modules/TaskManagement/assets/adhocType.svg";
import appRequestType from "modules/TaskManagement/assets/appRequestType.svg";
import { toggleShowTaskActionEditModal } from "../redux/TaskManagement.actions";
import noSearchResults from "modules/TaskManagement/assets/noSearchResults.svg";
import administrativeType from "modules/TaskManagement/assets/administrativeType.svg";
import onboardingWorkflowType from "modules/TaskManagement/assets/onboardingWorkflowType.svg";
import offboardingWorkflowType from "modules/TaskManagement/assets/offboardingWorkflowType.svg";
import taskActionEditModalReject from "modules/TaskManagement/assets/taskActionEditModalReject.svg";
import taskActionEditModalComplete from "modules/TaskManagement/assets/taskActionEditModalComplete.svg";
import {
	markActionasApproved,
	updateTaskActionStatus,
	markActionasRejected,
} from "../service/TaskManagement.api";

export const taskTypes = {
	onboarding: {
		value: "onboarding",
		text: "Onboarding Workflows",
		img: onboardingWorkflowType,
		color: "#5ABAFF",
	},
	offboarding: {
		value: "offboarding",
		text: "Offboarding Workflows",
		img: offboardingWorkflowType,
		color: "#1176BE",
	},
	app_request: {
		value: "app_request",
		text: "App Request",
		img: appRequestType,
		color: "#FFA217",
	},
	administrative: {
		value: "administrative",
		text: "Administrative",
		img: administrativeType,
		color: "#C97B07",
	},
	ad_hoc: {
		value: "ad_hoc",
		text: "AD-HOC",
		img: adhocType,
		color: "#9FA65E",
	},
};

export const taskStatuses = {
	pending: {
		value: "pending",
		text: "Pending",
	},
	completed: {
		value: "completed",
		text: "Completed",
	},
	failed: {
		value: "failed",
		text: "Task Failed",
	},
};

export const taskActionStatuses = {
	pending: {
		value: "pending",
		text: "Pending",
		pillProps: {
			overdue: {
				fontColor: "#FE6955",
				pillBackGround: "#FFE9E5",
			},
			due_today: {
				fontColor: "#1176BE",
				pillBackGround: "#E6F5FF",
			},
			pending: {
				fontColor: "#C97B07",
				pillBackGround: "#FFF6DC",
			},
		},
	},
	completed: {
		value: "completed",
		text: "Completed",
		pillProps: {
			number: "Completed",
			fontColor: "#009307",
			pillBackGround: "#E7F8E8",
		},
	},
	failed: {
		value: "failed",
		text: "Action Failed",
		pillProps: {
			fontColor: "#FE6955",
			pillBackGround: "#FFE9E5",
		},
	},
};

export const pendingTaskActionSubStatuses = {
	overdue: "overdue",
	due_today: "due_today",
	pending: "pending",
};

export const taskManagementReduxConstants = {
	REQUEST_TASKS: "REQUEST_TASKS",
	FETCH_TASKS: "FETCH_TASKS",
	TOGGLE_TASK_ACCORDION: "TOGGLE_TASK_ACCORDION",
	TOGGLE_ALL_TASK_ACCORDIONS: "TOGGLE_ALL_TASK_ACCORDIONS",
	TOGGLE_CHECK_TASK_ACTION: "TOGGLE_CHECK_TASK_ACTION",
	UNCHECK_ALL_TASK_ACTIONS: "UNCHECK_ALL_TASK_ACTIONS",
	CHANGE_TASK_SEARCH_QUERY: "CHANGE_TASK_SEARCH_QUERY",
	TOGGLE_SHOW_TASK_ACTION_EDIT_MODAL: "TOGGLE_SHOW_TASK_ACTION_EDIT_MODAL",
	CLEAR_TASK_CACHE: "CLEAR_TASK_CACHE",
	CHANGE_STATUS_FILTER: "CHANGE_STATUS_FILTER",
	FETCH_TASK_LIST_FILTERS: "FETCH_TASK_LIST_FILTERS",
	APPLY_TASK_LIST_FILTERS: "APPLY_TASK_LIST_FILTERS",
	APPLY_TASK_LIST_SORT: "APPLY_TASK_LIST_SORT",
};

export const taskActionEditTypes = {
	completed: {
		type: "completed",
		img: taskActionEditModalComplete,
		title: (action) => `Mark "${action.name}" as completed`,
		desc: "Confirm assigned task has been completed. Once marked, you can't undo this action.",
		btnText: "Mark as Complete",
		call: updateTaskActionStatus,
	},
	cancelled: {
		type: "cancelled",
		img: taskActionEditModalComplete,
		title: (action) => `Cancel "${action.name}"`,
		desc: "Are you sure you want to cancel the assigned task? Once cancelled, you can't undo this action.",
		btnText: "I'm sure",
		call: updateTaskActionStatus,
	},
	approve: {
		type: "approve",
		img: taskActionEditModalApprove,
		title: (action) => `Approve "${action.name}"`,
		desc: "Are you sure you want to approve this action?",
		btnText: "Approve",
		call: markActionasApproved,
	},
	reject: {
		type: "reject",
		img: taskActionEditModalReject,
		title: (action) => `Reject "${action.name}"`,
		desc: "Are you sure you want to reject this action?",
		btnText: "Reject",
		call: markActionasRejected,
	},
	reassign: {
		type: "reassign",
		img: taskActionEditModalReject, // reassign img
		title: (action) => `Reassign "${action.name}"`,
		desc: "Select the user you wish to assign the task to",
		btnText: "Reassign",
	},
};

export const emptyTaskListTypes = {
	error: {
		type: "error",
		img: errorTypeEmptyTaskList,
		title: () => "Error in fetching pending tasks",
		subText: "Server Error! We couldn't complete your request.",
		pillProps: {
			pillBackGround: "#FFE9E5",
		},
	},
	search: {
		type: "search",
		img: noSearchResults,
		title: (searchQuery) => `No results found for "${searchQuery}"`,
		subText: "We can’t find any item matching your search!",
		pillProps: {},
	},
	empty: {
		type: "empty",
		img: emptyTypeEmptyTaskList,
		title: () => "No pending task",
		subText: "We couldn’t find any pending task on you!",
		pillProps: {
			pillBackGround: "#E7F8E8",
		},
	},
	filter: {
		type: "filter",
		img: emptyTypeEmptyTaskList,
		title: () => "No tasks found",
		subText: "We couldn’t find any task on you for the applied filters!",
		pillProps: {
			pillBackGround: "#E7F8E8",
		},
	},
};

export const taskActionEllipsisDropdownViewOption = {
	text: "View",
	onClick: () => {},
};

export const taskActionEllipsisDropdownOptions = {
	workflow: [
		// taskActionEllipsisDropdownViewOption,
		{
			text: "Mark as complete",
			onClick: (dispatch, action) =>
				dispatch(
					toggleShowTaskActionEditModal(
						action,
						taskActionEditTypes.completed.type
					)
				),
		},
		{
			text: "Cancel Task",
			onClick: (dispatch, action) =>
				dispatch(
					toggleShowTaskActionEditModal(
						action,
						taskActionEditTypes.cancelled.type // check behavior of edit type = cancel
					)
				),
		},
		// {
		// 	text: "Reassign",
		// 	onClick: (dispatch, action) =>
		// 		dispatch(
		// 			toggleShowTaskActionEditModal(
		// 				action,
		// 				taskActionEditTypes.reassign.type
		// 			)
		// 		),
		// },
	],
	approval: [
		// taskActionEllipsisDropdownViewOption,
		{
			text: "Approve",
			onClick: (dispatch, action) =>
				dispatch(
					toggleShowTaskActionEditModal(
						action,
						taskActionEditTypes.approve.type
					)
				),
		},
		{
			text: "Reject",
			onClick: (dispatch, action) =>
				dispatch(
					toggleShowTaskActionEditModal(
						action,
						taskActionEditTypes.reject.type
					)
				),
		},
		// {
		// 	text: "Reassign",
		// 	onClick: (dispatch, action) =>
		// 		dispatch(
		// 			toggleShowTaskActionEditModal(
		// 				action,
		// 				taskActionEditTypes.reassign.type
		// 			)
		// 		),
		// },
	],
};

export const taskManagementStatusFilterOptions = [
	{
		text: "Pending Tasks",
		status: "pending",
	},
	{
		text: "Completed Tasks",
		status: "completed",
	},
];

export const taskManagementSortOptions = [
	{
		text: "Due Date",
		key: "due_date",
	},
	{
		text: "Assigned Date",
		key: "assigned_on",
	},
];

export const taskManagementSortOrderOptions = [
	{
		text: "Newest First",
		value: -1,
	},
	{
		text: "Oldest First",
		value: 1,
	},
];
