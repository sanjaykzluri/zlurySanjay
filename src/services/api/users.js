import { filterPropertiesHelper } from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";
import { client, clientV2, clientV3 } from "../../utils/client";
import _ from "underscore";
import { escapeURL } from "utils/common";
import { getValueFromLocalStorage } from "utils/localStorage";

export async function getAllUsers(page, row, cancelTokenSource = null) {
	let options = {
		params: {
			page,
			row,
		},
	};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	const response = await client.get("users", options);
	return response.data;
}

export async function fetchEmailAliases(userId) {
	const response = await client.get("users/" + userId + "/email-alias");
	return response.data.data;
}

export async function setPrimaryEmail(userId, emailId) {
	const response = await client.put("users/" + userId + "/email-alias", {
		email: emailId,
	});
	return response.data;
}

export async function getAllUsersV2(
	reqObj,
	page,
	row,
	cancelTokenSource = null,
	searchReqParams
) {
	let options = {};
	let url = "users?page=" + page + "&row=" + row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `users?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}

	const response = await clientV2.post(url, reqObj, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getOnboardingOffboardingUsersV2(
	reqObj,
	page,
	row,
	cancelTokenSource = null,
	searchReqParams
) {
	let options = {};
	let url = "onboarding-offboarding-users?page=" + page + "&row=" + row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `onboarding-offboarding-users?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}

	const response = await clientV2.post(url, reqObj, options);
	return response.data;
}

export async function getUserInfo(userId) {
	const response = await client.get(`users/${userId}`);
	return response.data;
}

export async function reviewAllAppUsers(appId) {
	const response = await client.put(
		`application/${appId}/batch/review-users`,
		{ reviewed_status: true, review_all: true, org_user_ids: [] }
	);
	return response.data;
}

export async function addUser(user) {
	Object.keys(user).forEach((key) => {
		if (!user[key]) {
			delete user[key];
		}
	});
	const response = await client.post("users", user);
	return response.data;
}

export async function mergeUsers(userId, targetUserId) {
	const response = await client.get(
		`users/${userId}/merge-user/${targetUserId}`
	);
	return response.data;
}

export async function getUserSpendGraphData(
	userId,
	start_month,
	end_month,
	start_year,
	end_year
) {
	const response = await client.get(`users/${userId}/spend/applications2`, {
		params: {
			start_month,
			end_month,
			start_year,
			end_year,
		},
	});
	return response.data;
}

export async function getUserApplications(
	userId,
	page,
	row,
	cancelTokenSource = null
) {
	let options = {
		params: {
			page,
			row,
		},
	};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	const response = await clientV3.get(
		`users/${userId}/applications`,
		options
	);
	return response.data;
}

export async function getUserUsageGraphData(
	userId,
	start_month,
	end_month,
	start_year,
	end_year
) {
	const response = await client.get(`users/${userId}/usage/applications2`, {
		params: {
			start_month,
			end_month,
			start_year,
			end_year,
		},
	});
	return response.data;
}

export async function getUserActionHistory(userId) {
	const response = await client.get(`user/${userId}/action-history`);
	return response.data;
}

export async function updateUser(userId, user) {
	Object.keys(user).forEach((key) => {
		if (!user[key]) {
			delete user[key];
		}
		if (!user[key] && key === "user_designation") {
			user[key] = null;
		}
	});
	const response = await client.put(`users/${userId}`, user);
	return response.data;
}

export async function setUserBulkStatus(
	user_new_status,
	user_ids,
	filter_by = [],
	set_all,
	user_search
) {
	const response = await client.put("users/batch/status", {
		user_new_status,
		user_ids,
		filter_by,
		set_all,
		user_search,
	});
	return response.data;
}
export async function setUserBulkArchive(
	status,
	user_ids,
	filter_by = [],
	set_all,
	user_search
) {
	const response = await client.put("users/batch/archive", {
		status,
		user_ids,
		filter_by,
		set_all,
		user_search,
	});
	return response.data;
}
export async function setUserBulkAccountType(
	type,
	user_ids,
	filter_by = [],
	set_all,
	user_search
) {
	const response = await client.put("users/batch/type", {
		type,
		user_ids,
		filter_by,
		set_all,
		user_search,
	});
	return response.data;
}
export async function getMiniTrendCharts() {
	const response = await client.get(`users/mini-trends-chart`);
	return response.data;
}

