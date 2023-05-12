export const getAppCountByAuthStatus = (authStatus, appTabCount) => {
	let count;
	if (authStatus === "managed") {
		count =
			appTabCount &&
			Array.isArray(appTabCount) &&
			appTabCount
				.filter(
					(el) =>
						el &&
						el._id &&
						el._id !== "unmanaged" &&
						el._id.includes(authStatus)
				)
				.reduce(function (sum, current) {
					return sum + current.count;
				}, 0);
	} else {
		count =
			(appTabCount &&
				Array.isArray(appTabCount) &&
				appTabCount.find(
					(el) =>
						el &&
						el._id &&
						el._id === authStatus.replaceAll("_", " ")
				)?.count) ||
			0;
	}

	return count;
};

export const getUserCountByType = (type, userTabCount) => {
	let count;
	count =
		(userTabCount &&
			Array.isArray(userTabCount) &&
			userTabCount.find((el) => el && el._id && type.includes(el._id))
				?.count) ||
		0;

	return count;
};

export const topRowAppBreakDownAuthMetaData = (
	authArr,
	extraFilters = [],
	sort_by = [],
	columns = []
) => {
	const filter_by = [
		{
			field_id: "app_state",
			field_name: "Authorisation Status",
			field_values: authArr,
			filter_type: "string",
			field_order: "contains",
			negative: false,
			is_custom: false,
		},
		{
			field_id: "app_status",
			field_name: "Status",
			field_values: ["active"],
			filter_type: "string",
			field_order: "contains",
			negative: false,
			is_custom: false,
		},
		{
			field_values: false,
			field_id: "app_archive",
			filter_type: "boolean",
			field_name: "Archive",
			negative: false,
			is_custom: false,
		},
		...extraFilters,
	];

	return { sort_by, filter_by, columns };
};

export const topRowUserBreakDownTypeMetaData = (typeArr) => {
	const filter_by = [
		{
			field_id: "user_archive",
			field_name: "Archive",
			field_values: false,
			filter_type: "boolean",
			negative: false,
			is_custom: false,
		},
		{
			field_id: "user_account_type",
			field_name: "User Account Type",
			field_values: typeArr,
			filter_type: "string",
			field_order: "contains",
			negative: false,
			is_custom: false,
		},
		{
			field_id: "user_status",
			field_name: "Status",
			field_values: ["active"],
			filter_type: "string",
			negative: false,
			is_custom: false,
		},
	];

	return { sort_by: [], filter_by, columns: [] };
};
