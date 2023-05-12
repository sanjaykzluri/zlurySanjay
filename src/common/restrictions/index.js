import { RESTRICTION_CONSTANTS } from "../../constants";
import { store } from "../../utils/store";

export const planSelector = (state) => state?.userInfo?.org_plan?.name;
export const planExpirySelector = (state) =>
	state?.userInfo?.plan_expires_in_days;
export const isBasicSubscriptionSelector = (state) =>
	state?.userInfo?.org_plan?.name === "basic";

export const showrestrictedPopup = (entity) =>
	store.dispatch({
		type: RESTRICTION_CONSTANTS.SHOW_UPGRADE_MODAL,
		payload: entity,
	});

export function isRestricted(isClickable, entity) {
	const isBasicSubscription = isBasicSubscriptionSelector(store.getState());

	if (!isClickable && isBasicSubscription) {
		return true;
	}
	return false;
}
