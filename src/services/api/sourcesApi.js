import { client } from "../../utils/client";

export async function getSourceMetaDetails(id, sourceId, type) {
	var response;
	try {
		response = await client.get(
			`user-app/${id}?sourceId=${sourceId}&compact=1&type=${type}`
		);
	} catch (error) {
		return { error: error };
	}
	return response;
}

export async function getSourceDetails(id, sourceId, type) {
	var response;
	try {
		response = await client.get(
			`user-app/${id}?sourceId=${sourceId}&compact=0&type=${type}`
		);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function getManualUsage(id) {
	const response = await client.get(
		`user-app/${id}?sourceId=manual&compact=1&type=agent`
	);
	return response.data;
}

export async function getUsageActivityDetails(id) {
	var response;
	try {
		response = await client.get(`user-app/${id}/activity`);
	} catch (error) {
		return { error: error };
	}
	return response;
}

export async function markSourcePrimary(userAppId, sourceId) {
	var response;
	try {
		response = await client.put(
			`user-app/${userAppId}/mark-source-as-primary?sourceId=${sourceId}`
		);
	} catch (error) {
		return { error: error };
	}
	return response;
}
