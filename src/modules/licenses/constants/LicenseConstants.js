import { getValueFromLocalStorage } from "utils/localStorage";
import mapLicenseStep1 from "assets/licenses/mapLicenseStep1.svg";
import mapLicenseStep2 from "assets/licenses/mapLicenseStep2.svg";
import mapLicenseStep3 from "assets/licenses/mapLicenseStep3.svg";
import { getHyperLinkMetaData } from "modules/Optimization/utils/OptimizationUtils";
import { optimizationLicenseClassifications } from "modules/Optimization/constants/OptimizationConstants";

export const screenEntity = {
	SUBSCRIPTION: "subscription",
	CONTRACT: "contract",
	PERPETUAL: "perpetual",
};

export const returnURLsFromBC = {
	subscription: `/licenses#allSubscriptions`,
	contract: `/licenses#allContracts`,
	perpetual: `/licenses#allPerpetualContracts`,
};

export const documentTypes = [
	{
		label: "Contract",
		value: "contract",
	},
	{
		label: "Security",
		value: "security",
	},
	{
		label: "Compliance",
		value: "compliance",
	},
	{
		label: "Other",
		value: "other",
	},
];

export const booleanFieldArray = [
	{
		key: "Signed by both parties",
		value: false,
		is_custom: false,
	},
	{
		key: "Approved by Finance",
		value: false,
		is_custom: false,
	},
	{
		key: "Approved by IT",
		value: false,
		is_custom: false,
	},
	{
		key: "Compliance Verification",
		value: false,
		is_custom: false,
	},
	{
		key: "Security Verification",
		value: false,
		is_custom: false,
	},
];

export const defaultBooleanFieldArray = booleanFieldArray.filter(
	(field) => field.key !== "Security Verification"
);

export const defaultBooleanFieldKeysArray = booleanFieldArray.map((field) =>
	field?.key?.replaceAll("_", " ")?.toLowerCase()
);

export const contractReqBody = {
	entity: "contract",
	is_app: true,
	app_id: null,
	app_name: null,
	app_logo: null,
	renewing_contract: false,
	renewed_contract_id: null,
	renewed_contract_name: null,
	name: "Untitled",
	description: null,
	vendor_id: null,
	vendor_name: null,
	vendor_logo: null,
	primary_owner_id: null,
	primary_owner_name: null,
	primary_owner_profile: null,
	financial_owner_id: null,
	financial_owner_name: null,
	financial_owner_profile: null,
	it_owner_id: null,
	it_owner_name: null,
	it_owner_profile: null,
	start_date: null,
	end_date: null,
	cancel_by: null,
	contract_auto_renews: false,
	payment_term: "one_time",
	payment_date: null,
	payment_repeat_frequency: 1,
	payment_repeat_interval: "months",
	payment_repeat_on: null,
	documents: [],
	checklist: defaultBooleanFieldArray,
	licenses: [],
	has_base_price: false,
	base_price: null,
	base_period: "years",
	base_currency: getValueFromLocalStorage("userInfo")?.org_currency || "USD",
	complete_term: true,
	base_frequency: 1,
	custom_fields: [],
	payment_method_id: null,
	discount_type: "percentage",
	discount_value: null,
	one_time_fee: [],
	cost_amortization: "months",
	license_group_precedence: "start_date",
	agreement_type: null,
};

export const subReqBody = {
	entity: "subscription",
	is_app: true,
	app_id: null,
	app_name: null,
	app_logo: null,
	name: "Untitled",
	description: null,
	vendor_id: null,
	vendor_name: null,
	vendor_logo: null,
	primary_owner_id: null,
	primary_owner_name: null,
	primary_owner_profile: null,
	financial_owner_id: null,
	financial_owner_name: null,
	financial_owner_profile: null,
	it_owner_id: null,
	it_owner_name: null,
	it_owner_profile: null,
	start_date: null,
	renewal_repeat_frequency: 1,
	renewal_repeat_interval: "months",
	next_renewal_date: null,
	auto_renews: true,
	licenses: [],
	has_base_price: false,
	base_price: null,
	base_period: "years",
	base_frequency: 1,
	base_currency: getValueFromLocalStorage("userInfo")?.org_currency || "USD",
	complete_term: true,
	custom_fields: [],
	payment_method_id: null,
	discount_type: "percentage",
	discount_value: null,
	one_time_fee: [],
	cost_amortization: "months",
	license_group_precedence: "start_date",
};

