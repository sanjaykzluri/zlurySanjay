import { viewsnewConstants } from "../constants/viewsnewConstants";

const initialState = {
	5: {},
	6: {},
	7: {},
	8: {},
};

export function viewsnewReducer(state = initialState, action) {
	switch (action.type) {
		case viewsnewConstants.VIEWS_REQUESTED:
			var tempState = { ...state };
			tempState[action.payload.screenTagKey] = {
				...tempState[action.payload.screenTagKey],
				isLoadingData: true,
			};
			return tempState;
		case viewsnewConstants.VIEWS_FETCHED:
			var tempState = { ...state };
			tempState[action.payload.screenTagKey].data = [
				...action.payload.data,
			];
			tempState[action.payload.screenTagKey].layout_option =
				action.payload.layout_option;
			return {
				...tempState,
				[action.payload.screenTagKey]: {
					...tempState[action.payload.screenTagKey],
					isLoadingData: false,
					error: action.payload.err ? action.payload.err : null,
				},
			};

		case viewsnewConstants.CLEAR_SCREENTAG_VIEWS:
			var tempState = { ...state };
			tempState[action.payload.screenTagKey] = {};
			return tempState;
		case viewsnewConstants.SET_LAYOUT_OPTION:
			var tempState = { ...state };
			tempState[action.payload.screenTagKey];
			return {
				...tempState,
				[action.payload.screenTagKey]: {
					...tempState[action.payload.screenTagKey],
					layout_option: action.payload.layout_option,
				},
			};
		default:
			return state;
	}
}
