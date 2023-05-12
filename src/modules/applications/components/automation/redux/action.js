import {
	getAppPlaybookRules,
	updateRule,
	createRule,
	updateOrderOfRule,
} from "../service/automation-api";
import { getAutomationRuleService } from "modules/workflow/service/api";
import {
	WorkFlowAutomationRuleResponseModel,
	WorkFlowAutomationRuleRequestModel,
} from "../model/model";
import { TriggerIssue } from "../../../../../utils/sentry";

export const ACTION_TYPE = {
	CREATE_RULE: "CREATE_RULE",
	GET_APP_RULES: "GET_APP_RULES",
	GET_APP_RULE: "GET_APP_RULE",
	APP_UPDATE_AUTOMATION_RULE: "APP_UPDATE_AUTOMATION_RULE",
	SET_AUTOMATION_RULE_NAME: "SET_AUTOMATION_RULE_NAME",
	RESET_APP_RULE: "RESET_APP_RULE",
	SET_EDIT_AUTOMATION_RULE: "SET_EDIT_AUTOMATION_RULE",
	UPDATE_APP_AUTOMATION_RULES_ORDER: "UPDATE_APP_AUTOMATION_RULES_ORDER",
};

export const createAppRule = (folderType, entity) => {
	return async function (dispatch) {
		try {
			const response = await createRule(folderType, entity);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.CREATE_RULE,
					payload: {
						data: new WorkFlowAutomationRuleResponseModel(response),
					},
				});
		} catch (reason) {
			TriggerIssue("Error in createAppRule", reason);
		}
	};
};

export const getAppRules = (obj) => {
	return async function (dispatch) {
		try {
			const response = await getAppPlaybookRules(obj);
			if (response && !response.error)
				dispatch({
					type: ACTION_TYPE.GET_APP_RULES,
					payload: { data: response },
				});
		} catch (err) {
			TriggerIssue("Error in getAppRules", reason);
		}
	};
};

export const getAppRule = (ruleId) => {
	return async function (dispatch) {
		try {
			const response = await getAutomationRuleService(ruleId);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.GET_APP_RULE,
					payload: {
						data: new WorkFlowAutomationRuleResponseModel(response),
					},
				});
		} catch (reason) {
			TriggerIssue("Error in getAppRule", reason);
		}
	};
};

export const setEditAutomationRule = (action) => {
	return async function (dispatch, getState) {
		const automationRule = getState()?.appRule?.rule;
		try {
			dispatch({
				type: ACTION_TYPE.SET_EDIT_AUTOMATION_RULE,
				payload: { data: { ...automationRule, ...action } },
			});
		} catch (reason) {
			TriggerIssue("Error in setEditAutomationRule", reason);
		}
	};
};

export const setAutomationRuleName = (data) => {
	return async function (dispatch) {
		try {
			const response = await updateRule(
				new WorkFlowAutomationRuleRequestModel(data)
			);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.SET_AUTOMATION_RULE_NAME,
					payload: {
						data: new WorkFlowAutomationRuleResponseModel(response),
					},
				});
		} catch (reason) {
			TriggerIssue("Error in setAutomationRuleName", reason);
		}
	};
};

export const updateAutomationRule = (data) => {
	return async function (dispatch) {
		try {
			const response = await updateRule(
				new WorkFlowAutomationRuleRequestModel(data)
			);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.APP_UPDATE_AUTOMATION_RULE,
					payload: {
						data: new WorkFlowAutomationRuleResponseModel(response),
					},
				});
		} catch (reason) {
			TriggerIssue("Error updateAutomationRule", reason);
		}
	};
};

export const resetAppRule = () => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.RESET_APP_RULE,
				payload: {},
			});
		} catch (reason) {
			TriggerIssue("Error in resetAppRule", reason);
		}
	};
};

export const updateOrderOfAutomationRules = ({
	id,
	type,
	currentOrder,
	newOrder,
}) => {
	return async function (dispatch) {
		try {
			const response = await updateOrderOfRule({
				id,
				type,
				currentOrder,
				newOrder,
			});
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.UPDATE_APP_AUTOMATION_RULES_ORDER,
					payload: response,
				});
		} catch (reason) {
			TriggerIssue("Error in updateOrderOfAutomationRules", reason);
		}
	};
};
