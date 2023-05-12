import { getValueFromLocalStorage } from "utils/localStorage";
import { SAVE_USER_DETAILS } from "../constants/user";

const initialState = getValueFromLocalStorage("user") || {};

export function userDetailsReducer(state = initialState, action) {
	switch (action.type) {
		case SAVE_USER_DETAILS:
			return action.payload;
		default:
			return state;
	}
}