export async function patchUser(userId, patchObj) {
	const response = await client.patch(`users/${userId}`, patchObj);
	return response.data;
}

export async function setUsersDepartment(
	user_new_department_id,
	user_ids,
	filter_by = [],
	set_all,
	user_search
) {
	const response = await client.put("users/batch/department", {
		user_new_department_id,
		user_ids,
		filter_by,
		set_all,
		user_search,
	});
	return response.data;
}

export async function addManualUsage(user_id, app_id, frequency, interval) {
	const response = await client.post(`users/${user_id}/add-manual-usage`, {
		app_id,
		frequency,
		interval,
	});
	return response.data;
}

export async function updateManualUsage(
	user_id,
	org_user_app_id,
	frequency,
	interval
) {
	const response = await client.put(
		`users/${user_id}/add-manual-usage/${org_user_app_id}`,
		{
			frequency,
			interval,
		}
	);
	return response.data;
}

export async function markAsNotActive(user_id, org_user_app_id) {
	const response = await client.put(
		`users/${user_id}/mark-as-not-active/${org_user_app_id}`
	);
	return response.data;
}

export async function markAsActive(user_id, org_user_app_id) {
	const response = await client.put(
		`users/${user_id}/mark-as-active/${org_user_app_id}`
	);
	return response.data;
}

export async function archiveUsers(user_ids) {
	if (Array.isArray(user_ids) && user_ids.length > 0) {
		const response = await client.put(`users/batch/archive`, {
			status: true,
			user_ids: user_ids,
		});
		return response.data;
	} else {
		return { error: "expected array of user ids" };
	}
}

export async function unArchiveUsers(user_ids) {
	if (Array.isArray(user_ids) && user_ids.length > 0) {
		const response = await client.put(`users/batch/archive`, {
			status: false,
			user_ids: user_ids,
		});
		return response.data;
	} else {
		return { error: "expected array of user ids" };
	}
}

