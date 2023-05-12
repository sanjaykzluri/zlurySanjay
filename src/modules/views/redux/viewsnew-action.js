import { client } from "utils/client";
import { TriggerIssue } from "utils/sentry";
import _ from "underscore";
import { viewsnewConstants } from "../constants/viewsnewConstants";
import { fetchViewsList } from "services/api/views";

export function checkAndFetchViewsData(screenTagKey) {
	return async function (dispatch, getState) {
		if (
			getState().viewsnew[screenTagKey] &&
			getState().viewsnew[screenTagKey]?.data
		) {
			return;
		} else {
			dispatch(fetchViewsData(screenTagKey));
		}
	};
}

export function fetchViewsData(screenTagKey) {
	return async function (dispatch, getState) {
		try {
			dispatch({
				type: viewsnewConstants.VIEWS_REQUESTED,
				payload: {
					screenTagKey: screenTagKey,
				},
			});
			let viewsList = await fetchViewsList(screenTagKey);
			const { isLoadingData } = getState().viewsnew[screenTagKey];
			let obj = viewsList.data.find((el) => el.is_default);
			if (isLoadingData) {
				dispatch({
					type: viewsnewConstants.VIEWS_FETCHED,
					payload: {
						screenTagKey: screenTagKey,
						data: viewsList.data,
						layout_option: obj.layout_option,
					},
				});
			}
		} catch (err) {
			dispatch({
				type: viewsnewConstants.VIEWS_FETCHED,
				payload: {
					err,
					screenTagKey: screenTagKey,
					data: [],
				},
			});
			TriggerIssue(
				`Error while fetching Views of screenTag ${screenTagKey}`,
				err
			);
		}
	};
}

export function UpdateViewsData(screenTagKey, id, layout_option) {
	return async function (dispatch, getState) {
		try {
			let viewsList = getState().viewsnew[screenTagKey];
			let tempViews = JSON.parse(JSON.stringify(viewsList?.data));
			let tempIndex = tempViews.findIndex((el) => el._id === id);
			tempViews[tempIndex].layout_option = layout_option;
			dispatch({
				type: viewsnewConstants.VIEWS_FETCHED,
				payload: {
					screenTagKey: screenTagKey,
					data: tempViews,
				},
			});
		} catch (err) {
			TriggerIssue(`Error in Updating view`, err);
		}
	};
}
