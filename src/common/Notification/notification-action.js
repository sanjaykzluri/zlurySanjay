import { getAllNotifications } from "../../services/api/notifications";
import { TriggerIssue } from "../../utils/sentry";
import { notification_constants } from "./notifications-constants";
import moment from "moment";
import _ from "underscore";
import Axios from "axios";

function groupBy(arrayObj) {
	return arrayObj.reduce(function (item, obj) {
		const isToday = moment(new Date(obj?.createdAt).toISOString())?.isSame(
			moment(),
			"day"
		);
		const key = isToday ? "today" : "older";
		if (!item[key]) item[key] = [];
		item[key].push(obj);
		return item;
	}, {});
}

export function fetchAllNotifications(page, rows) {
	return async function (dispatch) {
		try {
			getAllNotifications(page, rows)
				.then((res) => {
					if (!res.error && Array.isArray(res?.data)) {
						const groupedData = groupBy(res?.data);
						dispatch({
							type: notification_constants.GET_ALL_NOTIFICATIONS,
							payload: {
								data: groupedData,
								pageNo: page,
								hasMoreData: !(res.data?.length < 10),
							},
						});
					} else if (res?.error && !!res?.data?.length) {
						TriggerIssue(
							"ERROR in fetching the notifications",
							res
						);
					}
				})
				.catch((error) => {
					TriggerIssue("Error in fetching notifications", error);
				});
		} catch (err) {
			TriggerIssue("ERROR in fetching the notifications", err);
		}
	};
}

export function clearAndFetchNotifications() {
	return async function (dispatch) {
		try {
			dispatch({
				type: notification_constants.CLEAR_NOTIFICATIONS_CACHE,
			});
			dispatch(fetchAllNotifications(0, 10));
		} catch (err) {
			TriggerIssue(
				"ERROR when clearing store and fetching notifications",
				err
			);
		}
	};
}

export function updateNotifications(pages) {
	const pageNos = parseInt(pages) + 1;
	return async function (dispatch) {
		const requestArray = [];
		try {
			_.times(pageNos, (pageNo) => {
				requestArray.push(getAllNotifications(parseInt(pageNo), 10));
			});
			Axios.all(requestArray).then(
				Axios.spread((...responses) => {
					let responseData = [];
					responses.map((response) => {
						if (
							response?.data?.length > 0 &&
							!response?.error &&
							Array.isArray(response?.data)
						) {
							responseData = [...responseData, ...response?.data];
						}
					});
					dispatch({
						type: notification_constants.UPDATE_NOTIFICATIONS,
						payload: {
							data: groupBy(responseData),
							pageNo: pages,
						},
					});
				})
			);
		} catch (error) {
			TriggerIssue("Error in updating notifications", error);
		}
	};
}

export function increaseToastCounter() {
	return async function (dispatch) {
		try {
			dispatch({
				type: notification_constants.INCREASE_TOAST_COUNTER,
			});
		} catch (err) {
			TriggerIssue("Error in increasing toast counter", err);
		}
	};
}

export function decreaseToastCounter() {
	return async function (dispatch) {
		try {
			dispatch({
				type: notification_constants.DECREASE_TOAST_COUNTER,
			});
		} catch (err) {
			TriggerIssue("Error in decreasing toast counter", err);
		}
	};
}
