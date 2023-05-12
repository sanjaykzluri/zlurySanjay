import { getSearchReqObj } from "common/infiniteTableUtil";
import { sortApplicationsFunction } from "modules/applications/utils/applicationutils";
import { client, clientV2 } from "../../utils/client";

export async function getSearch(key, cancelTokenSource = null) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(`search?q=${key}`, options);
	return response.data;
}

// Search through global and org apps
export async function getAppSearchGlobal(key, cancelTokenSource = null) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(`search-apps?q=${key}`, options);
	let updatedData = sortApplicationsFunction(response.data);
	response.data.results = updatedData;
	return response.data;
}

// Search through global apps (Does NOT include Org apps)
export async function searchGlobalOnlyApps(key, cancelTokenSource = null) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`search-apps?q=${key}&filter_org_apps=true`,
		options
	);
	let updatedData = sortApplicationsFunction(response.data);
	response.data.results = updatedData;
	return response.data;
}

export async function searchAppCompliance(
	appId,
	key,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`applications/${appId}/search-compliance?q=${key}`,
		options
	);
	return response.data;
}

export async function searchAllApps(
	query,
	cancelTokenSource = null,
	compact,
	integrationActionsRequired = false
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`applications/search?q=${query}&compact=${compact}&integration_actions_required=${integrationActionsRequired}`,
		options
	);
	return response.data;
}

export async function searchAllAppsV2(
	reqObj,
	cancelTokenSource = null,
	pageNo = 0,
	row = 30
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	let searchReqObj = {};
	if (!reqObj.filter_by) {
		searchReqObj.filter_by = [
			getSearchReqObj(reqObj, "app_name", "Application Name"),
		];
		searchReqObj.sort_by = [];
		searchReqObj.columns = [];
	} else {
		searchReqObj = reqObj;
	}

	const response = await clientV2.post(
		"applications?page=" + pageNo + "&row=" + row,
		searchReqObj,
		options
	);
	return response.data;
}

export async function searchAllUsersV2(
	reqObj,
	cancelTokenSource = null,
	compact
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	let searchReqObj = {};
	if (!reqObj.filter_by) {
		searchReqObj.filter_by = [
			getSearchReqObj(reqObj, "user_name", "User Name"),
		];
		searchReqObj.sort_by = [];
		searchReqObj.columns = [];
	} else {
		searchReqObj = reqObj;
	}

	const response = await clientV2.post(
		"users?page=0" + "&row=" + 30,
		searchReqObj,
		options
	);
	return response.data;
}
export async function searchAllDepartmentsV2(
	reqObj,
	cancelTokenSource = null,
	compact
) {
	let options = {};
	let searchReqObj = {};
	if (!reqObj.filter_by) {
		searchReqObj.filter_by = [
			getSearchReqObj(reqObj, "dept_name", "Department Name"),
		];
		searchReqObj.sort_by = [];
		searchReqObj.columns = [];
	} else {
		searchReqObj = reqObj;
	}

	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await clientV2.post(
		"departments?page=0" + "&row=" + 30,
		searchReqObj,
		options
	);
	return response.data;
}

export async function searchAppCategories(query, cancelTokenSource = null) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		query
			? `search-app-categories?q=${query}&page=0&row=2000`
			: "search-app-categories?page=0&row=2000",
		options
	);
	return response.data;
}

export async function searchAppSource(query, cancelTokenSource = null) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`sources?sources_for=applications`,
		options
	);
	return response.data;
}

export async function searchDepAppSource(
	id,
	cancelTokenSource = null,
	type = "application"
) {
	let url = `sources?sources_for=user_applications`;
	if (id) {
		url = `sources?sources_for=user_applications&${
			type === "application" ? "app_id" : "user_id"
		}=${id}`;
	}
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(url, options);
	return response.data;
}
export async function searchUserSource(
	query,
	cancelTokenSource = null,
	manual_source_required = true
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`sources?sources_for=users&manual_source_required=${manual_source_required}${
			query ? `&q=${query}` : ""
		}`,
		options
	);
	return response.data;
}

export async function searchUsers(
	query,
	cancelTokenSource = null,
	compact,
	user_active = false,
	dept_id = ''
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`users/search?q=${query}&search_entity=users&compact=${compact}&user_active=${user_active}${
			dept_id ? `&department_id=${dept_id}` : ""
		}`,
		options
	);
	return response.data;
}

