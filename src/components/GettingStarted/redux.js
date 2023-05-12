import { getGettingStartedStatus } from "../../services/api/onboarding";
import { TriggerIssue } from "../../utils/sentry";
import {
	SAVE_GETTINGSTARTED__STATUS,
	TOGGLE_GETTINGSTARTED_MODAL,
} from "./actions";

export function updateGettingStartedStatuses(orgId) {
	return async function (dispatch) {
		try {
			const response = await getGettingStartedStatus(orgId);
			dispatch({
				type: SAVE_GETTINGSTARTED__STATUS,
				payload: response,
			});
		} catch (err) {
			TriggerIssue("issue in get getting statuses api", err);
		}
	};
}

export function showGettingStartedModal() {
	return async function (dispatch) {
		try {
			dispatch({
				type: TOGGLE_GETTINGSTARTED_MODAL,
				payload: true,
			});
		} catch (err) {
			TriggerIssue("issue in toggle getting started");
		}
	};
}

export function hideGettingStartedModal() {
	return async function (dispatch) {
		try {
			dispatch({
				type: TOGGLE_GETTINGSTARTED_MODAL,
				payload: false,
			});
		} catch (err) {
			TriggerIssue("issue in toggle getting started");
		}
	};
}
