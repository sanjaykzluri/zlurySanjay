import { LicenseMapperReduxConstants } from "modules/licenses/constants/LicenseConstants";

const initialState = {};

export function LicenseMapperReducer(state = initialState, action) {
	switch (action.type) {
		case LicenseMapperReduxConstants.REQUEST_ALL_LICENSE_MAPPER_USERS:
			var tempState = { ...state };
			tempState = {
				loaded: false,
				loading: true,
			};

			return tempState;

		case LicenseMapperReduxConstants.FETCH_ALL_LICENSE_MAPPER_USERS:
			var tempState = { ...state };
			tempState = {
				loaded: true,
				loading: false,
				hasMoreData: action.payload.hasMoreData,
				data: tempState.data
					? [...tempState.data, ...action.payload.data]
					: [...action.payload.data],
				initialData: tempState.initialData
					? [
							...tempState.initialData,
							structuredClone(action.payload.data),
					  ]
					: structuredClone(action.payload.data),
				metaData: action.payload.metaData,
			};

			return tempState;

		case LicenseMapperReduxConstants.CLEAR_ALL_LICENSE_MAPPER_USERS:
			return {};

		case LicenseMapperReduxConstants.UPDATE_ALL_LICENSE_MAPPER_USERS:
			var tempState = { ...state };
			tempState.data = [...action.payload.data];

			return tempState;

		case LicenseMapperReduxConstants.UPDATE_FEW_LICENSE_MAPPER_USERS:
			var tempState = { ...state };
			const updatedUsers = [...action.payload.data];
			const updatedUserIds = updatedUsers.map((user) => user.user_id);
			const tempUsers = [...tempState.data];
			for (let user of tempUsers) {
				let index = updatedUserIds.findIndex(
					(userId) => userId === user.user_id
				);
				if (index > -1) {
					user = updatedUsers[index];
				}
			}
			tempState.data = [...tempUsers];

			return tempState;

		case LicenseMapperReduxConstants.UPDATE_TABLE_SCROLL_POSITION:
			var tempState = { ...state };
			return {
				...tempState,
				scrollTop: action.payload.scrollTop,
			};

		default:
			return state;
	}
}
