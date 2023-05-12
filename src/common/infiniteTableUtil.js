import _ from "underscore";

export function getSearchReqObj(searchQuery, fieldId, fieldName) {
	const searchObj = {
		field_values: [searchQuery],
		field_order: "contains",
		field_id: fieldId,
		filter_type: "search_in_string",
		field_name: fieldName,
		negative: false,
		is_custom: false,
	};
	return searchObj;
}

export const defaultReqBody = {
	filter_by: [],
	sort_by: [],
	columns: [],
};

export const ARCHIVE_FIELD_CONSTANTS = {
	APPLICATION: "app_archive",
	USER: "user_archive",
	DEPARTMENT: "dept_archive",
};

export function addArchiveFilter(
	urlReqBody,
	reqBody,
	fieldId,
	archiveFilterName = "Archive"
) {
	let isArchiveFilter = false;
	urlReqBody.filter_by.map((appliedFilter) => {
		if (appliedFilter.field_id === fieldId) {
			isArchiveFilter = true;
			return;
		}
	});

	if (!isArchiveFilter) {
		reqBody.filter_by.push({
			field_values: false,
			field_id: fieldId,
			filter_type: "boolean",
			field_name: archiveFilterName,
			negative: false,
			is_custom: false,
		});
	}
	return reqBody.filter_by;
}

export function filtersRequestBodyGenerator(
	query,
	reqBody = defaultReqBody,
	archiveFilterId,
	archiveFilterName
) {
	let urlMetaData;
	let urlReqBody = reqBody;
	let newReqObj = {};
	if (!_.isEmpty(query.metaData)) {
		urlMetaData = JSON.parse(JSON.stringify(query));
		urlReqBody = JSON.parse(decodeURIComponent(urlMetaData.metaData));
	}
	newReqObj.sort_by = urlReqBody.sort_by || [];
	newReqObj.filter_by = urlReqBody.filter_by || [];
	newReqObj.columns = urlReqBody.columns || [];
	newReqObj.reset_filter = urlReqBody.reset_filter;
	if (archiveFilterId && urlReqBody?.filter_by?.length) {
		newReqObj.filter_by = addArchiveFilter(
			urlReqBody,
			newReqObj,
			archiveFilterId,
			archiveFilterName
		);
	}
	return newReqObj;
}
