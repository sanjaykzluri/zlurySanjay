import { getTotalLicenseRowData } from "modules/licenses/utils/LicensesUtils";
import { addSubtractMonth, dateResetTimeZone, MONTH } from "utils/DateUtility";
import {
	optimizationAmountType,
	optimizationAppsTableColumns,
	optimizationAppUsersTableColumns,
	optimizationDefaultFilter,
	optimizationLicenseClassifications,
	optimizationSummaryColumns,
	optimizationSummaryLicenseColumn,
	optimizationTableColumnTypes,
} from "../constants/OptimizationConstants";

export const generateCSVData = (data, keyField) => {
	function csvFormatter(action) {
		return generateLicenseCSVRow(
			action.monthly_data,
			keyField,
			action.license_name,
			action.contract_name
		);
	}

	let csvData = data?.map(csvFormatter);
	return csvData;
};

const generateLicenseCSVRow = (data, keyField, license_name, contract_name) => {
	const cost_key = `${keyField}_cost`;

	const license_row = {
		["License Name"]: license_name,
		["Contract Name"]: contract_name,
	};

	data?.map((cell) => {
		license_row[`${MONTH[cell.month_id - 1]} ${cell.year_id} Quantity`] =
			cell[keyField] || "0";
		if (keyField !== "actively_used") {
			license_row[
				`${MONTH[cell.month_id - 1]} ${
					cell.year_id
				} Savings(+)/Wastage(-)`
			] = `${
				cell.license_savings_type === optimizationAmountType.WASTAGE
					? "-"
					: ""
			}${cell[cost_key] || "0"}`;
		}
	});

	return license_row;
};

export const getLicenseListFromOptimizationData = (data) => {
	return data?.table_data?.map((td) => {
		return {
			license_id: td.license_id,
			license_name: td.license_name,
			contract_id: td.contract_id,
			contract_name: td.contract_name,
		};
	});
};

export const getLicenseListForOverviewTableTooltip = (
	data,
	optimizationFunnel,
	date
) => {
	const month = date.getMonth() + 1;
	const year = date.getFullYear();

	const optimizationFunnelData =
		data[
			optimizationFunnel === "total"
				? optimizationLicenseClassifications.ACTIVELY_USED
				: optimizationFunnel
		];

	const licenseList =
		Array.isArray(optimizationFunnelData?.table_data) &&
		optimizationFunnelData?.table_data?.map((license) => {
			const licenseObj = {};
			licenseObj.license_name = license.license_name;
			const licenseDetailsForDate = license.monthly_data.find(
				(monthlyData) =>
					monthlyData.year_id === year &&
					monthlyData.month_id === month
			);
			licenseObj.quantity =
				licenseDetailsForDate[
					optimizationFunnel === "total"
						? "total_license"
						: optimizationFunnel
				];
			licenseObj.cost =
				licenseDetailsForDate[`${optimizationFunnel}_cost`];
			return licenseObj;
		});

	return licenseList || [];
};

export const showAppOptimizationGetStarted = (app) => {
	if (app?.app_active_contracts > 0 && app?.app_user_with_license_count > 0) {
		return false;
	}
	return true;
};

export const showContractOptimizationGetStarted = (contract) => {
	if (getTotalLicenseRowData(contract).in_use > 0) {
		return false;
	}
	return true;
};

export const getOptimizationTableColumnGroups = (v2Entity) => {
	const optimizationColumns =
		v2Entity === "applications"
			? optimizationAppsTableColumns
			: v2Entity === "application_users"
			? optimizationAppUsersTableColumns
			: v2Entity === "optimization_summary"
			? optimizationSummaryColumns
			: v2Entity === "optimization_summary_license_breakdown"
			? getOptimizationSummaryLicenseBreakdownColumns()
			: [];

	const optimizationColumnGroups = {};

	for (const column of optimizationColumns) {
		optimizationColumnGroups[column.group_name] = {
			dataField: column.group_name,
			text: column.header,
			sortKey: column.group_name,
			formatter:
				optimizationTableColumnTypes[column.group_type].formatter,
		};
	}

	return optimizationColumnGroups;
};

