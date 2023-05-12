import { client } from "../../../utils/client";
import { TriggerIssue } from "../../../utils/sentry";
import { v2InfiniteConstants } from "../constants/v2InfiniteTableConstants";
import { defaultReqBody, getSearchReqObj } from "../utils/v2infiniteTableUtil";
import _ from "underscore";
import { trackActionSegment } from "modules/shared/utils/segment";

export function checkAndFetchAllV2Data(
	reqBody,
	pageNo,
	row,
	v2Entity,
	getAPI,
	searchReqParams
) {
	return async function (dispatch, getState) {
		if (
			getState().v2Data[v2Entity][`${JSON.stringify(reqBody)}`] &&
			getState().v2Data[v2Entity][`${JSON.stringify(reqBody)}`]?.metaData
		) {
			return;
		} else {
			dispatch(
				fetchAllV2Data(
					reqBody,
					pageNo,
					row,
					v2Entity,
					getAPI,
					searchReqParams
				)
			);
		}
	};
}

export function fetchAllV2Data(
	reqBody,
	pageNo,
	row,
	v2Entity,
	getAPI,
	searchReqParams
) {
	return async function (dispatch, getState) {
		try {
			dispatch({
				type: v2InfiniteConstants.ALL_DATA_REQUESTED,
				payload: {
					v2Entity: v2Entity,
					reqBody: reqBody,
				},
			});
			dispatch({
				type: v2InfiniteConstants.CURRENT_DATA_KEY,
				payload: {
					v2Entity: v2Entity,
					reqBody: reqBody,
				},
			});
			const response = await getAPI(
				reqBody,
				pageNo,
				row,
				undefined,
				searchReqParams
			);
			let tempMeta = JSON.parse(JSON.stringify(response.meta));
			tempMeta.columns = _.uniq(tempMeta.columns, "group_name");
			const { isLoadingData } = {
				...getState().v2Data[v2Entity][
					`${decodeURIComponent(JSON.stringify(reqBody))}`
				],
			};
			if (isLoadingData) {
				dispatch({
					type: v2InfiniteConstants.ALL_DATA_FETCHED,
					payload: {
						v2Entity: v2Entity,
						data: response.data,
						metaData: tempMeta,
						pageNo: pageNo,
						hasMoreData: response.data.length === row,
						reqBody: reqBody,
					},
				});
			}
		} catch (err) {
			dispatch({
				type: v2InfiniteConstants.ALL_DATA_FETCHED,
				payload: {
					err,
					reqBody: reqBody,
					v2Entity: v2Entity,
					data: [],
				},
			});
			TriggerIssue(`Error while fetching ${v2Entity}`, err);
		}
	};
}

export function v2updateScrollPosition(v2Entity, reqBody, scrollTop) {
	return async function (dispatch, getState) {
		try {
			dispatch({
				type: v2InfiniteConstants.UPDATE_SCROLL_POSTION,
				payload: {
					v2Entity,
					reqBody,
					scrollTop,
				},
			});
			dispatch({
				type: v2InfiniteConstants.CURRENT_DATA_KEY,
				payload: {
					v2Entity: v2Entity,
					reqBody: reqBody,
				},
			});
		} catch (err) {
			TriggerIssue(
				`Error while updating scroll position for ${v2Entity}`,
				err
			);
		}
	};
}
export function v2UpdateData(v2Entity, data) {
	return async function (dispatch, getState) {
		try {
			dispatch({
				type: v2InfiniteConstants.UPDATE_V2_DATA,
				payload: {
					v2Entity,
					data,
				},
			});
		} catch (err) {
			TriggerIssue(`Error while updating data for ${v2Entity}`, err);
		}
	};
}

