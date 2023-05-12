import { settingsConstants } from "../constants/settings";

const initialState = {
	admins: { count: 0, loading: false, loaded: false, data: [] },
};

export function settingsReducer(state = initialState, action) {
	switch (action.type) {
		case settingsConstants.ADMINS_REQUESTED:
			return {
				...state,
				admins: {
					loading: true,
					loaded: false,
					data: [],
					count: 0,
				},
			};
		case settingsConstants.ADMINS_FETCHED:
			return {
				...state,
				admins: {
					loading: false,
					loaded: true,
					count: action.payload.count,
					data: action.payload.data,
				},
			};
		default:
			return state;
	}
}
