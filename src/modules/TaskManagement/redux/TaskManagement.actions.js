import { TriggerIssue } from "utils/sentry";
import { getTaskList } from "../service/TaskManagement.api";
import { taskManagementReduxConstants } from "../constants/TaskManagement.constants";

export function checkAndFetchTasks(reqPayload) {
	return async function (dispatch, getState) {
		if (getState().tasks?.tasksLoaded) {
			return;
		} else {
			dispatch(fetchTasks(reqPayload));
		}
	};
}

export function fetchTasks(reqPayload) {
	return async function (dispatch) {
		try {
			dispatch({
				type: taskManagementReduxConstants.REQUEST_TASKS,
				payload: { reqPayload },
			});
			const response = await getTaskList(reqPayload);
			dispatch({
				type: taskManagementReduxConstants.FETCH_TASKS,
				payload: {
					tasks: Array.isArray(response.data) ? response.data : [],
					reqPayload,
				},
			});
			dispatch(
				checkAndFetchTaskListFilters(response.properties.filter_props)
			);
		} catch (error) {
			dispatch({
				type: taskManagementReduxConstants.FETCH_TASKS,
				payload: {
					error: error,
					tasks: [],
					reqPayload,
				},
			});
			TriggerIssue(`Error while fetching task list`, error);
		}
	};
}

export function toggleTaskAccordian(taskId, reqPayload) {
	return async function (dispatch) {
		try {
			dispatch({
				type: taskManagementReduxConstants.TOGGLE_TASK_ACCORDION,
				payload: { taskId, reqPayload },
			});
		} catch (error) {
			TriggerIssue(`Error while toggling task accordian`, error);
		}
	};
}

export function toggleAllTaskAccordions(reqPayload) {
	return async function (dispatch) {
		try {
			dispatch({
				type: taskManagementReduxConstants.TOGGLE_ALL_TASK_ACCORDIONS,
				payload: { reqPayload },
			});
		} catch (error) {
			TriggerIssue(`Error while toggling all task accordians`, error);
		}
	};
}

export function toggleCheckTaskAction(taskActionId) {
	return async function (dispatch) {
		try {
			dispatch({
				type: taskManagementReduxConstants.TOGGLE_CHECK_TASK_ACTION,
				payload: { taskActionId },
			});
		} catch (error) {
			TriggerIssue(`Error while checking/unchecking task action`, error);
		}
	};
}

export function uncheckAllTaskActions() {
	return async function (dispatch) {
		try {
			dispatch({
				type: taskManagementReduxConstants.UNCHECK_ALL_TASK_ACTIONS,
			});
		} catch (error) {
			TriggerIssue(`Error while unchecking all task actions`, error);
		}
	};
}

export function changeTaskSearchQuery(searchQuery) {
	return async function (dispatch) {
		try {
			dispatch({
				type: taskManagementReduxConstants.CHANGE_TASK_SEARCH_QUERY,
				payload: { searchQuery },
			});
		} catch (error) {
			TriggerIssue(`Error while changing task search query`, error);
		}
	};
}

export function toggleShowTaskActionEditModal(action, editType) {
	return async function (dispatch) {
		try {
			dispatch({
				type: taskManagementReduxConstants.TOGGLE_SHOW_TASK_ACTION_EDIT_MODAL,
				payload: { action, editType },
			});
		} catch (error) {
			TriggerIssue(
				`Error while toggling task action edit modal display`,
				error
			);
		}
	};
}

export function clearTaskCache(reqPayload) {
	return async function (dispatch) {
		try {
			dispatch({
				type: taskManagementReduxConstants.CLEAR_TASK_CACHE,
				payload: { reqPayload },
			});
		} catch (error) {
			TriggerIssue(`Error while clearing task cache`, error);
		}
	};
}

export function changeStatusFilter(status) {
	return async function (dispatch) {
		try {
			dispatch({
				type: taskManagementReduxConstants.CHANGE_STATUS_FILTER,
				payload: { status },
			});
		} catch (error) {
			TriggerIssue(`Error while changing task status filter`, error);
		}
	};
}

export function checkAndFetchTaskListFilters(filters) {
	return async function (dispatch, getState) {
		if (getState().tasks?.taskListFilters?.length > 0) {
			return;
		} else {
			dispatch(fetchTaskListFilters(filters));
		}
	};
}

export function fetchTaskListFilters(filters) {
	return async function (dispatch) {
		try {
			dispatch({
				type: taskManagementReduxConstants.FETCH_TASK_LIST_FILTERS,
				payload: { filters },
			});
		} catch (error) {
			dispatch({
				type: taskManagementReduxConstants.FETCH_TASK_LIST_FILTERS,
				payload: {
					error: error,
					filters,
				},
			});
			TriggerIssue(`Error while fetching task list filters`, error);
		}
	};
}

export function applyTaskFilters(filters) {
	return async function (dispatch) {
		try {
			dispatch({
				type: taskManagementReduxConstants.APPLY_TASK_LIST_FILTERS,
				payload: { filters },
			});
		} catch (error) {
			dispatch({
				type: taskManagementReduxConstants.APPLY_TASK_LIST_FILTERS,
				payload: { filters, error },
			});
			TriggerIssue(`Error while applying task list filters`, error);
		}
	};
}

export function applyTaskSort(sortField, sortOrder) {
	return async function (dispatch) {
		try {
			dispatch({
				type: taskManagementReduxConstants.APPLY_TASK_LIST_SORT,
				payload: { sortField, sortOrder },
			});
		} catch (error) {
			dispatch({
				type: taskManagementReduxConstants.APPLY_TASK_LIST_SORT,
				payload: { sortField, sortOrder, error },
			});
			TriggerIssue(`Error while sorting task list`, error);
		}
	};
}
