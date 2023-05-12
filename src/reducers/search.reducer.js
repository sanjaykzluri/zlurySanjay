import { searchConstants } from "../constants";

const initialState = {
	searchdata: { count: 0, loading: false, loaded: false, data: [] },
};

export function searchReducer(state = initialState, action) {
	switch (action.type) {
		case searchConstants.SEARCH_REQUESTED:
			return {
				...state,
				searchdata: {
					loading: true,
					loaded: false,
					count: 0,
					data: [],
				},
			};
		case searchConstants.SEARCH_FETCHED:
			return {
				...state,
				searchdata: {
					loading: false,
					loaded: true,
					data: action.payload.data,
					count: action.payload.count,
					err: action.payload.err,
				},
			};
		default:
			return state;
	}
}
