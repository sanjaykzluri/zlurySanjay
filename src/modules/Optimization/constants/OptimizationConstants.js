import React from "react";
import { kFormatter } from "constants/currency";
import { UTCDateFormatter } from "utils/DateUtility";
import { getHyperLinkMetaData } from "../utils/OptimizationUtils";
import getstartedstep1 from "assets/optimization/getstartedstep1.svg";
import getstartedstep2 from "assets/optimization/getstartedstep2.svg";
import { getValueFromLocalStorage } from "utils/localStorage";

import { HeaderFormatter } from "modules/licenses/utils/LicensesUtils";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";
import OptimizationSummaryAppCell from "../OptimizationSummary/OptimizationSummaryAppCell";
import OptimizationSummaryToggleLicenseDisplay from "../OptimizationSummary/OptimizationSummaryToggleLicenseDisplay";

const partner = getValueFromLocalStorage("partner");

export const optimizationEntityType = {
	application: "application",
	contract: "contract",
};

export const generateOptimizationStatuses = {
	NOT_GENERATED: "not-generated",
	PENDING: "pending",
	COMPLETED: "completed",
};

export const optimizationLicenseClassifications = {
	UNASSIGNED: "unassigned",
	LEFT_ORG: "left_org",
	UNUSED: "unused",
	UNDER_USED: "under_used",
	ACTIVELY_USED: "actively_used",
};

export const optimizationFilterTypes = {
	MONTH: "month",
	USAGE: "usage",
};

export const filterStringArrIndex = {
	usage: 1,
	month: 3,
};

export const optimizationFunnelLevels = [
	{
		keyField: optimizationLicenseClassifications.UNASSIGNED,
		title: "Unassigned",
		barColor: "#FFB169",
		description: "The number of licenses not assigned to any user",
	},
	{
		keyField: optimizationLicenseClassifications.LEFT_ORG,
		title: "Left Org",
		barColor: "#B5D1FD",
		description:
			"Licenses assigned to users who are deprovisioned in the SSO",
	},
	{
		keyField: optimizationLicenseClassifications.UNUSED,
		title: "Unused",
		barColor: "#478CFA",
		filterType: optimizationFilterTypes.MONTH,
		filterIndex: filterStringArrIndex.month,
		description: `Licenses assigned to users for which ${partner?.name} has found no activity the given period`,
	},
	{
		keyField: optimizationLicenseClassifications.UNDER_USED,
		title: "Under Used",
		barColor: "#2266E2",
		filterType: optimizationFilterTypes.USAGE,
		filterIndex: filterStringArrIndex.usage,
		description:
			"Licenses assigned to users with usage percentage is less then the given threshold",
	},
	{
		keyField: optimizationLicenseClassifications.ACTIVELY_USED,
		title: "Actively Used",
		barColor: "#6967E0",
		description: "The number of licenses utilized effectively by the users",
	},
];

export const optimizationForecastBarGraphHeight = "173px";

export const optimizationAmountType = {
	SAVINGS: "savings",
	WASTAGE: "wastage",
};

export const optimizationUsageFilters = [
	{
		label: "< 30% usage",
		value: 30,
	},
	{
		label: "< 40% usage",
		value: 40,
	},
	{
		label: "< 50% usage",
		value: 50,
	},
];

export const optimizationDaysFilters = [
	{
		label: "> 30 days",
		value: 30,
	},
	{
		label: "> 60 days",
		value: 60,
	},
	{
		label: "> 90 days",
		value: 90,
	},
];

export const optimizationFilters = {
	usage: [
		{
			tableLabel: "Usage < 30%",
			label: "< 30% usage",
			value: 30,
		},
		{
			tableLabel: "Usage < 40%",
			label: "< 40% usage",
			value: 40,
		},
		{
			tableLabel: "Usage < 50%",
			label: "< 50% usage",
			value: 50,
		},
	],
	month: [
		{
			tableLabel: "Unused since 30 days",
			label: "> 1 month",
			value: 1,
		},
		{
			tableLabel: "Unused since 60 days",
			label: "> 2 months",
			value: 2,
		},
		{
			tableLabel: "Unused since 90 days",
			label: "> 3 months",
			value: 3,
		},
	],
};

export const licenseUsersTableMetaData = {
	columns: [
		{ group_name: "user" },
		{ group_name: "usage" },
		{ group_name: "role" },
		{ group_name: "activity" },
		{ group_name: "source" },
	],
};

export const licenseUsersStatuses = [
	"left_org",
	"unused",
	"under_used",
	"actively_used",
];

export const licenseListTooltipKeyHeaderCSS = [
	{
		key: "license_name",
		header: "License",
		style: {
			width: "120px",
			maxWidth: "120px",
			marginRight: "5px",
			whiteSpace: "nowrap",
			overflow: "hidden",
			textOverflow: "ellipsis",
		},
	},
	{
		key: "quantity",
		header: "Qty",
		style: {
			width: "50px",
			marginRight: "5px",
			marginLeft: "5px",
		},
	},
	{
		key: "cost",
		header: "Cost",
		CSS: {
			width: "80px",
			marginLeft: "5px",
		},
	},
];

