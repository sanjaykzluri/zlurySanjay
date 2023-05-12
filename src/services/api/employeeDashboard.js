import {
	client,
	clientEmployee,
	clientEmployeeV2,
	clientV2,
} from "utils/client";
import { getSearchReqObj } from "common/infiniteTableUtil";
import { filterPropertiesHelper } from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";

export async function getOverviewStats() {
	const response = await clientEmployee.get(`user/me/overview/stats`);
	return response;
}

export async function getAppLauncherData() {
	const response = await clientEmployee.get(`user/me/overview`);
	return response;
}

export async function getTopCategories() {
	const response = await clientEmployee.get(`user/me/top-categories`);
	return response;
}

export async function getListOfCategories() {
	const response = await clientEmployee.get(`user/me/categories-list`);
	return response;
}

export async function getSingleCategoryApplications(categoryId) {
	const response = await clientEmployee.get(`user/me/category/${categoryId}`);
	return response.data;
}

export async function getAppInsights(appId) {
	const response = await clientEmployee.get(
		`user/me/application/${appId}/insights`
	);
	return response;
}

export async function getSimilarAppsEmployeeDashboard(
	appId,
	is_global = false
) {
	const response = await clientEmployee.get(
		`user/me/application/${appId}/similar-applications?is_global=${is_global} `
	);
	return response.data;
}

export async function updateEmployeeDashboardSettings(reqBody) {
	const response = await client.put(`settings/update-permissions`, reqBody);
	return response;
}

export async function getOrgMostUsedApps() {
	const response = await clientEmployee.get(`user/me/org-most-used-apps`);
	return response;
}

export async function getDeptMostUsedApps() {
	const response = await clientEmployee.get(`user/me/dept-most-used-apps`);
	return response;
}

export async function getEmployeeMostUsedApps() {
	const response = await clientEmployee.get(`user/me/emp-most-used-apps`);
	return response;
}

export async function addAppToFavourites(appId, bool) {
	const response = await clientEmployee.patch(
		`user/me/application/${appId}/mark-as-favourite`,
		{
			is_favourite: bool,
		}
	);
	return response.data;
}

export async function getEmployeeUsageGraphData(
	start_month,
	end_month,
	start_year,
	end_year
) {
	const response = await clientEmployee.get(`users/me/usage/applications2`, {
		params: {
			start_month,
			end_month,
			start_year,
			end_year,
		},
	});
	return response.data;
}

export async function getAppOverview(appId) {
	const response = await clientEmployee.get(
		`user/me/application/${appId}/get-app-overview`
	);
	return response.data;
}

export async function searchGlobalAppsForEmployees(
	query,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await clientEmployee.get(
		`user/me/global-applications/search?q=${query}`,
		options
	);
	return response;
}

export async function addLicenseRequest(reqBody) {
	const response = await clientEmployee.post(
		`user/me/license-request`,
		reqBody
	);
	return response.data;
}

export async function getRequestLicenseOverview(id) {
	const response = await clientEmployee.get(`user/me/request-license/${id}`);
	return response.data;
}

export async function getLicenseRequestChangeLog(id) {
	const response = await clientEmployee.get(`user/me/get-changelogs/${id}`);
	return response.data;
}

export async function changeStatusOfLicenseRequest(reqBody) {
	const response = await clientEmployee.post(
		`user/me/change-request-license-status`,
		reqBody
	);
	return response.data;
}

export async function updateRequestLicense(reqBody, id) {
	const response = await clientEmployee.put(
		`user/me/license-request/${id}`,
		reqBody
	);
	return response.data;
}

export async function updateRequestLicenseApprovers(reqBody, id) {
	const response = await clientEmployee.patch(
		`user/me/${id}/add-rearrange-approvers`,
		reqBody
	);
	return response.data;
}

export async function getApproversOfARequest(reqBody) {
	const response = await clientEmployee.post(
		`user/me/get-approvers-from-rule`,
		reqBody
	);
	return response.data;
}

