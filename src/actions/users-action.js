import { usersConstants } from "../constants/users";
import { getAllUsers, getUserApplications } from "../services/api/users";
import { defaults, ENTITIES } from "../constants"
import { client } from "../utils/client";

export function fetchAllUsers(page = 0, cancelToken = null) {
	var isCanceled = false;
	if (cancelToken && cancelToken?.current?.token) {
		isCanceled = true;
		cancelToken.current.token.cancel(
			"Operation cancelled in favor of a new request"
		);
	}
	return async function (dispatch) {
		dispatch({
			type: usersConstants.USERS_REQUESTED,
		});
		try {
			if (cancelToken && cancelToken?.current) {
				cancelToken.current.token = client.CancelToken.source();
			}
			const response = await getAllUsers(page, defaults.USERS_TABLE_ROW, cancelToken && cancelToken.current.token);
			if (page === 0 && response?.users?.[0]) {
				response.users[0].isAccessible = true;
				response.users[0].type = "users";
			}
			dispatch({
				type: usersConstants.USERS_FETCHED,
				payload: {
					data: response.users,
					count: response.row,
					pageNo: page,
				},
			});
		} catch (err) {
			if (!isCanceled) {
				if (err && err?.message && (err?.message === "Operation cancelled in favor of a new request")) {
					dispatch({
						type: usersConstants.USERS_FETCHED,
						payload: {
							err,
							loading: err?.message === "Operation cancelled in favor of a new request",
						},
					});
				} else {
					dispatch({
						type: usersConstants.USERS_FETCHED,
						payload: {
							err,
						},
					});
				}
			}
		}
	};
}

export function fetchSingleUserApps(page, cancelToken) {
	if (cancelToken.current.token) {
		cancelToken.current.token.cancel("Operation cancelled in favor of a new request");
	}
	const applicationId = window.location.pathname.split("/")[2];
	return async function (dispatch) {
		dispatch({
			type: usersConstants.SINGLE_USER_APPS_REQUESTED,
			payload: {
				id: applicationId,
			}
		});
		try {
			cancelToken.current.token = client.CancelToken.source();
			const response = await getUserApplications(applicationId, page, defaults.USERS_TABLE_ROW, cancelToken.current.token);
			if (page === 0 && response?.apps?.[0]) {
				response.apps[0].isAccessible = true;
				response.apps[0].type = ENTITIES.APPLICATIONS;
			}
			dispatch({
				type: usersConstants.SINGLE_USER_APPS_FETCHED,
				payload: {
					data: response.data,
					count: response.meta.pagination.row,
					pageNo: page,
					id: applicationId,
				},
			});

		} catch (err) {
			dispatch({
				type: usersConstants.SINGLE_USER_APPS_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}