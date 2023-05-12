import { client } from "../../utils/client";

export async function fetchFirstFewRoles(appId) {
	var response;
	try {
		response = await client.get(
			`applications/${appId}/initial-user-app-role`
		);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function updateRole(appId, userIds, role) {
	var response;
	try {
		const requestBody = {
			user_ids: userIds,
			role: role,
		};
		response = await client.post(
			`applications/${appId}/user-app-role`,
			requestBody
		);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function addNewRole(appId, role) {
	var response;
	try {
		const requestBody = {
			role: role,
		};
		response = await client.post(
			`applications/${appId}/app-role`,
			requestBody
		);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function searchUserAppRoles(
	appId,
	searchQuery,
	cancelTokenSource
) {
	var response;
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	try {
		response = await client.get(
			`applications/${appId}/role/search?q=${searchQuery}`,
			options
		);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function unAssignRole(appId, userIds) {
	var response;
	try {
		const requestBody = {
			user_ids: userIds,
		};
		response = await client.put(
			`applications/${appId}/user-app-role`,
			requestBody
		);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}