export async function cancelRequest(id) {
	const response = await clientEmployee.patch(`user/me/cancel-request`, {
		request_license_id: id,
	});
}

export async function getAppLicenses(appId, query, cancelTokenSource = null) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await clientEmployee.get(
		`user/me/application/${appId}/license-search?q=${query}`,
		options
	);
	return response.data;
}

export async function getCommentsOfARequest(id) {
	const response = await clientEmployee.get(
		`user/me/request-license-comment/${id}`
	);
	return response;
}

export async function saveNewCommentOfARequest(reqBody) {
	const response = await clientEmployee.post(`user/me/add-comment`, reqBody);
	return response.data;
}

export async function searchUsersEmployeeDashboard(
	query,
	cancelTokenSource = null,
	compact
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await clientEmployee.get(
		`user/me/users/search?q=${query}&search_entity=users&compact=${compact}`,
		options
	);
	return response.data;
}

export async function performActionOnBehalfOfAdmin(id, reqObj) {
	const response = await client.patch(
		`workflows/app-requisition/${id}/take-action`,
		reqObj
	);
	return response.data;
}

export async function performStatusChangeFromAdminBoard(id, reqObj) {
	const response = await client.patch(
		`workflows/app-requisition/${id}/take-action-by-procure-user`,
		reqObj
	);
	return response.data;
}
export async function getAppRequisitionRequestList(reqBody, page, row) {
	const response = await clientEmployeeV2.post(
		`user/me/request-licenses-list?page=${page}&row=${row}`,
		reqBody
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getAppRequisitionApprovalsList(reqBody, page, row) {
	const response = await clientEmployeeV2.post(
		`user/me/get-approvals-request?page=${page}&row=${row}`,
		reqBody
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getCompletedAppRequestListForAdmin(reqBody, page, row) {
	const response = await clientV2.post(
		`workflows/apprequisition/list?type=completed&page=${page}&row=${row}`,
		reqBody
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}
export async function getPendingAppRequestListForAdmin(reqBody, page, row) {
	const response = await clientV2.post(
		`workflows/apprequisition/list?type=pending&page=${page}&row=${row}`,
		reqBody
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}
export async function searchRequestsAppRequisition(
	reqBody,
	row,
	cancelTokenSource
) {
	let options = {};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}

	const response = await clientEmployeeV2.post(
		`user/me/request-licenses-list?page=0` + "&row=" + 30,
		reqBody,
		options
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}
export async function searchApprovalsAppRequisition(
	reqBody,
	row,
	cancelTokenSource
) {
	let options = {};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}

	const response = await clientEmployeeV2.post(
		`user/me/get-approvals-request?page=0` + "&row=" + 30,
		reqBody,
		options
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function searchCompletedAppRequestsListForAdmin(
	reqBody,
	row,
	cancelTokenSource
) {
	let options = {};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}

	const response = await clientV2.post(
		`workflows/apprequisition/list?type=completed&page=0` + "&row=" + 30,
		reqBody,
		options
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function searchPendingAppRequestsListForAdmin(
	reqBody,
	row,
	cancelTokenSource
) {
	let options = {};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}

	const response = await clientV2.post(
		`workflows/apprequisition/list?type=pending&page=0` + "&row=" + 30,
		reqBody,
		options
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function appRequestsPropertiesListForAdmin() {
	const response = await clientV2.get(
		`workflows/app-requisition/filters?entity=admin`
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function appRequestsPropertiesList() {
	const response = await clientEmployeeV2.get(
		`app-requisition/filters?entity=employee`
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function overrideAutoReject(id, reqBody) {
	const response = await client.patch(
		`workflows/app-requisition/${id}/override-auto-rejection`,
		reqBody
	);
	return response.data;
}

export async function sendReminderToApprover(requestLicenseId, reqBody) {
	const response = await client.post(
		`workflows/app-requisition/${requestLicenseId}/send-approver-reminder-email
	`,
		reqBody
	);
	return response.data;
}
