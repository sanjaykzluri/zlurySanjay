import { client, clientV2 } from "utils/client";
import { integration } from "../../../utils/integration";

export async function getIntegrations() {
	const response = await client.get("global/integrations");
	return response.data;
}

export async function getIntegrationInfo(id) {
	const response = await client.get(`global/integrations/${id}`);
	return response.data;
}

export async function updateIntegrationUserMapping(integrationId, data) {
	return client.post(
		`integrations/${integrationId}/integration-user-keys/map`,
		data
	);
}

export async function searchIntegrationUserMapping(
	page,
	row,
	integrationId,
	filters,
	cancelTokenSource = null
) {
	let options = {
		params: {
			page,
			row,
			type: filters.type,
			q: filters.searchTerm,
		},
	};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	const response = await client.get(
		`integrations/${integrationId}/integration-user-keys/search`,
		options
	);
	return response.data;
}

export async function getIntegrationUserMappingCount(integrationId) {
	const response = await client.get(
		`integrations/${integrationId}/integration-user-keys/count`
	);
	return response.data;
}
export async function getIntegrationScopesAndPermissions(integrationId) {
	const response = await clientV2.get(
		`integrations/${integrationId}/permissions-scopes`
	);
	return response.data;
}

export async function getIntegrationInstanceOverview(integrationId) {
	const response = await clientV2.get(
		`integrations/${integrationId}/overview`
	);
	return response.data;
}

export async function fetchCarousalImages() {
	const response = await clientV2.get(`integrations/featured-images`);
	return response.data;
}

export async function getIntegrationInstanceLogs(integrationId) {
	const response = await client.get(`integrations/${integrationId}/logs`);
	return response.data;
}

export async function getGlobalSearchIntegrations(
	query,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	const response = await clientV2.get(
		`integrations?search_text=${query}`,
		options
	);
	return response.data;
}

export async function getIntegrationUserMapping(
	page,
	row,
	integrationId,
	filters,
	cancelTokenSource = null
) {
	let options = {
		params: {
			page,
			row,
			type: filters.type,
		},
	};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	const response = await client.get(
		`integrations/${integrationId}/integration-user-keys`,
		options
	);
	return response.data;
}

export async function getIntegrationsv2(integrationId) {
	const response = await clientV2.get(
		`integrations/${integrationId}/catalog/overview`
	);
	return response.data;
}

export async function getIntegrationsCapabilities(integrationId) {
	const response = await clientV2.get(
		`integrations/${integrationId}/catalog/capabilities/details`
	);
	return response.data;
}

export async function getIntegrationsHowTo(integrationId) {
	const response = await clientV2.get(
		`integrations/${integrationId}/catalog/how-to`
	);
	return response.data;
}
export async function getIntegrationScopes(
	integrationId,
	selectedFilter,
	cancelTokenSource = null,
	searchQuery = ""
) {
	let options = {};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	let {
		feature = "",
		entity = "",
		type = "",
		plan = "",
	} = { ...selectedFilter };

	if (type?.toLowerCase() === "read") {
		type = true;
	} else if (type?.toLowerCase() === "write") {
		type = false;
	} else {
		type = "all";
	}

	let url = `integrations/${integrationId}/instance-scopes?feature=${feature}&entity=${entity}&plan=${plan}&type=${type}&searchText=${searchQuery}`;

	const response = await clientV2.get(url, options);
	return response.data;
}

export async function getIntegrationWorkflowActions(
	integrationId,
	type = "all"
) {
	const response = await clientV2.get(
		`integrations/${integrationId}/workflows/actions?type=${type}`
	);
	return response.data;
}

export async function getIntegrationFeatures(integrationId, orgIntegrationId) {
	const response = await clientV2.get(
		`integrations/${integrationId}/features`
	);
	return response.data;
}

export async function getIntegrationInstanceScopes(
	integrationId,
	orgIntegrationId,
	featureFilter
) {
	let url = `integrations/${integrationId}/instance/${orgIntegrationId}/scopes`;
	if (featureFilter && featureFilter !== "All") {
		url = `integrations/${integrationId}/instance/${orgIntegrationId}/scopes?feature=${featureFilter}`;
	}
	const response = await clientV2.get(url);
	return response.data;
}
export async function getIntegrationInstanceScopesFilters(integrationId) {
	const response = await clientV2.get(
		`integrations/${integrationId}/features`
	);
	return response.data;
}

//

export async function fetchCategoriesService() {
	const response = await client.get(`integrations/categories`);
	return response.data;
}

export async function fetchCatalogService() {
	const response = await clientV2.get(`integrations/catalog/side-bar`);
	return response.data;
}

export async function fetchIntegrationsService(
	categoryID = "",
	sort_by = "",
	status = null,
	cancelToken = null,
	isCollection,
	isCapability
) {
	let param = isCollection
		? "collection"
		: isCapability
		? "capability"
		: "status";
	let URL = categoryID
		? `integrations?category_id=${categoryID}${
				sort_by ? `&sort_by=${sort_by}` : ""
		  }`
		: `integrations${sort_by ? `?sort_by=${sort_by}` : ""}`;
	URL = status
		? `integrations?${param}=${status}${
				sort_by ? `&sort_by=${sort_by}` : ""
		  }`
		: URL;
	let options = {};
	if (cancelToken) {
		options = {
			cancelToken: cancelToken,
		};
	}
	const response = await clientV2.get(URL, options);
	return response.data;
}