export async function searchEntityCustomValues(
	query,
	cancelTokenSource = null,
	compact,
	fieldId,
	curr_module = "applications"
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	let reqBody = { curr_module };
	const response = await client.post(
		`custom-field/${fieldId}?q=${query}`,
		reqBody,
		options
	);
	return response.data;
}

export async function searchUserApplications(
	query,
	userId,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`users/search?q=${query}&search_entity=applications&user_id=${userId}`,
		options
	);
	return response.data;
}

export async function searchVendors(query, cancelTokenSource = null) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(`vendors/search?q=${query}`, options);
	return response.data;
}

export async function searchApplicationTransactions(
	query,
	pageNo,
	rows,
	applicationId,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`applications/search?q=${query}&applicationId=${applicationId}&search_entity=transactions&page=${pageNo}&row=${rows}`,
		options
	);
	return response.data;
}

export async function searchApplicationUsers(
	query,
	applicationId,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`applications/search?q=${query}&applicationId=${applicationId}&search_entity=users`,
		options
	);
	return response.data;
}

export async function searchAllDepartments(query, cancelTokenSource = null) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`departments/search?q=${encodeURIComponent(
			query
		)}&search_entity=departments`,
		options
	);
	return response.data;
}

export async function searchUsersDepartment(
	query,
	cancelTokenSource = null,
	departmentId
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`departments/search?q=${query}&search_entity=users&department_id=${departmentId}`,
		options
	);
	return response.data;
}
export async function searchUsersDepartmentV2(
	departmentId,
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
		`users/${departmentId}?page=0` + "&row=" + 30,
		reqObj,
		options
	);
	return response.data;
}

export async function searchApplicationsDepartment(
	query,
	cancelTokenSource = null,
	departmentId
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`departments/search?q=${query}&search_entity=applications&department_id=${departmentId}`,
		options
	);
	return response.data;
}
export async function searchApplicationsDepartmentV2(
	reqBody,
	cancelTokenSource = null,
	departmentId
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await clientV2.post(
		`applications/${departmentId}?page=0` + "&row=" + 30,
		reqBody,
		options
	);
	return response.data;
}

export async function searchAllUnrecognisedTransactions(
	query,
	pageNo,
	rows,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`transactions/search?q=${query}&search_entity=unrecognized&page=${pageNo}&row=${rows}`,
		options
	);
	return { data: response.data, searchQuery: query };
}

export async function searchAllRecognisedTransactions(
	query,
	pageNo,
	rows,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`transactions/search?q=${query}&search_entity=recognized&page=${pageNo}&row=${rows}`,
		options
	);
	return response.data;
}

export async function searchAllArchivedTransactions(
	query,
	pageNo,
	rows,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`transactions/search?q=${query}&search_entity=archived&page=${pageNo}&row=${rows}`,
		options
	);
	return { data: response.data, searchQuery: query };
}

export async function searchContracts(
	query,
	pageNo,
	rows,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(`contracts/search?q=${query}`, options);
	return response.data;
}

export async function searchAppContracts(
	query,
	pageNo,
	rows,
	appId,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`application/${appId}/license-contracts-search?q=${query}`,
		options
	);
	return response;
}

export async function searchVendorContracts(
	vendorId,
	query,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`vendors/${vendorId}/contracts/search?q=${query}`,
		options
	);
	return response.data;
}

function handleInvalidQueryPayments(error) {
	if (error.response.status === 400) {
		var response = new Response();
		return (response = {
			data: { payment_ccs: [], payment_banks: [], payment_others: [] },
		});
	} else {
		return error;
	}
}

export async function searchAllPaymentMethods(query, cancelTokenSource = null) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client
		.get(`payment_methods/search?q=${query}`, options)
		.catch(handleInvalidQueryPayments);
	return response.data;
}
export async function searchAllPaymentMethodsAuditlogs(
	query,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client
		.get(
			`payment_methods/search?q=${query}&search_entity=auditlogs`,
			options
		)
		.catch(handleInvalidQueryPayments);
	return response.data;
}

export async function searchAllRecognisedTransactionsAuditlogs(
	query,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`transactions/search?q=${query}&search_entity=recognized&page=0&row=30'`,
		options
	);
	let updated_response = { results: [] };
	updated_response.results = response.data.results.results.map((res) => ({
		...res,
		transaction_name:
			res.transaction_description + "_" + res.transaction_app.app_name,
	}));
	return updated_response;
}

