import { transactionConstants } from "../constants";
import {
	getArchivedTransactions,
	getRecognisedTransactions,
	getUnrecognisedTransactions,
	getPaymentMethods,
	getUploads,
	getUploadsRecognized,
	getUploadsUnrecognized,
	getUploadsArchived,
} from "../services/api/transactions";
import { client } from "../utils/client";
import _ from "underscore";
import Axios from "axios";
import { TriggerIssue } from "../utils/sentry";

export function checkAndFetchRecog(page, row, cancelToken) {
	var pagination = "page_" + page?.toString() + "_" + row?.toString();
	return async function (dispatch, getState) {
		if (getState().transactions.recognisedTransactions.data[pagination]) {
			return;
		} else {
			dispatch(fetchRecognisedTransactions(page, row, cancelToken));
		}
	};
}

export function fetchRecognisedTransactions(page, row, cancelToken) {
	var isCancelled = false;
	if (cancelToken.current?.token) {
		cancelToken.current.cancel(
			"Operation cancelled in favor of a new request"
		);
		isCancelled = true;
	}
	return async function (dispatch) {
		try {
			dispatch({
				type: transactionConstants.RECOGNISED_TRANSACTIONS_REQUESTED,
			});
			cancelToken.current = client.CancelToken.source();
			const response = await getRecognisedTransactions(
				page,
				row,
				cancelToken.current
			);
			if (!response.error) {
				dispatch({
					type: transactionConstants.RECOGNISED_TRANSACTIONS_FETCHED,
					payload: {
						data: response.transactions,
						count: response.total_count,
						page_no: page,
						rows: row,
					},
				});
			} else {
				throw new Error(response.error);
			}
		} catch (err) {
			dispatch({
				type: transactionConstants.RECOGNISED_TRANSACTIONS_FETCHED,
				payload: {
					err,
					data: [],
					loading: isCancelled,
				},
			});
		}
	};
}

export function refreshAllRecognisedTransPages(pages) {
	return async function (dispatch) {
		const requestArray = [];
		try {
			if (Array.isArray(pages) && pages?.length > 0) {
				dispatch({
					type: transactionConstants.RECOGNISED_TRANSACTIONS_REQUESTED,
				});
				_.map(pages, function (pageObj) {
					requestArray.push(
						getRecognisedTransactions(
							Number.parseInt(pageObj.page),
							Number.parseInt(pageObj.row)
						)
					);
				});
				Axios.all(requestArray).then(
					Axios.spread((...responses) => {
						responses.map((response, index) => {
							if (
								response?.transactions?.length >= 0 &&
								!response?.error &&
								Array.isArray(response?.transactions)
							) {
								dispatch({
									type: transactionConstants.RECOGNISED_TRANSACTIONS_FETCHED,
									payload: {
										data: response.transactions,
										count: response.total_count,
										page_no: pages[index].page,
										rows: pages[index].row,
									},
								});
							}
						});
					})
				);
			}
		} catch (error) {
			TriggerIssue(
				"Error when refreshing All pages of recognisedTransactions",
				error
			);
		}
	};
}

export function checkAndFetchUnRecog(page, row, cancelToken) {
	var pagination = "page_" + page?.toString() + "_" + row?.toString();
	return async function (dispatch, getState) {
		if (getState().transactions.unrecognisedTransactions.data[pagination]) {
			return;
		} else {
			dispatch(fetchUnrecognisedTransactions(page, row, cancelToken));
		}
	};
}

export function fetchUnrecognisedTransactions(page, row, cancelToken) {
	var isCancelled = false;
	if (cancelToken.current?.token) {
		cancelToken.current.cancel(
			"Operation cancelled in favor of a new request"
		);
		isCancelled = true;
	}
	return async function (dispatch, getState) {
		try {
			dispatch({
				type: transactionConstants.UNRECOGNISED_TRANSACTIONS_REQUESTED,
			});
			cancelToken.current = client.CancelToken.source();
			const response = await getUnrecognisedTransactions(
				page,
				row,
				cancelToken.current
			);
			dispatch({
				type: transactionConstants.UNRECOGNISED_TRANSACTIONS_FETCHED,
				payload: {
					data: response.transactions,
					count: response.total_count,
					page_no: page,
					rows: row,
				},
			});
		} catch (err) {
			dispatch({
				type: transactionConstants.UNRECOGNISED_TRANSACTIONS_FETCHED,
				payload: {
					err,
					loading: isCancelled,
				},
			});
		}
	};
}

