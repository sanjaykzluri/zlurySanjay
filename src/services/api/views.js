import { client, clientV3 } from "../../utils/client";
import { clientV2 } from "../../utils/client";

export async function fetchViewsList(screen_tag, appId) {
	let url = `views?screen_tag=${screen_tag}`;
	if (appId) {
		url = `views?screen_tag=${screen_tag}&appId=${appId}`;
	}
	const response = await client.get(url, {});
	return response.data;
}

export async function saveCustomViewService(reqBody) {
	const response = await client.post("view", reqBody);
	return response.data;
}
export async function deleteCustomView(viewId) {
	const response = await client.delete(`view/${viewId}`);
	return response.data;
}
export async function saveAsDefaultView(viewId, screenTag = "1", appId) {
	let reqBody = {
		screen_tag: screenTag,
	};
	if (appId) reqBody.appId = appId;
	const response = await client.put(`view/${viewId}/default`, reqBody);
	return response.data;
}

export async function patchView(viewId, patchObj) {
	const response = await client.patch(`view/${viewId}`, patchObj);
	return response.data;
}
