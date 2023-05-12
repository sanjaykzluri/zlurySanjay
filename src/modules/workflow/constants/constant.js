import _ from "underscore";
import { offboardingDeclarationColumns } from "./offboarding";
import { OffboardingDashboardEmptyScreen } from "../components/OffboardingDashboardEmptyScreen/OffboardingDashboardEmptyScreen";
import NeedsReview from "../../../assets/workflow/needs-review.svg";
import Restricted from "../../../assets/workflow/restricted.svg";
import Unmanaged from "../../../assets/workflow/unmanaged.svg";
import schedule from "../../../assets/workflow/schedule.svg";
import scheduled from "../../../assets/workflow/scheduled.svg";
import approval from "../../../assets/workflow/approval.svg";
import approved from "../../../assets/workflow/approved.svg";
import immediately from "assets/workflow/immediately.svg";
import date from "assets/workflow/onboardingdate.svg";
import { INPUT_TYPE } from "constants/ui";

export const ICONS = {
	"needs review": { icon: NeedsReview, name: "Needs Review" },
	restricted: { icon: Restricted, name: "Restricted" },
	unmanaged: { icon: Unmanaged, name: "Unmanaged" },
};

export const EVENT_TYPE = {
	RUN_WORKFLOW: "run_workflow",
	WAIT: "wait",
};

export const TIME_UNIT = [
	{ unit: "minutes" },
	{ unit: "hours" },
	{ unit: "days" },
	{ unit: "weeks" },
];

export const STATUSES = {
	COMPLETED: "completed",
	PENDING: "pending",
	FAILED: "failed",
	COMPLETED_WITH_ERRORS: "completed_with_errors",
};

export const METHODS = [
	{ value: "GET" },
	{ value: "POST" },
	{ value: "PUT" },
	{ value: "DELETE" },
];

export const SIDEBAR_TABS = {
	RECOMMENDED: "recommended",
	OVERVIEW: "overview",
	SETTINGS: "settings",
	RUNS: "runs",
	HELP: "help",
};

export const WORFKFLOW_TYPE = {
	ONBOARDING: "onboarding",
	OFFBOARDING: "offboarding",
	APPREQUISITION: "apprequisition",
	APPPLAYBOOK: "appPlaybook",
};

export const ACTION_TYPE = {
	MANUAL: "manual",
	INTEGRATION: "integration",
	INTERNAL: "internal",
	STATIC: "static",
	LICENSE_OPTIMIZATION: "license_optimization",
};

export const ACTION_SCOPE_VALIDATION_ERROR = {
	SCOPE_MISSING: "scope_missing",
	DISCONNECTED: "orgintegration_not_connected",
};

export const ACTION_EDIT_OPTIONS = [
	{
		name: "Edit action",
		type: "edit",
	},
	{
		name: "Delete Action",
		type: "delete",
	},
];

export const CAPTURE_CONSTRAINT = {
	SINGLE_ONLY: "single-only",
	MULTI_ONLY: "multi-only",
};

export const NO_ASSIGNEE_DATA = {
	app_owner: "No app owner for this app",
	current_user: "No current user for this app",
	dept_head: "No Department head for this app",
	workflow_users: "No workflow user for this app",
	reporting_manager: "No reporting manager for this app",
	it_admin: "No IT admin for this app",
	app_it_owner: "No app IT owner for this app",
	payment_owner: "No payment owner for this app",
	app_finance_owner: "No app finance owner for this app",
};

export const ASSIGNEE_SUGGESTION_TITLE = {
	app_owner: "Assign to App Owner",
	current_user: "Assign to Me",
	dept_head: "Assign to Department Head",
	workflow_users: "Assign to Users",
};

export const TAB_TYPES = {
	declaration: {
		type: "declaration",
		columns: offboardingDeclarationColumns,
		emptyScreen: OffboardingDashboardEmptyScreen,
	},
};

export function getSearchReqObj(searchQuery, fieldId, fieldName) {
	const searchObj = {
		field_values: [searchQuery],
		field_order: "contains",
		field_id: fieldId,
		filter_type: "search_in_string",
		field_name: fieldName,
		negative: false,
		is_custom: false,
	};
	return searchObj;
}

