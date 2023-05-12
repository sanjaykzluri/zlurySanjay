import Axios from "axios";
import { isBasicSubscriptionSelector } from "../common/restrictions";
import { applicationConstants, defaults, ENTITIES } from "../constants";
import {
	getAllApplications,
	getAllContracts,
	getContractInfo,
	getRenewals,
	getUpcomingRenewals,
	getApplicationInfo,
	getSingleApplicationUsersInfo,
	getSingleApplicationTransactions,
	getSpendGraphData,
	getUsageGraphData,
	getApplicationsActionHistory,
	getSingleApplicationLicenseContracts,
	getAllLicenseContracts,
	getVendorContracts,
	getApplicationSecurityEvents,
	getApplicationSecurityDataShared,
	getApplicationSecurityProbes,
	getApplicationCompliance,
} from "../services/api/applications";
import { client } from "../utils/client";
import { TriggerIssue } from "../utils/sentry";
import _ from "underscore";
import moment from "moment";

export function fetchAllApplications(page, cancelToken = null) {
	var isCancelled = false;
	if (cancelToken && cancelToken.current?.token) {
		cancelToken.current.token.cancel(
			"Operation cancelled in favor of a new request"
		);
		isCancelled = true;
	}
	return async function (dispatch) {
		dispatch({
			type: applicationConstants.ALL_APPLICATIONS_REQUESTED,
		});
		try {
			if (cancelToken)
				cancelToken.current.token = client.CancelToken.source();
			const response = await getAllApplications(
				page,
				defaults.ALL_APPLICATIONS_ROW,
				cancelToken && cancelToken.current.token
			);
			if (page === 0 && response?.applications?.[0]) {
				response.applications[0].isAccessible = true;
				response.applications[0].type = ENTITIES.APPLICATIONS;
			}
			dispatch({
				type: applicationConstants.ALL_APPLICATIONS_FETCHED,
				payload: {
					data: response.applications,
					count: response.totalRows,
					page: page,
				},
			});
		} catch (err) {
			dispatch({
				type: applicationConstants.ALL_APPLICATIONS_FETCHED,
				payload: {
					err: err,
					loading: isCancelled,
				},
			});
		}
	};
}