export const optimizationReduxConstants = {
	LICENSE_USER_PROPERTIES_REQUESTED: "LICENSE_USER_PROPERTIES_REQUESTED",
	LICENSE_USER_PROPERTIES_FETCHED: "LICENSE_USER_PROPERTIES_FETCHED",
	SET_OPTIMIZATION_FILTER: "SET_OPTIMIZATION_FILTER",
	PDF_GENERATION_START: "PDF_GENERATION_START",
	PDF_GENERATION_END: "PDF_GENERATION_END",
	OPTIMIZATION_SUMMARY_REQUESTED: "OPTIMIZATION_SUMMARY_REQUESTED",
	OPTIMIZATION_SUMMARY_FETCHED: "OPTIMIZATION_SUMMARY_FETCHED",
	SET_OPTIMIZATION_SUMMARY_FILTER: "SET_OPTIMIZATION_SUMMARY_FILTER",
	TOGGLE_LICENSE_ROW_DISPLAY: "TOGGLE_LICENSE_ROW_DISPLAY",
	REQUEST_LICENSE_SUMMARY: "REQUEST_LICENSE_SUMMARY",
	FETCH_LICENSE_SUMMARY: "FETCH_LICENSE_SUMMARY",
};

export const optimizationDefaultFilter = "usage_30_month_1";

export const reportRegenerateTypes = {
	REFRESH: "REFRESH",
	MODIFY: "MODIFY",
};

export const OptimizationGetStartedSteps = [
	{
		image: getstartedstep1,
		title: `Add licenses and contracts to ${partner?.name}`,
		description: `${partner?.name} needs cost of licenses to calculate potential savings in optimization report. Please add a contract/subscription with the licenses and their costs.`,
		buttonText: (type) =>
			type === optimizationEntityType.contract
				? "Edit Contract"
				: "Add Contract",
		buttonClick: (history, id, type) =>
			history.push(
				type === optimizationEntityType.contract
					? `/contract/edit/${id}`
					: "/contract/new"
			),
	},
	{
		image: getstartedstep2,
		title: "Map licenses to users",
		description:
			"We have found no licenses assigned to any user for the application. Please assign licenses to get accurate potential savings in the report.",
		buttonText: () => "Map Licenses",
		buttonClick: (history, id, type) =>
			history.push(
				type === optimizationEntityType.contract
					? `/licenses/mapping/${id}`
					: "#users"
			),
	},
	{
		title: "Optimize Licenses",
	},
];

export const optimizationTableColumnTypes = {
	string: { type: "string", formatter: (v) => v },
	count: { type: "count", formatter: (v) => v || 0 },
	cost: { type: "cost", formatter: (v) => kFormatter(v) },
	boolean: { type: "boolean", formatter: (v) => (!!v ? "Yes" : "No") },
	date: { type: "date", formatter: (v) => (v ? UTCDateFormatter(v) : "-") },
	percentage: {
		type: "percentage",
		formatter: (v) => `${v ? Number(v?.toFixed(2)) : 0}%`,
	},
	application: {
		type: "application",
		formatter: (v, w) => (
			<OptimizationSummaryAppCell
				app_name={w?.app_name}
				app_logo={w?.app_logo}
				app_auth_status={w?.app_state}
				app_id={w?.app_id}
				logo_height="auto"
				logo_width={20}
			/>
		),
	},
	license: {
		type: "license",
		formatter: (v) => <LongTextTooltip maxWidth={190} text={v} />,
	},
	toggle_license_display: {
		type: "toggle_license_display",
		formatter: (v, w) => (
			<OptimizationSummaryToggleLicenseDisplay row={w} />
		),
	},
};

export const optimizationAppsTableColumns = [
	{
		group_name: "app_estimated_wastage",
		group_type: "cost",
		header: "Estimated Wastage",
	},
	{
		group_name: "app_realised_savings",
		group_type: "cost",
		header: "Realised Savings",
	},
	{
		group_name: "app_monthly_potential_savings",
		group_type: "cost",
		header: "Monthly Potential Savings",
	},
	{
		group_name: "app_annual_potential_savings",
		group_type: "cost",
		header: "Annual Potential Savings",
	},
	{
		group_name: "app_optimisable_licenses_count",
		group_type: "count",
		header: "Optimizable Licenses",
	},
	{
		group_name: "app_optimised_licenses_count",
		group_type: "count",
		header: "Optimized Licenses",
	},
];

export const optimizationAppUsersTableColumns = [
	{
		group_name: "is_optimisable",
		group_type: "boolean",
		header: "Is Optimizable?",
	},
	{
		group_name: "date_since_optimisable",
		group_type: "date",
		header: "Date Since Optimizable",
	},
	{
		group_name: "reason",
		group_type: "string",
		header: "Optimizablilty Reason",
	},
	{
		group_name: "estimated_wastage",
		group_type: "cost",
		header: "Estimated Wastage",
	},
	{
		group_name: "realised_savings",
		group_type: "cost",
		header: "Realised Savings",
	},
	{
		group_name: "monthly_potential_savings",
		group_type: "cost",
		header: "Monthly Potential Savings",
	},
	{
		group_name: "annual_potential_savings",
		group_type: "cost",
		header: "Annual Potential Savings",
	},
];