export async function fetchAllIntegrations(cancelToken) {
	let options = {};
	if (cancelToken) {
		options = {
			cancelToken: cancelToken,
		};
	}
	const response = await clientV2.get("integrations", options);
	return response.data;
}

export async function fetchAvailableForPocIntegrations(cancelToken = null) {
	let options = {};
	if (cancelToken) {
		options = {
			cancelToken: cancelToken,
		};
	}
	const response = await clientV2.get("available-for-poc", options);
	return response.data;
}

export async function fetchIntegrationsCollection(
	categoryID = "",
	sort_by = "",
	status = null,
	cancelToken = null
) {
	let URL = categoryID
		? `integrations?category_id=${categoryID}${
				sort_by && `&sort_by=${sort_by}`
		  }`
		: `integrations${sort_by ? `?sort_by=${sort_by}` : ""}`;
	URL = status
		? `integrations?collection=${status}${sort_by && `&sort_by=${sort_by}`}`
		: URL;
	let options = {};
	if (cancelToken) {
		options = {
			cancelToken: cancelToken,
		};
	}
	const response = await clientV2.get(URL, options);
	return response.data;
}

export async function fetchRecommendedIntegrationsService(
	cancelToken,
	sort_by
) {
	let options = {};
	if (cancelToken) {
		options = {
			cancelToken: cancelToken,
		};
	}
	const response = await clientV2.get(
		`integrations/recommended${sort_by ? `?sort_by=${sort_by}` : ""}`,
		options
	);
	return response.data;
}
export async function fetchV2IntegrationByID(itegrationid, cancelToken) {
	let options = {};
	if (cancelToken) {
		options = {
			cancelToken: cancelToken,
		};
	}
	const response = await clientV2.get(
		`global-integrations/${itegrationid}`,
		options
	);
	return response.data;
}

export async function fetchPendingRequestIntegrationsService(
	pageNo,
	query,
	sortBy
) {
	const URL = query
		? `pending-requests/search?q=${query}&page=${pageNo}`
		: sortBy
		? `pending-requests?page=${pageNo}&sort_by=${sortBy}`
		: `pending-requests?page=${pageNo}`;
	const response = await client.get(URL);
	return response.data;
}

export async function remindIntegrationRequestService(inviteId) {
	const response = await client.post(`integrations/resend-invite-email`, {
		invite_id: inviteId,
	});
	return response.data;
}

export async function withdrawIntegrationRequestService(
	integrationID,
	orgInviteId
) {
	const response = await client.put(
		`integrations/${integrationID}/withdraw-request`,
		{
			orgInviteId: orgInviteId,
		}
	);
	return response.data;
}

export async function fetchIntegrationService(id) {
	const response = await clientV2.get(`global-integrations/${id}`);
	return response.data;
}
export async function fetchIntegrationServiceV2(id) {
	const response = await clientV2.get(`integrations/${id}/details`);
	return response.data;
}

export async function SendInvitationToCoworker(data) {
	const response = await integration.post("/invite/add", data);
	return response.data;
}

export async function validateAdminInviteCode(code, otp) {
	const response = await integration.post("/invite/validateTokenWithCode", {
		inviteCode: code,
		invitepasscode: otp,
	});
	return response.data;
}

export async function withdrawInvite(integrationID, orgInviteId) {
	let response;
	try {
		response = await client.put(
			`integrations/${integrationID}/withdraw-request`,
			{
				orgInviteId: orgInviteId,
			}
		);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function reSendInvite(orgInviteId) {
	let response;
	try {
		response = await integration.post(`/invite/resend`, {
			id: orgInviteId,
		});
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function editInviteAccountDetails(inviteId, invitedAccountObject) {
	let response;
	try {
		response = await integration.patch(`admin/orginvite`, {
			id: inviteId,
			name: invitedAccountObject.accountName,
			description: invitedAccountObject.accountDescription,
		});
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function editAccountDetails(accountId, accountObject, code) {
	let response;
	try {
		let url = `admin/orgintegration`;
		if (code) {
			url = `admin/updateOrgintegrationWithCode?code=${code}`;
		}
		response = await integration.patch(url, {
			id: accountId,
			name: accountObject.accountName,
			description: accountObject.accountDescription,
		});
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function removeAccount(orgIntegrationId, userId) {
	let response;
	let reqBody = {
		userId: userId,
	};
	try {
		response = await integration.delete(
			`admin/orgintegration/${orgIntegrationId}`,
			reqBody
		);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function getIntegrationsErrorStatus() {
	let response;
	try {
		response = await clientV2.get("integrations/error-details");
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function getOrgIntegrationSchema(orgIntegrationId) {
	const response = await client.get(
		`integrations/${orgIntegrationId}/integration-schema`
	);
	return response.data;
}

export async function getOrgIntegrationInstanceDataSource(
	integrationId,
	orgIntegrationId
) {
	const response = await client.get(
		`integrations/${integrationId}/instance/${orgIntegrationId}/data-source`
	);
	return response.data;
}

export async function saveOrgIntegrationInstanceDataSource(
	orgIntegrationId,
	data_source
) {
	const response = await client.post(
		`integrations/${orgIntegrationId}/data-source`,
		{ data_source }
	);
	return response.data;
}