export const getHyperLinkMetaData = (
	optimizationType,
	selectedFilter = optimizationDefaultFilter,
	licenseId = null
) => {
	const usageForFilter = Number(selectedFilter.split("_")[1]);
	const monthForFilter = Number(selectedFilter.split("_")[3]);
	const meta = {
		columns: [],
		filter_by: [
			{
				field_id: "license_mapped",
				field_name: "License Mapped",
				field_values: true,
				filter_type: "boolean",
				negative: false,
				is_custom: false,
			},
			{
				field_values: false,
				field_id: "user_archive",
				filter_type: "boolean",
				field_name: "User Archive",
				negative: false,
				is_custom: false,
			},
			{
				field_id: "user_app_archive",
				field_name: "User Application Archive",
				field_values: false,
				filter_type: "boolean",
				negative: false,
				is_custom: false,
			},
		],
		sort_by: [],
	};

	if (licenseId) {
		meta.filter_by.push({
			field_id: "licenses.license_id",
			field_name: "License Id",
			field_values: [licenseId],
			filter_type: "objectId",
			negative: false,
			is_custom: false,
		});
	}

	switch (optimizationType) {
		case optimizationLicenseClassifications.LEFT_ORG:
			meta.filter_by.push({
				field_id: "user_status",
				field_name: "User Status",
				field_values: ["inactive"],
				filter_type: "string",
				field_order: "contains",
				negative: false,
				is_custom: false,
			});
			break;
		case optimizationLicenseClassifications.UNUSED:
			meta.filter_by.push({
				field_id: "user_status",
				field_name: "User Status",
				field_values: ["active", "suspended"],
				filter_type: "string",
				field_order: "contains",
				negative: false,
				is_custom: false,
			});
			meta.filter_by.push({
				field_id: "user_app_last_used",
				field_name: "Last Used",
				field_values: [
					`${dateResetTimeZone(
						new Date(
							new Date().setDate(
								new Date().getDate() - monthForFilter * 30
							)
						)
					)}`,
				],
				filter_type: "date_range",
				field_order: ["lt"],
				negative: false,
				is_custom: false,
				timestamp_type: true,
			});
			break;
		case optimizationLicenseClassifications.UNDER_USED:
			meta.filter_by.push({
				field_id: "user_status",
				field_name: "User Status",
				field_values: ["active", "suspended"],
				filter_type: "string",
				field_order: "contains",
				negative: false,
				is_custom: false,
			});
			meta.filter_by.push({
				field_id: "user_app_last_used",
				field_name: "Last Used",
				field_values: [
					`${dateResetTimeZone(
						new Date(
							new Date().setDate(
								new Date().getDate() - monthForFilter * 30
							)
						)
					)}`,
				],
				filter_type: "date_range",
				field_order: ["gt"],
				negative: false,
				is_custom: false,
				timestamp_type: true,
			});
			meta.filter_by.push({
				field_id: "user_app_current_month_usage",
				field_name: "Usage (Current month)",
				field_values: [usageForFilter],
				filter_type: "range",
				field_order: ["lt"],
				negative: false,
				is_custom: false,
			});
			break;
		case optimizationLicenseClassifications.ACTIVELY_USED:
			meta.filter_by.push({
				field_id: "user_status",
				field_name: "User Status",
				field_values: ["active", "suspended"],
				filter_type: "string",
				field_order: "contains",
				negative: false,
				is_custom: false,
			});
			meta.filter_by.push({
				field_id: "user_app_last_used",
				field_name: "Last Used",
				field_values: [
					`${dateResetTimeZone(
						new Date(
							new Date().setDate(
								new Date().getDate() - monthForFilter * 30
							)
						)
					)}`,
				],
				filter_type: "date_range",
				field_order: ["gt"],
				negative: false,
				is_custom: false,
				timestamp_type: true,
			});
			meta.filter_by.push({
				field_id: "user_app_current_month_usage",
				field_name: "Usage (Current month)",
				field_values: [usageForFilter],
				filter_type: "range",
				field_order: ["lt"],
				negative: false,
				is_custom: false,
			});
			break;
		default:
			break;
	}

	return JSON.stringify(meta);
};

export const getOptimizationSummaryLicenseBreakdownColumns = () => {
	const columns = [...optimizationSummaryColumns];
	columns.splice(0, 2);
	columns.unshift(optimizationSummaryLicenseColumn);
	return columns;
};
