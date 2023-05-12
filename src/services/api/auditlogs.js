import { filterPropertiesHelper } from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";
import { client } from "../../utils/client";

export async function getAllAuditlogsV2(reqBody, page, row, cancelTokenSource) {
	let options = {
		params: {
			page,
			row,
		},
	};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	const response = await client.post(`auditlogs`, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getAllAuditlogsPropertiesList() {
	const response = await client.get(`auditlogs/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}
export async function postComment(auditID, comment) {
	let body = {
		comment: {
			description: comment,
			is_manual: true,
		},
	};
	const response = await client.post(`auditlogs/${auditID}/comment`, body);
	return response.data;
}

export async function exportAuditlogsCSV(exportRequestObj) {
	const response = await client.post(
		`auditlogs/file-export`,
		exportRequestObj
	);
	return response.data;
}
