import { RESTRICTION_CONSTANTS } from "../constants";

const initialState = {
	showUpgradeModal: false,
};

export function restrictionsReducer(state = initialState, action) {
	switch (action.type) {
		case RESTRICTION_CONSTANTS.SHOW_UPGRADE_MODAL:
			return {
				showUpgradeModal: true,
				entity: action.payload
				};
		case RESTRICTION_CONSTANTS.HIDE_UPGRADE_MODAL:
			return {
				showUpgradeModal: false,
				entity: ""
			};
		default:
			return state;
		}
}
