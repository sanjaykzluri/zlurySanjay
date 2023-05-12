import { SAVE_GETTINGSTARTED__STATUS, TOGGLE_GETTINGSTARTED_MODAL } from "./actions";

export function gettingStartedReducer(state = {}, action) {
	switch (action.type) {
		case SAVE_GETTINGSTARTED__STATUS:
			return action.payload;
		default:
			return state;
	}
}

export function toggleGettingStartedModalReducer(state = false, action) {
	switch (action.type) {
		case TOGGLE_GETTINGSTARTED_MODAL:
			return action.payload;
		default:
			return state;
	}
}