export function fetchApplicationActionHistory(applicationId) {
	return async function (dispatch) {
		dispatch({
			type: applicationConstants.APP_ACTIONHISTORY_REQUESTED,
		});
		try {
			const response = await getApplicationsActionHistory(applicationId);
			dispatch({
				type: applicationConstants.APP_ACTIONHISTORY_FETCHED,
				payload: response,
			});
		} catch (err) {
			dispatch({
				type: applicationConstants.APP_ACTIONHISTORY_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}

export function fetchApplicationInfo(applicationId) {
	return async function (dispatch) {
		dispatch({
			type: applicationConstants.APPLICATION_INFO_REQUESTED,
		});
		try {
			const response = await getApplicationInfo(applicationId);
			dispatch({
				type: applicationConstants.APPLICATION_INFO_FETCHED,
				payload: {
					data: response,
				},
			});
		} catch (err) {
			dispatch({
				type: applicationConstants.APPLICATION_INFO_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}
export function fetchAllContracts(page, cancelToken) {
	var isCanceled = false;
	if (cancelToken?.current?.token) {
		cancelToken.current.token.cancel(
			"Operation cancelled in favor of a new request"
		);
		isCanceled = true;
	}
	return async function (dispatch, getState) {
		const isBasicSubscription = isBasicSubscriptionSelector(getState());
		if (isBasicSubscription) {
			dispatch({
				type: applicationConstants.ALL_CONTRACTS_FETCHED,
				payload: {
					data: [],
					count: 0,
					pageNo: 0,
					isRestricted: true,
					loading: false,
				},
			});
			return;
		}
		try {
			dispatch({
				type: applicationConstants.ALL_CONTRACTS_REQUESTED,
			});
			cancelToken.current.token = client.CancelToken.source();
			const response = await getAllLicenseContracts(
				page,
				30,
				cancelToken.current.token
			);
			if (
				page === 0 &&
				Array.isArray(response?.licenseContracts) &&
				response?.licenseContracts?.length > 0 &&
				response?.licenseContracts[0]
			) {
				response.licenseContracts[0].isAccessible = true;
				response.licenseContracts[0].type = ENTITIES.CONTRACTS;
			}
			dispatch({
				type: applicationConstants.ALL_CONTRACTS_FETCHED,
				payload: {
					data: response.licenseContracts,
					count: response.count,
					pageNo: page,
					loading: false,
				},
			});
		} catch (err) {
			dispatch({
				type: applicationConstants.ALL_CONTRACTS_FETCHED,
				payload: {
					err: err,
					loading: isCanceled,
				},
			});
		}
	};
}

export function fetchAllRenewals() {
	return async function (dispatch, getState) {
		const isBasicSubscription = isBasicSubscriptionSelector(getState());

		if (isBasicSubscription) {
			dispatch({
				type: applicationConstants.RENEWALS_FETCHED,
				payload: {
					data: [],
					isRestricted: true,
				},
			});
			return;
		}
		dispatch({
			type: applicationConstants.RENEWALS_REQUESTED,
		});
		try {
			const response = await getRenewals();
			dispatch({
				type: applicationConstants.RENEWALS_FETCHED,
				payload: {
					data: response,
				},
			});
		} catch (err) {
			dispatch({
				type: applicationConstants.RENEWALS_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}

export function fetchUpcomingRenewals() {
	return async function (dispatch) {
		dispatch({
			type: applicationConstants.UPCOMING_RENEWALS_REQUESTED,
		});
		try {
			const response = await getUpcomingRenewals();
			dispatch({
				type: applicationConstants.UPCOMING_RENEWALS_FETCHED,
				payload: {
					data: response,
				},
			});
		} catch (err) {
			dispatch({
				type: applicationConstants.UPCOMING_RENEWALS_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}

export function fetchContractInfo(contractId) {
	return async function (dispatch) {
		dispatch({
			type: applicationConstants.CONTRACT_INFO_REQUESTED,
		});
		try {
			const response = await getContractInfo(contractId);
			dispatch({
				type: applicationConstants.CONTRACT_INFO_FETCHED,
				payload: {
					data: response,
				},
			});
		} catch (err) {
			dispatch({
				type: applicationConstants.CONTRACT_INFO_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}
export function fetchSingleAppContractInfo(page, cancelToken) {
	var isCanceled = false;
	if (cancelToken?.current?.token) {
		cancelToken.current.token.cancel(
			"Operation cancelled in favor of a new request"
		);
		isCanceled = true;
	}
	const applicationId = window.location.pathname.split("/")[2];
	return async function (dispatch) {
		try {
			dispatch({
				type: applicationConstants.SINGLE_APPLICATION_CONTRACT_INFO_REQUESTED,
				payload: {
					id: applicationId,
				},
			});
			if (cancelToken && cancelToken?.current) {
				cancelToken.current.token = client.CancelToken.source();
			}
			const response = await getSingleApplicationLicenseContracts(
				page,
				defaults.ALL_APPLICATIONS_ROW,
				applicationId,
				cancelToken.current.token
			);
			if (
				page === 0 &&
				Array.isArray(response?.data?.licenseContracts) &&
				response?.data?.licenseContracts[0]
			) {
				response.data.licenseContracts[0].isAccessible = true;
				response.data.licenseContracts[0].type = ENTITIES.CONTRACTS;
			}
			if (response.error) {
				dispatch({
					type: applicationConstants.SINGLE_APPLICATION_CONTRACT_INFO_FETCHED,
					payload: {
						data: [],
						count: 0,
						pageNo: page,
						id: applicationId,
					},
				});
				TriggerIssue(
					"Error occurred while fetching license contracts",
					response.error
				);
			} else {
				dispatch({
					type: applicationConstants.SINGLE_APPLICATION_CONTRACT_INFO_FETCHED,
					payload: {
						data: response.data.licenseContracts,
						count: response.data.count,
						pageNo: page,
						id: applicationId,
					},
				});
			}
		} catch (err) {
			dispatch({
				type: applicationConstants.SINGLE_APPLICATION_CONTRACT_INFO_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}

export function fetchSingleAppUsersInfo(page, cancelToken) {
	if (cancelToken.current.token) {
		cancelToken.current.token.cancel(
			"Operation cancelled in favor of a new request"
		);
	}
	const id = window.location.pathname.split("/")[2];
	return async function (dispatch) {
		dispatch({
			type: applicationConstants.SINGLE_APPLICATION_USERS_INFO_REQUESTED,
			payload: {
				id: id,
			},
		});
		try {
			cancelToken.current.token = client.CancelToken.source();
			const response = await getSingleApplicationUsersInfo(
				id,
				page,
				defaults.ALL_APPLICATIONS_ROW,
				cancelToken.current.token
			);
			if (
				page === 0 &&
				Array.isArray(response?.users?.data) &&
				response?.users?.data[0]
			) {
				response.users.data[0].isAccessible = true;
				response.users.data[0].type = ENTITIES.USERS;
			}
			dispatch({
				type: applicationConstants.SINGLE_APPLICATION_USERS_INFO_FETCHED,
				payload: {
					data: response.users.data,
					count: response.users.data.length,
					pageNo: page,
					id: id,
				},
			});
		} catch (err) {
			dispatch({
				type: applicationConstants.SINGLE_APPLICATION_USERS_INFO_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}

export function checkStoreAndFetchSingleAppTrans(id, page, row, cancelToken) {
	var pagination = "page_" + page?.toString() + "_" + row?.toString();
	return async function (dispatch, getState) {
		if (getState().applications.singleapptransinfo[id]?.data[pagination]) {
			return;
		} else {
			dispatch(fetchSingleAppTrans(id, page, row, cancelToken));
		}
	};
}

export function fetchSingleAppTrans(id, page, row, cancelToken) {
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
				type: applicationConstants.SINGLE_APPLICATION_TRANSACTION_INFO_REQUESTED,
				payload: {
					id: id,
				},
			});
			cancelToken.current = client.CancelToken.source();
			const response = await getSingleApplicationTransactions(
				id,
				page,
				row,
				cancelToken.current
			);
			if (page === 0 && response?.transactions?.[0]) {
				response.transactions[0].type = ENTITIES.TRANSACTIONS;
				response.transactions[0].isAccessible = true;
			}
			dispatch({
				type: applicationConstants.SINGLE_APPLICATION_TRANSACTION_INFO_FETCHED,
				payload: {
					data: response.transactions,
					count: response.total_count,
					page_no: page,
					rows: row,
					id: id,
				},
			});
		} catch (err) {
			dispatch({
				type: applicationConstants.SINGLE_APPLICATION_TRANSACTION_INFO_FETCHED,
				payload: {
					err,
					data: [],
					id: id,
				},
			});
		}
	};
}

export function refreshAllSingleAppTransPages(pages, id) {
	return async function (dispatch) {
		const requestArray = [];
		try {
			if (Array.isArray(pages) && pages?.length > 0) {
				dispatch({
					type: applicationConstants.SINGLE_APPLICATION_TRANSACTION_INFO_REQUESTED,
					payload: {
						id: id,
					},
				});
				_.map(pages, function (pageObj) {
					requestArray.push(
						getSingleApplicationTransactions(
							id,
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
									type: applicationConstants.SINGLE_APPLICATION_TRANSACTION_INFO_FETCHED,
									payload: {
										id: id,
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
				"Error when refreshing All pages of SingleApplicationTransactions",
				error
			);
		}
	};
}

export function fetchSpendGraphData(
	id,
	start_month,
	end_month,
	start_year,
	end_year
) {
	return async function (dispatch, getState) {
		if (
			getState().applications.allApplications[id]?.spendgraph &&
			getState().applications.allApplications[id]?.usagegraph
		) {
			dispatch({
				type: applicationConstants.SPENDGRAPH_ALREADY_PRESENT,
				payload: {
					id: id,
				},
			});
			return;
		}
		dispatch({
			type: applicationConstants.SPENDGRAPH_REQUESTED,
			payload: {
				id: id,
			},
		});
		try {
			const response = await getSpendGraphData(
				id,
				start_month,
				end_month,
				start_year,
				end_year
			);
			dispatch({
				type: applicationConstants.SPENDGRAPH_FETCHED,
				payload: {
					response: response,
					id: id,
				},
			});
		} catch (err) {
			dispatch({
				type: applicationConstants.SPENDGRAPH_FETCHED,
				payload: {
					err,
					id: id,
				},
			});
		}
	};
}

export function fetchUsageGraphData(
	id,
	start_month,
	end_month,
	start_year,
	end_year
) {
	return async function (dispatch, getState) {
		if (
			getState().applications.allApplications[id]?.spendgraph &&
			getState().applications.allApplications[id]?.usagegraph
		) {
			dispatch({
				type: applicationConstants.USAGEGRAPH_ALREADY_PRESENT,
				payload: {
					id: id,
				},
			});
			return;
		}
		dispatch({
			type: applicationConstants.USAGEGRAPH_REQUESTED,
			payload: {
				id: id,
			},
		});
		try {
			const response = await getUsageGraphData(
				id,
				start_month,
				end_month,
				start_year,
				end_year
			);
			dispatch({
				type: applicationConstants.USAGEGRAPH_FETCHED,
				payload: {
					response: response,
					id: id,
				},
			});
		} catch (err) {
			dispatch({
				type: applicationConstants.USAGEGRAPH_FETCHED,
				payload: {
					err,
					id: id,
				},
			});
		}
	};
}

export function fetchSingleVendorContractInfo(page, cancelToken) {
	var isCanceled = false;
	if (cancelToken?.current?.token) {
		cancelToken.current.token.cancel(
			"Operation cancelled in favor of a new request"
		);
		isCanceled = true;
	}
	const vendorId = window.location.pathname.split("/")[3];
	return async function (dispatch) {
		try {
			dispatch({
				type: applicationConstants.SINGLE_VENDOR_CONTRACTS_REQUESTED,
				payload: {
					id: vendorId,
				},
			});
			if (cancelToken && cancelToken?.current) {
				cancelToken.current.token = client.CancelToken.source();
			}
			const response = await getVendorContracts(
				page,
				defaults.ALL_APPLICATIONS_ROW,
				vendorId,
				cancelToken.current.token
			);
			if (
				page === 0 &&
				Array.isArray(response?.licenseContracts) &&
				response?.licenseContracts[0]
			) {
				response.licenseContracts[0].isAccessible = true;
				response.licenseContracts[0].type = ENTITIES.CONTRACTS;
			}
			if (response.error) {
				dispatch({
					type: applicationConstants.SINGLE_VENDOR_CONTRACTS_FETCHED,
					payload: {
						data: [],
						count: 0,
						pageNo: page,
						id: vendorId,
					},
				});
				TriggerIssue(
					"Error occurred while fetching license contracts",
					response.error
				);
			} else {
				dispatch({
					type: applicationConstants.SINGLE_VENDOR_CONTRACTS_FETCHED,
					payload: {
						data: response.licenseContracts,
						count: response.count,
						pageNo: page,
						id: vendorId,
					},
				});
			}
		} catch (err) {
			dispatch({
				type: applicationConstants.SINGLE_VENDOR_CONTRACTS_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}

export function fetchApplicationCompliance(appId) {
	return async function (dispatch) {
		dispatch({
			type: applicationConstants.FETCH_APPLICATION_COMPLIANCE_REQUESTED,
			payload: {
				id: appId,
			},
		});
		try {
			getApplicationCompliance(appId).then((response) => {
				if (response.error) {
					dispatch({
						type: applicationConstants.FETCHED_APPLICATION_COMPLIANCE,
						payload: {
							id: appId,
							error: response.error,
						},
					});
				} else {
					dispatch({
						type: applicationConstants.FETCHED_APPLICATION_COMPLIANCE,
						payload: {
							id: appId,
							data: response,
						},
					});
				}
			});
		} catch (err) {
			dispatch({
				type: applicationConstants.FETCHED_APPLICATION_COMPLIANCE,
				payload: {
					id: appId,
					error: err,
				},
			});
		}
	};
}

export function fetchApplicationEvents(appId) {
	return async function (dispatch) {
		dispatch({
			type: applicationConstants.FETCH_APPLICATION_EVENTS_REQUESTED,
			payload: {
				id: appId,
			},
		});
		try {
			getApplicationSecurityEvents(appId).then((response) => {
				if (response.error) {
					dispatch({
						type: applicationConstants.FETCHED_APPLICATION_EVENTS,
						payload: {
							id: appId,
							error: response.error,
						},
					});
				} else {
					const groupedEvents = _.groupBy(
						response?.events,
						function (event) {
							return moment(event.event_date).isSameOrAfter(
								moment(),
								"day"
							);
						}
					);

					dispatch({
						type: applicationConstants.FETCHED_APPLICATION_EVENTS,
						payload: {
							recentEvents: groupedEvents["true"] || [],
							olderEvents: groupedEvents["false"] || [],
							id: appId,
							error: {},
						},
					});
				}
			});
		} catch (err) {
			dispatch({
				type: applicationConstants.FETCHED_APPLICATION_EVENTS,
				payload: {
					id: appId,
					error: err,
				},
			});
		}
	};
}

export function fetchApplicationDataSharedInfo(appId) {
	return async function (dispatch) {
		dispatch({
			type: applicationConstants.FETCH_APPLICATION_DATASHARED_INFO_REQUESTED,
			payload: {
				id: appId,
			},
		});
		try {
			getApplicationSecurityDataShared(appId).then((response) => {
				if (response.error) {
					dispatch({
						type: applicationConstants.FETCHED_APPLICATION_DATASHARED_INFO,
						payload: {
							id: appId,
							error: response.error,
						},
					});
				} else {
					dispatch({
						type: applicationConstants.FETCHED_APPLICATION_DATASHARED_INFO,
						payload: {
							id: appId,
							data: response,
							error: {},
						},
					});
				}
			});
		} catch (error) {
			dispatch({
				type: applicationConstants.FETCHED_APPLICATION_DATASHARED_INFO,
				payload: {
					id: appId,
					error: error,
				},
			});
		}
	};
}

export function fetchApplicationSecurityProbes(appId) {
	return async function (dispatch) {
		dispatch({
			type: applicationConstants.FETCH_APPLICATION_SECURITY_PROBES_REQUESTED,
			payload: {
				id: appId,
			},
		});
		try {
			getApplicationSecurityProbes(appId).then((response) => {
				if (response?.error) {
					dispatch({
						type: applicationConstants.FETCHED_APPLICATION_SECURITY_PROBES,
						payload: {
							id: appId,
							error: response.error,
						},
					});
				} else {
					dispatch({
						type: applicationConstants.FETCHED_APPLICATION_SECURITY_PROBES,
						payload: {
							id: appId,
							data: response,
							error: {},
						},
					});
				}
			});
		} catch (error) {
			dispatch({
				type: applicationConstants.FETCHED_APPLICATION_SECURITY_PROBES,
				payload: {
					id: appId,
					error: error,
				},
			});
		}
	};
}