export function refreshAllUnrecognisedTransPages(pages) {
	return async function (dispatch) {
		const requestArray = [];
		try {
			if (Array.isArray(pages) && pages?.length > 0) {
				dispatch({
					type: transactionConstants.UNRECOGNISED_TRANSACTIONS_REQUESTED,
				});
				_.map(pages, function (pageObj) {
					requestArray.push(
						getUnrecognisedTransactions(
							Number.parseInt(pageObj.page),
							Number.parseInt(pageObj.row)
						)
					);
				});
				Axios.all(requestArray).then(
					Axios.spread((...responses) => {
						responses.map((response, index) => {
							if (
								response?.transactions?.length >= 0 &&
								!response?.error &&
								Array.isArray(response?.transactions)
							) {
								dispatch({
									type: transactionConstants.UNRECOGNISED_TRANSACTIONS_FETCHED,
									payload: {
										data: response.transactions,
										count: response.total_count,
										page_no: pages[index].page,
										rows: pages[index].row,
									},
								});
							}
						});
					})
				);
			}
		} catch (error) {
			TriggerIssue(
				"Error when refreshing all pages in unrecognisedTransactions",
				error
			);
		}
	};
}

export function checkAndFetchArchived(page, row, cancelToken) {
	var pagination = "page_" + page?.toString() + "_" + row?.toString();
	return async function (dispatch, getState) {
		if (getState().transactions.archivedTransactions.data[pagination]) {
			return;
		} else {
			dispatch(fetchArchivedTransactions(page, row, cancelToken));
		}
	};
}

export function fetchArchivedTransactions(page, row, cancelToken) {
	var isCancelled = false;
	if (cancelToken.current?.token) {
		cancelToken.current.cancel(
			"Operation cancelled in favor of a new request"
		);
		isCancelled = true;
	}
	return async function (dispatch) {
		try {
			dispatch({
				type: transactionConstants.ARCHIVED_REQUESTED,
			});
			cancelToken.current = client.CancelToken.source();
			const response = await getArchivedTransactions(
				page,
				row,
				cancelToken.current
			);
			dispatch({
				type: transactionConstants.ARCHIVED_FETCHED,
				payload: {
					data: response.transactions,
					count: response.total_count,
					page_no: page,
					rows: row,
				},
			});
		} catch (err) {
			dispatch({
				type: transactionConstants.ARCHIVED_FETCHED,
				payload: {
					err,
					loading: isCancelled,
				},
			});
		}
	};
}

export function refreshAllArchivedTransPages(pages) {
	return async function (dispatch) {
		const requestArray = [];
		try {
			if (Array.isArray(pages) && pages?.length > 0) {
				dispatch({
					type: transactionConstants.ARCHIVED_REQUESTED,
				});
				_.map(pages, function (pageObj) {
					requestArray.push(
						getArchivedTransactions(
							Number.parseInt(pageObj.page),
							Number.parseInt(pageObj.row)
						)
					);
				});
				Axios.all(requestArray).then(
					Axios.spread((...responses) => {
						responses.map((response, index) => {
							if (
								response?.transactions?.length >= 0 &&
								!response?.error &&
								Array.isArray(response?.transactions)
							) {
								dispatch({
									type: transactionConstants.ARCHIVED_FETCHED,
									payload: {
										data: response.transactions,
										count: response.total_count,
										page_no: pages[index].page,
										rows: pages[index].row,
									},
								});
							}
						});
					})
				);
			}
		} catch (error) {
			TriggerIssue(
				"Error when refreshing all pages in archived Transactions",
				error
			);
		}
	};
}

export function fetchPaymentMethods() {
	return async function (dispatch) {
		dispatch({
			type: transactionConstants.PAYMENT_METHODS_REQUESTED,
		});
		try {
			const response = await getPaymentMethods();
			dispatch({
				type: transactionConstants.PAYMENT_METHODS_FETCHED,
				payload: {
					data: response.data,
				},
			});
		} catch (err) {
			dispatch({
				type: transactionConstants.PAYMENT_METHODS_FETCHED,
				payload: { err },
			});
			TriggerIssue("Error in fetching payment methods", err);
		}
	};
}

export function checkAndFetchUploads(page, row, forceFetch, cancelToken) {
	var pagination = "page_" + page?.toString() + "_" + row?.toString();
	return async function (dispatch, getState) {
		if (getState().transactions.uploads.data[pagination]) {
			return;
		} else {
			dispatch(fetchUploads(page, row, forceFetch, cancelToken));
		}
	};
}

