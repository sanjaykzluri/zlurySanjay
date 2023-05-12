import { applicationConstants, ENTITIES } from "../constants";
import { unpackSpendGraphData, unpackUsageGraphData } from "../components/Overview/util"

const initialState = {
	allApplications: { count: 0, loading: false, loaded: false, data: [] },
	allContracts: { count: 0, loading: false, loaded: false, data: [] },
	allVendors: { count: 0, loading: false, loaded: false, data: [] },
	singlevendorcontractinfo: {
		count: 0,
		loading: false,
		loaded: false,
		data: [],
	},
	renewals: { count: 0, loading: false, loaded: false, data: [] },
	upcomingrenewals: { count: 0, loading: false, loaded: false, data: [] },
	applicationinfo: { count: 0, loading: false, loaded: false, data: [] },
	applications: {
		allApplications: {
			loading: false,
			loaded: false,
			count: 0,
			data: []
		},
		spendgraph: {
			spend_table_data: [],
			spend_trend: [],
			computed_data: {
				spendLoading: true,
				spendDataKeys: [],
				spendTable: [],
				spendData: []
			}
		},
		usagegraph: {
			usage_table_data: [],
			usage_trend: [],
			usage_computed_data: {
				usageLoading: true,
				usageDataKeys: [],
				usageTable: [],
				usageData: []
			}
		},
		singleappcontractinfo: {
			count: 0,
			loading: false,
			loaded: false,
			data: [],
		},
	},
	contractinfo: { count: 0, loading: false, loaded: false, data: [] },
	singleappcontractinfo: {
		count: 0,
		loading: false,
		loaded: false,
		data: [],
	},
	singleappusersinfo: { count: 0, loading: false, loaded: false, data: [], complete: false },
	singleapptransinfo: { count: 0, rows: 20, loading: false, loaded: false, data: [] },
	singleappSecurityEvents: {},
	singleappSecurityCompliance: { loading: true},
	singleappSecurityDataShared: {},
	singleappSecurityProbes: {},
	showAddContract: false,
	showAddUser: false,
	showAddTransaction: false,
	spendgraph: {
		spend_table_data: [],
		spend_trend: [],
		computed_data: {
			spendLoading: true,
			spendDataKeys: [],
			spendTable: [],
			spendData: []
		}
	},
	usagegraph: {
		usage_table_data: [],
		usage_trend: [],
		usage_computed_data: {
			usageLoading: true,
			usageDataKeys: [],
			usageTable: [],
			usageData: []
		}
	},
	showAddContract: false,
	showAddUser: false,
	showAddTransaction: false
};

