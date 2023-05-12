const ACTION_TYPE = {
	SAVE_API_RESPONSE: "SAVE_API_RESPONSE",
	REMOVE_API_FROM_STORE: "REMOVE_API_FROM_STORE",
};

export const saveAPIResponseToStore = (api, response) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.SAVE_API_RESPONSE,
				payload: {
					api,
					response,
				},
			});
		} catch (reason) {
			console.log("Error while saving api response to store", reason);
		}
	};
};

export const removeAPIResponseToStore = (api) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.REMOVE_API_FROM_STORE,
				payload: {
					api,
				},
			});
		} catch (reason) {
			console.log("Error while removing api response from store", reason);
		}
	};
};

const apiState = {
	getCalls: {},
};

export function apiReducer(state = apiState, action) {
	switch (action.type) {
		case ACTION_TYPE.SAVE_API_RESPONSE:
			return Object.assign({}, state, {
				getCalls: Object.assign({}, state.getCalls, {
					[action.payload.api]: action.payload.response,
				}),
			});
		case ACTION_TYPE.REMOVE_API_FROM_STORE:
			var getCalls = state.getCalls;
			delete getCalls[action.payload.api];
			return Object.assign({}, state, {
				getCalls,
			});
		default:
			return state;
	}
}
