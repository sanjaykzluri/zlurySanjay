/**
 * Reducer
 * @param {*} state // state of the current reducer
 * @param {*} action // action dispatched {type:"",payload:{}}
 */

export const VIEWS_ACTION_TYPE = {
	SET_VIEWS: "SET_VIEWS",
};

export function viewsReducer(state = {}, action) {
	switch (action.type) {
		case VIEWS_ACTION_TYPE.SET_VIEWS:
			return { ...action.payload };
		default:
			return state;
	}
}
