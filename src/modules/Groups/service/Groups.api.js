import { client, clientV2 } from "utils/client";
import { filterPropertiesHelper } from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";

export async function getGroupsProperties() {
	const response = await clientV2.get("groups/filters");
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function getGroupsList(
	reqObj,
	page,
	row,
	cancelTokenSource = null
) {
	let options = {};
	let url = "groups?page=" + page + "&row=" + row;
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await clientV2.post(url, reqObj, options);
	return response.data;
}

export async function getGroupSources(cancelTokenSource = null) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(`sources?sources_for=groups`, options);
	return response.data;
}

export async function bulkEditGroupsArchive(
	groups,
	archive,
	filter_by = [],
	set_all
) {
	const response = await client.put(`groups/archive`, {
		groups,
		archive,
		filter_by,
		set_all,
	});
	return response.data;
}
