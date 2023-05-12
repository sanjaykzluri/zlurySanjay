import { PARTNER } from "../constants/app.constants";

const ACTION_TYPE = {
	SAVE_PARTNER: "SAVE_PARTNER",
};

export const savePartner = (partner) => {
	return async function (dispatch) {
		dispatch({
			type: ACTION_TYPE.SAVE_PARTNER,
			payload: { partner },
		});
	};
};

/**
 * STORE
 */
const appState = {
	partner: PARTNER.ZLURI,
};

/**
 * Reducer
 * @param {*} state // state of the current reducer
 * @param {*} action // action dispatched {type:"",payload:{}}
 */
export function appReducer(state = appState, action) {
	switch (action.type) {
		case ACTION_TYPE.SAVE_PARTNER:
			return Object.assign({}, state, {
				partner: action.payload.partner,
			});

		default:
			return state;
	}
}
