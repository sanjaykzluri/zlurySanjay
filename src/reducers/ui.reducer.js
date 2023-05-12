import { uiConstants } from "../constants/ui";

const initialState = {
	scroll: true,
	searchActive: false,
	refreshTable: undefined,
};

export function uiReducer(state = initialState, action) {
	switch (action.type) {
		case uiConstants.NOSCROLL:
			return {
				...state,
				scroll: action.payload.scroll,
			};
		case uiConstants.SEARCH_STATUS:
			return {
				...state,
				searchActive: action.payload.searchActive,
			};
		case uiConstants.SET_REFRESH_TABLE_FN:
			if (action.payload.renderedFrom) {
				return {
					...state,
					[action.payload.renderedFrom]: action.payload.refreshTable,
				};
			}
			return {
				...state,
				refreshTable: action.payload.refreshTable,
			};
		default:
			return state;
	}
}