export const optimizationSummaryTableFilterKeys = [
	"usage_30_month_1",
	"usage_30_month_2",
	"usage_30_month_3",
	"usage_40_month_1",
	"usage_40_month_2",
	"usage_40_month_3",
	"usage_50_month_1",
	"usage_50_month_2",
	"usage_50_month_3",
];

export const optimizationSummaryColumns = [
	{
		group_name: "arrow",
		dataField: null,
		group_type: "toggle_license_display",
		headerContainerClassName:
			"optimization_summary_toggle_license_display_header",
		cellContainerClassName:
			"optimization_summary_toggle_license_display_cell",
	},
	{
		group_name: "application",
		dataField: "app_name",
		group_type: "application",
		header: "Application",
		headerClassName: "d-flex",
		cellClassName: "d-flex",
	},
	{
		group_name: "potential_savings",
		dataField: "potential_savings",
		group_type: "cost",
		header: (
			<HeaderFormatter
				text={"Potential Savings"}
				onClick={() => window.open(optimizationSummaryBlogLink)}
			/>
		),
	},
	{
		group_name: "unassigned",
		dataField: "unassigned_licenses",
		group_type: "count",
		header: "Unassigned Licenses",
	},
	{
		group_name: "left_org",
		dataField: "left_org_licenses",
		group_type: "count",
		header: "Un-deprovisioned",
		navigateTo: (history, app_id, selected_filter, license_id) =>
			history.push(
				`/applications/${app_id}?metaData=${getHyperLinkMetaData(
					optimizationLicenseClassifications.LEFT_ORG,
					selected_filter,
					license_id
				)}#users`
			),
	},
	{
		group_name: "unused",
		dataField: "unused_licenses",
		group_type: "count",
		header: "Unused Licenses",
		navigateTo: (history, app_id, selected_filter, license_id) =>
			history.push(
				`/applications/${app_id}?metaData=${getHyperLinkMetaData(
					optimizationLicenseClassifications.UNUSED,
					selected_filter,
					license_id
				)}#users`
			),
	},
	{
		group_name: "under_used",
		dataField: "under_used_licenses",
		group_type: "count",
		header: "Under Used Licenses",
		navigateTo: (history, app_id, selected_filter, license_id) =>
			history.push(
				`/applications/${app_id}?metaData=${getHyperLinkMetaData(
					optimizationLicenseClassifications.UNDER_USED,
					selected_filter,
					license_id
				)}#users`
			),
	},
	// {
	// 	group_name: "actively_used",
	// 	dataField: "actively_used_licenses",
	// 	group_type: "count",
	// 	header: "Actively Used Licenses",
	// 	navigateTo: (history, app_id, selected_filter) =>
	// 		history.push(
	// 			`/applications/${app_id}?metaData=${getHyperLinkMetaData(
	// 				optimizationLicenseClassifications.ACTIVELY_USED,
	// 				selected_filter
	// 			)}#users`
	// 		),
	// },
	{
		group_name: "app_cost_per_license",
		dataField: "app_cost_per_license",
		group_type: "cost",
		header: "Cost/License (per month)",
	},
	{
		group_name: "estimated_wastage",
		dataField: "estimated_wastage",
		group_type: "cost",
		header: (
			<HeaderFormatter
				text={"Estimated Wastage (past month)"}
				onClick={() => window.open(optimizationSummaryBlogLink)}
			/>
		),
		headerContainerClassName:
			"optimization_summary_estimated_wastage_header",
	},
	{
		group_name: "optimized_licenses",
		dataField: "optimized_licenses",
		group_type: "count",
		header: "Optimized Licenses",
	},
	{
		group_name: "realised_savings",
		dataField: "realised_savings",
		group_type: "cost",
		header: (
			<HeaderFormatter
				text={"Realised Savings (annualized)"}
				onClick={() => window.open(optimizationSummaryBlogLink)}
			/>
		),
	},
];

export const optimizationSummaryBlogLink =
	"https://help.zluri.com/en/articles/6886221-how-zluri-calculates-estimated-wastage-savings";

export const optimizationSummaryMetaCardTypes = [
	{
		amountKey: "prev_month_estimated_wastage",
		monthType: "past",
		title: "Estimated Wastage",
		pillBackground: "#FFE9E5",
		numberColor: "#BB2915",
		desc: "in the past month",
	},
	{
		amountKey: "next_month_potential_savings",
		monthType: "upcoming",
		title: "Potential Savings",
		pillBackground: "#E8F0FC",
		numberColor: "#2266E2",
		desc: "in the upcoming month",
	},
	{
		amountKey: "next_month_realised_savings",
		monthType: "upcoming",
		title: "Realised Savings",
		pillBackground: "#E8F0FC",
		numberColor: "#2266E2",
		desc: "(annualized)",
	},
];

export const optimizationSummaryLicenseColumn = {
	group_name: "license",
	dataField: "license_name",
	group_type: "license",
	cellClassName: "d-flex",
};
