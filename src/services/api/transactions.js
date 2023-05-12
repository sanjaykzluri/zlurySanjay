import { trackActionSegment } from "modules/shared/utils/segment";
import { filterPropertiesHelper } from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";
import { client, clientV2 } from "../../utils/client";
import _ from "underscore";
import { getValueFromLocalStorage } from "utils/localStorage";

export async function getRecognisedTransactions(
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

	const response = await client.get("transactions/recognized", options);
	return response.data;
}

export async function getRecognisedTransactionsV2(
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
	let url = "transactions/recognized?page=" + page + "&row=" + row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `transactions/recognized?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}

	const response = await clientV2.post(url, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getRecognisedTransactionsProperties() {
	const response = await clientV2.get(`transactions/recognized/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function getUnRecognisedTransactionsV2(
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
	let url = "transactions/unrecognized?page=" + page + "&row=" + row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `transactions/unrecognized?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}

	const response = await clientV2.post(url, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getUnrecognisedTransactions(
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
	const response = await client.get("transactions/unrecognized", options);
	return response.data;
}

export async function getArchivedTransactions(
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
	const response = await client.get("transactions/archived", options);
	return response.data;
}

export async function getArchivedV2(
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
	let url = "transactions/archived?page=" + page + "&row=" + row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `transactions/archived?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}

	const response = await clientV2.post(url, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getUploads(page, row, cancelTokenSource = null) {
	let options = {
		params: {
			page,
			row,
		},
	};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	const response = await client.get("uploads", options);
	return response.data;
}

export async function getUploadsV2(
	reqBody,
	page,
	row,
	cancelTokenSource,
	searchReqParams
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
	const response = await clientV2.post(`uploads`, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function searchUploadsV2(
	reqBody,
	row,
	cancelTokenSource,
	searchReqParams,
	page = 0
) {
	let options = {};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	let url = "uploads?page=" + page + "&row=" + row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `uploads?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}

	const response = await clientV2.post(url, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function searchRecognisedTransactionsV2(
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
	let url = "transactions/recognized?page=" + page + "&row=" + row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `transactions/recognized?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}

	const response = await clientV2.post(url, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function searchUnrecognisedTransactionsV2(
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
	let url = "transactions/unrecognized?page=" + page + "&row=" + row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `transactions/unrecognized?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}

	const response = await clientV2.post(url, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function searchArchivedTransactionsV2(
	reqBody,
	row,
	cancelTokenSource,
	searchReqParams,
	page = 0
) {
	let options = {};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	let url = "transactions/archived?page=" + page + "&row=" + row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `transactions/archived?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}

	const response = await clientV2.post(url, reqBody, options);
	return response.data;
}

export async function searchRecognisedUploadsV2(
	reqBody,
	row,
	uploadId,
	cancelTokenSource,
	searchReqParams,
	page = 0
) {
	let options = {};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	let url =
		`uploads/${uploadId}/transactions/recognized?page=` +
		page +
		"&row=" +
		row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `uploads/${uploadId}/transactions/recognized?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}

	const response = await clientV2.post(url, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function searchUnecognisedUploadsV2(
	reqBody,
	row,
	uploadId,
	cancelTokenSource,
	searchReqParams,
	page = 0
) {
	let options = {};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	let url =
		`uploads/${uploadId}/transactions/unrecognized?page=` +
		page +
		"&row=" +
		row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `uploads/${uploadId}/transactions/unrecognized?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}

	const response = await clientV2.post(url, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function searchArchivedUploadsV2(
	reqBody,
	row,
	uploadId,
	cancelTokenSource,
	searchReqParams,
	page = 0
) {
	let options = {};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	let url =
		`uploads/${uploadId}/transactions/archived?page=` +
		page +
		"&row=" +
		row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `uploads/${uploadId}/transactions/archived?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}

	const response = await clientV2.post(url, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getRecognisedUploadsV2(
	reqBody,
	page,
	row,
	uploadId,
	cancelTokenSource,
	searchReqParams
) {
	let options = {};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	let url =
		`uploads/${uploadId}/transactions/recognized?page=` +
		page +
		"&row=" +
		row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `uploads/${uploadId}/transactions/recognized?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}

	const response = await clientV2.post(url, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getUnrecognisedUploadsV2(
	reqBody,
	page,
	row,
	uploadId,
	cancelTokenSource,
	searchReqParams
) {
	let options = {};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	let url =
		`uploads/${uploadId}/transactions/unrecognized?page=` +
		page +
		"&row=" +
		row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `uploads/${uploadId}/transactions/unrecognized?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}

	const response = await clientV2.post(url, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getArchivedUploadsV2(
	reqBody,
	page,
	row,
	uploadId,
	cancelTokenSource,
	searchReqParams
) {
	let options = {};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	let url =
		`uploads/${uploadId}/transactions/archived?page=` +
		page +
		"&row=" +
		row;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `uploads/${uploadId}/transactions/archived?is_search=${true}&search_query=${encodeURIComponent(
			searchReqParams?.search_query
		)}&page=${page}&row=${row}`;
	}

	const response = await clientV2.post(url, reqBody, options);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response.data;
}

export async function getTransactionsPropertiesList(type = "recognized") {
	const response = await clientV2.get(`transactions/filters?type=${type}`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function getPaymentMethods() {
	const response = await client.get("payment_methods");
	return response.data;
}

export async function getUploadsRecognized(
	page,
	row,
	uploadId,
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
		`uploads/${uploadId}/transactions/recognized`,
		options
	);
	return response.data;
}
export async function getUploadsUnrecognized(
	page,
	row,
	uploadId,
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
		`uploads/${uploadId}/transactions/unrecognized`,
		options
	);
	return response.data;
}
export async function getUploadsArchived(
	page,
	row,
	uploadId,
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
		`uploads/${uploadId}/transactions/archived`,
		options
	);
	return response.data;
}

export async function addTransaction(transaction) {
	const response = await client.post("transaction/manual", transaction);
	return response.data;
}
export async function setPMTransBulk(
	transactions,
	payment_method_id,
	set_all,
	filter_by = [],
	type
) {
	const response = await client.put("transactions/payment-method", {
		transactions,
		payment_method_id,
		set_all,
		filter_by,
		type,
	});
	return response.data;
}
export async function setTransArchiveBulk(transactions) {
	const response = await client.put("transactions/archive", {
		transactions,
	});
	return response.data;
}
export async function setTransUnarchiveBulk(transactions) {
	const response = await client.put("transactions/unarchive", {
		transactions,
	});
	return response.data;
}

export async function unAssignTransBulk(transactions) {
	const response = await client.put("transactions/applications/unassign", {
		transactions,
	});
	return response.data;
}
export async function assignTransaction(assignObj) {
	const response = await client.put(
		"transactions/applications/assign",
		assignObj
	);
	if (response.status === 200) {
		trackActionSegment(
			"Applications Assigned to Transactions",
			{
				additionalInfo: assignObj,
			},
			true
		);
	}
	return response.data;
}
export async function editPaymentMethod(paymentId, payment) {
	const response = await client.put(`payment_methods/${paymentId}`, payment);
	return response.data;
}
export async function deactivateUpload(uploadId) {
	const response = await client.get(`uploads/${uploadId}/deactivate`);
	return response.data;
}
export async function activateUpload(uploadId) {
	const response = await client.get(`uploads/${uploadId}/activate`);
	return response.data;
}
export async function addPaymentMethodNew(payment) {
	const response = await client.post("payment_methods", payment);
	return response.data;
}

export async function deletePaymentMethod(paymentId) {
	const response = await client.delete(`payment_methods/${paymentId}`);
	return response.data;
}

export async function getSimilarTransactions(body) {
	const response = await client.post(
		"transactions/similar-transactions",
		body
	);
	return response.data;
}

export async function addUpload(file, onUploadProgress) {
	const data = new FormData();

	var myHeaders = new Headers();
	const token = getValueFromLocalStorage("token");
	myHeaders.append("Authorization", `Bearer ${token}`);
	data.append("", file);
	data.append("type", "transactions");
	const response = await client.post("uploads", data, { onUploadProgress });
	// var requestOptions = {
	//   method: 'POST',
	//   headers:myHeaders,
	//   body: data,
	//   redirect: 'follow'
	// };
	// console.log(myHeaders)
	// const response = fetch("https://api-dev.zluri.com/organization/5f9954c3675c935faca95cfe/uploads", requestOptions)
	return response.data;
}

export async function processUpload(uploadObj) {
	uploadObj.source_url = decodeURI(uploadObj.source_url);
	const { data } = await client.post("process-upload", uploadObj);
	return data;
}

export async function getMiniTrendCharts() {
	const response = await client.get(`transactions/mini-trend`);
	return response.data;
}

export async function exportRecognisedTransCSV(exportRequestObj) {
	const response = await client.post(
		`transactions/recognized-file-export`,
		exportRequestObj
	);
	return response.data;
}
export async function getRecognisedTransactionsPropertiesList() {
	const response = await clientV2.get(`transactions/recognized/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function exportRecognisedTransactionCSV(req) {
	const response = await client.post(
		`transactions/recognized-file-export`,
		req
	);
	return response.data;
}

export async function getUnrecognisedTransactionsPropertiesList() {
	const response = await clientV2.get(`transactions/unrecognized/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function exportUnrecognisedTransactionCSV(req) {
	const response = await client.post(
		`transactions/unrecognized-file-export`,
		req
	);
	return response.data;
}

export async function getArchivedTransactionsPropertiesList() {
	const response = await clientV2.get(`transactions/archived/filters`);
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function exportArchivedTransactionCSV(req) {
	const response = await client.post(
		`transactions/archived-file-export`,
		req
	);
	return response.data;
}

export async function setTransactionsArchiveBulk(reqBody) {
	const response = await client.put("transactions/archive", reqBody);
	return response.data;
}

export async function unAssignTransactionsBulk(reqBody) {
	const response = await client.put(
		"transactions/applications/unassign",
		reqBody
	);
	return response.data;
}

export async function getSimilarAssignedTransactions(body) {
	const response = await client.post(
		"transactions/similar-assigned-transactions",
		body
	);
	return response.data;
}

export async function retryTransactionUploadCSV(uploadId) {
	const response = await client.post(`uploads/${uploadId}/retry`);
	return response.data;
}

export async function runSpendTrigger(startDate, appId) {
	const url = appId
		? `applications/${appId}/calculate-spends`
		: "calculate-spends";
	const response = await client.post(url, { start_date: startDate });
	return response.data;
}

export async function getOrgTriggerStatus() {
	const response = await client.get(`trigger-status`);
	return response.data;
}