export const defaultReqBody = {
	filter_by: [],
	sort_by: [],
	columns: [],
};

export function filtersRequestBodyGenerator(query, reqBody = defaultReqBody) {
	let urlMetaData;
	let urlReqBody = reqBody;
	let newReqObj = {};
	if (!_.isEmpty(query.metaData)) {
		urlMetaData = JSON.parse(JSON.stringify(query));
		urlReqBody = JSON.parse(decodeURIComponent(urlMetaData.metaData));
	}
	newReqObj.sort_by = urlReqBody.sort_by || [];
	newReqObj.filter_by = urlReqBody.filter_by || [];
	newReqObj.columns = urlReqBody.columns || [];
	newReqObj.reset_filter = urlReqBody.reset_filter;
	return newReqObj;
}

export const SCHEDULE_TIME = {
	CURRENT_DATE: "immediate",
	ONBOARDING_DATE: "onboarding_date",
	OFFBOARDING_DATE: "offboarding_date",
};

export const generateEventOptions = (tag) => {
	const data = [
		{
			label: "immediately",
			description: `Runs as soon as an employee is marked for ${tag}`,
			logo: immediately,
			value: SCHEDULE_TIME.CURRENT_DATE,
		},
	];
	if (tag) {
		data.push({
			label: `On ${tag} Date and Time`,
			description: `Runs on ${tag} date of employee at a specified time`,
			logo: date,
			value:
				tag === WORFKFLOW_TYPE.ONBOARDING
					? SCHEDULE_TIME.ONBOARDING_DATE
					: SCHEDULE_TIME.OFFBOARDING_DATE,
		});
	}
	return data;
};

export const MANUAL_TASK_TIME_UNIT = [{ unit: "days" }, { unit: "weeks" }];

export const ACTION_OPTIONS = {
	SCHEDULE: "schedule",
	APPROVAL: "approval",
};

export const ACTION_RENDER_OPTIONS = [
	{
		label: "Schedule",
		value: "schedule",
		icon: schedule,
		selectedIcon: scheduled,
	},
	{
		label: "Approval",
		value: "approval",
		icon: approval,
		selectedIcon: approved,
	},
];

export const CUSTOM_FIELD_INPUT_TYPE = {
	SELECT: "select",
	BOOL: "bool",
	REFERENCE: "reference",
	TEXT: "text",
	DATE: "date",
};

export const userSourceResponseFormater = (list = [], key = "manual") => {
	const idx = list.findIndex((item, index) => item?.keyword === key);
	list[idx] = {
		...list[idx],
		source_name: "Manual",
		org_integration_id: "manual",
		logo: "https://ui-avatars.com/api/?name=Manual",
	};
	return [...list];
};

export const MANUAL_TASK_INPUT_FIELD = {
	STATIC_MANUAL_INPUT_FIELD: "static_manual_input_field",
	ASSIGNEE: "assignee",
	DUE_DATE: "due_date",
};

export const SUMMARISED_RUN_LOG_TABS = {
	log: "LOG",
	configured_parameters: "CONFIGURED PARAMETERS",
	app_response: "APP RESPONSE",
};

export const excludeActionFromManualTask = [
	"ZLURI.SEND_WORKFLOW_SUMMARY_MAIL",
	"ZLURI.SEND_CUSTOM_MAIL",
];

export const scheduleTimeUnit = [{ unit: "AM" }, { unit: "PM" }];

export const workflowTagClassifications = {
	DRAFT: "draft",
	PLAYBOOKS: "playbooks",
	COMPLETED: "completed",
	RUNS: "runs",
	RULES: "rules",
};

export const EXCLUDE_MULTIPLE_USER_INPUT_BUTTON = [
	INPUT_TYPE.RADIO,
	INPUT_TYPE.CHECKBOX,
	INPUT_TYPE.RICHTEXT,
	INPUT_TYPE.DOCUMENT,
];