export function searchAllV2Data({
	searchQuery,
	cancelToken,
	v2Entity,
	v2SearchFieldId,
	v2SearchFieldName,
	searchAPI,
	screenTag,
	screenType,
	user_search,
	paramReqBody,
	pageNo,
}) {
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
				type: v2InfiniteConstants.SEARCH_DATA_REQUESTED,
				payload: {
					v2Entity: v2Entity,
				},
			});
			cancelToken.current = client.CancelToken.source();
			const searchObj = getSearchReqObj(
				searchQuery,
				v2SearchFieldId,
				v2SearchFieldName
			);
			const searchByEmailObj = getSearchReqObj(
				searchQuery,
				screenType === "onboarding" || screenType === "offboarding"
					? "onboardingoffboardingusers.email"
					: "user_email",
				"User Email"
			);
			const reqBody = { ...defaultReqBody };
			reqBody.filter_by = user_search
				? [searchObj, searchByEmailObj]
				: [searchObj];
			if (user_search) {
				reqBody.user_search = true;
			}
			if (screenType) {
				reqBody.type = screenType;
			}
			if (screenTag) {
				reqBody.screen_tag = screenTag;
			}
			reqBody.columns = paramReqBody.columns;
			reqBody.sort_by = paramReqBody.sort_by;
			const response = await searchAPI(
				reqBody,
				cancelToken.current,
				pageNo || 0
			);
			let tempMeta = JSON.parse(JSON.stringify(response.meta));
			tempMeta.columns = _.uniq(tempMeta.columns, "group_name");
			dispatch({
				type: v2InfiniteConstants.SEARCH_DATA_FETCHED,
				payload: {
					v2Entity: v2Entity,
					data: response.data,
					metaData: tempMeta,
					hasMoreData: response.data.length === 30,
					reqBody: reqBody,
					pageNo: pageNo,
				},
			});
			trackActionSegment(
				`Search Results displayed for keyword "${searchQuery}" in ${v2Entity}`,
				{ currentCategory: v2Entity }
			);
		} catch (err) {
			if (
				err.message === "Operation cancelled in favor of a new request"
			) {
				dispatch({
					type: v2InfiniteConstants.SEARCH_DATA_REQUESTED,
					payload: {
						v2Entity: v2Entity,
					},
				});
			} else {
				dispatch({
					type: v2InfiniteConstants.SEARCH_DATA_FETCHED,
					payload: {
						v2Entity: v2Entity,
						err,
						data: [],
					},
				});
				TriggerIssue(`Error while searching ${v2Entity}`, err);
			}
		}
	};
}

export function clearAllV2DataCache(v2Entity) {
	return async function (dispatch) {
		dispatch({
			type: v2InfiniteConstants.CLEAR_ALL_DATA_CACHE,
			payload: {
				v2Entity: v2Entity,
			},
		});
	};
}

export function checkAndFetchV2PropertyFile(v2Entity, propertyListAPI) {
	return async function (dispatch, getState) {
		if (getState().v2Data[v2Entity]?.property_file?.loaded) {
			return;
		} else {
			dispatch(fetchV2PropertyFile(v2Entity, propertyListAPI));
		}
	};
}

export function fetchV2PropertyFile(v2Entity, propertyListAPI) {
	return async function (dispatch) {
		try {
			dispatch({
				type: v2InfiniteConstants.PROPERTY_FILE_REQUESTED,
				payload: {
					v2Entity: v2Entity,
				},
			});
			const response = await propertyListAPI(v2Entity);
			dispatch({
				type: v2InfiniteConstants.PROPERTY_FILE_FETCHED,
				payload: {
					v2Entity: v2Entity,
					propertyList: response?.data?.properties || [],
					columnList: response?.data?.columns || [],
					group_properties: response?.data?.group_properties || [],
				},
			});
		} catch (err) {
			console.log(err);
			dispatch({
				type: v2InfiniteConstants.PROPERTY_FILE_FETCHED,
				payload: {
					err,
					v2Entity: v2Entity,
					propertyList: [],
					listOfColumns: [],
					group_properties: [],
				},
			});
			TriggerIssue(`Error while fetching ${v2Entity} property file`, err);
		}
	};
}

export function clearPropertyFileCache(v2Entity) {
	return async function (dispatch) {
		try {
			dispatch({
				type: v2InfiniteConstants.CLEAR_PROPERTY_FILE,
				payload: {
					v2Entity: v2Entity,
				},
			});
		} catch (err) {
			TriggerIssue(`Error while clearing property file cache`, err);
		}
	};
}

export function checkAndFetchV2SourceListForFilter(v2Entity, sourceListAPI) {
	return async function (dispatch, getState) {
		if (getState().v2Data[v2Entity]?.source_list?.loaded) {
			return;
		} else {
			dispatch(fetchV2SourceListForFilter(v2Entity, sourceListAPI));
		}
	};
}

export function fetchV2SourceListForFilter(v2Entity, sourceListAPI) {
	return async function (dispatch) {
		try {
			dispatch({
				type: v2InfiniteConstants.SOURCE_LIST_FOR_FILTER_REQUESTED,
				payload: {
					v2Entity: v2Entity,
				},
			});
			const response = await sourceListAPI();
			dispatch({
				type: v2InfiniteConstants.SOURCE_LIST_FOR_FILTER_FETCHED,
				payload: {
					v2Entity: v2Entity,
					sourceList: response,
				},
			});
		} catch (err) {
			dispatch({
				type: v2InfiniteConstants.SOURCE_LIST_FOR_FILTER_FETCHED,
				payload: {
					err,
					v2Entity: v2Entity,
					sourceList: [],
				},
			});
			TriggerIssue(`Error while fetching ${v2Entity} source list`, err);
		}
	};
}