export const perpetualReqBody = {
	entity: "perpetual",
	is_perpetual: true,
	is_app: true,
	app_id: null,
	app_name: null,
	app_logo: null,
	renewing_contract: false,
	name: "Untitled",
	description: null,
	vendor_id: null,
	vendor_name: null,
	vendor_logo: null,
	primary_owner_id: null,
	primary_owner_name: null,
	primary_owner_profile: null,
	financial_owner_id: null,
	financial_owner_name: null,
	financial_owner_profile: null,
	it_owner_id: null,
	it_owner_name: null,
	it_owner_profile: null,
	start_date: null,
	payment_term: "one_time",
	payment_date: null,
	documents: [],
	checklist: defaultBooleanFieldArray,
	has_base_price: false,
	base_price: null,
	base_period: "years",
	base_frequency: 1,
	base_currency: getValueFromLocalStorage("userInfo")?.org_currency || "USD",
	complete_term: true,
	licenses: [],
	custom_fields: [],
	payment_method_id: null,
	discount_type: "percentage",
	discount_value: null,
	one_time_fee: [],
	license_group_precedence: "start_date",
	cost_amortization: "start_date",
};

export const entityReqBodyObj = {
	subscription: subReqBody,
	contract: contractReqBody,
	perpetual: perpetualReqBody,
};

export const licenseTypes = [
	{
		label: "User Based",
		value: "user",
	},
	{
		label: "Qty Based",
		value: "quantity",
	},
];

export const LicenseDetailsHeaderCSS = {
	license_type: {
		width: 110,
		default: true,
	},
	license_name: {
		width: 140,
		default: true,
	},
	cost_per_license: {
		width: 145,
		default: true,
	},
	quantity: {
		width: 90,
		default: true,
	},
	in_use: {
		width: 90,
		default: true,
	},
	discount: {
		width: 90,
		default: false,
	},
	auto_increment: {
		width: 80,
		default: true,
	},
	license_included_in_base_price: {
		width: 80,
		default: true,
	},
	cost_per_term: {
		width: 80,
		default: true,
	},
	additional_col_dropdown: {
		width: 20,
		default: true,
	},
	license_term: {
		width: 250,
		default: false,
	},
};

export const amortizationOptions = [
	"months",
	"years",
	"financial_year",
	"quarter",
	"start_date",
];

export const assignSplitOptions = ["days", "months", "years"];

export const LicenseDetailsCSS = {
	Description: {
		width: 250,
		marginRight: "5px",
	},
	"License Type": {
		width: 110,
		marginRight: "5px",
	},
	"License Name": {
		width: 135,
		marginRight: "5px",
	},
	"License Term": {
		width: 215,
		marginRight: "5px",
	},
	"Start Date": {
		width: 105,
		marginRight: "5px",
	},
	"Cost/License": {
		width: 195,
		marginRight: "5px",
	},
	Discount: {
		width: 110,
		marginRight: "5px",
	},
	Quantity: {
		width: 70,
		marginRight: "5px",
	},
	"Auto Increment": {
		width: 100,
		marginRight: "5px",
	},
	"Auto Adjust": {
		width: 100,
		marginRight: "5px",
	},
	"Group Auto Increment": {
		width: 100,
		marginRight: "5px",
	},
	"Cost/Term": {
		width: 70,
		marginRight: "5px",
	},
	Edit: {
		width: 40,
		marginRight: "5px",
	},
	Remove: {
		width: 40,
		marginRight: "5px",
	},
};

