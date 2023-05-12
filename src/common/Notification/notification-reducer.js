import { notification_constants } from "./notifications-constants";

const initialState = {
	data: {
		today: [],
		older: [],
	},
	hasMoreData: true,
	pageNo: 0,
	toastCounter: 0,
};

export function notificationReducer(state = initialState, action) {
	switch (action.type) {
		case notification_constants.GET_ALL_NOTIFICATIONS:
			return {
				...state,
				data: {
					today: [
						...state.data.today,
						...(action.payload.data.today || []),
					],
					older: [
						...state.data.older,
						...(action.payload.data.older || []),
					],
				},
				pageNo: action.payload.pageNo,
				hasMoreData: action.payload.hasMoreData,
			};
		case notification_constants.UPDATE_NOTIFICATIONS:
			return {
				...state,
				data: {
					today: action.payload.data?.today || [],
					older: action.payload.data?.older || [],
				},
				pageNo: action.payload.pageNo,
			};
		case notification_constants.CLEAR_NOTIFICATIONS_CACHE:
			return initialState;

		case notification_constants.INCREASE_TOAST_COUNTER:
			var counter = state.toastCounter + 1;
			return {
				...state,
				toastCounter: counter,
			};

		case notification_constants.DECREASE_TOAST_COUNTER:
			var counter = state.toastCounter - 1;
			return {
				...state,
				toastCounter: counter,
			};
		default:
			return state;
	}
}
