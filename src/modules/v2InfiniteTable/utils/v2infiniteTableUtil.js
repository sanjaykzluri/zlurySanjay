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

export function addArchiveFilter(urlReqBody, reqBody, fieldId) {
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
			field_name: "Archive",
			negative: false,
			is_custom: false,
		});
	}
	return reqBody.filter_by;
}

export function filtersRequestBodyGenerator(
	query,
	reqBody = defaultReqBody,
	archiveFilterId
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
			archiveFilterId
		);
	}
	return newReqObj;
}

export function filterPropertiesHelper(data) {
	let properties = data.properties;
	let metaData = data.meta;
	if (properties) {
		data.properties = propertyMapper(properties);
	}
	if (metaData) {
		data.meta.filter_by = propertyMapper(metaData.filter_by);
	}
	return data;
}

export function propertyMapper(propertyList) {
	propertyList = propertyList.filter((filter) => !!filter?.field_id);
	return propertyList.map((filter) => {
		if (filter.is_custom) {
			filter.original_field_id = filter.field_id;
			filter.field_id = filter.field_values.custom_field_id;
			filter.field_values = filter.field_values.custom_field_values;
		}
		return filter;
	});
}

export function propertyMapperReversal(propertyList) {
	propertyList = propertyList.filter((filter) => !!filter?.field_id);
	return propertyList.map((filter) => {
		if (filter.is_custom && filter.field_id !== "custom_fields") {
			filter.field_values = {
				custom_field_id: filter.field_id,
				custom_field_values: [...filter.field_values],
			};
			filter.field_id = "custom_fields";
		}
		return filter;
	});
}