export async function searchIntegrationsAuditlogs(
	query,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`integrations/search?q=${query}`,
		options
	);
	return response.data;
}
export async function searchLicenses(query, cancelTokenSource = null) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(`licenses/search?q=${query}`, options);
	return response.data;
}
export async function searchContractsAuditlogs(
	query,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(`contracts/search?q=${query}`, options);
	return response.data;
}
export async function searchAllUploadedTransactions(
	query,
	pageNo,
	rows,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`uploads/search?q=${query}&search_entity=uploads&page=${pageNo}&row=${rows}`,
		options
	);
	return { data: response.data, searchQuery: query };
}

export async function searchUploadedRecognisedTransactions(
	query,
	pageNo,
	rows,
	uploadId,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`uploads/search?q=${query}&search_entity=recognized&page=${pageNo}&row=${rows}&&upload_id=${uploadId}`,
		options
	);
	return response.data;
}

export async function searchUploadedUnrecognisedTransactions(
	query,
	pageNo,
	rows,
	uploadId,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`uploads/search?q=${query}&search_entity=unrecognized&page=${pageNo}&row=${rows}&&upload_id=${uploadId}`,
		options
	);
	return response.data;
}

export async function searchUploadedArchivedTransactions(
	query,
	pageNo,
	rows,
	uploadId,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`uploads/search?q=${query}&search_entity=archived&page=${pageNo}&row=${rows}&&upload_id=${uploadId}`,
		options
	);
	return response.data;
}

export async function searchLicenseContracts(searchQuery, cancelTokenSource) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await client.get(
		`org-license-contracts-search?q=${searchQuery}`,
		options
	);
	return response.data.results;
}

export async function searchApplicationUsersV2(
	appId,
	reqBody,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await clientV2.post(
		`applications/${appId}/users?page=0` + "&row=" + 30,
		reqBody,
		options
	);
	return response.data;
}

export async function searchContractsV2(reqBody, cancelTokenSource = null) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await clientV2.post(
		`contracts?page=0` + "&row=" + 30,
		reqBody,
		options
	);
	return response.data;
}

export async function searchPerpetualV2(reqBody, cancelTokenSource = null) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await clientV2.post(
		`perpetual?page=0` + "&row=" + 30,
		reqBody,
		options
	);
	return response.data;
}

export async function searchSubscriptionV2(reqBody, cancelTokenSource = null) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await clientV2.post(
		`subscriptions?page=0` + "&row=" + 30,
		reqBody,
		options
	);
	return response.data;
}

export async function searchLicensesV2(reqBody, cancelTokenSource = null) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await clientV2.post(
		`license?page=0` + "&row=" + 30,
		reqBody,
		options
	);
	return response.data;
}

export async function searchUserApplicationsV2(
	userId,
	reqBody,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await clientV2.post(
		`users/${userId}/applications?page=0` + "&row=" + 30,
		reqBody,
		options
	);
	return response.data;
}

export async function searchCustomApps(
	searchQuery,
	page,
	row,
	cancelTokenSource
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await client.get(
		`settings/custom-apps?q=${encodeURIComponent(
			searchQuery
		)}&page=${page}&row=${row}`,
		options
	);
	return response.data.custom_apps;
}

export async function searchOnboardingOffboardingUsersV2(
	reqBody,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await clientV2.post(
		`onboarding-offboarding-users?page=0` + "&row=" + 30,
		reqBody,
		options
	);
	return response.data;
}

export function checkSpecialCharacters(
	searchQuery,
	allowFewSpecialChars = false,
	returnKey = false
) {
	if (!searchQuery) {
		return;
	}
	let invalidKey;

	const whiteListedCharsForSearching = "@,&_*+.#"; //for reference
	const splChars = allowFewSpecialChars
		? "<>!$%^()[]{}?:;|'\"\\~`="
		: "<>@!#$%^&*()_+[]{}?:;|'\"\\,~`=";
	for (let i = 0; i < splChars.length; i++) {
		if (searchQuery.indexOf(splChars[i]) > -1) {
			invalidKey = splChars[i];
			return returnKey ? invalidKey : true;
		}
	}
	return false;
}

export async function searchAppTags(query, cancelTokenSource = null) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`applications/app-tags/search?q=${query}&page=0&row=2000`,
		options
	);
	return response.data;
}

export async function searchAppCategoriesInFilters(
	query,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`applications/categories/search?q=${query}&page=0&row=2000`,
		options
	);
	return response.data;
}
