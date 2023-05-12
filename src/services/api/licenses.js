import { trackActionSegment } from "modules/shared/utils/segment";
import { filterPropertiesHelper } from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";
import { TriggerIssue } from "utils/sentry";
import { client, clientV2 } from "../../utils/client";
import _ from "underscore";

export async function getAllLicensesV2(
	reqBody,
	page,
	row,
	cancelTokenSource,
	searchReqParams
) {
	let options = {};
	let url = "license?page=" + page + "&row=" + row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `license?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}

	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	const response = await clientV2.post(url, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getAllLicensesPropertiesList() {
	const response = await clientV2.get(`licenses/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function getAllContractsV2(
	reqBody,
	page,
	row,
	cancelTokenSource,
	searchReqParams
) {
	let options = {};
	let url = "contracts?page=" + page + "&row=" + row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `contracts?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	const response = await clientV2.post(url, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getAllContractsPropertiesList() {
	const response = await clientV2.get(`contracts/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function getContractOverviewDetails(contract_id) {
	const response = await client.get(`contracts/${contract_id}`);
	return response.data;
}

export async function getAllSubsV2(
	reqBody,
	page,
	row,
	cancelTokenSource,
	searchReqParams
) {
	let options = {};
	let url = "subscriptions?page=" + page + "&row=" + row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `subscriptions?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	const response = await clientV2.post(url, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;

	return response.data;
}

export async function getAllSubsPropertiesList() {
	const response = await clientV2.get(`subscriptions/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function getPerpetualsPropertiesList() {
	const response = await clientV2.get(`perpetual/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function getAllPerpetuals(
	reqBody,
	page,
	row,
	cancelTokenSource,
	searchReqParams
) {
	let options = {};
	let url = "perpetual?page=" + page + "&row=" + row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `perpetual?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	const response = await clientV2.post(url, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function addContractV2(reqBody) {
	const response = await client.post("contracts", reqBody);
	return response.data;
}

export async function editContractV2(reqBody, contractId) {
	const response = await client.put(`contracts/${contractId}`, reqBody);
	return response.data;
}

export async function patchSingleContract(contract_id, patchObj) {
	const response = await client.patch(`contracts/${contract_id}`, patchObj);
	return response.data;
}

export async function getUnmappedLicenseData(contractId) {
	const response = await client.get(
		`contract/${contractId}/unmappedLicenses`
	);
	return response.data;
}

export async function fetchInitialLicences(
	appId,
	searchQuery,
	cancelTokenSource
) {
	var response;
	let options = {};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	try {
		response = await client.get(
			`application/${appId}/contracts/get-initial-licenses${
				searchQuery ? `?q=${searchQuery}` : ""
			}`,
			options
		);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}
export async function fetchOwnerSuggestions(appId) {
	let response;
	try {
		response = await client.get(`application/${appId}/owner-suggestion`);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function fetchVendorSuggestions(appId) {
	let response;
	try {
		response = await client.get(`application/${appId}/vendor-suggestion`);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function editLicenseForAUser(reqBody, licenseId, appId, userId) {
	const response = await client.put(
		`application/${appId}/user/${userId}/license/${licenseId}`,
		reqBody
	);
	return response.data;
}

export async function mapLicensesRequest(id, reqBody) {
	const response = await client.post(
		`application/${id}/licenses/assign`,
		reqBody
	);
	if (response.status === 200) {
		trackActionSegment(
			"License Assigned Manually",
			{
				additionalInfo: reqBody,
			},
			true
		);
	}
	return response.data;
}

export async function getMappedIntergrationAccounts(contractId) {
	const response = await client.get(
		`contract/${contractId}/mappedIntegrations`
	);
	return response.data;
}

export async function unmapLicensesRequest(id, reqBody) {
	const response = await client.post(
		`application/${id}/licenses/unassign`,
		reqBody
	);
	return response.data;
}

export async function getOrphanLicenses(appId) {
	const response = await client.get(
		`getOrphanLicenses${appId ? `?appId=${appId}` : ""}`
	);
	return response.data;
}

export async function searchApplicationLicenseSuggestions(appId, query) {
	const response = await client.get(
		`application/${appId}/license-names/search?q=${query}`
	);
	return response.data;
}

export async function bulkUpdatePaymentMethods(
	contract_ids,
	payment_method_id
) {
	const response = await client.put(`contracts/batch/payment-method`, {
		contract_ids: contract_ids,
		payment_method_id: payment_method_id,
	});
	return response.data;
}

export async function bulkArchiveUnarchive(
	contract_ids,
	archive,
	editLicenses
) {
	const response = await client.put(`contracts/batch/archive-unarchive`, {
		contract_ids: contract_ids,
		archive: archive,
		edit_licenses: editLicenses,
	});
	return response.data;
}

export async function bulkDelete(contract_ids, deleteLicenses) {
	const response = await client.put(`contracts/batch/delete`, {
		contract_ids: contract_ids,
		delete_licenses: deleteLicenses,
	});
	return response.data;
}

export async function getLicenseListForAnApp(appId) {
	const response = await client.get(`applications/${appId}/getLicenseList`);
	return response.data;
}

export async function bulkArchiveUnarchiveLicenses(license_ids, archive) {
	const response = await client.put(`licenses/batch/archive-unarchive`, {
		license_ids: license_ids,
		archive: archive,
	});
	return response.data;
}

export async function bulkDeleteLicenses(license_ids) {
	const response = await client.put(`licenses/batch/delete`, {
		license_ids: license_ids,
	});
	return response.data;
}

export async function getLicenseTabCount() {
	const response = await client.get(`license-contract/tab-count`);
	return response.data;
}

export async function bulkChangeStatus(contract_ids, status) {
	const response = await client.put(`contracts/batch/status`, {
		contract_ids: contract_ids,
		status: status,
	});
	return response.data;
}

export async function addDocumentToContract(contractId, document) {
	try {
		const response = await client.put(`contract/${contractId}/document`, {
			...document,
		});
		return response.data;
	} catch (error) {
		TriggerIssue("Error while adding document to contract", error);
		return error;
	}
}

export async function editDocumentOfContract(contractId, documentId, document) {
	try {
		const response = await client.put(
			`contract/${contractId}/document/${documentId}`,
			{
				name: document.name,
				doc_type: document.doc_type,
			}
		);
		return response.data;
	} catch (error) {
		TriggerIssue("Error while editing document to contract", error);
		return error;
	}
}

export async function deleteDocumentOfContract(contractId, documentId) {
	try {
		const response = await client.delete(
			`contract/${contractId}/document/${documentId}`
		);
		return response.data;
	} catch (error) {
		TriggerIssue("Error while deleting document to contract", error);
		return error;
	}
}

export async function addCustomReminder(contract_id, type, date) {
	const response = await client.put(`contract/${contract_id}/reminder`, {
		type: type,
		date: date,
	});
	return response.data;
}

export async function deleteCustomReminder(contract_id, reminder_id) {
	const response = await client.delete(
		`contract/${contract_id}/reminder/${reminder_id}`
	);
	return response.data;
}

export async function editCustomReminder(contract_id, reminder_id, type, date) {
	const response = await client.put(
		`contract/${contract_id}/reminder/${reminder_id}`,
		{
			type: type,
			date: date,
		}
	);
	return response.data;
}

export async function exportLicensesCSV(exportRequestObj) {
	const response = await client.post(
		`licenses/file-export`,
		exportRequestObj
	);
	return response.data;
}

export async function exportContractCSV(exportRequestObj) {
	const response = await client.post(
		`license-contract/file-export`,
		exportRequestObj
	);
	return response.data;
}

export async function exportSubscriptionCSV(exportRequestObj) {
	const response = await client.post(
		`license-subscription/file-export`,
		exportRequestObj
	);
	return response.data;
}

export async function exportPerpetualCSV(exportRequestObj) {
	const response = await client.post(
		`license-perpetual/file-export`,
		exportRequestObj
	);
	return response.data;
}

export async function licenseMapperBulkAssign(appId, contractId, body) {
	const response = await client.post(
		`application/${appId}/contract/${contractId}/licenses/bulkAssign`,
		body
	);
	return response.data;
}

export async function editLicenseCost(licenseId, amount) {
	const response = await clientV2.post(`licenses/${licenseId}`, { amount });
	return response.data;
}
