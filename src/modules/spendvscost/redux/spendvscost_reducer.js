import { spendCostTrendType } from "../components/SpendCostTrend";
import {
	SpendVSCostGraphKeyObjectsByPeriod,
	SpendVSCostGraphReduxConstants,
	SpendVSCostReduxConstants,
} from "../constants/SpendVSCostConstants";

const initialStateSpendCostTrend = {};

export function SpendVSCostReducer(state = initialStateSpendCostTrend, action) {
	switch (action.type) {
		case SpendVSCostGraphReduxConstants.SPEND_COST_TREND_REQUESTED:
			var keyTrend = action.payload.type + "_" + action.payload.id;
			if (action.payload.outerId) {
				keyTrend = keyTrend + "_" + action.payload.outerId;
			}
			var tempState = { ...state, [keyTrend]: {} };
			tempState[keyTrend] = { loaded: false, loading: true };
			return tempState;

		case SpendVSCostReduxConstants.SPEND_COST_TREND_FETCHED:
			var keyTrend = action.payload.type + "_" + action.payload.id;
			if (action.payload.outerId) {
				keyTrend = keyTrend + "_" + action.payload.outerId;
			}
			var tempState = { ...state, [keyTrend]: {} };
			var graphData, average;
			if (action.payload.type === spendCostTrendType.SPEND) {
				graphData = action.payload.data?.monthly_spend_data;
				average = action.payload.data?.average_monthly_spend;
			} else {
				graphData = action.payload.data?.monthly_cost_data;
				average = action.payload.data?.average_monthly_cost;
			}

			tempState[keyTrend].graphData = graphData;
			tempState[keyTrend].average = average;
			tempState[keyTrend].loaded = true;
			tempState[keyTrend].loading = false;

			return tempState;

		default:
			return state;
	}
}

const initialStateSpendCostgraph = {};

export function SpendVSCostGraphReducer(
	state = initialStateSpendCostgraph,
	action
) {
	switch (action.type) {
		case SpendVSCostGraphReduxConstants.SPEND_COST_GRAPH_TREND_REQUESTED:
			var keyGraph =
				action.payload.id +
				"_" +
				action.payload.period +
				"_" +
				action.payload.startMonth +
				"_" +
				action.payload.startYear +
				"_" +
				action.payload.endMonth +
				"_" +
				action.payload.endYear;

			var tempState = { ...state, [keyGraph]: {} };
			tempState[keyGraph].loading = true;

			tempState[keyGraph].loaded = false;

			return tempState;

		case SpendVSCostGraphReduxConstants.SPEND_COST_GRAPH_TREND_FETCHED:
			var keyGraph =
				action.payload.id +
				"_" +
				action.payload.period +
				"_" +
				action.payload.startMonth +
				"_" +
				action.payload.startYear +
				"_" +
				action.payload.endMonth +
				"_" +
				action.payload.endYear;

			var tempState = { ...state, [keyGraph]: {} };

			var data = action.payload.data;
			tempState[keyGraph].data = data;
			tempState[keyGraph].loading = false;
			tempState[keyGraph].loaded = true;
			tempState[keyGraph].spendKey =
				SpendVSCostGraphKeyObjectsByPeriod[action.payload.period].spend;
			tempState[keyGraph].costKey =
				SpendVSCostGraphKeyObjectsByPeriod[action.payload.period].cost;
			tempState[keyGraph].savingsKey =
				SpendVSCostGraphKeyObjectsByPeriod[
					action.payload.period
				].savings;

			return tempState;

		case SpendVSCostGraphReduxConstants.SPEND_COST_GRAPH_TREND_CLEAR_DATA:
			return {};

		default:
			return state;
	}
}