export function applicationReducer(state = initialState, action) {
	switch (action.type) {
		case applicationConstants.ALL_APPLICATIONS_REQUESTED:
			var newAllApplications = Object.assign({},
				state.allApplications,
				{
					loading: true,
					loaded: false,
					count: state.allApplications.data.length,
					data: state.allApplications.data
				});
			return {
				...state,
				allApplications: newAllApplications,
			};
		case applicationConstants.ALL_APPLICATIONS_FETCHED:
			//TODO: Why is this data going to the wrong node?!
			var latest_data_set = [];
			var isMoreDataAvailable = false;
			if (action.payload.data) {
				latest_data_set = state.allApplications.data.concat(action.payload.data);
				isMoreDataAvailable = !(action.payload.data.length < 10)
			} else {
				latest_data_set = state.allApplications.data;
				isMoreDataAvailable = false;
			}
			var newAllApplications = Object.assign({},
				state.allApplications,
				{
					loading: action.payload.loading || false,
					loaded: true,
					complete: true,
					data: latest_data_set,
					count: latest_data_set.length,
					err: action.payload.err,
					isMoreDataAvailable: isMoreDataAvailable,
					pageNo: action.payload.page,
				}
			);
			const latestState = {
				...state,
				allApplications: newAllApplications
			};
			return latestState;
		case applicationConstants.ALL_CONTRACTS_REQUESTED:
			var newAllContracts = Object.assign({},
				state.allContracts,
				{
					loading: true,
					loaded: false,
					count: state.allContracts.data.length,
					data: state.allContracts.data,
				});
			return {
				...state,
				allContracts: newAllContracts,
			};


		case applicationConstants.ALL_CONTRACTS_FETCHED:
			var latest_contracts_set = [];
			var isMoreDataAvailable = false;
			if (action.payload.data) {
				latest_contracts_set = state.allContracts.data.concat(action.payload.data);
				isMoreDataAvailable = !(action.payload.data.length < 30)
			} else {
				latest_contracts_set = state.allContracts.data;
				isMoreDataAvailable = false;
			}
			var newAllContracts = Object.assign({},
				state.allContracts,
				{
					loading: action.payload.loading || false,
					loaded: true,
					complete: true,
					count: latest_contracts_set.length,
					data: latest_contracts_set,
					err: action.payload.err,
					isMoreDataAvailable: isMoreDataAvailable,
					pageNo: action.payload.pageNo,
					isRestricted: action?.payload?.isRestricted,
					entity: ENTITIES.CONTRACTS
				}
			);
			const latestContractsState = {
				...state,
				allContracts: newAllContracts,
			}
			return latestContractsState;

		case applicationConstants.DELETE_ALL_CONTRACTS_CACHE:
			var newState = { ...state };
			newState.allContracts = {
				...newState.allContracts,
				data: [],
				loading: true,
				loaded: false,
			}
			return newState;

		case applicationConstants.ALL_VENDORS_FETCHED:
			var latest_vendors_set = [];
			var isMoreDataAvailable = false;
			if (action.payload.data) {
				latest_vendors_set = state.allVendors.data.concat(action.payload.data);
				isMoreDataAvailable = !(action.payload.data.length < 10)
			} else {
				latest_vendors_set = state.allVendors.data;
				isMoreDataAvailable = false;
			}
			var newAllVendors = Object.assign({},
				state.allVendors,
				{
					loading: action.payload.loading || false,
					loaded: true,
					complete: true,
					count: latest_vendors_set.length,
					data: latest_vendors_set,
					err: action.payload.err,
					isMoreDataAvailable: isMoreDataAvailable,
					pageNo: action.payload.pageNo,
					isRestricted: action?.payload?.isRestricted,
					// entity: ENTITIES
				}
			);
			const latestVendorsState = {
				...state,
				allVendors: newAllVendors,
			}
			return latestVendorsState;

		case applicationConstants.RENEWALS_REQUESTED:
			return {
				...state,
				renewals: {
					loading: true,
					loaded: false,
					count: 0,
					data: [],
				},
			};
		case applicationConstants.RENEWALS_FETCHED:
			return {
				...state,
				renewals: {
					loading: false,
					loaded: true,
					data: action.payload.data,
					count: action.payload.count,
					err: action.payload.err,
				},
			};
		case applicationConstants.UPCOMING_RENEWALS_REQUESTED:
			return {
				...state,
				upcomingrenewals: {
					loading: true,
					loaded: false,
					count: 0,
					data: [],
				},
			};
		case applicationConstants.UPCOMING_RENEWALS_FETCHED:
			return {
				...state,
				upcomingrenewals: {
					loading: false,
					loaded: true,
					data: action.payload.data,
					count: action.payload.count,
					err: action.payload.err,
				},
			};
		case applicationConstants.APPLICATION_INFO_REQUESTED:
			return {
				...state,
				applicationinfo: {
					loading: true,
					loaded: false,
					count: 0,
					data: [],
				},
			};
		case applicationConstants.APPLICATION_INFO_FETCHED:
			return {
				...state,
				applicationinfo: {
					loading: false,
					loaded: true,
					data: action.payload.data,
					count: action.payload.count,
					err: action.payload.err,
				},
			};
		case applicationConstants.CONTRACT_INFO_REQUESTED:
			return {
				...state,
				contractinfo: {
					loading: true,
					loaded: false,
					count: 0,
					data: [],
				},
			};
		case applicationConstants.CONTRACT_INFO_FETCHED:
			return {
				...state,
				contractinfo: {
					loading: false,
					loaded: true,
					data: action.payload.data,
					count: action.payload.count,
					err: action.payload.err,
				},
			};
		case applicationConstants.SINGLE_APPLICATION_CONTRACT_INFO_REQUESTED:
			var newState = { ...state };
			newState.singleappcontractinfo[action.payload.id] =
			{
				...newState.singleappcontractinfo[action.payload.id],
				loading: true,
				loaded: false,
			}
			return newState;

		case applicationConstants.SINGLE_APPLICATION_CONTRACT_INFO_FETCHED:
			var newSingleAppContractInfo = { ...state };
			var newSingleContractsData = newSingleAppContractInfo.singleappcontractinfo[action.payload.id]?.data ?
				[...newSingleAppContractInfo.singleappcontractinfo[action.payload.id]?.data, ...action.payload.data]
				: action.payload.data;
			if (action.payload.data) {
				isMoreDataAvailable = !(action.payload.data.length < 30)
			} else {
				isMoreDataAvailable = false;
			}
			newSingleAppContractInfo.singleappcontractinfo[action.payload.id] = {
				loading: false,
				loaded: true,
				data: newSingleContractsData,
				count: newSingleContractsData?.length,
				err: action.payload.err,
				isMoreDataAvailable: isMoreDataAvailable,
				pageNo: action.payload.pageNo,
			}
			return newSingleAppContractInfo;

		case applicationConstants.DELETE_SINGLE_APPLICATION_CONTRACT_CACHE:
			const applicationId = action?.payload?.appId ? action.payload.appId : window.location.pathname.split("/")[2];
			var newState = { ...state };
			newState.singleappcontractinfo[applicationId] = [];
			return newState;

		case applicationConstants.SINGLE_VENDOR_CONTRACTS_REQUESTED:
			var newState = { ...state };
			newState.singlevendorcontractinfo[action.payload.id] =
			{
				...newState.singlevendorcontractinfo[action.payload.id],
				loading: true,
				loaded: false,
			}
			return newState;

		case applicationConstants.SINGLE_VENDOR_CONTRACTS_FETCHED:
			var newSingleVendorContractInfo = { ...state };
			var newSingleVendorContractsData = newSingleVendorContractInfo.singlevendorcontractinfo[action.payload.id]?.data ?
				[...newSingleVendorContractInfo.singlevendorcontractinfo[action.payload.id]?.data, ...action.payload.data]
				: action.payload.data;
			if (action.payload.data) {
				isMoreDataAvailable = !(action.payload.data.length < 30)
			} else {
				isMoreDataAvailable = false;
			}
			newSingleVendorContractInfo.singlevendorcontractinfo[action.payload.id] = {
				loading: false,
				loaded: true,
				data: newSingleVendorContractsData,
				count: newSingleVendorContractsData?.length,
				err: action.payload.err,
				isMoreDataAvailable: isMoreDataAvailable,
				pageNo: action.payload.pageNo,
			}
			return newSingleVendorContractInfo;

		case applicationConstants.DELETE_SINGLE_VENDOR_CONTRACTS_CACHE:
			const vendorId = action?.payload?.vendorId ? action.payload.vendorId : window.location.pathname.split("/")[3];
			var newState = { ...state };
			newState.singlevendorcontractinfo[vendorId] = [];
			return newState;

		case applicationConstants.SINGLE_APPLICATION_USERS_INFO_REQUESTED:
			var new_singleappusersinfo = { ...state };
			new_singleappusersinfo.singleappusersinfo[action.payload.id] =
			{
				...new_singleappusersinfo.singleappusersinfo[action.payload.id],
				loading: true,
				loaded: false,
			}
			return new_singleappusersinfo;

		case applicationConstants.SINGLE_APPLICATION_USERS_INFO_FETCHED:
			var new_singleappusersinfo = { ...state };
			var newData = state.singleappusersinfo[action.payload.id]?.data ?
				[...state.singleappusersinfo[action.payload.id]?.data, ...action.payload.data]
				: action.payload.data;
			if (action.payload.data) {
				isMoreDataAvailable = !(action.payload.data.length < 10);
			} else {
				isMoreDataAvailable = false;
			}
			new_singleappusersinfo.singleappusersinfo[action.payload.id] = {
				loading: false,
				loaded: true,
				data: newData,
				count: newData?.length,
				err: action.payload.err,
				isMoreDataAvailable: isMoreDataAvailable,
				pageNo: action.payload.pageNo,
			}
			return new_singleappusersinfo;

		case applicationConstants.DELETE_SINGLE_APPLICATION_USERS_CACHE:
			const appId = window.location.pathname.split("/")[2];
			var newState = { ...state };
			newState.singleappusersinfo[appId] = {
				loading: true,
				loaded: false,
				data: [],
				count: 0
			};
			return newState;

		case applicationConstants.SINGLE_APPLICATION_TRANSACTION_INFO_REQUESTED:
			var newSingleAppTransInfo = { ...state };
			newSingleAppTransInfo.singleapptransinfo[action.payload?.id] = {
				...newSingleAppTransInfo.singleapptransinfo[action.payload?.id],
				loading: true,
				loaded: false,
			}
			return newSingleAppTransInfo;
		case applicationConstants.SINGLE_APPLICATION_TRANSACTION_INFO_FETCHED:
			var newSingleAppTransInfo = { ...state };
			var page = "page_" + action.payload?.page_no?.toString() + "_" + action.payload?.rows?.toString();
			var newData = {
				...newSingleAppTransInfo.singleapptransinfo[action.payload.id]?.data,
				[page]: action.payload.data
			};

			newSingleAppTransInfo.singleapptransinfo[action.payload.id] = {
				loading: false,
				loaded: true,
				data: newData,
				count: action.payload.count,
				err: action.payload.err,
				rows: action.payload.rows,
			}
			return newSingleAppTransInfo;
		case applicationConstants.SEARCH_SINGLE_APPLICATION_TRANSACTIONS_REQUESTED:
			var newSingleAppTransInfo = { ...state };
			newSingleAppTransInfo.singleapptransinfo[action.payload?.id].searchData = {
				data: [],
				loading: true,
				loaded: false,
			}
			return newSingleAppTransInfo;
		case applicationConstants.SEARCH_SINGLE_APPLICATION_TRANSACTIONS_FETCHED:
			var newSingleAppTransInfo = { ...state };
			newSingleAppTransInfo.singleapptransinfo[action.payload?.id].searchData = {
				data: action.payload.data,
				loading: false,
				loaded: true,
			}
			return newSingleAppTransInfo;

		case applicationConstants.TOGGLE_ADD_USER:
			return {
				...state,
				showAddUser: action.payload
			}
		case applicationConstants.TOGGLE_ADD_CONTRACT:
			return {
				...state,
				showAddContract: action.payload
			}
		case applicationConstants.TOGGLE_ADD_TRANSACTION:
			return {
				...state,
				showAddTransaction: action.payload
			}

		case applicationConstants.DELETE_SINGLE_APPLICATION_TRANSACTION_CACHE:
			var newState = { ...state };
			newState.singleapptransinfo[action.payload.id][action.payload.page] = [];
			return newState;
		case applicationConstants.DELETE_ALL_SINGLE_APPLICATION_TRANS_CACHE:
			var newState = { ...state };
			if (newState.singleapptransinfo[action.payload.id]) {
				newState.singleapptransinfo[action.payload.id].data = [];
			}
			return newState;
		case applicationConstants.SPENDGRAPH_REQUESTED:
			//TODO: Might be a good idea just to avoid this altogether
			// let new_computed_data = Object.assign({}, state.spendgraph.computed_data)
			var newState = { ...state };
			newState.allApplications[action.payload.id] = {}
			newState.allApplications[action.payload.id].spendgraph = {
				spend_table_data: [],
				spend_trend: [],
				computed_data: {
					spendLoading: true,
					spendDataKeys: [],
					spendTable: [],
					spendData: []
				}
			}
			return newState;
		case applicationConstants.SPENDGRAPH_FETCHED:
			var newState = { ...state };
			newState.allApplications[action.payload.id].spendgraph = {
				spend_table_data: action.payload?.response?.spend_table_data,
				spend_trend: action.payload?.response?.spend_trend,
				computed_data: unpackSpendGraphData(action.payload?.response)
			}
			return newState;
		case applicationConstants.USAGEGRAPH_REQUESTED:
			// let new_usage_computed_data = Object.assign({}, state.usagegraph.usage_computed_data)
			var newState = { ...state };
			// newState.allApplications[action.payload.id] = {}
			newState.allApplications[action.payload.id].usagegraph = {
				usage_table_data: [],
				usage_trend: [],
				usage_computed_data: {
					usageLoading: true,
					usageDataKeys: [],
					usageTable: [],
					usageData: []
				}
			}
			return newState;

		case applicationConstants.USAGEGRAPH_FETCHED:
			var newState = { ...state };
			newState.allApplications[action.payload?.id].usagegraph = {
				usage_table_data: action.payload?.response?.usage_table_data,
				usage_trend: action.payload?.response?.usage_trend,
				usage_computed_data: unpackUsageGraphData(action.payload?.response)
			}
			return newState;

		case applicationConstants.DELETE_APPLICATIONS_CACHE:
			var newState = { ...state };
			newState.allApplications.data = [];
			return newState;

		case applicationConstants.TOGGLE_ADD_USER:
			return {
				...state,
				showAddUser: action.payload
			}
		case applicationConstants.TOGGLE_ADD_CONTRACT:
			return {
				...state,
				showAddContract: action.payload
			}
		case applicationConstants.TOGGLE_ADD_TRANSACTION:
			return {
				...state,
				showAddTransaction: action.payload
			}
		case applicationConstants.FETCH_APPLICATION_EVENTS_REQUESTED:
			var newState = { ...state };
			newState.singleappSecurityEvents[action.payload?.id] = {
				loading: true,
				loaded: false,
				data: [],
			}
			return newState;
		case applicationConstants.FETCHED_APPLICATION_EVENTS:
			var newState = { ...state };
			newState.singleappSecurityEvents[action.payload?.id] = {
				loading: false,
				loaded: true,
				data: {
					recent: action.payload?.recentEvents || [],
					older: action.payload?.olderEvents || []
				},
				error: action.payload.error,
			}
			return newState;
        case applicationConstants.FETCH_APPLICATION_COMPLIANCE_REQUESTED:
			var newState = { ...state };
			newState.singleappSecurityCompliance[action.payload?.id] = {
				loading: true,
				loaded: false,
				data: [],
			}
			return newState;
		case applicationConstants.FETCHED_APPLICATION_COMPLIANCE:
			var newState = { ...state };
			newState.singleappSecurityCompliance[action.payload?.id] = {
				loading: false,
				loaded: true,
				data: action.payload?.data,
				error: action.payload.error,
			}
			return newState;
		case applicationConstants.FETCH_APPLICATION_DATASHARED_INFO_REQUESTED:
			var newState = { ...state };
			newState.singleappSecurityDataShared[action.payload?.id] = {
				loading: true,
				loaded: false,
				data: {},
			}
			return newState;
		case applicationConstants.FETCHED_APPLICATION_DATASHARED_INFO:
			var newState = { ...state };
			newState.singleappSecurityDataShared[action.payload?.id] = {
				loading: false,
				loaded: true,
				data: action.payload.data || {},
				error: action.payload.error,
			}
			return newState;
		case applicationConstants.FETCH_APPLICATION_SECURITY_PROBES_REQUESTED:
			var newState = { ...state };
			newState.singleappSecurityProbes[action.payload?.id] = {
				loading: true,
				loaded: false,
				data: {},
			}
			return newState;
		case applicationConstants.FETCHED_APPLICATION_SECURITY_PROBES:
			var newState = { ...state };
			newState.singleappSecurityProbes[action.payload?.id] = {
				loading: false,
				loaded: true,
				data: action.payload.data || {},
				error: action.payload.error,
			}
			return newState;
		default:
			return state;
	}
}


export function applicationActionHistoryReducer(state = null, action) {
	switch (action.type) {
		case applicationConstants.APP_ACTIONHISTORY_REQUESTED:
			return { loading: true };
		case applicationConstants.APP_ACTIONHISTORY_FETCHED:
			return { loading: false, ...action.payload }
		default: return state;
	}
}