import { departmentConstants, defaults, ENTITIES } from "../constants";
import {
	getDepartmentInfo,
	getAllDepartments,
	getSingleDepartmentAppInfo,
	getDepartmentUsers,
} from "../services/api/departments";
import { client } from "../utils/client";

export function fetchAllDepartments(page = 0, cancelToken = null) {
	var isCancelled = false;
	if (cancelToken && cancelToken.current?.token) {
		cancelToken.current.token.cancel("Operation cancelled in favor of a new request");
		isCancelled = true;
	}
	return async function (dispatch) {
		dispatch({
			type: departmentConstants.DEPARTMENTS_REQUESTED,
		});
		try {
			if (cancelToken) cancelToken.current.token = client.CancelToken.source();
			const response = await getAllDepartments(page, defaults.ALL_DEPARTMENTS_ROW, cancelToken && cancelToken.current.token);
			if (page === 0 && response?.departments?.[0]) {
				response.departments[0].type = ENTITIES.DEPARTMENT;
				response.departments[0].isAccessible = true;
			}
			dispatch({
				type: departmentConstants.DEPARTMENTS_FETCHED,
				payload: {
					data: response.departments,
					count: response.totalRows,
					pageNo: page,
				},
			});
		} catch (err) {
			dispatch({
				type: departmentConstants.DEPARTMENTS_FETCHED,
				payload: {
					err: err,
					loading: isCancelled,
				},
			});
		}
	};
}

export function fetchDepartmentInfo(departmentId) {
	return async function (dispatch) {
		dispatch({
			type: departmentConstants.DEPARTMENT_INFO_REQUESTED,
		});
		try {
			const response = await getDepartmentInfo(departmentId);
			dispatch({
				type: departmentConstants.DEPARTMENT_INFO_FETCHED,
				payload: {
					data: response,
				},
			});
		} catch (err) {
			dispatch({
				type: departmentConstants.DEPARTMENTS_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}

export function fetchSingleDepartmentUsers(page, cancelToken) {
	const applicationId = window.location.pathname.split("/")[2];
	if (cancelToken.current.token) {
		cancelToken.current.token.cancel("Operation cancelled in favor of a new request");
	}
	return async function (dispatch) {
		dispatch({
			type: departmentConstants.SINGLE_DEPARTMENT_USERS_REQUESTED,
			payload: {
				id: applicationId,
			}
		});
		try {
			cancelToken.current.token = client.CancelToken.source();
			const response = await getDepartmentUsers(applicationId, page, defaults.ALL_DEPARTMENTS_ROW, cancelToken.current.token);
			if (page === 0 && response?.users?.[0]) {
				response.users[0].isAccessible = true;
				response.users[0].type = ENTITIES.USERS;
			}
			dispatch({
				type: departmentConstants.SINGLE_DEPARTMENT_USERS_FETCHED,
				payload: {
					data: response.users,
					count: response.row,
					pageNo: page,
					id: applicationId,
				},
			});
		}
		catch (err) {
			dispatch({
				type: departmentConstants.SINGLE_DEPARTMENT_USERS_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}

export function fetchSingleDepartmentApps(page, cancelToken) {
	if (cancelToken.current.token) {
		cancelToken.current.token.cancel("Operation cancelled in favor of a new request");
	}

	const applicationId = window.location.pathname.split("/")[2];
	return async function (dispatch) {
		dispatch({
			type: departmentConstants.SINGLE_DEPARTMENT_APPS_REQUESTED,
			payload: {
				id: applicationId,
			}
		});
		try {
			cancelToken.current.token = client.CancelToken.source();
			const response = await getSingleDepartmentAppInfo(applicationId, page, defaults.ALL_DEPARTMENTS_ROW, cancelToken.current.token);
			if (page === 0 && response?.applications?.[0]) {
				response.applications[0].isAccessible = true;
				response.applications[0].type = ENTITIES.APPLICATIONS;
			}
			dispatch({
				type: departmentConstants.SINGLE_DEPARTMENT_APPS_FETCHED,
				payload: {
					data: response.applications,
					count: response.row,
					pageNo: page,
					id: applicationId,
				},
			});
		}
		catch (err) {
			dispatch({
				type: departmentConstants.SINGLE_DEPARTMENT_APPS_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}