import { overviewConstants } from "../constants";

const initialState = {
	toprow: { count: 0, loading: false, loaded: false, data: [] },
	minigraphs: { count: 0, loading: false, loaded: false, data: [] },
	budget: { count: 0, loading: false, loaded: false, data: [] },
	applicationsov: { count: 0, loading: false, loaded: false, data: [] },
	spendtrendov: { count: 0, loading: false, loaded: false, data: [] },
	spendgraph: { spend_table_data: [], spend_trend: [], computed_data: { spendData: [], spendDataKeys: [], spendTable: [] } },
	usagegraph: { usage_table_data: [], usage_trend: [], usage_computed_data: { usageData: [], usageDataKeys: [], usageTable: [] } },
	org_onboarding_status: { loading: false, loaded: false, data: "", err: "" },
	department_spend_data: { loading: false, loaded: false, data: {}, err: "" },
	category_spend_data: { loading: false, loaded: false, data: {}, err: "" },
};

export function overviewReducer(state = initialState, action) {
	switch (action.type) {
		case overviewConstants.TOP_ROW_REQUESTED:
			return {
				...state,
				toprow: {
					loading: true,
					loaded: false,
					count: 0,
					data: [],
				},
			};
		case overviewConstants.TOP_ROW_FETCHED:
			return {
				...state,
				toprow: {
					loading: false,
					loaded: true,
					data: action.payload.data,
					count: action.payload.count,
					err: action.payload.err,
				},
			};
		case overviewConstants.MINIGRAPHS_REQUESTED:
			return {
				...state,
				minigraphs: {
					loading: true,
					loaded: false,
					count: 0,
					data: [],
				},
			};
		case overviewConstants.MINIGRAPHS_FETCHED:
			return {
				...state,
				minigraphs: {
					loading: false,
					loaded: true,
					data: action.payload.data,
					count: action.payload.count,
					err: action.payload.err,
				},
			};
		case overviewConstants.BUDGET_REQUESTED:
			return {
				...state,
				budget: {
					loading: true,
					loaded: false,
					count: 0,
					data: [],
				},
			};
		case overviewConstants.BUDGET_FETCHED:
			return {
				...state,
				budget: {
					loading: false,
					loaded: true,
					data: action.payload.data,
					count: action.payload.count,
					err: action.payload.err,
				},
			};
		case overviewConstants.APPLICATIONS_REQUESTED:
			return {
				...state,
				applicationsov: {
					loading: true,
					loaded: false,
					count: 0,
					data: [],
				},
			};
		case overviewConstants.APPLICATIONS_FETCHED:
			return {
				...state,
				applicationsov: {
					loading: false,
					loaded: true,
					data: action.payload.data,
					count: action.payload.count,
					err: action.payload.err,
				},
			};
		case overviewConstants.SPENDTREND_REQUESTED:
			return {
				...state,
				spendtrendov: {
					loading: true,
					loaded: false,
					count: 0,
					data: [],
				},
			};
		case overviewConstants.SPENDTREND_FETCHED:
			return {
				...state,
				spendtrendov: {
					loading: false,
					loaded: true,
					data: action.payload.data,
					count: action.payload.count,
					err: action.payload.err,
				},
			};
		case overviewConstants.ORG_ONBOARDING_STATUS_REQUESTED:
			return {
				...state,
				org_onboarding_status: {
					loading: true,
					loaded: false,
					data: "",
				},
			};
		case overviewConstants.ORG_ONBOARDING_STATUS_FETCHED:
			return {
				...state,
				org_onboarding_status: {
					loading: false,
					loaded: true,
					data: action.payload.data,
					err: action.payload.err,
				},
			};
		case overviewConstants.REMOVE_ORG_ONBOARDING_STATUS:
			return {
				...state,
				org_onboarding_status: {
					data: [],
					err: "",
				},
			};
		case overviewConstants.DEPARTMENT_SPEND_DATA_REQUESTED:
			return {
				...state,
				department_spend_data: {
					loading: true,
					loaded: false,
					data: {},
				},
			};
		case overviewConstants.DEPARTMENT_SPEND_DATA_FETCHED:
			return {
				...state,
				department_spend_data: {
					loading: false,
					loaded: true,
					data: action.payload.data,
					err: action.payload.err,
				},
			};
		case overviewConstants.REMOVE_DEPARTMENT_SPEND_DATA:
			return {
				...state,
				department_spend_data: {
					data: {},
					err: "",
				},
			};
		case overviewConstants.CATEGORY_SPEND_DATA_REQUESTED:
			return {
				...state,
				category_spend_data: {
					loading: true,
					loaded: false,
					data: {},
				},
			};
		case overviewConstants.CATEGORY_SPEND_DATA_FETCHED:
			return {
				...state,
				category_spend_data: {
					loading: false,
					loaded: true,
					data: action.payload.data,
					err: action.payload.err,
				},
			};
		case overviewConstants.REMOVE_CATEGORY_SPEND_DATA:
			return {
				...state,
				category_spend_data: {
					data: {},
					err: "",
				},
			};
		default:
			return state;
	}
}
