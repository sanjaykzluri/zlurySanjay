export const GraphPeriods = {
	MONTH: {
		key: "M",
		value: "month",
	},
	YEAR: {
		key: "Y",
		value: "year",
	},
};

export const SpendVSCostReduxConstants = {
	SPEND_COST_TREND_REQUESTED: "SPEND_COST_TREND_REQUESTED",
	SPEND_COST_TREND_FETCHED: "SPEND_COST_TREND_FETCHED",
};

export const SpendVSCostGraphReduxConstants = {
	SPEND_COST_GRAPH_TREND_REQUESTED: "SPEND_COST_GRAPH_TREND_REQUESTED",
	SPEND_COST_GRAPH_TREND_FETCHED: "SPEND_COST_GRAPH_TREND_FETCHED",
	SPEND_COST_GRAPH_TREND_CLEAR_DATA: "SPEND_COST_GRAPH_TREND_CLEAR_DATA",
};

export const SpendVSCostGraphKeyObjectsByPeriod = {
	month: {
		spend: "actual_spend_per_month",
		cost: "estimate_cost_per_month",
		savings: "potentail_savings_per_month",
	},
	year: {
		spend: "actual_spend_per_year",
		cost: "estimate_cost_per_year",
		savings: "potential_savings_per_year",
	},
};
