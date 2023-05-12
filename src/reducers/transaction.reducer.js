import { transactionConstants } from "../constants";

const initialState = {
	recognisedTransactions: {
		count: 0,
		rows: 20,
		loading: false,
		data: [],
		err: null,
	},
	unrecognisedTransactions: { count: 0, rows: 20, loading: false, data: [] },
	archivedTransactions: { count: 0, rows: 20, loading: false, data: [] },
	paymentMethods: { count: 0, loading: false, loaded: false, data: [] },
	uploads: { count: 0, rows: 20, loading: false, data: [] },
	uploadsrecognized: { count: 0, rows: 20, loading: false, data: [] },
	uploadsunrecognized: { count: 0, rows: 20, loading: false, data: [] },
	uploadsarchived: { count: 0, rows: 20, loading: false, data: [] },
};

export function transactionReducer(state = initialState, action) {
	switch (action.type) {
		case transactionConstants.RECOGNISED_TRANSACTIONS_REQUESTED:
			var newRecognisedState = { ...state };
			newRecognisedState.recognisedTransactions = {
				...state.recognisedTransactions,
				loading: true,
				loaded: false,
				count: state?.recognisedTransactions.count,
				data: state?.recognisedTransactions.data,
				rows: state?.recognisedTransactions.rows,
			};
			return newRecognisedState;
		case transactionConstants.RECOGNISED_TRANSACTIONS_FETCHED:
			var newRecognisedState = { ...state };
			var page =
				"page_" +
				action.payload?.page_no?.toString() +
				"_" +
				action.payload?.rows?.toString();
			var newData = {
				...state.recognisedTransactions.data,
				[page]: action.payload.data,
			};
			newRecognisedState.recognisedTransactions = {
				...state.recognisedTransactions,
				loading: action.payload.loading || false,
				loaded: true,
				data: newData,
				count: action.payload.count,
				err: action.payload.err,
				rows: action.payload.rows,
			};
			return newRecognisedState;
		case transactionConstants.DELETE_RECOGNISED_TRANSACTIONS_CACHE:
			var newState = { ...state };
			newState.recognisedTransactions.data[action.payload.page] = [];
			return newState;
		case transactionConstants.DELETE_ALL_RECOGNISED_TRANSACTIONS_CACHE:
			var newState = { ...state };
			newState.recognisedTransactions.data = [];
			return newState;
		case transactionConstants.SEARCH_RECOGNISED_TRANSACTIONS_REQUESTED:
			var newRecognisedSearchState = { ...state };
			newRecognisedSearchState.recognisedTransactions.searchData = {
				loading: true,
				loaded: false,
				data: [],
				count: 0,
			};
			return newRecognisedSearchState;
		case transactionConstants.SEARCH_RECOGNISED_TRANSACTIONS_FETCHED:
			var newRecognisedSearchState = { ...state };
			newRecognisedSearchState.recognisedTransactions.searchData = {
				loading: false,
				loaded: true,
				data: action.payload.data,
				count: action.payload.count,
			};
			return newRecognisedSearchState;
		case transactionConstants.UNRECOGNISED_TRANSACTIONS_REQUESTED:
			var newUnRecognisedState = { ...state };
			newUnRecognisedState.unrecognisedTransactions = {
				...state.unrecognisedTransactions,
				loading: true,
				loaded: false,
				count: state?.unrecognisedTransactions.count,
				data: state?.unrecognisedTransactions.data,
				rows: state?.unrecognisedTransactions.rows,
			};
			return newUnRecognisedState;
		case transactionConstants.UNRECOGNISED_TRANSACTIONS_FETCHED:
			var newUnRecognisedState = { ...state };
			var page =
				"page_" +
				action.payload?.page_no?.toString() +
				"_" +
				action.payload?.rows?.toString();
			var newData = {
				...state.unrecognisedTransactions.data,
				[page]: action.payload.data,
			};
			newUnRecognisedState.unrecognisedTransactions = {
				...state.unrecognisedTransactions,
				loading: action.payload.loading || false,
				loaded: true,
				data: newData,
				count: action.payload.count,
				err: action.payload.err,
				rows: action.payload.rows,
			};
			return newUnRecognisedState;
		case transactionConstants.DELETE_UNRECOGNISED_TRANSACTIONS_CACHE:
			var newState = { ...state };
			newState.unrecognisedTransactions.data[action.payload.page] = [];
			return newState;
		case transactionConstants.DELETE_ALL_UNRECOGNISED_TRANSACTIONS_CACHE:
			var newState = { ...state };
			newState.unrecognisedTransactions.data = [];
			return newState;
		case transactionConstants.SEARCH_UNRECOGNISED_TRANSACTIONS_REQUESTED:
			var newUnrecognisedSearchState = { ...state };
			newUnrecognisedSearchState.unrecognisedTransactions.searchData = {
				loading: true,
				loaded: false,
				data: [],
				count: 0,
			};
			return newUnrecognisedSearchState;
		case transactionConstants.SEARCH_UNRECOGNISED_TRANSACTIONS_FETCHED:
			var newUnrecognisedSearchState = { ...state };
			newUnrecognisedSearchState.unrecognisedTransactions.searchData = {
				loading: false,
				loaded: true,
				data: action.payload.data,
				count: action.payload.count,
			};
			return newUnrecognisedSearchState;
		case transactionConstants.ARCHIVED_REQUESTED:
			var newArchivedTransactions = { ...state };
			newArchivedTransactions.archivedTransactions = {
				...state.archivedTransactions,
				loading: true,
				loaded: false,
				count: state?.archivedTransactions.count,
				data: state?.archivedTransactions.data,
				rows: state?.archivedTransactions.rows,
			};
			return newArchivedTransactions;
		case transactionConstants.ARCHIVED_FETCHED:
			var newArchivedTransactions = { ...state };
			var page =
				"page_" +
				action.payload?.page_no?.toString() +
				"_" +
				action.payload?.rows?.toString();
			var newData = {
				...state.archivedTransactions.data,
				[page]: action.payload.data,
			};
			newArchivedTransactions.archivedTransactions = {
				...state.archivedTransactions,
				loading: action.payload.loading || false,
				loaded: true,
				data: newData,
				count: action.payload.count,
				err: action.payload.err,
				rows: action.payload.rows,
			};
			return newArchivedTransactions;
		case transactionConstants.DELETE_ARCHIVED_CACHE:
			var newState = { ...state };
			newState.archivedTransactions.data[action.payload.page] = [];
			return newState;
		case transactionConstants.DELETE_ALL_ARCHIVED_TRANSACTIONS_CACHE:
			var newState = { ...state };
			newState.archivedTransactions.data = [];
			return newState;
		case transactionConstants.SEARCH_ARCHIVED_TRANSACTIONS_REQUESTED:
			var newArchivedSearchState = { ...state };
			newArchivedSearchState.archivedTransactions.searchData = {
				loading: true,
				loaded: false,
				data: [],
				count: 0,
			};
			return newArchivedSearchState;
		case transactionConstants.SEARCH_ARCHIVED_TRANSACTIONS_FETCHED:
			var newArchivedSearchState = { ...state };
			newArchivedSearchState.archivedTransactions.searchData = {
				loading: false,
				loaded: true,
				data: action.payload.data,
				count: action.payload.count,
			};
			return newArchivedSearchState;

		case transactionConstants.PAYMENT_METHODS_REQUESTED:
			return {
				...state,
				paymentMethods: {
					loading: true,
					count: state.archivedTransactions.count,
					data: [],
				},
			};
		case transactionConstants.PAYMENT_METHODS_FETCHED:
			return {
				...state,
				paymentMethods: {
					loading: false,
					data: action.payload.data,
					count: action.payload.count,
					err: action.payload.err,
					loaded: true,
				},
			};
		case transactionConstants.UPLOADS_REQUESTED:
			var newUploads = { ...state };
			newUploads.uploads = {
				loading: true,
				loaded: false,
				count: state?.uploads.count,
				data: state?.uploads.data,
				rows: state?.uploads.rows,
			};
			return newUploads;
		case transactionConstants.UPLOADS_FETCHED:
			var newUploads = { ...state };
			var page =
				"page_" +
				(action.payload?.page_no || 0)?.toString() +
				"_" +
				(action.payload?.rows || 20)?.toString();
			var newData = {
				...state.uploads.data,
				[page]: action.payload.data,
			};
			newUploads.uploads = {
				loading: action.payload.loading || false,
				loaded: true,
				data: newData,
				count: action.payload.count,
				err: action.payload.err,
				rows: action.payload.rows,
			};
			return newUploads;
		case transactionConstants.DELETE_UPLOADS_CACHE:
			var newState = { ...state };
			delete newState.uploads.data[action.payload.page];
			return newState;

		case transactionConstants.SEARCH_UPLOADS:
			var newUploadsSearchState = { ...state };
			newUploadsSearchState.uploads.searchData = {
				loading: false,
				loaded: true,
				data: action.payload.data,
				count: action.payload.count,
			};
			return newUploadsSearchState;

		case transactionConstants.UPLOADS_RECOG_REQUESTED:
			var newUploadsRecognized = { ...state };
			newUploadsRecognized.uploadsrecognized[action.payload.id] = {
				...newUploadsRecognized.uploadsrecognized[action.payload.id],
				loading: true,
				loaded: false,
				count: state?.uploadsrecognized.count,
			};
			return newUploadsRecognized;
		case transactionConstants.UPLOADS_RECOG_FETCHED:
			var newUploadsRecognized = { ...state };
			var page =
				"page_" +
				action.payload?.page_no?.toString() +
				"_" +
				action.payload?.rows?.toString();
			var newData = {
				...newUploadsRecognized.uploadsrecognized[action.payload.id]
					?.data,
				[page]: action.payload.data,
			};
			newUploadsRecognized.uploadsrecognized[action.payload.id] = {
				loading: false,
				loaded: true,
				data: newData,
				count: action.payload.count,
				err: action.payload.err,
				rows: action.payload.rows,
			};
			return newUploadsRecognized;
		case transactionConstants.SEARCH_UPLOADS_UNRECOG_REQUESTED:
			var newSearchUploadsUnRecognized = { ...state };
			newSearchUploadsUnRecognized.uploadsunrecognized.searchData = {
				loading: true,
				loaded: false,
				data: [],
				count: 0,
			};
			return newSearchUploadsUnRecognized;
		case transactionConstants.SEARCH_UPLOADS_UNRECOG_FETCHED:
			var newSearchUploadsUnRecognized = { ...state };
			newSearchUploadsUnRecognized.uploadsunrecognized.searchData = {
				loading: false,
				loaded: true,
				data: action.payload.data,
				count: action.payload.count,
			};
			return newSearchUploadsUnRecognized;
		case transactionConstants.SEARCH_UPLOADS_RECOG_REQUESTED:
			var newSearchUploadsRecognized = { ...state };
			newSearchUploadsRecognized.uploadsrecognized.searchData = {
				loading: true,
				loaded: false,
				data: [],
				count: 0,
			};
			return newSearchUploadsRecognized;
		case transactionConstants.SEARCH_UPLOADS_RECOG_FETCHED:
			var newSearchUploadsRecognized = { ...state };
			newSearchUploadsRecognized.uploadsrecognized.searchData = {
				loading: false,
				loaded: true,
				data: action.payload.data,
				count: action.payload.count,
			};
			return newSearchUploadsRecognized;
		case transactionConstants.SEARCH_UPLOADS_ARCH_REQUESTED:
			var newSearchUploadsArchived = { ...state };
			newSearchUploadsArchived.uploadsarchived.searchData = {
				loading: true,
				loaded: false,
				data: [],
				count: 0,
			};
			return newSearchUploadsArchived;
		case transactionConstants.SEARCH_UPLOADS_ARCH_FETCHED:
			var newSearchUploadsArchived = { ...state };
			newSearchUploadsArchived.uploadsarchived.searchData = {
				loading: false,
				loaded: true,
				data: action.payload.data,
				count: action.payload.count,
			};
			return newSearchUploadsArchived;
		case transactionConstants.DELETE_UPLOADS_RECOG_CACHE:
			var newState = { ...state };
			delete newState.uploadsrecognized[action.payload.id].data[
				action.payload.page
			];
			return newState;
		case transactionConstants.DELETE_ALL_UPLOADS_RECOG_CACHE:
			var newState = { ...state };
			if (newState.uploadsrecognized[action.payload.id]) {
				newState.uploadsrecognized[action.payload.id].data = [];
			}
			return newState;
		case transactionConstants.UPLOADS_UNRECOG_REQUESTED:
			var newUploadsUnrecognized = { ...state };
			newUploadsUnrecognized.uploadsunrecognized[action.payload.id] = {
				...newUploadsUnrecognized.uploadsunrecognized[
					action.payload.id
				],
				loading: true,
				loaded: false,
				count: state?.uploadsunrecognized.count,
			};
			return newUploadsUnrecognized;
		case transactionConstants.UPLOADS_UNRECOG_FETCHED:
			var newUploadsUnrecognized = { ...state };
			var page =
				"page_" +
				action.payload?.page_no?.toString() +
				"_" +
				action.payload?.rows?.toString();
			var newData = {
				...state.uploadsunrecognized[action.payload.id]?.data,
				[page]: action.payload.data,
			};
			newUploadsUnrecognized.uploadsunrecognized[action.payload.id] = {
				loading: false,
				loaded: true,
				data: newData,
				count: action.payload.count,
				err: action.payload.err,
				rows: action.payload.rows,
			};
			return newUploadsUnrecognized;
		case transactionConstants.DELETE_UPLOADS_UNRECOG_CACHE:
			var newState = { ...state };
			delete newState.uploadsunrecognized[action.payload.id].data[
				action.payload.page
			];
			return newState;
		case transactionConstants.DELETE_ALL_UPLOADS_UNRECOG_CACHE:
			var newState = { ...state };
			if (newState.uploadsunrecognized[action.payload.id]) {
				newState.uploadsunrecognized[action.payload.id].data = [];
			}
			return newState;
		case transactionConstants.UPLOADS_ARC_REQUESTED:
			var newUploadsArchivedState = { ...state };
			newUploadsArchivedState.uploadsarchived[action.payload.id] = {
				...newUploadsArchivedState.uploadsarchived[action.payload.id],
				loading: true,
				loaded: false,
				count: state?.uploadsarchived.count,
			};
			return newUploadsArchivedState;
		case transactionConstants.UPLOADS_ARC_FETCHED:
			var newUploadsArchivedState = { ...state };
			var page =
				"page_" +
				action.payload?.page_no?.toString() +
				"_" +
				action.payload?.rows?.toString();
			var newData = {
				...state.uploadsarchived[action.payload.id]?.data,
				[page]: action.payload.data,
			};
			newUploadsArchivedState.uploadsarchived[action.payload.id] = {
				loading: false,
				loaded: true,
				data: newData,
				count: action.payload.count,
				err: action.payload.err,
				rows: action.payload.rows,
			};
			return newUploadsArchivedState;
		case transactionConstants.DELETE_UPLOADS_ARC_CACHE:
			var newState = { ...state };
			delete newState.uploadsarchived[action.payload.id]?.data[
				action.payload.page
			];
			return newState;
		case transactionConstants.DELETE_ALL_UPLOADS_ARCHIVED_CACHE:
			var newState = { ...state };
			if (newState.uploadsarchived[action.payload.id]) {
				newState.uploadsarchived[action.payload.id].data = [];
			}
			return newState;
		case transactionConstants.RESET_TRANSACTIONS:
			var newState = initialState;
			newState.paymentMethods = state.paymentMethods;
			return newState;
		default:
			return state;
	}
}
