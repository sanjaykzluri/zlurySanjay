import { filterPropertiesHelper } from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";
import { includeKeysInOverviewResponse } from "../../modules/Agents/constants/AgentConstants";
import { client, clientV2 } from "../../utils/client";
import _ from "underscore";

export async function getAgents() {
	const response = await client.get(`agents`);
	return response.data;
}
export async function getAgentsUsers(
	filter,
	query,
	page,
	row,
	cancelTokenSource = null
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await client.get(
		`agents/users?filter=${filter}&q=${query}&page=${page}&row=${row}`,
		options
	);
	return response.data;
}

export async function getAgentUsersV2(
	reqBody,
	page,
	row,
	cancelTokenSource,
	searchReqParams
) {
	let options = {};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	let url = "agents/users?page=" + page + "&row=" + row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `agents/users?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}

	const response = await clientV2.post(url, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getAgentUsersProperties() {
	const response = await clientV2.get(`agents/users/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function searchAgentsUsers(
	reqBody,
	page,
	row,
	cancelTokenSource,
	searchReqParams
) {
	let options = {};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	let url = "agents/users?page=" + page + "&row=" + row;

	const response = await clientV2.post(url, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getSingleAgentOverview(agentId) {
	const response = await client.get(
		`agents/${agentId}?include_fields=${includeKeysInOverviewResponse}`
	);
	return response.data;
}

export async function sendPrompts(req) {
	const response = await client.put("agents/prompts", req);
	return response.data;
}

export async function sendPromptsOverview(agentId) {
	const response = await client.put(`agents/${agentId}/prompts`);
	return response.data;
}

export async function sendPromptsAgentsNotInstalled() {
	const response = await client.put(`agents/not-installed/prompts`);
	return response.data;
}