export async function getUserPropertiesList() {
	const response = await clientV2.get(`users/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function getOnboardingOffboardingUserPropertiesList() {
	const response = await clientV2.get(`users/onboarding-offboarding/filters`);
	return response;
}

export async function exportUserCSV(req) {
	const response = await client.post("users/file-export", req);
	return response.data;
}

export async function getUserApplicationPropertiesList() {
	const response = await clientV2.get(`users/applications/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;

	return response;
}

export async function exportUserApplicationCSV(req, id) {
	const response = await client.post(`users/${id}/app-file-export`, req);
	return response.data;
}

export async function fetchUsageActivityOverviewDetails(userAppId) {
	const orgId = getValueFromLocalStorage("userInfo")?.org_id;
	var response;
	try {
		response = await client.get(
			`organization/${orgId}/user-app/${userAppId}/overview`
		);
	} catch (error) {
		return { error: error };
	}
	return response;
}

export async function fetchUsageActivityRiskDetails(userAppId) {
	var response;
	try {
		response = await client.get(`user-app/${userAppId}/risk`);
	} catch (error) {
		return { error: error };
	}
	return response;
}

export async function fetchUsageActivityLogDetails(userAppId) {
	var response;
	try {
		response = await client.get(`user-app/${userAppId}/log`);
	} catch (error) {
		return { error: error };
	}
	return response;
}
export async function bulkUpdateUserData(fileKey) {
	const response = await client.post(`bulk-import/users?fileKey=${fileKey}`);
	return response;
}

export async function getUserApplicationsV2(
	userId,
	reqBody,
	page,
	row,
	cancelTokenSource
) {
	let options = {
		params: {
			page,
			row,
		},
	};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	const response = await clientV2.post(
		`users/${userId}/applications`,
		reqBody,
		options
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}
export async function getAccesedBySingleUser(userId, page, row) {
	const response = await client.get(
		`users/${userId}/accessed-by?page=${page}&row=${row}`
	);
	return response.data;
}

export async function addUsersInAccessedBy(userId, req) {
	const response = await client.post(`users/${userId}/accessed-by`, req);
	return response.data;
}

export async function removeUsersAccessedBy(userId, req) {
	const response = await client.put(`users/${userId}/accessed-by`, req);
	return response.data;
}

export async function searchAccessedBy(
	userId,
	query,
	page,
	row,
	cancelTokenSource = null
) {
	let options = {
		params: {
			page,
			row,
		},
	};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await client.get(
		`users/${userId}/accessed-by/search?q=${query}&page=${page}&row=${row}`,
		options
	);
	return response.data;
}

export async function getUsersinAddModalAccessedBy(userId, page, row) {
	const response = await client.get(
		`users/${userId}/accessed-by/add-user?page=${page}&row=${row}`
	);
	return response.data;
}

export async function searchUsersinAddModalAccessedBy(
	userId,
	query,
	page,
	row,
	cancelTokenSource = null
) {
	let options = {
		params: {
			page,
			row,
		},
	};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await client.get(
		`users/${userId}/accessed-by/add-user/search?q=${query}&page=${page}&row=${row}`,
		options
	);
	return response.data;
}

export async function getUserCostTrend(id) {
	const response = await client.get(`users/${id}/cost-trend`);
	return response.data;
}

export async function getUserSpendTrend(id) {
	const response = await client.get(`users/${id}/spend-trend`);
	return response.data;
}

export async function getUserApplicationCostTrend(appId, userId) {
	const response = await client.get(
		`users/${userId}/applications/${appId}/cost-trend`
	);
	return response.data;
}

export async function getUserApplicationSpendTrend(appId, userId) {
	const response = await client.get(
		`users/${userId}/applications/${appId}/spend-trend`
	);
	return response.data;
}

export async function setAsPrimarySource(userId, body) {
	const response = await client.put(`users/${userId}/primary-source`, body);
	return response.data;
}

export async function getUserSourceDetails(userId, sourceId) {
	const response = await client.get(
		`users/${userId}/source?sourceId=${sourceId}`
	);
	return response.data;
}

export async function getUserSourceList(userId) {
	const response = await client.get(`users/${userId}/source-list`);
	return response.data;
}

export async function exportUserActivityforAllApps(req) {
	const response = await client.post(`users/user-activity-export`, req);
	return response.data;
}

export async function markUserForOnbaordOffboard(req) {
	const response = await client.post(
		`mark-user-as-onboarding-offboarding`,
		req
	);
	return response.data;
}

export async function removeUserFromOnboardOffboard(req) {
	const response = await clientV2.post(
		`users/onboarding-offboarding/remove`,
		req
	);
	return response.data;
}

export async function getUserTabCount() {
	const response = await client.get("users/tab-count");
	return response.data;
}

export async function setUsersReportingManager(user_ids, manager_id) {
	const response = await client.put("users/batch/reporting-manager", {
		user_ids,
		manager_id,
	});
	return response.data;
}

export async function setUsersOwner(user_ids, owner_id) {
	const response = await client.put("users/batch/owner", {
		user_ids,
		owner_id,
	});
	return response.data;
}

export async function exportLicenseOptimizationforAllApps(req) {
	const response = await client.post(
		`users/license-optimization-file-export`,
		req
	);
	return response.data;
}

export async function bulkArchiveUserApps(userId, reqObj) {
	const response = await client.post(
		`users/${userId}/user-app-archive`,
		reqObj
	);
	return response.data;
}

export async function bulkUnarchiveUserApps(userId, reqObj) {
	const response = await client.post(
		`users/${userId}/user-app-unarchive`,
		reqObj
	);
	return response.data;
}

export async function exportInactiveUsersReport(exportRequestObj) {
	const response = await client.post(
		`users/inactive-appowner-users-file-export`,
		exportRequestObj
	);
	return response.data;
}

export const getTimezones = async () => {
	const response = await client.get(`timezones`);
	return response.data;
};
