import { usersConstants } from "../constants/users";

const initialState = {
	users: { count: 0, loading: false, loaded: false, data: [] },
	singleUserApps: { count: 0, loading: false, loaded: false, data: [] }
};

export function usersReducer(state = initialState, action) {
	switch (action.type) {
		case usersConstants.USERS_REQUESTED:
			var allUsers = Object.assign({},
				state.users,
				{
					loading: true,
					loaded: false,
					count: state.users.length,
					data: state.users.data
				});
			return {
				...state,
				users: allUsers,
			};
		case usersConstants.USERS_FETCHED:
			var latest_users_set = [];
			var isMoreDataAvailable = false;
			if (action.payload.data) {
				latest_users_set = state.users.data.concat(action.payload.data);
				isMoreDataAvailable = !(action.payload.data.length < 10)
			} else {
				latest_users_set = state.users.data;
				isMoreDataAvailable = false;
			}
			var allUsers = Object.assign({},
				state.users,
				{
					loading: action.payload.loading || false,
					loaded: true,
					complete: true,
					data: latest_users_set,
					count: latest_users_set.length,
					err: action.payload.err,
					isMoreDataAvailable: isMoreDataAvailable,
					pageNo: action.payload.pageNo,
				}
			);
			const latestState = {
				...state,
				users: allUsers
			};
			return latestState;

		case usersConstants.DELETE_USERS_CACHE:
			var newState = { ...state };
			newState.users = {
				...newState.users,
				data: [],
				loading: true,
				loaded: false,
			}
			return newState;

		case usersConstants.SINGLE_USER_APPS_REQUESTED:
			var allSingleUserApps = { ...state };
			allSingleUserApps.singleUserApps[action.payload.id] =
			{
				...allSingleUserApps.singleUserApps[action.payload.id],
				loading: true,
				loaded: false,
			}
			return allSingleUserApps;

		case usersConstants.SINGLE_USER_APPS_FETCHED:
			var allSingleUserApps = { ...state };
			var newData = allSingleUserApps.singleUserApps[action.payload.id]?.data ?
				[...state.singleUserApps[action.payload.id].data, ...action.payload.data]
				: action.payload.data;

			if (action.payload.data) {
				isMoreDataAvailable = !(action.payload.data.length < 10)
			} else {
				isMoreDataAvailable = false;
			}
			allSingleUserApps.singleUserApps[action.payload.id] = {
				loading: false,
				loaded: true,
				data: newData,
				count: newData?.length,
				err: action.payload.err,
				isMoreDataAvailable: isMoreDataAvailable,
				pageNo: action.payload.pageNo,
			}
			return allSingleUserApps;

		case usersConstants.DELETE_SINGLE_USER_APPS_CACHE:
			var newState = { ...state };
			newState.singleUserApps[action.payload.id] = [];
			return newState;

		default:
			return state;
	}
}
