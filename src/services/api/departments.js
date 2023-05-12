import { filterPropertiesHelper } from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";
import { getValueFromLocalStorage } from "utils/localStorage";
import { client } from "../../utils/client";
import { clientV2 } from "../../utils/client";

export async function getAllDepartments(page, row, cancelTokenSource = null) {
	let options = {
		params: {
			page,
			row,
		},
	};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	const response = await client.get("departments", options);
	return response.data;
}

export async function getAllDepartmentsV2(page, row, reqObj, parentId = '') {
	const response = await clientV2.post(
		"departments?page=" + page + "&row=" + row + `${parentId ? `&parentId=${parentId}`: ''}`,
		reqObj
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getDepartmentUsers(
	id,
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
	const response = await client.get(`departments/${id}/users`, options);
	return response.data;
}

export async function getDepartmentUsersV2(
	page,
	row,
	reqObj,
	departmentId,
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
	const response = await clientV2.post(
		`users/${departmentId}?page=${page}&row=${row}`,
		reqObj
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;

	return response.data;
}

export async function getDepartmentApplications(id, page, row) {
	const response = await client.get(`departments/${id}/applications`, {
		params: {
			page,
			row,
		},
	});
	return response.data;
}

export async function getDepartmentApplicationsV2(
	page,
	row,
	reqObj,
	departmentId
) {
	const response = await clientV2.post(
		`applications/${departmentId}?page=${page}&row=${row}`,
		reqObj
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getDepartmentInfo(departmentId) {
	const response = await client.get(`departments/${departmentId}`);
	return response.data;
}

export async function updateDepartment(departmentId, department) {
	department.orgId = getValueFromLocalStorage("userInfo")?.org_id;
	const response = await client.put(
		`departments/${departmentId}`,
		department
	);
	return response.data;
}

export async function addDepartment(department) {
	department.orgId = getValueFromLocalStorage("userInfo")?.org_id;
	const response = await client.post("departments", department);
	return response.data;
}

export async function getDepartmentSpendGraphData(
	departmentId,
	start_month,
	end_month,
	start_year,
	end_year
) {
	const response = await client.get(
		`departments/${departmentId}/spend/applications2`,
		{
			params: {
				start_month,
				end_month,
				start_year,
				end_year,
			},
		}
	);
	return response.data;
}
export async function getDepartmentUsageGraphData(
	departmentId,
	start_month,
	end_month,
	start_year,
	end_year
) {
	const response = await client.get(
		`departments/${departmentId}/usage/applications2`,
		{
			params: {
				start_month,
				end_month,
				start_year,
				end_year,
			},
		}
	);
	return response.data;
}

export async function getMiniTrendCharts() {
	const response = await client.get(`departments/mini-trends-chart`);
	return response.data;
}

export async function patchDepartments(depId, patchObj) {
	const response = await client.patch(`departments/${depId}`, patchObj);
	return response.data;
}

export async function bulkUpdateDepartmentHead(userId, departmentIds) {
	const response = await client.put(`departments/batch/head`, {
		dept_ids: departmentIds,
		dept_new_head: userId,
	});
	return response.data;
}

export async function addManualUsageToDepartmentUsersAppliction(
	deptId,
	appId,
	manualUsages
) {
	const response = await client.post(
		`departments/${deptId}/add-application/${appId}`,
		{
			manual_usages: manualUsages,
		}
	);
	return response.data;
}

export async function getSingleDepartmentAppInfo(
	id,
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
	const response = await client.get(
		`departments/${id}/applications`,
		options
	);
	return response.data;
}
export async function getSingleDepartmentAppInfoV2(
	id,
	page,
	reqBody,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	const response = await clientV2.post(`applications/${id}`, reqBody);
	return response.data;
}

export async function getDepartmentPropertiesList() {
	const response = await clientV2.get(`departments/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function exportDepartmentCSV(req) {
	const response = await client.post("departments/file-export", req);
	return response.data;
}

export async function getDepartmentApplicationsPropertiesList() {
	const response = await clientV2.get(`departments/applications/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function exportDepartmentApplicationsCSV(req, id) {
	const response = await client.post(
		`departments/${id}/applications-file-export`,
		req
	);
	return response.data;
}

export async function getDepartmentUsersPropertiesList() {
	const response = await clientV2.get(`departments/users/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function exportDepartmentUsersCSV(req, id) {
	const response = await client.post(
		`departments/${id}/users-file-export`,
		req
	);
	return response.data;
}

export async function bulkEditDeptArchive(dept_ids, status) {
	const response = await client.put(`departments/batch/archive`, {
		dept_ids,
		status,
	});
	return response.data;
}

export async function getDeptCostTrend(id) {
	const response = await client.get(`departments/${id}/cost-trend`);
	return response.data;
}

export async function getDeptSpendTrend(id) {
	const response = await client.get(`departments/${id}/spend-trend`);
	return response.data;
}

export async function getDeptApplicationCostTrend(appId, deptId) {
	const response = await client.get(
		`departments/${deptId}/applications/${appId}/cost-trend`
	);
	return response.data;
}

export async function getDeptApplicationSpendTrend(appId, deptId) {
	const response = await client.get(
		`departments/${deptId}/applications/${appId}/spend-trend`
	);
	return response.data;
}

export async function getDeptUserCostTrend(appId, deptId) {
	const response = await client.get(
		`departments/${deptId}/users/${appId}/cost-trend`
	);
	return response.data;
}

export async function getDeptUserSpendTrend(appId, deptId) {
	const response = await client.get(
		`departments/${deptId}/users/${appId}/spend-trend`
	);
	return response.data;
}
