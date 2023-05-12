import { v2InfiniteConstants } from "../constants/v2InfiniteTableConstants";

const initialState = {
	applications: {},
	application_users: {},
	application_licenses: {},
	users: {},
	marked_for_onboarding: {},
	marked_for_offboarding: {},
	user_applications: {},
	departments: {},
	department_users: {},
	departments_applications: {},
	licenses: {},
	contracts: {},
	subscriptions: {},
	perpetuals: {},
	critical_apps: {},
	critical_users: {},
	recognized: {},
	unrecognized: {},
	auditlogs: {},
	pending: {},
	completed: {},
	requests: {},
	approvals: {},
	appPlaybooksProvision: {},
	appPlaybooksDeprovision: {},
	appPlaybooksAppManagement: {},
	automationRulesProvision: {},
	automationRulesDeprovision: {},
	automationRulesAppManagement: {},
	miniplaybooks: {},
	groups: {},
};

export function v2InfiniteReducer(state = initialState, action) {
	switch (action.type) {
		case v2InfiniteConstants.ALL_DATA_REQUESTED:
			var tempState = { ...state };
			tempState[action.payload.v2Entity][
				`${JSON.stringify(action.payload.reqBody)}`
			] = {
				...tempState[action.payload.v2Entity][
					`${JSON.stringify(action.payload.reqBody)}`
				],
				isLoadingData: true,
				hasMoreData: true,
			};
			tempState[action.payload.v2Entity].searchData = null;
			return tempState;

		case v2InfiniteConstants.ALL_DATA_FETCHED:
			var tempState = { ...state };
			if (
				tempState[action.payload.v2Entity][
					`${JSON.stringify(action.payload.reqBody)}`
				] &&
				tempState[action.payload.v2Entity][
					`${JSON.stringify(action.payload.reqBody)}`
				]?.data &&
				tempState[action.payload.v2Entity][
					`${JSON.stringify(action.payload.reqBody)}`
				]?.metaData
			) {
				var tempData =
					tempState[action.payload.v2Entity][
						`${JSON.stringify(action.payload.reqBody)}`
					].data;
				tempState[action.payload.v2Entity][
					`${JSON.stringify(action.payload.reqBody)}`
				].data = [...tempData, ...action.payload.data];
			} else {
				tempState[action.payload.v2Entity][
					`${JSON.stringify(action.payload.reqBody)}`
				] = {};
				tempState[action.payload.v2Entity][
					`${JSON.stringify(action.payload.reqBody)}`
				].data = [...action.payload.data];
			}
			return {
				...tempState,
				[action.payload.v2Entity]: {
					...tempState[action.payload.v2Entity],
					[`${JSON.stringify(action.payload.reqBody)}`]: {
						...tempState[action.payload.v2Entity][
							`${JSON.stringify(action.payload.reqBody)}`
						],
						metaData: action.payload.metaData || {},
						error: action.payload.err ? action.payload.err : null,
						hasMoreData: action.payload.hasMoreData,
						pageNo: action.payload.pageNo,
						isLoadingData: false,
					},
				},
			};
		case v2InfiniteConstants.CURRENT_DATA_KEY:
			return {
				...state,
				[action.payload.v2Entity]: {
					...state[action.payload.v2Entity],
					current_data_key: JSON.stringify(action.payload.reqBody),
				},
			};
		case v2InfiniteConstants.CLEAR_ALL_DATA_CACHE:
			var tempState = { ...state };
			tempState[action.payload.v2Entity] = {
				property_file: {
					...tempState[action.payload.v2Entity]?.property_file,
				},
			};
			return tempState;

		case v2InfiniteConstants.NEXT_PAGE:
			var tempState = { ...state };
			tempState[action.payload.v2Entity][
				`${JSON.stringify(action.payload.reqBody)}`
			].pageNo = action.payload.pageNo;
			tempState[action.payload.v2Entity][
				`${JSON.stringify(action.payload.reqBody)}`
			].isLoadingData = true;
			return tempState;

		case v2InfiniteConstants.SEARCH_DATA_REQUESTED:
			var tempState = { ...state };
			tempState[action.payload.v2Entity].searchData = {
				...tempState[action.payload.v2Entity].searchData,
				hasMoreData: false,
				isLoadingData: true,
			};
			return tempState;

		case v2InfiniteConstants.SEARCH_DATA_FETCHED:
			var tempState = { ...state };
			tempState[action.payload.v2Entity].searchData = {
				data: [
					...(tempState[action.payload.v2Entity]?.searchData?.data ||
						[]),
					...action.payload.data,
				],
				isLoadingData: true,
				metaData: action.payload.metaData,
				error: action.payload.error,
				hasMoreData: action.payload.hasMoreData,
				pageNo: action.payload.pageNo,
				isLoadingData: false,
			};

			return tempState;

		case v2InfiniteConstants.PROPERTY_FILE_REQUESTED:
			var tempState = { ...state };
			tempState[action.payload.v2Entity].property_file = {
				loaded: false,
			};
			return tempState;

		case v2InfiniteConstants.PROPERTY_FILE_FETCHED:
			var tempState = { ...state };
			tempState[action.payload.v2Entity].property_file = {
				loaded: true,
				propertyList: action.payload.propertyList,
				columnList: action.payload.columnList,
				group_properties: action.payload.group_properties,
			};
			return tempState;
		case v2InfiniteConstants.CLEAR_PROPERTY_FILE:
			var tempState = { ...state };
			tempState[action.payload.v2Entity].property_file = {
				loaded: false,
				propertyList: [],
				columnList: [],
			};
			return tempState;
		case v2InfiniteConstants.SOURCE_LIST_FOR_FILTER_REQUESTED:
			var tempState = { ...state };
			tempState[action.payload.v2Entity].source_list = {
				source_list_for_filter_loaded: false,
			};
			return tempState;

		case v2InfiniteConstants.SOURCE_LIST_FOR_FILTER_FETCHED:
			var tempState = { ...state };
			tempState[action.payload.v2Entity].source_list = {
				source_list_for_filter_loaded: true,
				source_list_for_filter: action.payload.sourceList,
			};
			return tempState;

		case v2InfiniteConstants.UPDATE_SCROLL_POSTION:
			var tempState = { ...state };
			return {
				...tempState,
				[action.payload.v2Entity]: {
					...tempState[action.payload.v2Entity],
					[`${JSON.stringify(action.payload.reqBody)}`]: {
						...tempState[action.payload.v2Entity][
							`${JSON.stringify(action.payload.reqBody)}`
						],
						scrollTop: action.payload.scrollTop,
					},
				},
			};
		case v2InfiniteConstants.UPDATE_V2_DATA:
			const v2Entity_key = action.payload.v2Entity;
			var tempState = { ...state };
			const data_key = state[v2Entity_key].current_data_key;
			tempState = {
				...tempState,
				[v2Entity_key]: {
					...state[v2Entity_key],
					[data_key]: {
						...state[v2Entity_key][data_key],
						data: [
							...state[action.payload.v2Entity][
								data_key
							].data.map((value) => {
								return value._id ===
									action.payload.data.data._id
									? {
											...value,
											...action.payload.data.data,
									  }
									: value;
							}),
						],
					},
				},
			};
			return tempState;

		default:
			return state;
	}
}
