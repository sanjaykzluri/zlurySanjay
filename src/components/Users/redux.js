import { getUserApplicationsActionHistory } from "../../services/api/applications";
import { getUserInfo, getUserActionHistory } from "../../services/api/users";

const ACTION_TYPE = {
	REQUEST_FETCH_USER_INFO: "REQUEST_FETCH_USER_INFO",
	SAVE_USER_INFO: "SAVE_USER_INFO",
	SAVE_USER_ACTION_HISTORY: "SAVE_USER_ACTION_HISTORY",
	USER_ACTION_HISTORY_REQUESTED: "USER_ACTION_HISTORY_REQUESTED",
	SAVE_USER_APPLICATIONS_ACTION_HISTORY: "SAVE_USER_APPLICATIONS_ACTION_HISTORY",
	USER_APPLICATIONS_ACTION_HISTORY_REQUESTED: "USER_APPLICATIONS_ACTION_HISTORY_REQUESTED",
};

export const fetchUserDetails = (id) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.REQUEST_FETCH_USER_INFO,
			});
			const response = await getUserInfo(id);

			if (!response.error) {
				var user = response;
				dispatch({
					type: ACTION_TYPE.SAVE_USER_INFO,
					payload: response,
				});
			}
		} catch (err) {
			console.log(err);
		}
	};
};

export const fetchUserActionHistory = (id) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.USER_ACTION_HISTORY_REQUESTED,
			});
			const response = await getUserActionHistory(id);

			if (!response.error) {
				dispatch({
					type: ACTION_TYPE.SAVE_USER_ACTION_HISTORY,
					payload: response,
				});
			}
		} catch (err) {
			console.log(err);
		}
	};
};

export const fetchUserApplicationsActionHistory = (id, appId) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.USER_APPLICATIONS_ACTION_HISTORY_REQUESTED,
			});
			const response = await getUserApplicationsActionHistory(id, appId);

			if (!response.error) {
				dispatch({
					type: ACTION_TYPE.SAVE_USER_APPLICATIONS_ACTION_HISTORY,
					payload: response,
				});
			}
		} catch (err) {
			console.log(err);
		}
	};
};
/**
 * Reducer
 * @param {*} state // state of the current reducer
 * @param {*} action // action dispatched {type:"",payload:{}}
 */

export function userReducer(state = {}, action) {
	switch (action.type) {
		case ACTION_TYPE.REQUEST_FETCH_USER_INFO:
			return {loading: true}
		case ACTION_TYPE.SAVE_USER_INFO:
			return {...action.payload, loading: false};
		default:
			return state;
	}
}

/**
 * Reducer
 * @param {*} state // state of the current reducer
 * @param {*} action // action dispatched {type:"",payload:{}}
 */

 export function userActionHistoryReducer(state = null, action) {
	switch (action.type) {
		case ACTION_TYPE.USER_ACTION_HISTORY_REQUESTED:
			return { loading: true };
		case ACTION_TYPE.SAVE_USER_ACTION_HISTORY:
			return { loading: false, ...action.payload };
		default:
			return state;
	}
}

/**
 * Reducer
 * @param {*} state // state of the current reducer
 * @param {*} action // action dispatched {type:"",payload:{}}
 */

 export function userApplicationsActionHistoryReducer(state = null, action) {
	switch (action.type) {
		case ACTION_TYPE.USER_APPLICATIONS_ACTION_HISTORY_REQUESTED:
			return { loading: true };
		case ACTION_TYPE.SAVE_USER_APPLICATIONS_ACTION_HISTORY:
			return { loading: false, ...action.payload };
		default:
			return state;
	}
}
