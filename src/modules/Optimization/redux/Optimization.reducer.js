import {
	optimizationDefaultFilter,
	optimizationReduxConstants,
} from "../constants/OptimizationConstants";
import {
	OptimizationSummary,
	OptimizationLicenseSummary,
} from "../models/OptimizationSummary.model";

const initialState = {
	license_user_properties: {
		loaded: false,
		loading: false,
	},
	selected_filter: optimizationDefaultFilter,
	generating_pdf: false,
	optimization_summary: {
		loaded: false,
		loading: true,
		selected_filter: optimizationDefaultFilter,
		active_license_row_apps: [],
		license_summary: {},
	},
};

export function OptimizationReducer(state = initialState, action) {
	switch (action.type) {
		case optimizationReduxConstants.LICENSE_USER_PROPERTIES_REQUESTED:
			var tempState = { ...state };
			tempState.license_user_properties = {
				loaded: false,
				loading: true,
			};
			return tempState;

		case optimizationReduxConstants.LICENSE_USER_PROPERTIES_FETCHED:
			var tempState = { ...state };
			tempState.license_user_properties = {
				loaded: true,
				loading: false,
				properties: action.payload.properties,
			};
			return tempState;

		case optimizationReduxConstants.SET_OPTIMIZATION_FILTER:
			var tempState = { ...state };
			tempState.selected_filter = action.payload.filter;
			return tempState;

		case optimizationReduxConstants.PDF_GENERATION_START:
			var tempState = { ...state };
			tempState.generating_pdf = true;
			return tempState;

		case optimizationReduxConstants.PDF_GENERATION_END:
			var tempState = { ...state };
			tempState.generating_pdf = false;
			return tempState;

		case optimizationReduxConstants.OPTIMIZATION_SUMMARY_REQUESTED:
			var tempState = { ...state };
			tempState.optimization_summary = {
				...tempState.optimization_summary,
				loaded: false,
				loading: true,
			};
			return tempState;

		case optimizationReduxConstants.OPTIMIZATION_SUMMARY_FETCHED:
			var tempState = { ...state };
			tempState.optimization_summary = {
				...tempState.optimization_summary,
				loaded: true,
				loading: false,
				summary: new OptimizationSummary(action.payload.summary),
				error: action.payload.error,
			};
			return tempState;

		case optimizationReduxConstants.SET_OPTIMIZATION_SUMMARY_FILTER:
			var tempState = { ...state };
			tempState.optimization_summary = {
				...tempState.optimization_summary,
				selected_filter: action.payload.filter,
			};
			return tempState;

		case optimizationReduxConstants.TOGGLE_LICENSE_ROW_DISPLAY:
			var tempState = { ...state };
			var activeLicenseRowApps = [
				...tempState.optimization_summary.active_license_row_apps,
			];
			var index = activeLicenseRowApps.findIndex(
				(id) => id === action.payload.app_id
			);
			if (index > -1) {
				activeLicenseRowApps.splice(index, 1);
			} else {
				activeLicenseRowApps.push(action.payload.app_id);
			}
			tempState.optimization_summary.active_license_row_apps =
				activeLicenseRowApps;

			return tempState;

		case optimizationReduxConstants.REQUEST_LICENSE_SUMMARY:
			var tempState = { ...state };
			tempState.optimization_summary.license_summary = {
				...tempState.optimization_summary.license_summary,
				[action.payload.app_id]: {
					loaded: false,
					loading: true,
				},
			};
			return tempState;

		case optimizationReduxConstants.FETCH_LICENSE_SUMMARY:
			var tempState = { ...state };
			tempState.optimization_summary.license_summary = {
				...tempState.optimization_summary.license_summary,
				[action.payload.app_id]: {
					loaded: true,
					loading: false,
					error: action.payload.error,
					license_summary: new OptimizationLicenseSummary(
						action.payload.license_summary
					),
				},
			};
			return tempState;

		default:
			return state;
	}
}
