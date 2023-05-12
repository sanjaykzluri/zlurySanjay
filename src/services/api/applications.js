import { trackActionSegment } from "modules/shared/utils/segment";
import { filterPropertiesHelper } from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";
import { TriggerIssue } from "utils/sentry";
import { client, clientV3 } from "../../utils/client";
import { clientV2 } from "../../utils/client";
import _ from "underscore";

export async function getAllApplications(
	reqObj,
	page,
	row,
	cancelTokenSource = null,
	searchReqParams
) {
	let options = {};
	let url = "applications?page=" + page + "&row=" + row;
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `applications?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}

	const response = await clientV2.post(url, reqObj, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getAllApplicationsV1(
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
	const response = await client.get("applications", options);
	return response.data;
}

export async function getApplicationInfo(applicationId) {
	const response = await client.get(`applications/${applicationId}`);
	return response.data;
}
export async function getGlobalHealthCards() {
	const response = await client.get("cards");
	return response.data;
}

export async function getAppHealthCards(appId, tab = "all") {
	const response = await client.get(
		`applications/${appId}/health-insights?tab=${tab}`
	);
	return response.data;
}

export async function getAppHealthCard(appId, cardId) {
	const response = await client.get(
		`applications/${appId}/health-insights?card_id=${cardId}`
	);
	return response.data;
}

export async function getAppHealthChangeLogs(appId) {
	const response = await client.get(`applications/${appId}/change-logs`);
	return response.data;
}

export async function addComplianceDocument(appId, complianceId, body) {
	const response = await client.put(
		`applications/${appId}/compliance/${complianceId}/documents/add`,
		body
	);
	return response;
}

export async function updateComplianceStatus(appId, complianceId, body) {
	const response = await client.put(
		`applications/${appId}/compliance/${complianceId}/status`,
		body
	);
	return response;
}

export async function updateUserActiveTabs(tabs) {
	const response = await client.put(`activetabs/user`, { tabs });
	return response.data;
}

export async function updateApplicationActiveTabs(tabs) {
	const response = await client.put(`activetabs/application`, { tabs });
	return response.data;
}

export async function updateApplicationDefaultTabs(defaultTab) {
	const response = await client.put(`default-tab/application`, {
		default_tab: defaultTab,
	});
	return response.data;
}

export async function updateUserDefaultTabs(defaultTab) {
	const response = await client.put(`default-tab/user`, {
		default_tab: defaultTab,
	});
	return response.data;
}

export async function updateManualRisk(appId, risk) {
	const response = await client.put(
		`applications/${appId}/manual-risk-level`,
		{
			manual_risk_level: risk,
		}
	);
	return response;
}

export async function getVendorInfo(vendorId) {
	const response = await client.get(`vendors/${vendorId}`);
	return response.data;
}
export async function getVendorContracts(
	page,
	row,
	vendorId,
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
	const response = await client.get(`vendors/${vendorId}/contracts`, options);
	return response.data;
}
export async function getApplicationsActionHistory(appId) {
	const response = await client.get(`applications/${appId}/action-history`);
	return response.data;
}

export async function getUserApplicationsActionHistory(userId, appId) {
	const response = await client.get(
		`user/${userId}/applications/${appId}/action-history`
	);
	return response.data;
}

export async function getAllContracts(page, row, cancelTokenSource = null) {
	let options = {
		params: {
			page,
			row,
		},
	};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}

	const response = await client.get("contracts", options);
	return response.data;
}

export async function getAllVendors(page, row, cancelTokenSource = null) {
	let options = {
		params: {
			page,
			row,
		},
	};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}

	const response = await client.get("vendors", options);
	return response.data;
}

export async function getSingleApplicationContractInfo(
	page,
	row,
	applicationId,
	cancelTokenSource = null
) {
	let options = {
		params: {
			page,
			row,
			applicationId,
		},
	};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	const response = await client.get("contracts", options);
	return response.data;
}
export async function getSingleApplicationLicenseContracts(
	page,
	row,
	applicationId,
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
	const response = await client.get(
		`application/${applicationId}/licensecontracts`,
		options
	);
	return response;
}
export async function getRenewals() {
	const response = await client.get("renewals");
	return response.data;
}
export async function getUpcomingRenewals() {
	const response = await client.get("renewals/upcoming");
	return response.data;
}

export async function getContractInfo(contractId) {
	const response = await client.get(`licensecontracts/${contractId}`);
	return response.data;
}

export async function updateApplication(applicationId, application) {
	Object.keys(application).forEach((key) => {
		if (application[key] === "") {
			delete application[key];
		}
	});
	let url = !application.app_is_custom
		? `applications/${applicationId}`
		: `applications/custom/${applicationId}`;
	const response = await client.put(url, application);
	return response.data;
}

export async function updateAppOwner(applicationId, app_owner_id) {
	const response = await client.put(`applications/${applicationId}`, {
		app_owner_id: app_owner_id ? app_owner_id : null,
	});
	return response.data;
}

export async function addLicenseContract(contractObj) {
	const response = await client.post("licensecontracts", contractObj);
	return response.data;
}

export async function deleteVendorDocument(vendorId, documentId) {
	const response = await client.put(
		`vendors/${vendorId}/documents/${documentId}`
	);
	return response.data;
}

export async function addDocumentToVendor(vendorId, documentObj) {
	const response = await client.post(
		`vendors/${vendorId}/documents`,
		documentObj
	);
	return response.data;
}

export async function addApplication(applicationObj) {
	Object.keys(applicationObj).forEach((key) => {
		if (!applicationObj[key] || applicationObj[key] === "") {
			delete applicationObj[key];
		}
	});
	const response = await client.post("applications", applicationObj);
	return response.data;
}

export async function addCompliance(appId, complianceObj) {
	const response = await client.post(
		`applications/${appId}/compliance`,
		complianceObj
	);
	return response.data;
}

export async function updateCompliance(appId, complianceObj, complianceId) {
	const response = await client.put(
		`applications/${appId}/compliance/${complianceId}`,
		complianceObj
	);
	return response.data;
}

export async function addCustomCompliance(appId, complianceObj) {
	const response = await client.post(
		`applications/${appId}/compliance/custom`,
		complianceObj
	);
	return response.data;
}

export async function addVendor(vendorObj) {
	const response = await client.post("vendors", vendorObj);
	return response.data;
}

export async function addCustomApplication(applicationObj) {
	Object.keys(applicationObj).forEach((key) => {
		if (!applicationObj[key]) {
			delete applicationObj[key];
		}
	});
	const response = await client.post("applications/custom", applicationObj);
	return response.data;
}

export async function getSpendGraphData(
	applicationId,
	start_month,
	end_month,
	start_year,
	end_year
) {
	const response = await client.get(
		`applications/${applicationId}/spend/departments2`,
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
export async function getUsageGraphData(
	applicationId,
	start_month,
	end_month,
	start_year,
	end_year
) {
	const response = await client.get(
		`applications/${applicationId}/usage/departments2`,
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
export async function getSingleApplicationUsersInfo(
	applicationId,
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
		`applications/${applicationId}/users`,
		options
	);
	return response.data;
}

export async function setDepartmentSplitDefault(appId, DSobj) {
	const response = await client.put(
		`applications/${appId}/department-split`,
		DSobj
	);
	return response.data;
}

export async function setDepartmentSplitManual(appId, DSobj) {
	const response = await client.put(
		`applications/${appId}/department-split`,
		DSobj
	);
	return response.data;
}

export async function getSingleApplicationTransactions(
	applicationId,
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
		`applications/${applicationId}/transactions`,
		options
	);
	return response.data;
}

export async function setAppsBulkAuth(
	app_new_auth,
	app_ids,
	filter_by = [],
	set_all
) {
	const response = await client.put("applications/batch/authorization", {
		app_new_auth,
		app_ids,
		filter_by,
		set_all,
	});
	if (response.status === 200) {
		trackActionSegment(
			"Changed Authorization Status of Apps",
			{
				"New Auth": app_new_auth,
				app_ids: app_ids,
				filter_by: filter_by,
			},
			true
		);
	}
	return response.data;
}

export async function setAppsBulkTags(
	app_tags,
	app_ids,
	filter_by = [],
	set_all
) {
	const response = await client.put("applications/batch/tags", {
		app_tags,
		app_ids,
		filter_by,
		set_all,
	});
	return response.data;
}

export async function setAppsBulkStatus(
	app_new_status,
	app_ids,
	filter_by = [],
	set_all
) {
	const response = await client.put("applications/batch/status", {
		app_new_status,
		app_ids,
		filter_by,
		set_all,
	});
	return response.data;
}

export async function setAppsBulkOwner(
	app_new_owner,
	app_ids,
	filter_by = [],
	set_all
) {
	const response = await client.put("applications/batch/owner", {
		app_new_owner,
		app_ids,
		filter_by,
		set_all,
	});
	return response.data;
}

export async function setAppsBulkType(
	app_new_type,
	app_ids,
	filter_by = [],
	set_all
) {
	const response = await client.put("applications/batch/type", {
		app_type: app_new_type,
		app_ids,
		filter_by,
		set_all,
	});
	return response.data;
}

export async function getMiniTrendCharts() {
	const response = await client.get(`applications/mini-trends-chart`);
	return response.data;
}

export async function patchApplication(appId, patchObj) {
	const response = await client.patch(`applications/${appId}`, patchObj);
	return response.data;
}

function handleRequestToSimilarAndAlternateApps(error) {
	var response = new Response();
	response = { data: {} };
	return response;
}

export async function getSimilarAndAlternateApps(
	appId,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await client
		.get(`applications/${appId}/alternate`, options)
		.catch(handleRequestToSimilarAndAlternateApps);
	return response.data;
}

export async function mapToApp(appId, parentAppId) {
	const response = await client.get(
		`applications/${appId}/map-app/${parentAppId}`
	);
	return response.data;
}

export async function mergeApps(appId, parentAppId) {
	const response = await client.get(
		`applications/${appId}/merge-app/${parentAppId}`
	);
	return response.data;
}

export async function editContract(contractObj) {
	const response = await client.put(
		`licensecontracts/${contractObj.contract_id}`,
		contractObj
	);
	return response.data;
}

export async function editVendor(vendorObj, vendor_id) {
	const response = await client.put(`vendors/${vendor_id}/vendor`, vendorObj);
	return response.data;
}

export async function archiveApplications(app_ids, filter_by = [], set_all) {
	if (Array.isArray(app_ids) && app_ids.length > 0) {
		const response = await client.put(`applications/batch/archive`, {
			status: true,
			app_ids: app_ids,
			filter_by: filter_by,
			set_all: set_all,
		});
		return response.data;
	} else {
		return { error: "Expected array of app ids" };
	}
}

export async function unArchiveApplications(app_ids, filter_by = [], set_all) {
	if (Array.isArray(app_ids) && app_ids.length > 0) {
		const response = await client.put(`applications/batch/archive`, {
			status: false,
			app_ids: app_ids,
			filter_by: filter_by,
			set_all: set_all,
		});
		return response.data;
	} else {
		return { error: "Expected array of app ids" };
	}
}

export async function exportApplicationsCSV(exportRequestObj) {
	const response = await client.post(
		`applications/file-export`,
		exportRequestObj
	);
	return response.data;
}

export async function getAppPropertiesList() {
	const response = await clientV2.get(`applications/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function getAppUserPropertiesList() {
	const response = await clientV2.get(`applications/users/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function exportApplicationUserCSV(req, id) {
	const response = await client.post(
		`applications/${id}/users-file-export`,
		req
	);
	return response.data;
}

export async function bulkUpdateAppData(fileKey) {
	const response = await client.post(
		`bulk-import/applications?fileKey=${fileKey}`
	);
	return response;
}

export async function getAllLicenseContracts(page, row, cancelTokenSource) {
	let options = {
		params: {
			page,
			row,
		},
	};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	const response = await client.get(`allorglicensecontracts`, options);
	return response.data;
}

export async function deleteVendor(vendorId) {
	const response = await client.post(`vendors/${vendorId}/remove`);
	return response.data;
}

export async function getAllLicenseContractsV2(
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
	const response = await clientV2.post(`licensecontracts`, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getAllLicenseContractsPropertiesList() {
	const response = await clientV2.get(`licensecontracts/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function getApplicationLicenseContractsV2(
	appId,
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
		`applications/${appId}/licensecontracts`,
		reqBody,
		options
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getApplicationContractsPropertiesList() {
	const response = await clientV2.get(`applications/contracts/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function getVendorLicenseContractsV2(
	vendorId,
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
		`vendors/${vendorId}/contracts`,
		reqBody,
		options
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getVendorContractsPropertiesList() {
	const response = await clientV2.get(`vendors/contracts/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function getLicensesForLicenseContract(id) {
	const response = await client.get(`licensecontract/${id}/getlicenses`);
	return response.data;
}

export async function getAllVendorsV2(
	reqBody,
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

	const response = await clientV2.post("vendors", reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getVendorPropertiesList() {
	const response = await clientV2.get(`vendors/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function patchLicenseContract(contract_id, patchObj) {
	const response = await client.patch(
		`licensecontract/${contract_id}`,
		patchObj
	);
	return response.data;
}

export async function patchVendors(vendor_id, patchObj) {
	const response = await client.patch(`vendors/${vendor_id}`, patchObj);
	return response.data;
}

export async function getApplicationUsersV2(
	appId,
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
		`applications/${appId}/users`,
		reqBody,
		options
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function exportAllLicenseContractsCSV(exportRequestObj) {
	const response = await client.post(
		`licensecontracts/file-export`,
		exportRequestObj
	);
	return response.data;
}

export async function getApplicationSecurityOverview(appId) {
	let response = {};
	try {
		response = await client.get(
			`applications/${appId}/security-compliance`
		);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function getApplicationSecurityEvents(appId) {
	let response = {};
	try {
		response = await client.get(`applications/${appId}/events`);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function getApplicationSecurityDataShared(appId) {
	let response = {};
	try {
		response = await client.get(
			`applications/${appId}/data-shared?scopes_gte=all`
		);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}
export async function getApplicationComplianceDetails(appId, complianceId) {
	let response = {};
	try {
		response = await client.get(
			`applications/${appId}/compliance/${complianceId}`
		);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function getApplicationCompliance(appId) {
	let response = {};
	try {
		response = await client.get(`applications/${appId}/compliance`);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function getApplicationSecurityProbes(appId) {
	let response = {};
	try {
		response = await client.get(`applications/${appId}/security-probes`);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function appSecurityRescan(appId) {
	let response = {};
	try {
		response = await client.put(
			`applications/${appId}/security-probes/rescan`
		);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function updatedHost(appId, host) {
	let response = {};
	try {
		response = await client.put(
			`applications/${appId}/security-probes/host-name`,
			{
				host: host ? host : null,
			}
		);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function getApplicationCostTrend(appId) {
	const response = await client.get(`applications/${appId}/cost-trend`);
	return response.data;
}

export async function getApplicationSpendTrend(appId) {
	const response = await client.get(`applications/${appId}/spend-trend`);
	return response.data;
}

export async function getVendorCostTrend(vendorId) {
	const response = await client.get(`vendors/${vendorId}/cost-trend`);
	return response.data;
}

export async function getVendorSpendTrend(vendorId) {
	const response = await client.get(`vendors/${vendorId}/spend-trend`);
	return response.data;
}

export async function getApplicationLicensesPropertiesList(appId) {
	const response = await clientV2.get(
		`applications/${appId}/licenses/filters`
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function getApplicationLicensesV2(
	appId,
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
		`application/${appId}/licenses`,
		reqBody,
		options
	);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;

	return response.data;
}

export async function getApplicationSpendVSEstCostGraph(
	appId,
	period = "month",
	start_month,
	start_year,
	end_month,
	end_year
) {
	const response = await clientV2.get(
		`applications/${appId}/spend?period=${period}&start_month=${start_month}&start_year=${start_year}&end_month=${end_month}&end_year=${end_year}`
	);
	return response.data;
}

export async function getVendorSpendVSEstCostGraph(
	vendorId,
	period = "month",
	start_month,
	start_year,
	end_month,
	end_year
) {
	const response = await clientV2.get(
		`vendors/${vendorId}/spend?period=${period}&start_month=${start_month}&start_year=${start_year}&end_month=${end_month}&end_year=${end_year}`
	);
	return response.data;
}

export async function getApplicationUsersCostTrend(userId, appId) {
	const response = await client.get(
		`applications/${appId}/users/${userId}/cost-trend`
	);
	return response.data;
}

export async function getApplicationUsersSpendTrend(userId, appId) {
	const response = await client.get(
		`applications/${appId}/users/${userId}/spend-trend`
	);
	return response.data;
}

export async function bulkEditAppArchive(
	app_ids,
	status,
	filter_by = [],
	set_all
) {
	const response = await client.put(`applications/batch/archive`, {
		app_ids,
		status,
		filter_by,
		set_all,
	});
	return response.data;
}

export async function getApplicationRecommendations(appId) {
	const response = await client.get(`applications/${appId}/recommendation`);
	return response.data;
}

export async function exportMonthWiseSpendCSV(exportRequestObj) {
	const response = await client.post(
		`applications/spend-file-export`,
		exportRequestObj
	);
	return response.data;
}

export async function sendRestrictedAppEmail(app_ids) {
	const response = await client.post("applications/restricted-apps-email", {
		app_ids: app_ids,
	});
	return response.data;
}

export async function getAppTabCount() {
	const response = await client.get("applications/tab-count");
	return response.data;
}

export async function exportAlternateAppsCSV(exportRequestObj) {
	const response = await client.post(
		`applications/alternate-apps-file-export`,
		exportRequestObj
	);
	return response.data;
}

export async function bulkArchiveAppUsers(appId, reqObj) {
	const response = await client.post(
		`applications/${appId}/user-app-archive`,
		reqObj
	);
	return response.data;
}

export async function bulkUnarchiveAppUsers(appId, reqObj) {
	const response = await client.post(
		`applications/${appId}/user-app-unarchive`,
		reqObj
	);
	return response.data;
}

export async function bulkArchiveUnarchiveVendors(archive, vendorIds) {
	try {
		const response = await client.put(`vendors/batch/archive`, {
			status: archive,
			vendor_ids: vendorIds,
		});
		return response.data;
	} catch (err) {
		TriggerIssue(
			`Error while ${archive ? "archiving" : "unarchiving"} vendors`,
			err
		);
		return err;
	}
}

export async function bulkDeleteVendors(vendorIds) {
	try {
		const response = await client.put(`vendors/batch/remove`, {
			vendor_ids: vendorIds,
		});
		return response.data;
	} catch (err) {
		TriggerIssue(`Error while deleting vendors`, err);
	}
}

export async function exportOptimizationSummaryReport(exportRequestObj) {
	const response = await client.post(
		`optimization-summary/file-export`,
		exportRequestObj
	);
	return response.data;
}

export async function exportSecurityComplianceReport(exportRequestObj) {
	const response = await client.post(
		`applications/security-compliance-file-export`,
		exportRequestObj
	);
	return response.data;
}

export async function exportDepartmentSpend(exportRequestObj) {
	const response = await client.post(
		`departments/spend-file-export`,
		exportRequestObj
	);
	return response.data;
}

export async function exportUserCost(exportRequestObj) {
	const response = await client.post(
		`users/cost-file-export`,
		exportRequestObj
	);
	return response.data;
}

export async function exportAppCost(exportRequestObj) {
	const response = await client.post(
		`applications/cost-file-export`,
		exportRequestObj
	);
	return response.data;
}

export async function exportDeptCost(exportRequestObj) {
	const response = await client.post(
		`departments/cost-file-export`,
		exportRequestObj
	);
	return response.data;
}

export async function setAppPrimarySource(appId, body) {
	const response = await client.put(
		`application/${appId}/primary-source`,
		body
	);
	return response.data;
}

export async function deleteDocumentOfCompliance({
	documentId,
	appId,
	complianceId,
}) {
	const response = await client.delete(
		`applications/${appId}/compliance/${complianceId}/documents/${documentId}`
	);
	return response.data;
}

export async function addAppUsersByEmails(appId, emails) {
	const response = await client.post(
		`application/${appId}/add-users-by-email`,
		{ emails }
	);
	return response.data;
}

export async function updateApplicationPrimarySourceSettings(appId, body) {
	const response = await client.put(
		`application/${appId}/primary-source-settings`,
		body
	);
	return response.data;
}

export async function exportUpcomingRenewals(body) {
	const response = await client.post(`renewals/file-export`, body);
	return response.data;
}