export const LicenseGroupsHeaderCSS = {
	Description: {
		width: 160,
		marginRight: "5px",
	},
	"License Term": {
		width: 225,
		marginLeft: "5px",
		marginRight: "5px",
	},
	"Start Date": {
		width: 125,
		marginLeft: "5px",
		marginRight: "5px",
	},
	"Cost/License": {
		width: 195,
		marginLeft: "5px",
		marginRight: "5px",
	},
	Discount: {
		width: 110,
		marginLeft: "5px",
		marginRight: "5px",
	},
	Quantity: {
		width: 75,
		marginLeft: "5px",
		marginRight: "5px",
	},
	Remove: {
		width: 40,
		marginLeft: "5px",
	},
};

export const licenseApplyCostOptions = [
	"pro-rata",
	"months",
	"quarter",
	"years",
];

export const defaultLicenseGroup = {
	description: "",
	start_date: null,
	end_date: null,
	amount: null,
	quantity: null,
	group_type: "true_up",
	discount_type: "percentage",
	discount: null,
	complete_term: false,
	frequency: 1,
	period: "term",
};

export const licenseDetailsErrorMsgs = {
	NEGATIVE_VALUE:
		"Negative quantity and negative cost/term are not allowed for a license. Please check and correct the license details and try again!",
	SAME_NAME:
		"Licenses with same name are not allowed. Please change the names and try again!",
};

export const licenseFormErrorMsgs = {
	EMPTY_FIELDS:
		"Name and description fields cannot be left empty. Please fill them out and try again!",
	GROUPS: {
		NOT_AN_ARRAY: "license.groups is not an array",
		EMPTY: "License does not have any groups",
	},
};

export const licenseGroupPrecedenceOptions = ["start_date", "amount"];

export const tooltipTexts = {
	COST_AMORTIZATION:
		"The contract/subscription cost will be distributed according to the option set here.",
	APPLY_COST:
		"The minimum duration for which cost will be applied for the license.",
	LICENSE_GROUP_PRECEDENCE:
		"Licenses will be assigned to users based on earliest start date/lowest amount based on this setting when multiple groups are active.",
	AUTO_INCREMENT:
		"True ups will be added automatically when more licenses are assigned to the users.",
	AUTO_ADJUST:
		"License quantity will be auto adjusted to match the assigned license quantity.",
};

export const contractPaymentDateSuggestions = [
	{
		display: "PIA",
		daysToBeAddedToStartDate: 0,
	},
	{
		display: "NET 7",
		daysToBeAddedToStartDate: 7,
	},
	{
		display: "NET 10",
		daysToBeAddedToStartDate: 10,
	},
	{
		display: "NET 15",
		daysToBeAddedToStartDate: 15,
	},
	{
		display: "NET 30",
		daysToBeAddedToStartDate: 30,
	},
	{
		display: "NET 45",
		daysToBeAddedToStartDate: 45,
	},
	{
		display: "NET 60",
		daysToBeAddedToStartDate: 60,
	},
	{
		display: "NET 90",
		daysToBeAddedToStartDate: 90,
	},
];

