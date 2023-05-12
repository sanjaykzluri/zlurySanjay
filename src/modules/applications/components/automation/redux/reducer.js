import { ACTION_TYPE } from "./action";

const appRuleState = {
	rule: null,
	rules: null,
	new_rule: null,
	updated_rule: null,
};

export function appRuleReducer(state = appRuleState, action) {
	switch (action.type) {
		case ACTION_TYPE.GET_APP_RULES:
			return { ...state, rules: action.payload.data };
		case ACTION_TYPE.CREATE_RULE:
			return {
				...state,
				new_rule: action.payload.data,
			};
		case ACTION_TYPE.GET_APP_RULE:
			return {
				...state,
				rule: action.payload.data,
			};
		case ACTION_TYPE.APP_UPDATE_AUTOMATION_RULE:
			return {
				...state,
				updated_rule: action.payload.data,
			};
		case ACTION_TYPE.SET_AUTOMATION_RULE_NAME:
			return {
				...state,
				rule: action.payload.data,
			};
		case ACTION_TYPE.SET_EDIT_AUTOMATION_RULE:
			return { ...state, rule: action.payload.data };
		case ACTION_TYPE.RESET_APP_RULE:
			return { ...state, rule: null };
		case ACTION_TYPE.UPDATE_APP_AUTOMATION_RULES_ORDER:
			return {
				...state,
				rules: Object.assign({}, state.rules, {
					data: action.payload,
				}),
			};
		default:
			return state;
	}
}