export function fetchUploads(page, row, forceFetch = false, cancelToken) {
	var isCancelled = false;
	if (cancelToken?.current) {
		cancelToken.current.cancel(
			"Operation cancelled in favor of a new request"
		);
		isCancelled = true;
	}
	var pagination = "page_" + page?.toString() + "_" + row?.toString();
	return async function (dispatch, getState) {
		try {
			if (
				getState().transactions.uploads.data[pagination] &&
				!forceFetch
			) {
				return;
			} else {
				dispatch({
					type: transactionConstants.UPLOADS_REQUESTED,
				});
			}
			cancelToken.current = client.CancelToken.source();
			const response = await getUploads(page, row, cancelToken.current);
			dispatch({
				type: transactionConstants.UPLOADS_FETCHED,
				payload: {
					data: response.uploads,
					count: response.total_count,
					page_no: page,
					rows: row,
				},
			});
		} catch (err) {
			dispatch({
				type: transactionConstants.UPLOADS_FETCHED,
				payload: {
					err,
					loading: isCancelled,
				},
			});
		}
	};
}

export function checkAndFetchUploadsRecognized(
	page,
	row,
	uploadId,
	cancelToken
) {
	var pagination = "page_" + page?.toString() + "_" + row?.toString();
	return async function (dispatch, getState) {
		const uploads = getState().transactions.uploadsrecognized[uploadId];
		if (uploads?.data && uploads?.data[pagination]) {
			return;
		} else {
			dispatch(fetchUploadsRecognized(page, row, uploadId, cancelToken));
		}
	};
}