export const licenseUtilizationTooltipArray = [
	{
		typeLabel: "Unassigned",
		numberKey: "unassigned_licenses",
		costKey: "unassigned_licenses_cost",
		costTypeKey: "unassigned_licenses_cost_type",
		monthlySavingsKey: "monthly_potential_savings_unassigned",
		yearlySavingsKey: "annual_potential_savings_unassigned",
		color: "#FFB169",
	},
	{
		typeLabel: "Left Org",
		numberKey: "left_organisation_licenses",
		costKey: "left_organisation_licenses_cost",
		costTypeKey: "left_organisation_licenses_cost_type",
		monthlySavingsKey: "monthly_potential_savings_left_org",
		yearlySavingsKey: "annual_potential_savings_left_org",
		color: "#B5D1FD",
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
		typeLabel: "Unused",
		numberKey: "unused_licenses",
		costKey: "unused_licenses_cost",
		costTypeKey: "unused_licenses_cost_type",
		monthlySavingsKey: "monthly_potential_savings_unused",
		yearlySavingsKey: "annual_potential_savings_unused",
		color: "#478CFA",
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
		typeLabel: "Under Used",
		numberKey: "under_used_licenses",
		costKey: "under_used_licenses_cost",
		costTypeKey: "under_used_licenses_cost_type",
		monthlySavingsKey: "monthly_potential_savings_under_used",
		yearlySavingsKey: "annual_potential_savings_under_used",
		color: "#2A64F3",
		navigateTo: (history, app_id, selected_filter, license_id) =>
			history.push(
				`/applications/${app_id}?metaData=${getHyperLinkMetaData(
					optimizationLicenseClassifications.UNDER_USED,
					selected_filter,
					license_id
				)}#users`
			),
	},
	{
		typeLabel: "Actively Used",
		numberKey: "actively_used_licenses",
		color: "#6967E0",
		navigateTo: (history, app_id, selected_filter, license_id) =>
			history.push(
				`/applications/${app_id}?metaData=${getHyperLinkMetaData(
					optimizationLicenseClassifications.ACTIVELY_USED,
					selected_filter,
					license_id
				)}#users`
			),
	},
	// uncomment total row if required
	// {
	// 	typeLabel: "Total",
	// 	numberKey: "quantity",
	// 	monthlySavingsKey: "aggregated_monthly_potential_savings",
	// 	yearlySavingsKey: "aggregated_annual_potential_savings",
	// 	color: "#000000",
	// },
];

export const LicenseMapperReduxConstants = {
	REQUEST_ALL_LICENSE_MAPPER_USERS: "REQUEST_ALL_LICENSE_MAPPER_USERS",
	FETCH_ALL_LICENSE_MAPPER_USERS: "FETCH_ALL_LICENSE_MAPPER_USERS",
	CLEAR_ALL_LICENSE_MAPPER_USERS: "CLEAR_ALL_LICENSE_MAPPER_USERS",
	UPDATE_ALL_LICENSE_MAPPER_USERS: "UPDATE_ALL_LICENSE_MAPPER_USERS",
	UPDATE_FEW_LICENSE_MAPPER_USERS: "UPDATE_FEW_LICENSE_MAPPER_USERS",
	UPDATE_TABLE_SCROLL_POSITION: "UPDATE_TABLE_SCROLL_POSITION",
};

export const MapLicenseViaCSVSteps = [
	{
		title: "Download Template",
		description:
			"Download the data containing the list of all users and their currently assigned licenses & other details.",
		img: mapLicenseStep1,
	},
	{
		title: "Add Licenses",
		description:
			"Edit the the csv with the date you wish to update. Please follow the guide provided on the link below to understand in what format you should update the data in the csv.",
		img: mapLicenseStep2,
	},
	{
		title: "Upload CSV",
		description:
			"Upload the csv and verify the updated data in the platform. Then you can click ‘Save’ button on the right top corner to process the license updation.",
		img: mapLicenseStep3,
	},
];

export const LicenseMapperCSVHeaders = [
	"Email",
	"License",
	"Start Date",
	"Role",
	"End Date",
];

export const LicenseMapperCSVDateFormat = "YYYY-MM-DD";

export const BulkUploadAppUsersEmailHeader = "Email";

export const AddAppUsersViaCSVSteps = [
	{
		title: "Download Template",
		description: "Download the template csv file for adding the emails.",
		img: mapLicenseStep1,
	},
	{
		title: "Add Emails",
		description:
			"Edit the the csv with the emails of users you want to add to the application.",
		img: mapLicenseStep2,
	},
	{
		title: "Upload CSV",
		description:
			"Upload the csv to add users associated with emails to the application.",
		img: mapLicenseStep3,
	},
];

export const contractAgreementTypes = {
	master: {
		label: "Master",
		value: "master",
	},
	sow: {
		label: "SOW",
		value: "sow",
	},
	service: {
		label: "Service",
		value: "service",
	},
	true_up: {
		label: "True Up",
		value: "true_up",
	},
};
