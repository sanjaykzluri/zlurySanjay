import {
	SAVE_USER_INFO_OBJECT,
	UPDATE_USER_INFO_OBJECT,
} from "../constants/user";

export function userInfoReducer(state = {}, action) {
	switch (action.type) {
		case SAVE_USER_INFO_OBJECT:
			return action.payload;
		case UPDATE_USER_INFO_OBJECT:
			return { ...state, ...action.payload };
		default:
			return state;
	}
}

export function employeeDashoboardFeatureSelector(state) {
	if(Array.isArray(state?.userInfo?.org_beta_features)){
		if(state?.userInfo?.org_beta_features.find((item) => item === "app_requisition")){
			return true
		}
	}
	return false
}
