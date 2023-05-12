/**
 * Reducer
 * @param {*} state // state of the current reducer
 * @param {*} action // action dispatched {type:"",payload:{}}
 */
import { push } from "connected-react-router";
import { propertyMapperReversal } from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";
import _ from "underscore";
import { filtersRequestBodyGenerator } from "../../../../../common/infiniteTableUtil";
import { escapeURL } from "../../../../../utils/common";

export const ACTION_TYPE = {
	UPDATE_FILTER: "UPDATE_FILTER",
	RESET_FILTERS: "RESET_FILTERS",
	RESET_FILTER: "RESET_FILTER",
	UPDATE_FILTER_PROPS: "UPDATE_FILTER_PROPS",
	SET_FILTERS: "SET_FILTERS",
};

export function filtersReducer(state = {}, action) {
	switch (action.type) {
		case ACTION_TYPE.UPDATE_FILTER:
			return { ...state, [action.payload.key]: action.payload.value };
		case ACTION_TYPE.SET_FILTERS:
			return { ...action.payload };
		case ACTION_TYPE.RESET_FILTERS:
			return {};
		case ACTION_TYPE.RESET_FILTER:
			delete state[action.payload.key];
			return { ...state };
		default:
			return state;
	}
}

export const applyFilters = (isResetFilter = false) => {
	const archiveFields = ["app_archive", "user_archive", "dept_archive"];

	return async function (dispatch, getState) {
		try {
			const { filters, router, groups_filters } = getState();
			const { hash, query } = router.location;
			const filterBy = Object.values(filters) || [];
			let reqObj = {};
			let filterByObj = filterBy
				.filter(
					(filter) =>
						(!archiveFields.includes(filter.field_id) ||
							filter.field_values === true) &&
						!_.isEmpty(filter)
				)
				.map((filter) => {
					let obj = {
						field_id: filter.field_id,
						field_name: filter.field_name,
						field_values: filter.field_values,
						filter_type: filter.filter_type,
						field_order: filter.field_order,
						negative: filter.negative,
						is_custom: filter.is_custom || false,
						is_only: filter.is_only,
						timestamp_type: filter.timestamp_type,
					};

					if (filter.is_custom) {
						obj.field_values = {
							custom_field_id: filter.field_id,
							custom_field_values:
								filter.filter_type === "boolean"
									? [filter.field_values]
									: filter.custom_field_values ||
									  filter.field_values,
						};
						obj.field_id = filter.original_field_id;
					}
					if (filter.is_exact_array) {
						obj.is_exact_array = filter.is_exact_array;
					}
					return obj;
				});
			reqObj = filtersRequestBodyGenerator(query);
			reqObj.filter_by = propertyMapperReversal(filterByObj);
			reqObj.group_filter_by = groups_filters;
			reqObj.reset_filter = isResetFilter ? 1 : false;
			dispatch(
				push(
					`?metaData=${escapeURL(JSON.stringify(reqObj))}${
						query.selectedTab
							? `&selectedTab=${query.selectedTab}`
							: ""
					}${hash}`
				)
			);
			dispatch({ type: ACTION_TYPE.RESET_FILTERS });
		} catch (err) {
			console.log(err);
		}
	};
};
