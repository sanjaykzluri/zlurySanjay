export const markForOnboardingOffboardingType = {
	ONBOARDING: "onboarding",
	OFFBOARDING: "offboarding",
};

export const userType = {
	EMPLOYEE: "employee",
	SERVICE: "service",
	GROUP: "group",
};

export const EXTERNAL_USER = "external";

export const addEditUserRequiredFields = {
	employee: [
		{ field: "user_name", type: "text" },
		{ field: "user_email", type: "email" },
		{ field: "user_designation", type: "text" },
		{ field: "user_department_id", type: "text" },
	],
	external: [
		{ field: "user_name", type: "text" },
		{ field: "user_email", type: "email" },
		{ field: "user_designation", type: "text" },
		{ field: "user_department_id", type: "text" },
	],
	group: [
		{ field: "user_name", type: "text" },
		{ field: "user_email", type: "email" },
		{ field: "user_department_id", type: "text" },
	],
	service: [
		{ field: "user_name", type: "text" },
		{ field: "user_email", type: "email" },
		{ field: "user_department_id", type: "text" },
	],
};

export const userStatuses = ["active", "inactive"];

export const USER_TYPE_OPTIONS = [
	{
		label: "Employee",
		value: userType.EMPLOYEE,
	},
	{
		label: "Group",
		value: userType.GROUP,
	},
	{
		label: "Service",
		value: userType.SERVICE,
	},
	{
		label: "External Employee",
		value: EXTERNAL_USER,
	},
];

export const defaultAddUserObject = {
	user_name: null,
	user_email: null,
	user_designation: null,
	user_department: null,
	user_department_id: null,
	user_status: "active",
	user_custom_fields: [],
	account_type: "employee",
	owner_id: null,
	owner_name: null,
	owner_profile: null,
	reporting_manager_id: null,
	reporting_manager_name: null,
	reporting_manager_profile: null,
	user_personal_email: null,
	onboardingData: {},
};

export const addUserFormFields = {
	COMMON: ["profile_img", "name"],
	[userType.EMPLOYEE]: [
		"email",
		"designation",
		"status",
		"department",
		"reporting_manager",
		"personal_email",
	],
	[userType.GROUP]: ["email", "status", "department", "owner"],
	[userType.SERVICE]: ["email", "status", "department", "owner"],
	[EXTERNAL_USER]: [
		"email",
		"designation",
		"status",
		"department",
		"reporting_manager",
		"personal_email",
	],
};

export const addUserOnboardingDataFields = ["assign_to", "onboard_date"];
export const addUserOnboardingTimezoneDataFields = [
	"timezone_picker",
	"time_picker",
];