export function fetchUploadsRecognized(page, row, uploadId, cancelToken) {
	if (cancelToken.current?.token) {
		cancelToken.current.cancel(
			"Operation cancelled in favor of a new request"
		);
	}
	return async function (dispatch) {
		try {
			dispatch({
				type: transactionConstants.UPLOADS_RECOG_REQUESTED,
				payload: {
					id: uploadId,
				},
			});
			cancelToken.current = client.CancelToken.source();
			const response = await getUploadsRecognized(
				page,
				row,
				uploadId,
				cancelToken.current
			);
			dispatch({
				type: transactionConstants.UPLOADS_RECOG_FETCHED,
				payload: {
					data: response.transactions,
					count: response.total_count,
					page_no: page,
					id: uploadId,
					rows: row,
				},
			});
		} catch (err) {
			dispatch({
				type: transactionConstants.UPLOADS_RECOG_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}

export function refreshAllUploadsRecognisedTransPages(pages, uploadId) {
	return async function (dispatch) {
		const requestArray = [];
		try {
			if (Array.isArray(pages) && pages?.length > 0) {
				dispatch({
					type: transactionConstants.UPLOADS_RECOG_REQUESTED,
					payload: {
						id: uploadId,
					},
				});
				_.map(pages, function (pageObj) {
					requestArray.push(
						getUploadsRecognized(
							Number.parseInt(pageObj.page),
							Number.parseInt(pageObj.row),
							uploadId
						)
					);
				});
				Axios.all(requestArray).then(
					Axios.spread((...responses) => {
						responses.map((response, index) => {
							if (
								response?.transactions?.length >= 0 &&
								!response?.error &&
								Array.isArray(response?.transactions)
							) {
								dispatch({
									type: transactionConstants.UPLOADS_RECOG_FETCHED,
									payload: {
										data: response.transactions,
										count: response.total_count,
										page_no: pages[index].page,
										rows: pages[index].row,
										id: uploadId,
									},
								});
							}
						});
					})
				);
			}
		} catch (error) {
			TriggerIssue(
				"Error when refreshing all pages in uploadsRecognised Transactions",
				error
			);
		}
	};
}

export function checkAndFetchUploadsUnrecognized(
	page,
	row,
	uploadId,
	cancelToken
) {
	var pagination = "page_" + page?.toString() + "_" + row?.toString();
	return async function (dispatch, getState) {
		const uploads = getState().transactions.uploadsunrecognized[uploadId];
		if (uploads?.data && uploads?.data[pagination]) {
			return;
		} else {
			dispatch(
				fetchUploadsUnrecognized(page, row, uploadId, cancelToken)
			);
		}
	};
}

export function fetchUploadsUnrecognized(page, row, uploadId, cancelToken) {
	var isCancelled = false;
	if (cancelToken.current?.token) {
		cancelToken.current.cancel(
			"Operation cancelled in favor of a new request"
		);
		isCancelled = true;
	}
	return async function (dispatch) {
		try {
			dispatch({
				type: transactionConstants.UPLOADS_UNRECOG_REQUESTED,
				payload: {
					id: uploadId,
				},
			});
			cancelToken.current = client.CancelToken.source();
			const response = await getUploadsUnrecognized(
				page,
				row,
				uploadId,
				cancelToken.current
			);
			dispatch({
				type: transactionConstants.UPLOADS_UNRECOG_FETCHED,
				payload: {
					data: response.transactions,
					count: response.total_count,
					page_no: page,
					id: uploadId,
					rows: row,
				},
			});
		} catch (err) {
			dispatch({
				type: transactionConstants.UPLOADS_UNRECOG_FETCHED,
				payload: {
					err,
					loading: isCancelled,
				},
			});
		}
	};
}

export function refreshAllUploadsUnRecognisedTransPages(pages, uploadId) {
	return async function (dispatch) {
		const requestArray = [];
		try {
			if (Array.isArray(pages) && pages?.length > 0) {
				dispatch({
					type: transactionConstants.UPLOADS_UNRECOG_REQUESTED,
					payload: {
						id: uploadId,
					},
				});
				_.map(pages, function (pageObj) {
					requestArray.push(
						getUploadsUnrecognized(
							Number.parseInt(pageObj.page),
							Number.parseInt(pageObj.row),
							uploadId
						)
					);
				});
				Axios.all(requestArray).then(
					Axios.spread((...responses) => {
						responses.map((response, index) => {
							if (
								response?.transactions?.length >= 0 &&
								!response?.error &&
								Array.isArray(response?.transactions)
							) {
								dispatch({
									type: transactionConstants.UPLOADS_UNRECOG_FETCHED,
									payload: {
										data: response.transactions,
										count: response.total_count,
										page_no: pages[index].page,
										rows: pages[index].row,
										id: uploadId,
									},
								});
							}
						});
					})
				);
			}
		} catch (error) {
			TriggerIssue(
				"Error when refreshing all pages in uploadsUnRecognised Transactions",
				error
			);
		}
	};
}

export function checkAndFetchUploadsArchived(page, row, uploadId, cancelToken) {
	var pagination = "page_" + page?.toString() + "_" + row?.toString();
	return async function (dispatch, getState) {
		const uploads = getState().transactions.uploadsarchived[uploadId];
		if (uploads?.data && uploads?.data[pagination]) {
			return;
		} else {
			dispatch(fetchUploadsArchived(page, row, uploadId, cancelToken));
		}
	};
}

export function fetchUploadsArchived(page, row, uploadId, cancelToken) {
	if (cancelToken.current?.token) {
		cancelToken.current.cancel(
			"Operation cancelled in favor of a new request"
		);
	}
	var pagination = "page_" + page?.toString() + row?.toString();
	return async function (dispatch, getState) {
		try {
			if (getState().transactions.uploadsarchived.data[pagination]) {
				return;
			} else {
				dispatch({
					type: transactionConstants.UPLOADS_ARC_REQUESTED,
					payload: {
						id: uploadId,
					},
				});
				cancelToken.current = client.CancelToken.source();
				const response = await getUploadsArchived(
					page,
					row,
					uploadId,
					cancelToken.current
				);
				dispatch({
					type: transactionConstants.UPLOADS_ARC_FETCHED,
					payload: {
						data: response.transactions,
						count: response.total_count,
						page_no: page,
						id: uploadId,
						rows: row,
					},
				});
			}
		} catch (err) {
			dispatch({
				type: transactionConstants.UPLOADS_ARC_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}

export function refreshAllUploadsArchivedTransPages(pages, uploadId) {
	return async function (dispatch) {
		const requestArray = [];
		try {
			if (Array.isArray(pages) && pages?.length > 0) {
				dispatch({
					type: transactionConstants.UPLOADS_ARC_REQUESTED,
					payload: {
						id: uploadId,
					},
				});
				_.map(pages, function (pageObj) {
					requestArray.push(
						getUploadsArchived(
							Number.parseInt(pageObj.page),
							Number.parseInt(pageObj.row),
							uploadId
						)
					);
				});
				Axios.all(requestArray).then(
					Axios.spread((...responses) => {
						responses.map((response, index) => {
							if (
								response?.transactions?.length >= 0 &&
								!response?.error &&
								Array.isArray(response?.transactions)
							) {
								dispatch({
									type: transactionConstants.UPLOADS_ARC_FETCHED,
									payload: {
										data: response.transactions,
										count: response.total_count,
										page_no: pages[index].page,
										rows: pages[index].row,
										id: uploadId,
									},
								});
							}
						});
					})
				);
			}
		} catch (error) {
			TriggerIssue(
				"Error when refreshing all pages in uploadsUnArchived Transactions",
				error
			);
		}
	};
}

export function resetTransactionsState() {
	return async function (dispatch) {
		try {
			dispatch({ type: transactionConstants.RESET_TRANSACTIONS });
		} catch (error) {
			console.log("Error in resetting transactions", error);
		}
	};
}
