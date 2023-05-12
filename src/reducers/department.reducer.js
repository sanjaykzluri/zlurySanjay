import { departmentConstants } from "../constants";

const initialState = {
	departments: { count: 0, loading: false, loaded: false, data: [] },
	singleDepartmentApps: {loading: false, loaded: false, count: 0, data: []},
	singleDepartmentUsers: {loading: false, loaded: false, count: 0, data: [], complete: false}
};

export function departmentReducer(state = initialState, action) {
	switch (action.type) {
		case departmentConstants.DEPARTMENTS_REQUESTED:
			var allDepartments = Object.assign( {},
				state.departments,
				{
					loading: true,
					loaded: false,
					count: state.departments.data.length,
					data: state.departments.data,
				});
			return {
				...state,
				departments: allDepartments,
			};
		case departmentConstants.DEPARTMENTS_FETCHED:
			var latest_department_set = [];
			var isMoreDataAvailable = false;
			if(action.payload.data) { 
				latest_department_set = state.departments.data.concat(action.payload.data); 
				isMoreDataAvailable = !(action.payload.data.length<10) 
			} else { 
				latest_department_set = state.departments.data; 
				isMoreDataAvailable = false;  
			}
			var allDepartments = Object.assign( {},
				state.departments,
				{
					loading: action.payload.loading || false,
					loaded: true,
					complete: true,
					data: latest_department_set,
					count: latest_department_set.length,
					err: action.payload.err,
					isMoreDataAvailable: isMoreDataAvailable,
					pageNo: action.payload.pageNo,
				});
			const latestState = {
				...state,
				departments: allDepartments
			}
			return latestState;

		case departmentConstants.DELETE_DEPARTMENTS_CACHE:
			var newState = {...state};
			newState.departments.data = [];
			return newState;
	
		case departmentConstants.SINGLE_DEPARTMENT_APPS_REQUESTED:
			var allSingleDepartmentApps = {...state};
			allSingleDepartmentApps.singleDepartmentApps[action.payload.id] = 
		  	{
				...allSingleDepartmentApps.singleDepartmentApps[action.payload.id],
				loading: true,
				loaded: false,
			} 
			return allSingleDepartmentApps;

		case departmentConstants.SINGLE_DEPARTMENT_APPS_FETCHED:
			var latest_singleDepartmentApps = {...state};
			var newAppData = state.singleDepartmentApps[action.payload.id]?.data ?
				[...state.singleDepartmentApps[action.payload.id].data, ...action.payload.data]
				: action.payload.data;
			if(action.payload.data) { 
				isMoreDataAvailable = !(action.payload.data.length<10) 
			} else { 
				isMoreDataAvailable = false;  
			}
			latest_singleDepartmentApps.singleDepartmentApps[action.payload.id] = {
				loading: false,
				loaded: true,
				data: newAppData,
				count: newAppData?.length,
				err: action.payload.err,
				isMoreDataAvailable: isMoreDataAvailable,
				pageNo: action.payload.pageNo,
			}
			return latest_singleDepartmentApps;

		case departmentConstants.DELETE_DEPARTMENTS_APPS_CACHE:
			var newState = {...state};
			newState.singleDepartmentApps[action.payload.id] = [];
			return newState;

		case departmentConstants.SINGLE_DEPARTMENT_USERS_REQUESTED:
			var allSingleDepartmentUsers = {...state};
			allSingleDepartmentUsers.singleDepartmentUsers[action.payload.id] = 
		  	{
				...allSingleDepartmentUsers.singleDepartmentUsers[action.payload.id],
				loading: true,
				loaded: false,
			} 
			return allSingleDepartmentUsers;

		case departmentConstants.SINGLE_DEPARTMENT_USERS_FETCHED:
			var latest_singleDepartmentUsers = {...state};
			var newUsersData = state.singleDepartmentUsers[action.payload.id]?.data ?
				[...state.singleDepartmentUsers[action.payload.id].data, ...action.payload.data]
				: action.payload.data
			if(action.payload.data) { 
				isMoreDataAvailable = !(action.payload.data.length<10) 
			} else { 
				isMoreDataAvailable = false;  
			}
			latest_singleDepartmentUsers.singleDepartmentUsers[action.payload.id] = {
				loading: false,
				loaded: true,
				data: newUsersData,
				count: newUsersData?.length,
				err: action.payload.err,
				isMoreDataAvailable: isMoreDataAvailable,
				pageNo: action.payload.pageNo,
			}
			return latest_singleDepartmentUsers;

		case departmentConstants.DELETE_SINGLE_DEPARTMENT_USERS:
			var newState = {...state};
			newState.singleDepartmentUsers[action.payload.id] = [];
			return newState;

		default:
			return state;
	}
}