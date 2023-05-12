import { client } from "../../../utils/client";
import { TriggerIssue } from "../../../utils/sentry";
import { v2PaginatedConstants } from "../constants/v2PaginatedTableConstants";
import {
	defaultReqBody,
	getSearchReqObj,
} from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";

import _ from "underscore";

export function checkAndFetchAllV2Data(
	reqBody,
	pageNo,
	row,
	v2Entity,
	getAPI,
	searchReqParams
) {
	let page = `page_${pageNo}_row_${row}`;
	return async function (dispatch, getState) {
		if (
			getState().v2PaginatedData[v2Entity][
				`${JSON.stringify(reqBody)}`
			] &&
			getState().v2PaginatedData[v2Entity][`${JSON.stringify(reqBody)}`]
				?.metaData &&
			getState().v2PaginatedData[v2Entity][
				`${JSON.stringify(reqBody)}`
			]?.[page]
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
				type: v2PaginatedConstants.PAGINATED_ALL_DATA_REQUESTED,
				payload: {
					v2Entity: v2Entity,
					reqBody: reqBody,
					pageNo: pageNo,
					row: row,
				},
			});
			dispatch({
				type: v2PaginatedConstants.PAGINATED_CURRENT_DATA_KEY,
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

			dispatch({
				type: v2PaginatedConstants.PAGINATED_ALL_DATA_FETCHED,
				payload: {
					v2Entity: v2Entity,
					data: response.data,
					metaData: tempMeta,
					pageNo: pageNo,
					hasMoreData: response.data.length === row,
					reqBody: reqBody,
					row: row,
				},
			});
		} catch (err) {
			dispatch({
				type: v2PaginatedConstants.PAGINATED_ALL_DATA_FETCHED,
				payload: {
					err,
					reqBody: reqBody,
					v2Entity: v2Entity,
					data: [],
					pageNo: pageNo,
					row: row,
				},
			});
			TriggerIssue(`Error while fetching ${v2Entity}`, err);
		}
	};
}

export function clearAllV2DataCache(v2Entity, row, pageNo) {
	return async function (dispatch) {
		dispatch({
			type: v2PaginatedConstants.PAGINATED_CLEAR_ALL_DATA_CACHE,
			payload: {
				v2Entity: v2Entity,
				row: row,
				pageNo: pageNo,
			},
		});
	};
}

export function checkAndFetchV2PropertyFile(v2Entity, propertyListAPI) {
	return async function (dispatch, getState) {
		if (getState().v2PaginatedData[v2Entity]?.property_file?.loaded) {
			return;
		} else {
			dispatch(fetchV2PropertyFile(v2Entity, propertyListAPI));
		}
	};
}

export function setPagePaginatedTable(v2Entity, pageNo, reqBody) {
	return async function (dispatch, getState) {
		try {
			dispatch({
				type: v2PaginatedConstants.PAGINATED_SET_PAGE,
				payload: {
					pageNo: pageNo,
					v2Entity: v2Entity,
					reqBody: reqBody,
				},
			});
		} catch (err) {}
	};
}

export function setScrollTopPaginatedTable(v2Entity, scrollTop, reqBody) {
	return async function (dispatch, getState) {
		try {
			dispatch({
				type: v2PaginatedConstants.PAGINATED_SET_SCROLLTOP,
				payload: {
					scrollTop,
					v2Entity: v2Entity,
					reqBody: reqBody,
				},
			});
		} catch (err) {}
	};
}

export function setRowPaginatedTable(v2Entity, row, reqBody) {
	return async function (dispatch, getState) {
		try {
			dispatch({
				type: v2PaginatedConstants.PAGINATED_SET_ROW,
				payload: {
					row: row,
					v2Entity: v2Entity,
					reqBody: reqBody,
				},
			});
		} catch (err) {}
	};
}

export function fetchV2PropertyFile(v2Entity, propertyListAPI) {
	return async function (dispatch) {
		try {
			dispatch({
				type: v2PaginatedConstants.PAGINATED_PROPERTY_FILE_REQUESTED,
				payload: {
					v2Entity: v2Entity,
				},
			});
			const response = await propertyListAPI();
			dispatch({
				type: v2PaginatedConstants.PAGINATED_PROPERTY_FILE_FETCHED,
				payload: {
					v2Entity: v2Entity,
					propertyList: response?.data?.properties || [],
					columnList: response?.data?.columns || [],
					group_properties: response?.data?.group_properties || [],
				},
			});
		} catch (err) {
			dispatch({
				type: v2PaginatedConstants.PAGINATED_PROPERTY_FILE_FETCHED,
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

export function checkAndFetchV2SourceListForFilter(v2Entity, sourceListAPI) {
	return async function (dispatch, getState) {
		if (getState().v2PaginatedData[v2Entity]?.source_list?.loaded) {
			return;
		} else {
			dispatch(fetchV2SourceListForFilter(v2Entity, sourceListAPI));
		}
	};
}
export function v2UpdateData(v2Entity, data) {
	return async function (dispatch, getState) {
		console.log("update data");
		try {
			dispatch({
				type: v2PaginatedConstants.PAGINATED_UPDATE_V2_DATA,
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
export function fetchV2SourceListForFilter(v2Entity, sourceListAPI) {
	return async function (dispatch) {
		try {
			dispatch({
				type: v2PaginatedConstants.PAGINATED_SOURCE_LIST_FOR_FILTER_REQUESTED,
				payload: {
					v2Entity: v2Entity,
				},
			});
			const response = await sourceListAPI();
			dispatch({
				type: v2PaginatedConstants.PAGINATED_SOURCE_LIST_FOR_FILTER_FETCHED,
				payload: {
					v2Entity: v2Entity,
					sourceList: response,
				},
			});
		} catch (err) {
			dispatch({
				type: v2PaginatedConstants.PAGINATED_SOURCE_LIST_FOR_FILTER_FETCHED,
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
