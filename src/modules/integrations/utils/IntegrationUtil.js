export function selectFirstNElement(bigList, maxItem) {
	if (!Array.isArray(bigList)) throw Error("Expected type of an array");
	const size = bigList.length;
	const response = { remain: 0, shortenedList: bigList };
	if (size > maxItem) {
		response.remain = size - maxItem;
		response.shortenedList = bigList.slice(0, maxItem);
	}
	return response;
}

export const filterOptions = [
	{
		label: "Show All",
		value: "all",
	},
	{
		label: "Disconnected",
		value: "disconnected",
	},
	{
		label: "Connected",
		value: "connected",
	},
	{
		label: "Error",
		value: "error",
	},
];
export const statusMap = {
	disconnected: "disconnected_accounts",
	error: "error_accounts",
	connected: "connected_accounts",
};
export const filterMap = {
	disconnected: filterOptions[1],
	error: filterOptions[3],
	connected: filterOptions[2],
	all: filterOptions[0],
};

export const integrationStatusMap = {
	disconnected: "not-connected",
	error: "error",
	connected: "connected",
	all: "connected,not-connected,error",
};

export const isBetaFeatureScope = (beta_features_scopes, integration_id) => {
	const betaFeatureScope = beta_features_scopes?.[integration_id];
	return betaFeatureScope;
};

export const enabledBetaFeature = (beta_features_scopes, integration_id) => {
	const betaFeatureScope = isBetaFeatureScope(
		beta_features_scopes,
		integration_id
	);
	return betaFeatureScope?.flatMap((item) =>
		Object.keys(item).filter((key) => item[key])
	);
};

export const disabledBetaFeature = (beta_features_scopes, integration_id) => {
	const betaFeatureScope = isBetaFeatureScope(
		beta_features_scopes,
		integration_id
	);
	return betaFeatureScope?.flatMap((item) =>
		Object.keys(item).filter((key) => !item[key])
	);
};
