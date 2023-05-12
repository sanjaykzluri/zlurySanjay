export const usersConstants = {
	USERS_REQUESTED: "USERS_REQUESTED",
	USERS_FETCHED: "USERS_FETCHED",
	SINGLE_USER_APPS_REQUESTED: "SINGLE_USER_APPS_REQUESTED",
	SINGLE_USER_APPS_FETCHED: "SINGLE_USER_APPS_FETCHED",
	DELETE_USERS_CACHE: "DELETE_USERS_CACHE",
	DELETE_SINGLE_USER_APPS_CACHE: "DELETE_SINGLE_USER_APPS_CACHE",
	UPDATE_USER_STATUS: "UPDATE_USER_STATUS",
};

export const userStatus = {
	ACTIVE: "active",
	INACTIVE: "inactive",
	SUSPENDED: "suspended",
};

export const userType = {
	EMPLOYEE: "employee",
	SERVICE: "service",
	GROUP: "group",
};

export const userTabs = {
	group: "Group",
	service: "Service",
	employees: "Employees",
	external: "External",
	marked_for_onboarding: "Marked for Onboarding",
	marked_for_offboarding: "Marked for Offboarding",
};

export const USER_ONBOARDING_VIEW_STATUS = {
	LOADING: "LOADING",
	REQUIRED: "REQUIRED",
	NOT_REQUIRED: "NOT_REQUIRED",
	STEPS: "STEPS",
	COMPLETED: "completed",
	ONBOARDING: "onboarding",
	EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
	BLOCKED: "blocked",
	INACTIVE: "inactive",
	ACTIVE: "active",
	LOGIN_FAILED: "LOGIN_FAILED",
	PROCESSING: "processing",
	SWITCH_TO_EMPLOYEE_VIEW: "SWITCH_TO_EMPLOYEE_VIEW",
};
