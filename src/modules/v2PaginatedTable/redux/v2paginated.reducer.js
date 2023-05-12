import { v2PaginatedConstants } from "../constants/v2PaginatedTableConstants";

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
	auditlogs: {},
};

export function v2PaginatedReducer(state = initialState, action) {
	switch (action.type) {
		case v2PaginatedConstants.PAGINATED_ALL_DATA_REQUESTED:
			var tempState = { ...state };
			tempState[action.payload.v2Entity][
				`${JSON.stringify(action.payload.reqBody)}`
			] = {
				...tempState[action.payload.v2Entity][
					`${JSON.stringify(action.payload.reqBody)}`
				],
				row: action.payload.row || 20,
				pageNo: action.payload.pageNo || 0,
				isLoadingData: true,
				hasMoreData: true,
			};
			tempState[action.payload.v2Entity].searchData = null;
			return tempState;

		case v2PaginatedConstants.PAGINATED_ALL_DATA_FETCHED:
			var tempState = { ...state };
			var page =
				"page_" +
				action.payload?.pageNo?.toString() +
				"_" +
				"row_" +
				action.payload?.row?.toString();

			if (
				tempState[action?.payload?.v2Entity][
					`${JSON.stringify(action?.payload?.reqBody)}`
				]
			) {
				tempState[action?.payload?.v2Entity][
					`${JSON.stringify(action?.payload?.reqBody)}`
				][page] = [...action?.payload.data];
			} else {
				tempState[action?.payload?.v2Entity][
					`${JSON.stringify(action?.payload?.reqBody)}`
				] = {};
				tempState[action?.payload?.v2Entity][
					`${JSON.stringify(action?.payload?.reqBody)}`
				][page] = [...action?.payload.data];
			}
			return {
				...tempState,
				[action.payload.v2Entity]: {
					...tempState[action.payload.v2Entity],
					[`${JSON.stringify(action.payload.reqBody)}`]: {
						...tempState[action?.payload?.v2Entity][
							`${JSON.stringify(action?.payload?.reqBody)}`
						],
						metaData: action.payload.metaData || {},
						error: action.payload.err ? action.payload.err : null,
						hasMoreData: action.payload.hasMoreData,
						pageNo: action.payload.pageNo,
						isLoadingData: false,
						row: action.payload.row,
					},
				},
			};

		case v2PaginatedConstants.PAGINATED_CLEAR_ALL_DATA_CACHE:
			var tempState = { ...state };
			tempState[action.payload.v2Entity] = {
				property_file: {
					...tempState[action.payload.v2Entity]?.property_file,
				},
				row: action.payload.row,
				pageNo: action.payload.pageNo,
			};
			return tempState;

		case v2PaginatedConstants.PAGINATED_SET_PAGE:
			var tempState = { ...state };
			tempState[action.payload.v2Entity][
				`${JSON.stringify(action.payload.reqBody)}`
			].pageNo = action.payload.pageNo;

			return tempState;

		case v2PaginatedConstants.PAGINATED_SET_SCROLLTOP:
			var tempState = { ...state };
			tempState[action.payload.v2Entity][
				`${JSON.stringify(action.payload.reqBody)}`
			].scrollTop = action.payload.scrollTop;

			return tempState;

		case v2PaginatedConstants.PAGINATED_SET_ROW:
			var tempState = { ...state };
			tempState[action.payload.v2Entity][
				`${JSON.stringify(action.payload.reqBody)}`
			].row = action.payload.row;

			return tempState;

		case v2PaginatedConstants.PAGINATED_SEARCH_DATA_REQUESTED:
			var tempState = { ...state };
			tempState[action.payload.v2Entity].searchData = {
				data: [],
				metaData: null,
				hasMoreData: false,
				isLoadingData: true,
				pageNo: action.payload?.pageNo || 0,
			};
			return tempState;

		case v2PaginatedConstants.PAGINATED_SEARCH_DATA_FETCHED:
			var tempState = { ...state };
			var page =
				"page_" +
				action.payload?.pageNo?.toString() +
				"_" +
				"row_" +
				action.payload?.row?.toString();
			tempState[action.payload.v2Entity].searchData = {
				[page]: action.payload.data,
				isLoadingData: true,
				metaData: action.payload.metaData,
				error: action.payload.error,
				hasMoreData: action.payload.hasMoreData,
				pageNo: action.payload.pageNo,
				row: action.payload.row,
				isLoadingData: false,
				total: action.payload.total,
			};
			return tempState;

		case v2PaginatedConstants.PAGINATED_PROPERTY_FILE_REQUESTED:
			var tempState = { ...state };
			tempState[action.payload.v2Entity].property_file = {
				loaded: false,
			};
			return tempState;

		case v2PaginatedConstants.PAGINATED_PROPERTY_FILE_FETCHED:
			var tempState = { ...state };
			tempState[action.payload.v2Entity].property_file = {
				loaded: true,
				propertyList: action.payload.propertyList,
				columnList: action.payload.columnList,
				group_properties: action.payload.group_properties,
			};
			return tempState;
		case v2PaginatedConstants.PAGINATED_CURRENT_DATA_KEY:
			return {
				...state,
				[action.payload.v2Entity]: {
					...state[action.payload.v2Entity],
					current_data_key: JSON.stringify(action.payload.reqBody),
				},
			};
		case v2PaginatedConstants.PAGINATED_SOURCE_LIST_FOR_FILTER_REQUESTED:
			var tempState = { ...state };
			tempState[action.payload.v2Entity].source_list = {
				source_list_for_filter_loaded: false,
			};
			return tempState;

		case v2PaginatedConstants.PAGINATED_SOURCE_LIST_FOR_FILTER_FETCHED:
			var tempState = { ...state };
			tempState[action.payload.v2Entity].source_list = {
				source_list_for_filter_loaded: true,
				source_list_for_filter: action.payload.sourceList,
			};
			return tempState;
		case v2PaginatedConstants.PAGINATED_UPDATE_V2_DATA:
			const v2Entity_key = action.payload.v2Entity;
			var tempState = { ...state };
			const data_key = state[v2Entity_key].current_data_key;
			const page_row =
				"page_" +
				tempState[v2Entity_key][data_key].pageNo?.toString() +
				"_" +
				"row_" +
				tempState[v2Entity_key][data_key].row?.toString();
			tempState = {
				...tempState,
				[v2Entity_key]: {
					...state[v2Entity_key],
					[data_key]: {
						...state[v2Entity_key][data_key],
						[page_row]: [
							...state[action.payload.v2Entity][data_key][
								page_row
							].map((value) => {
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
