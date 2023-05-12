import { getAppUserPropertiesList } from "services/api/applications";
import {
	getOptimizationSummary,
	getOptimizationSummaryLicenseBreakdown,
} from "services/api/optimization";
import { TriggerIssue } from "utils/sentry";
import { optimizationReduxConstants } from "../constants/OptimizationConstants";

export function checkAndFetchLicenseUserProperties() {
	return async function (dispatch, getState) {
		if (getState().optimization?.license_user_properties?.loaded) {
			return;
		} else {
			dispatch(fetchLicenseUsersProperties());
		}
	};
}

export function fetchLicenseUsersProperties() {
	return async function (dispatch) {
		try {
			dispatch({
				type: optimizationReduxConstants.LICENSE_USER_PROPERTIES_REQUESTED,
			});
			const response = await getAppUserPropertiesList();
			dispatch({
				type: optimizationReduxConstants.LICENSE_USER_PROPERTIES_FETCHED,
				payload: {
					properties: response?.data?.properties || [],
				},
			});
		} catch (err) {
			dispatch({
				type: optimizationReduxConstants.LICENSE_USER_PROPERTIES_FETCHED,
				payload: {
					error: err,
					properties: [],
				},
			});
			TriggerIssue(
				`Error while fetching license users (app-users) property file`,
				err
			);
		}
	};
}

export function setOptimizationFilter(filter) {
	return function (dispatch) {
		try {
			dispatch({
				type: optimizationReduxConstants.SET_OPTIMIZATION_FILTER,
				payload: {
					filter,
				},
			});
		} catch (err) {
			TriggerIssue(`Error while setting optimization filter`, err);
		}
	};
}

export function startPdfGeneration() {
	return function (dispatch) {
		try {
			dispatch({ type: optimizationReduxConstants.PDF_GENERATION_START });
		} catch (err) {
			TriggerIssue(
				`Error while starting optimization pdf generation`,
				err
			);
		}
	};
}

export function endPdfGeneration() {
	return function (dispatch) {
		try {
			dispatch({ type: optimizationReduxConstants.PDF_GENERATION_END });
		} catch (err) {
			TriggerIssue(`Error while ending optimization pdf generation`, err);
		}
	};
}

export function checkAndFetchOptimizationSummary() {
	return async function (dispatch, getState) {
		if (getState().optimization?.optimization_summary?.loaded) {
			return;
		} else {
			dispatch(fetchOptimizationSummary());
		}
	};
}

export function fetchOptimizationSummary() {
	return async function (dispatch) {
		try {
			dispatch({
				type: optimizationReduxConstants.OPTIMIZATION_SUMMARY_REQUESTED,
			});
			const response = await getOptimizationSummary();
			dispatch({
				type: optimizationReduxConstants.OPTIMIZATION_SUMMARY_FETCHED,
				payload: {
					summary: response || {},
				},
			});
		} catch (error) {
			dispatch({
				type: optimizationReduxConstants.OPTIMIZATION_SUMMARY_FETCHED,
				payload: {
					error: error,
					summary: {},
				},
			});
			TriggerIssue(`Error while fetching optimization summary`, error);
		}
	};
}

export function setOptimizationSummaryFilter(filter) {
	return function (dispatch) {
		try {
			dispatch({
				type: optimizationReduxConstants.SET_OPTIMIZATION_SUMMARY_FILTER,
				payload: {
					filter,
				},
			});
		} catch (err) {
			TriggerIssue(
				`Error while setting optimization summary filter`,
				err
			);
		}
	};
}

export function toggleLicenseRowDisplay(app_id) {
	return function (dispatch) {
		try {
			dispatch({
				type: optimizationReduxConstants.TOGGLE_LICENSE_ROW_DISPLAY,
				payload: { app_id },
			});
		} catch (err) {
			TriggerIssue(`Error while toggling license row display`, err);
		}
	};
}

export function checkAndFetchOptimizationSummaryLicenseBreakdown(app_id) {
	return async function (dispatch, getState) {
		if (
			getState().optimization?.optimization_summary?.license_summary?.[
				app_id
			]?.loaded
		) {
			return;
		} else {
			dispatch(fetchOptimizationSummaryLicenseBreakdown(app_id));
		}
	};
}

export function fetchOptimizationSummaryLicenseBreakdown(app_id) {
	return async function (dispatch) {
		try {
			dispatch({
				type: optimizationReduxConstants.REQUEST_LICENSE_SUMMARY,
				payload: { app_id },
			});
			const response = await getOptimizationSummaryLicenseBreakdown(
				app_id
			);
			dispatch({
				type: optimizationReduxConstants.FETCH_LICENSE_SUMMARY,
				payload: { app_id, license_summary: response || {} },
			});
		} catch (error) {
			console.log(error);
			dispatch({
				type: optimizationReduxConstants.FETCH_LICENSE_SUMMARY,
				payload: { app_id, error: error, license_summary: {} },
			});
			TriggerIssue(
				`Error while fetching optimization summary license breakdown for app_id ${app_id}`,
				error
			);
		}
	};
}
