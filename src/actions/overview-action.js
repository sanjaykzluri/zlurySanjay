import { overviewConstants } from "../constants";
import { getOrgOnboardingStatus } from "../services/api/onboarding";
import {
	getTopRow,
	getMiniCharts,
	getBudget,
	getApplications,
	getSpendTrendOverview,
	getCategoryWiseTrendOverview,
} from "../services/api/overview";

export function fetchTopRow(key) {
	return async function (dispatch) {
		dispatch({
			type: overviewConstants.TOP_ROW_REQUESTED,
		});
		try {
			const response = await getTopRow(key);

			dispatch({
				type: overviewConstants.TOP_ROW_FETCHED,
				payload: {
					data: response,
				},
			});
		} catch (err) {
			dispatch({
				type: overviewConstants.TOP_ROW_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}
export function fetchMiniCharts(key) {
	return async function (dispatch) {
		dispatch({
			type: overviewConstants.MINIGRAPHS_REQUESTED,
		});
		try {
			const response = await getMiniCharts(key);

			dispatch({
				type: overviewConstants.MINIGRAPHS_FETCHED,
				payload: {
					data: response,
				},
			});
		} catch (err) {
			dispatch({
				type: overviewConstants.MINIGRAPHS_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}

export function fetchBudget(key) {
	return async function (dispatch) {
		dispatch({
			type: overviewConstants.BUDGET_REQUESTED,
		});
		try {
			const response = await getBudget(key);
			if (!response.error) {
				dispatch({
					type: overviewConstants.BUDGET_FETCHED,
					payload: {
						data: response,
					},
				});
			} else {
				throw new Error(response.error)
			}
		} catch (err) {
			dispatch({
				type: overviewConstants.BUDGET_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}

export function fetchApplications(key, sorted_via) {
	return async function (dispatch) {
		dispatch({
			type: overviewConstants.APPLICATIONS_REQUESTED,
		});
		try {
			const response = await getApplications(key, sorted_via);
			dispatch({
				type: overviewConstants.APPLICATIONS_FETCHED,
				payload: {
					data: response,
				},
			});
		} catch (err) {
			dispatch({
				type: overviewConstants.APPLICATIONS_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}

export function fetchOrgOnboardingStatus(orgId) {
	return async function (dispatch) {
		dispatch({
			type: overviewConstants.ORG_ONBOARDING_STATUS_REQUESTED,
		});
		try {
			const response = await getOrgOnboardingStatus(orgId);
			dispatch({
				type: overviewConstants.ORG_ONBOARDING_STATUS_FETCHED,
				payload: {
					data: response.org_status,
				},
			});
		} catch (error) {
			dispatch({
				type: overviewConstants.ORG_ONBOARDING_STATUS_FETCHED,
				payload: {
					err: error,
				},
			});
		}
	};
}

export function clearOrgOboardingStatus() {
	return async function (dispatch) {
		dispatch({
			type: overviewConstants.REMOVE_ORG_ONBOARDING_STATUS,
		});
	}
}

export function fetchDepartmentSpendData(orgId, start_month, end_month, start_year, end_year) {
	return async function (dispatch) {
		dispatch({
			type: overviewConstants.DEPARTMENT_SPEND_DATA_REQUESTED,
		});
		try {
			const response = await getSpendTrendOverview(orgId, start_month, end_month, start_year, end_year);
			dispatch({
				type: overviewConstants.DEPARTMENT_SPEND_DATA_FETCHED,
				payload: {
					data: {
						spend_trend: response?.spend_trend || [],
						spend_table_data: response?.spend_table_data || [],
					}
				}
			});
		} catch (error) {
			dispatch({
				type: overviewConstants.DEPARTMENT_SPEND_DATA_FETCHED,
				payload: {
					err: error,
				}
			});
		}
	}
}

export function clearDepartmentSpendData() {
	return async function (dispatch) {
		dispatch({
			type: overviewConstants.REMOVE_DEPARTMENT_SPEND_DATA,
		});
	}
}

export function fetchCategorySpendData(orgId, start_month, end_month, start_year, end_year) {
	return async function (dispatch) {
		dispatch({
			type: overviewConstants.CATEGORY_SPEND_DATA_REQUESTED,
		});
		try {
			const response = await getCategoryWiseTrendOverview(orgId, start_month, end_month, start_year, end_year);
			dispatch({
				type: overviewConstants.CATEGORY_SPEND_DATA_FETCHED,
				payload: {
					data: {
						category_spend_data: response?.category_spend_data || [],
						category_table_data: response?.category_table_data || [],
					}
				}
			});
		} catch (error) {
			dispatch({
				type: overviewConstants.CATEGORY_SPEND_DATA_FETCHED,
				payload: {
					err: error,
				}
			});
		}
	}
}

export function clearCategorySpendData() {
	return async function (dispatch) {
		dispatch({
			type: overviewConstants.REMOVE_CATEGORY_SPEND_DATA,
		});
	}
}