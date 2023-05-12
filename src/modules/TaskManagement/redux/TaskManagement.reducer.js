import { TaskList } from "../model/TaskManagement.model";
import { getRequestKeyFromReqPayload } from "../util/TaskManagement.utils";
import { taskManagementReduxConstants } from "../constants/TaskManagement.constants";

const initialState = {
	tasks: [],
	taskListAndReqPayloadMap: {},
	error: false,
	tasksLoaded: false,
	tasksLoading: false,
	checkedTaskActionIds: [],
	searchQuery: "",
	showTaskActionEditModal: false,
	taskActionEditModalProps: {},
	includedStatusesInFilter: ["pending"],
	taskListFilters: [],
	taskListRequestPayload: { filter_by: [], sort_by: [], columns: [] },
};

export function TaskManagementReducer(state = initialState, action) {
	switch (action.type) {
		case taskManagementReduxConstants.REQUEST_TASKS:
			var reqKey = getRequestKeyFromReqPayload(action.payload.reqPayload);
			var tempState = { ...state };
			tempState.taskListAndReqPayloadMap[reqKey] = {};
			tempState.taskListAndReqPayloadMap[reqKey].tasks = [];
			tempState.taskListAndReqPayloadMap[reqKey].tasksLoaded = false;
			tempState.taskListAndReqPayloadMap[reqKey].tasksLoading = true;
			return tempState;

		case taskManagementReduxConstants.FETCH_TASKS:
			var reqKey = getRequestKeyFromReqPayload(action.payload.reqPayload);
			var tempState = { ...state };
			tempState.taskListAndReqPayloadMap[reqKey] = {
				tasksLoading: false,
				tasksLoaded: true,
				error: action.payload.error,
				...new TaskList(action.payload.tasks),
				reqPayload: action.payload.reqPayload,
			};
			return tempState;

		case taskManagementReduxConstants.TOGGLE_TASK_ACCORDION:
			var reqKey = getRequestKeyFromReqPayload(action.payload.reqPayload);
			var tempState = { ...state };
			var taskIndex = state.taskListAndReqPayloadMap[
				reqKey
			].tasks.findIndex((task) => action.payload.taskId === task._id);
			tempState.taskListAndReqPayloadMap[reqKey].tasks[
				taskIndex
			].collapsed =
				!tempState.taskListAndReqPayloadMap[reqKey].tasks[taskIndex]
					.collapsed;
			return tempState;

		case taskManagementReduxConstants.TOGGLE_ALL_TASK_ACCORDIONS:
			var reqKey = getRequestKeyFromReqPayload(action.payload.reqPayload);
			var tempState = { ...state };
			if (
				tempState.taskListAndReqPayloadMap[reqKey].tasks.some(
					(task) => !task.collapsed
				)
			) {
				for (const task of tempState.taskListAndReqPayloadMap[reqKey]
					.tasks) {
					task.collapsed = true;
				}
			} else {
				for (const task of tempState.taskListAndReqPayloadMap[reqKey]
					.tasks) {
					task.collapsed = false;
				}
			}
			return tempState;

		case taskManagementReduxConstants.TOGGLE_CHECK_TASK_ACTION:
			var tempState = { ...state };
			var taskActionIdIndex = tempState.checkedTaskActionIds.findIndex(
				(id) => id === action.payload.taskActionId
			);
			if (taskActionIdIndex > -1) {
				tempState.checkedTaskActionIds.splice(taskActionIdIndex, 1);
			} else {
				tempState.checkedTaskActionIds.push(
					action.payload.taskActionId
				);
			}
			return tempState;

		case taskManagementReduxConstants.UNCHECK_ALL_TASK_ACTIONS:
			var tempState = { ...state };
			tempState.checkedTaskActionIds = [];
			return tempState;

		case taskManagementReduxConstants.CHANGE_TASK_SEARCH_QUERY:
			var tempState = {
				...state,
				searchQuery: action.payload.searchQuery,
			};
			return tempState;

		case taskManagementReduxConstants.TOGGLE_SHOW_TASK_ACTION_EDIT_MODAL:
			var tempState = { ...state };
			if (tempState.showTaskActionEditModal) {
				tempState.showTaskActionEditModal = false;
				tempState.taskActionEditModalProps = {};
			} else {
				tempState.showTaskActionEditModal = true;
				tempState.taskActionEditModalProps = action.payload;
			}
			return tempState;

		case taskManagementReduxConstants.CLEAR_TASK_CACHE:
			var reqKey = getRequestKeyFromReqPayload(action.payload.reqPayload);
			var tempState = { ...state };
			tempState.taskListAndReqPayloadMap = {};
			return tempState;

		case taskManagementReduxConstants.CHANGE_STATUS_FILTER:
			var tempState = { ...state };
			var index = tempState.includedStatusesInFilter.findIndex(
				(status) => status === action.payload.status
			);
			if (index > -1) {
				tempState.includedStatusesInFilter.splice(index, 1);
			} else {
				tempState.includedStatusesInFilter.push(action.payload.status);
			}
			return tempState;

		case taskManagementReduxConstants.FETCH_TASK_LIST_FILTERS:
			var tempState = { ...state };
			if (Array.isArray(action.payload.filters)) {
				tempState.taskListFilters = action.payload.filters.filter(
					(filter) => !filter.exclude_from_filters
				);
			}
			return tempState;

		case taskManagementReduxConstants.APPLY_TASK_LIST_FILTERS:
			var tempState = { ...state };
			tempState.taskListRequestPayload = {
				...tempState.taskListRequestPayload,
				filter_by: action.payload.filters,
			};
			return tempState;

		case taskManagementReduxConstants.APPLY_TASK_LIST_SORT:
			var tempState = { ...state };
			tempState.taskListRequestPayload = {
				...tempState.taskListRequestPayload,
				sort_by: [
					{ [action.payload.sortField]: action.payload.sortOrder },
				],
			};
			return tempState;

		default:
			return state;
	}
}
