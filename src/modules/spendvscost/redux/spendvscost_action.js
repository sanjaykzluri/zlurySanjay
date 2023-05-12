import { TriggerIssue } from "utils/sentry";
import {
	SpendVSCostGraphReduxConstants,
	SpendVSCostReduxConstants,
} from "../constants/SpendVSCostConstants";

export function checkAndFetchSpendCostTrend(trendAPI, type, id, outerId) {
	var keyTrend = type + "_" + id;
	if (outerId) {
		keyTrend = keyTrend + "_" + outerId;
	}
	return async function (dispatch, getState) {
		if (getState().spendvscost?.[keyTrend]?.loaded) {
			return;
		} else {
			dispatch(fetchSpendCostTrend(trendAPI, type, id, outerId));
		}
	};
}

export function fetchSpendCostTrend(trendAPI, type, id, outerId) {
	return async function (dispatch) {
		try {
			dispatch({
				type: SpendVSCostReduxConstants.SPEND_COST_TREND_REQUESTED,
				payload: { type, id, outerId },
			});
			const data = await trendAPI(id, outerId);
			dispatch({
				type: SpendVSCostReduxConstants.SPEND_COST_TREND_FETCHED,
				payload: { type, id, outerId, data },
			});
		} catch (err) {
			dispatch({
				type: SpendVSCostReduxConstants.SPEND_COST_TREND_FETCHED,
				payload: {
					err,
				},
			});
			TriggerIssue(`Error while fetching ${type} trend`, err);
		}
	};
}

export function checkAndFetchSpendCostTrendGraph(
	id,
	period,
	startMonth,
	startYear,
	endMonth,
	endYear,
	graphAPI
) {
	return async function (dispatch, getState) {
		var keyGraph =
			id +
			"_" +
			period +
			"_" +
			startMonth +
			"_" +
			startYear +
			"_" +
			endMonth +
			"_" +
			endYear;

		if (getState().spendvscostgraph?.[keyGraph]?.loaded) {
			return;
		} else {
			dispatch(
				fetchSpendCostTrendGraph(
					id,
					period,
					startMonth,
					startYear,
					endMonth,
					endYear,
					graphAPI
				)
			);
		}
	};
}

export function fetchSpendCostTrendGraph(
	id,
	period,
	startMonth,
	startYear,
	endMonth,
	endYear,
	graphAPI
) {
	return async function (dispatch) {
		try {
			dispatch({
				type: SpendVSCostGraphReduxConstants.SPEND_COST_GRAPH_TREND_REQUESTED,
				payload: {
					id,
					period,
					startMonth,
					startYear,
					endMonth,
					endYear,
				},
			});

			const data = await graphAPI(
				id,
				period,
				startMonth,
				startYear,
				endMonth,
				endYear
			);

			dispatch({
				type: SpendVSCostGraphReduxConstants.SPEND_COST_GRAPH_TREND_FETCHED,
				payload: {
					id,
					period,
					startMonth,
					startYear,
					endMonth,
					endYear,
					data: data?.spend_graphs_data,
				},
			});
		} catch (err) {
			dispatch({
				type: SpendVSCostGraphReduxConstants.SPEND_COST_GRAPH_TREND_FETCHED,
				payload: {
					id,
					period,
					startMonth,
					startYear,
					endMonth,
					endYear,
					err,
				},
			});
			TriggerIssue(`Error while fetching spend cost trend graph`, err);
		}
	};
}

export function clearSpendCostGraphData() {
	return async function (dispatch) {
		try {
			dispatch({
				type: SpendVSCostGraphReduxConstants.SPEND_COST_GRAPH_TREND_CLEAR_DATA,
			});
		} catch (err) {
			dispatch({
				type: SpendVSCostGraphReduxConstants.SPEND_COST_GRAPH_TREND_CLEAR_DATA,
				payload: {
					err,
				},
			});
			TriggerIssue(`Error while clearing spend vs cost graph data`, err);
		}
	};
}
