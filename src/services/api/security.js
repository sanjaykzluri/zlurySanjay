import { filterPropertiesHelper } from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";
import { getValueFromLocalStorage } from "utils/localStorage";
import { client } from "../../utils/client";
import { clientV2 } from "../../utils/client";
export async function getAllCritcialApps(
	page,
	row,
	reqObj,
	cancelTokenSource = null
) {
	let options = {};

	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await clientV2.post(
		`security/critical-apps?page=${page}&row=${row}`,
		reqObj,
		options
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;

	return response.data;
}

export async function getAllCritcialUsers(
	page,
	row,
	reqObj,
	cancelTokenSource = null
) {
	let options = {};

	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await clientV2.post(
		`security/critical-users?page=${page}&row=${row}`,
		reqObj,
		options
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;

	return response.data;
}

export async function getCriticalAppsOverview(appId) {
	const orgId = getValueFromLocalStorage("userInfo")?.org_id;
	const response = await client.get(
		`organization/${orgId}/applications/${appId}/overview`
	);

	return response;
}

export async function getCriticalUsersOverview(userId) {
	const orgId = getValueFromLocalStorage("userInfo")?.org_id;
	const response = await client.get(
		`organization/${orgId}/users/${userId}/overview?risk=3`
	);

	return response.data;
}

export async function getAllCritcialUsersforApps(
	appId,
	page = 0,
	row = 10,
	risk = 3
) {
	const response = await client.get(
		`applications/${appId}/critical-users?page=${page}&row=${row}&risk=3`
	);
	return response.data;
}

export async function getAllCritcialAppsforUsers(
	userId,
	page = 0,
	row = 10,
	risk = 3
) {
	const response = await client.get(
		`users/${userId}/critical-apps?page=${page}&row=${row}&risk=3`
	);
	return response.data;
}

export async function getAllCritcialUsersforAppsWithFilter(
	appId,
	page = 0,
	row = 10,
	risk = 3,
	obj
) {
	const response = await client.post(
		`applications/${appId}/filter-critical-users?page=${page}&row=${row}`,
		obj
	);
	return response.data;
}

export async function getAllCritcialAppsforUsersWithFilter(
	userId,
	page = 0,
	row = 10,
	risk = 3,
	obj
) {
	const response = await client.post(
		`users/${userId}/filter-critical-apps?page=${page}&row=${row}`,
		obj
	);
	return response.data;
}

export async function searchAllCriticalAppsV2(
	page,
	row,
	reqObj,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await clientV2.post(
		`security/critical-apps?page=${page}&row=${row}`,
		reqObj,
		options
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function searchAllCriticalUsersV2(
	reqObj,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await clientV2.post(
		`security/critical-users?page=0` + "&row=" + 30,
		reqObj,
		options
	);
	return response.data;
}

export async function getCriticalUsersPropertiesList() {
	const response = await clientV2.get(`security/critical-users/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function getCriticalAppsPropertiesList() {
	const response = await clientV2.get(`security/critical-apps/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function exportCriticalUsersCSV(req) {
	const response = await client.post(
		"security/critical-users/file-export",
		req
	);
	return response.data;
}
