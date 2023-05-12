import { searchUsers } from "../../../services/api/search";
import { TriggerIssue } from "../../../utils/sentry";
import { ACTION_TYPE as ACTION_TYPE_CONSTANTS } from "../constants/constant";
import {
	WorkflowModel,
	Completed,
	CompletedV2,
	CompletedApps,
	WorkFlowApplicationModel,
	WorkFlowActionModel,
	AppDescriptionModel,
	AllManualTaskTemplatesModel,
	WorkFlowOffboardingDashboardModel,
	WorkFlowAutomationRuleResponseModel,
	WorkFlowAutomationRuleRequestModel,
} from "../model/model";
import { Integration } from "../../integrations/model/model";
import {
	editWorkflowDetails,
	editWorkflowNodesService,
	getWorkflow,
	getAllTemplatesService,
	getMostUsedTemplatesService,
	getAllCompletedWorkflowsServiceV2,
	getInProgressWorkflowsService,
	getAllDraftsService,
	getAutomationRulesService,
	getAutomationRuleService,
	getTopFiveDraftsService,
	getUserslistServiceV2,
	getListOfRuns,
	getSummarisedRunLogData,
	fetchRecommendedApps,
	fetchRecommendedActions,
	getRawRunLogData,
	saveApplicationToWorkflow,
	saveActionToWorkflow,
	deleteApplicationFromWorkflow,
	deleteActionFromWorkflow,
	updateActionFromWorkflow,
	editApplicationInWorkflow,
	getAppDescriptionAPI,
	getAllManualTaskTemplatesAPI,
	getManualTaskTemplateByIdAPI,
	getManualTaskTemplateDataAPI,
	saveStaticApplicationToWorkflow,
	getIntegrationAccountsAPI,
	saveActionToWorkflowStaticNode,
	updateActionFromWorkflowStaticNode,
	getOffboardingTasksAPI,
	markOffboardingTaskAsCompleteAPI,
	signOffboardingDeclarationAPI,
	actionValidation,
	deleteAppFromMultiNodeService,
	seperateAppFromMultiNodeService,
	getPendingAppListAPI,
	addPendingAppListAPI,
	updateAutomationRulesService,
	updateAutomationRuleService,
	updateOrderOfRule,
	patchAutomationStatusService,
	getAllPlaybookWorkflowsServiceV2,
	getAllScheduledRunsServiceV2,
	compileWorkflowDraft,
	getIntegrationAccountsV2API,
	changeIntegrationAccountAPI,
	editWorkflowetailsviaTemplate,
} from "../service/api";
import { PARTNER } from "modules/shared/constants/app.constants";

const ACTION_TYPE = {
	GET_WORKFLOW: "GET_WORKFLOW",
	CLEAR_WORKFLOW: "CLEAR_WORKFLOW",
	EDIT_WORKFLOW_DETAILS: "EDIT_WORKFLOW_DETAILS",
	SET_APP_ORG_ID: "SET_APP_ORG_ID",
	GET_RECOMMENDED_APPS: "GET_RECOMMENDED_APPS",
	GET_RECOMMENDED_ACTIONS: "GET_RECOMMENDED_ACTIONS",
	EDIT_WORKFLOW_NODE: "EDIT_WORKFLOW_NODE",
	ADD_APPLICATION_TO_WORKFLOW: "ADD_APPLICATION_TO_WORKFLOW",
	EDIT_APPLICATION_TO_WORKFLOW: "EDIT_APPLICATION_TO_WORKFLOW",
	ADD_ACTION_TO_WORKFLOW: "ADD_ACTION_TO_WORKFLOW",
	UPDATE_ACTION_TO_WORKFLOW: "UPDATE_ACTION_TO_WORKFLOW",
	DELETE_APPLICATION_TO_WORKFLOW: "DELETE_APPLICATION_TO_WORKFLOW",
	DELETE_ACTION_TO_WORKFLOW: "DELETE_ACTION_TO_WORKFLOW",
	DELETE_APP_FROM_MULTI_NODE: "DELETE_APP_FROM_MULTI_NODE",
	SEPARATE_APP_FROM_MULTI_NODE: "SEPARATE_APP_FROM_MULTI_NODE",
	WORKFLOWS_GET_ALL_TEMPLATES: "WORKFLOWS_GET_ALL_TEMPLATES",
	WORKFLOWS_GET_ALL_TEMPLATES_ERROR: "WORKFLOWS_GET_ALL_TEMPLATES_ERROR",
	WORKFLOWS_GET_MOST_USED_TEMPLATES: "WORKFLOWS_GET_MOST_USED_TEMPLATES",
	WORKFLOWS_GET_ALL_DRAFTS: "WORKFLOWS_GET_ALL_DRAFTS",
	WORKFLOWS_GET_AUTOMATION_RULES: "WORKFLOWS_GET_AUTOMATION_RULES",
	WORKFLOWS_UPDATE_AUTOMATION_RULES: "WORKFLOWS_UPDATE_AUTOMATION_RULES",
	WORKFLOWS_UPDATE_AUTOMATION_RULE: "WORKFLOWS_UPDATE_AUTOMATION_RULE",
	WORKFLOWS_GET_AUTOMATION_RULE: "WORKFLOWS_GET_AUTOMATION_RULE",
	SET_EDIT_AUTOMATION_RULE: "SET_EDIT_AUTOMATION_RULE",
	WORKFLOWS_GET_TOP_FIVE_DRAFTS: "WORKFLOWS_GET_TOP_FIVE_DRAFTS",
	WORKFLOWS_GET_ALL_COMPLETED_WORKFLOWS:
		"WORKFLOWS_GET_ALL_COMPLETED_WORKFLOWS",
	WORKFLOWS_GET_IN_PROGRESS_WORKFLOWS: "WORKFLOWS_GET_IN_PROGRESS_WORKFLOWS",
	WORKFLOWS_GET_ONBOARDING_USERS: "WORKFLOWS_GET_ONBOARDING_USERS",
	WORKFLOWS_GET_ACTIONS_BY_WORKFLOW_ID:
		"WORKFLOWS_GET_ACTIONS_BY_WORKFLOW_ID",
	WORKFLOWS_GET_SEARCHED_USERS: "WORKFLOWS_GET_SEARCHED_USERS",
	SET_EDIT_ACTION: "SET_EDIT_ACTION",
	SET_EDIT_APP_ID: "SET_EDIT_APP_ID",
	GET_LIST_OF_RUNS: "GET_LIST_OF_RUNS",
	GET_SUMMARISED_RUN_LOGS: "GET_SUMMARISED_RUN_LOGS",
	GET_RAW_RUN_LOGS: "GET_RAW_RUN_LOGS",
	UPDATE_WORKFLOW: "UPDATE_WORKFLOW",
	SET_WORKFLOW_EXECUTED: "SET_WORKFLOW_EXECUTED",
	CLEAR_WORKFLOW_LOGS: "CLEAR_WORKFLOW_LOGS",
	CLEAR_LIST_OF_WORKFLOWS: "CLEAR_LIST_OF_WORKFLOWS",
	GET_APP_DESCRIPTION: "GET_APP_DESCRIPTION",
	GET_ALL_MANUAL_TASK_TEMPLATES: "GET_ALL_MANUAL_TASK_TEMPLATES",
	GET_MANUAL_TASK_TEMPLATE_BY_ID: "GET_MANUAL_TASK_TEMPLATE_BY_ID",
	GET_MANUAL_TASK_TEMPLATE_DATA: "GET_MANUAL_TASK_TEMPLATE_DATA",
	CLEAR_MANUAL_TASK_TEMPLATE_DATA: "CLEAR_MANUAL_TASK_TEMPLATE_DATA",
	GET_INTEGRATION_ACCOUNTS: "GET_INTEGRATION_ACCOUNTS",
	REMOVE_INTEGRATION_ACCOUNT: "REMOVE_INTEGRATION_ACCOUNT",
	GET_OFFBOARDING_TASKS_LIST: "GET_OFFBOARDING_TASKS_LIST",
	MARK_OFFBOARDING_TASK_COMPLETE: "MARK_OFFBOARDING_TASK_COMPLETE",
	SIGN_OFFBOARDING_DECLARATION_TASK: "SIGN_OFFBOARDING_DECLARATION_TASK",
	CLEAR_OFFBOARDING_TASKS_LIST: "CLEAR_OFFBOARDING_TASKS_LIST",
	ACTION_SCOPE_VALIDATIONS: "ACTION_SCOPE_VALIDATIONS",
	GET_PENDING_APP_LIST: "GET_PENDING_APP_LIST",
	ADD_PENDING_APP_TO_WORKFLOW: "ADD_PENDING_APP_TO_WORKFLOW",
	REMOVE_TEMPLATE: "REMOVE_TEMPLATE",
	REMOVE_MOST_USED_TEMPLATE: "REMOVE_MOST_USED_TEMPLATE",
	EMPTY_TEMPLATES: "EMPTY_TEMPLATES",
	WORKFLOWS_UPDATE_AUTOMATION_RULES_ORDER:
		"WORKFLOWS_UPDATE_AUTOMATION_RULES_ORDER",
	WORKFLOWS_GET_SCHEDULED_RUNS: "WORKFLOWS_GET_SCHEDULED_RUNS",
	SELECTED_USERS: "SELECTED_USERS",
	WORKFLOWS_GET_SEARCHED_USERS_FOR_DRAFT:
		"WORKFLOWS_GET_SEARCHED_USERS_FOR_DRAFT",
	COMPILED_WORKFLOW_RESPONSE: "COMPILED_WORKFLOW_RESPONSE",
};

export const getWorkFlow = (obj) => {
	return async function (dispatch) {
		try {
			const response = await getWorkflow(obj);
			if (response && !response.error)
				dispatch({
					type: ACTION_TYPE.GET_WORKFLOW,
					payload: { data: response },
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const getAppDescription = (obj) => {
	return async function (dispatch) {
		try {
			const response = await getAppDescriptionAPI(obj);
			if (response && !response.error)
				dispatch({
					type: ACTION_TYPE.GET_APP_DESCRIPTION,
					payload: { data: response.data },
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const getRecommendedApps = (
	workflowId,
	entity,
	entity_id,
	isTemplate
) => {
	return async function (dispatch) {
		try {
			const response = await fetchRecommendedApps(
				workflowId,
				entity,
				entity_id,
				isTemplate
			);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.GET_RECOMMENDED_APPS,
					payload: { data: response },
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const getRecommendedActions = (appID, parent_integration_id, type) => {
	return async function (dispatch) {
		try {
			const response = await fetchRecommendedActions(
				appID,
				parent_integration_id,
				type
			);
			if (!response.error) {
				dispatch({
					type: ACTION_TYPE.GET_RECOMMENDED_ACTIONS,
					payload: { data: response },
				});
			}
		} catch (err) {
			console.log(err);
		}
	};
};

export const editWorkflowUsers = (id, data, isTemplate, source) => {
	return async function (dispatch) {
		console.log(source);
		try {
			const response =
				source === "draft"
					? await editWorkflowDetails(id, data, isTemplate)
					: await editWorkflowetailsviaTemplate(id, data, isTemplate);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.EDIT_WORKFLOW_DETAILS,
					payload: { data: response },
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const editWorkFlowDetails = (id, data, isTemplate) => {
	return async function (dispatch) {
		try {
			const response = await editWorkflowDetails(id, data, isTemplate);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.EDIT_WORKFLOW_DETAILS,
					payload: { data: response },
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const editWorkflowNodes = (id, nodes) => {
	return async function (dispatch) {
		try {
			const response = await editWorkflowNodesService(id, {
				nodes: nodes,
			});
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.EDIT_WORKFLOW_NODE,
					payload: { data: response },
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const addAppToWorkflow = (
	workflowId,
	data,
	staticNode = false,
	isTemplate,
	appName
) => {
	return async function (dispatch) {
		try {
			let response;
			if (staticNode) {
				response = await saveStaticApplicationToWorkflow(
					workflowId,
					data,
					isTemplate
				);
				if (!response.error && appName !== PARTNER.ZLURI.name) {
					response.app_name = response.app_name.replace(
						"Zluri",
						appName
					);
					response.app_logo = null;
				}
			} else {
				response = await saveApplicationToWorkflow(
					workflowId,
					data,
					isTemplate
				);
			}

			if (!response.error) {
				dispatch({
					type: ACTION_TYPE.ADD_APPLICATION_TO_WORKFLOW,
					payload: {
						data: {
							...new WorkFlowApplicationModel(response),
							isAppAdded: data?.isAppAdded || false,
						},
						positionAt: data.positionAt,
					},
				});
			}
		} catch (err) {
			console.log(err);
		}
	};
};

export const addActionToWorkflow = (
	workflowId,
	workflowApplicationId,
	data,
	isStaticNode,
	isTemplate
) => {
	return async function (dispatch) {
		let response;
		try {
			if (isStaticNode) {
				response = await saveActionToWorkflowStaticNode(
					workflowId,
					data,
					isTemplate
				);
			} else {
				response = await saveActionToWorkflow(
					workflowId,
					workflowApplicationId,
					data,
					isTemplate
				);
			}

			if (!response.error)
				dispatch({
					type: ACTION_TYPE.ADD_ACTION_TO_WORKFLOW,
					payload: {
						action: new WorkFlowActionModel(response),
						workflowApplicationId,
					},
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const updateActionToWorkflow = (
	workflowId,
	workflowApplicationId,
	workflowActionId,
	data,
	isStaticNode,
	isTemplate
) => {
	return async function (dispatch) {
		let response;
		try {
			if (isStaticNode) {
				response = await updateActionFromWorkflowStaticNode(
					workflowId,
					workflowActionId,
					data,
					isTemplate
				);
			} else {
				response = await updateActionFromWorkflow(
					workflowId,
					workflowApplicationId,
					workflowActionId,
					data,
					isTemplate
				);
			}

			if (!response.error)
				dispatch({
					type: ACTION_TYPE.UPDATE_ACTION_TO_WORKFLOW,
					payload: {
						action: new WorkFlowActionModel(response),
						workflowApplicationId,
					},
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const editApplicationOfWorkflow = (
	workflowId,
	workflowApplicationId,
	data,
	isTemplate
) => {
	return async function (dispatch) {
		try {
			const response = await editApplicationInWorkflow(
				workflowId,
				workflowApplicationId,
				data,
				isTemplate
			);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.EDIT_APPLICATION_TO_WORKFLOW,
					payload: { data: new WorkFlowApplicationModel(response) },
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const deleteAppFromWorkflow = (
	workflowId,
	workflowApplicationId,
	isTemplate
) => {
	return async function (dispatch) {
		try {
			const response = await deleteApplicationFromWorkflow(
				workflowId,
				workflowApplicationId,
				isTemplate
			);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.DELETE_APPLICATION_TO_WORKFLOW,
					payload: { data: response, workflowApplicationId },
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const deleteAppFromMultiNode = (
	workflowId,
	workflowApplicationID,
	appId
) => {
	return async function (dispatch) {
		try {
			const response = await deleteAppFromMultiNodeService(
				workflowId,
				workflowApplicationID,
				appId
			);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.DELETE_APP_FROM_MULTI_NODE,
					payload: {
						data:
							response && Object.keys(response).length
								? new WorkFlowApplicationModel(response)
								: null,
						workflowApplicationID,
					},
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const seperateAppFromMultiNode = (
	workflowId,
	workflowApplicationId,
	appIds
) => {
	return async function (dispatch) {
		try {
			const response = await seperateAppFromMultiNodeService(
				workflowId,
				workflowApplicationId,
				appIds
			);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.SEPARATE_APP_FROM_MULTI_NODE,
					payload: {
						data: response.map(
							(res) => new WorkFlowApplicationModel(res)
						),
						workflowApplicationId,
						appIds,
					},
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const deleteActFromWorkflow = (
	workflowId,
	workflowApplicationId,
	workflowActionId,
	isTemplate
) => {
	return async function (dispatch) {
		try {
			const response = await deleteActionFromWorkflow(
				workflowId,
				workflowApplicationId,
				workflowActionId,
				isTemplate
			);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.DELETE_ACTION_TO_WORKFLOW,
					payload: {
						workflowApplicationId,
						workflowActionId,
					},
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const getAllTemplates = (type, pageNo, onApiError) => {
	return async function (dispatch) {
		try {
			const response = await getAllTemplatesService(type, pageNo);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.WORKFLOWS_GET_ALL_TEMPLATES,
					payload: response,
				});
		} catch (reason) {
			onApiError();
			console.log("Error in getAllTemplates", reason);
		}
	};
};

export const getMostUsedTemplates = (type, pageNo, onApiError) => {
	return async function (dispatch) {
		try {
			const response = await getMostUsedTemplatesService(type, pageNo);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.WORKFLOWS_GET_MOST_USED_TEMPLATES,
					payload: response,
				});
		} catch (reason) {
			onApiError();
			console.log("Error in getAllTemplates", reason);
		}
	};
};

export const getAllDrafts = (type, pageNo, onApiError) => {
	return async function (dispatch) {
		try {
			const response = await getAllDraftsService(type, pageNo);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.WORKFLOWS_GET_ALL_DRAFTS,
					payload: response,
				});
		} catch (reason) {
			onApiError();
			console.log("Error in getAllTemplates", reason);
		}
	};
};

export const getAutomationRules = (type, pageNo, onApiError) => {
	return async function (dispatch) {
		try {
			const response = await getAutomationRulesService(type, pageNo);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.WORKFLOWS_GET_AUTOMATION_RULES,
					payload: response,
				});
		} catch (reason) {
			onApiError();
			console.log("Error in getAllTemplates", reason);
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
					type: ACTION_TYPE.WORKFLOWS_UPDATE_AUTOMATION_RULES_ORDER,
					payload: response,
				});
		} catch (reason) {
			TriggerIssue("Error in updateOrderOfAutomationRules", reason);
		}
	};
};

export const getAutomationRule = (ruleId) => {
	return async function (dispatch) {
		try {
			const response = await getAutomationRuleService(ruleId);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.WORKFLOWS_GET_AUTOMATION_RULE,
					payload: response,
				});
		} catch (reason) {
			console.log("Error in get rule", reason);
		}
	};
};

export const setEditAutomationRule = (action) => {
	return async function (dispatch, getState) {
		const automationRule = getState()?.workflows?.automationRule;
		try {
			dispatch({
				type: ACTION_TYPE.SET_EDIT_AUTOMATION_RULE,
				payload: { action: { ...automationRule, ...action } },
			});
		} catch (reason) {
			console.log("Error in update rule", reason);
		}
	};
};

export const updateAutomationRules = (data) => {
	return async function (dispatch) {
		try {
			const response = await updateAutomationRulesService(data);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.WORKFLOWS_UPDATE_AUTOMATION_RULES,
					payload: { data, response },
				});
		} catch (reason) {
			onApiError();
			console.log("Error in get rule", reason);
		}
	};
};

export const patchAutomationRuleStatus = (data, status) => {
	return async function (dispatch) {
		try {
			const response = await patchAutomationStatusService(data, status);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.WORKFLOWS_UPDATE_AUTOMATION_RULES,
					payload: { data, response },
				});
		} catch (reason) {
			console.log("Error in get rule", reason);
		}
	};
};

export const updateAutomationRule = (data) => {
	return async function (dispatch) {
		try {
			console.log(
				{ data },
				"model",
				new WorkFlowAutomationRuleRequestModel(data)
			);

			const response = await updateAutomationRuleService(
				new WorkFlowAutomationRuleRequestModel(data)
			);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.WORKFLOWS_UPDATE_AUTOMATION_RULE,
					payload: {
						data: new WorkFlowAutomationRuleResponseModel(response),
					},
				});
		} catch (reason) {
			console.log("Error in get rule", reason);
		}
	};
};

export const getTopFiveDrafts = (type, onApiError) => {
	return async function (dispatch) {
		try {
			const response = await getTopFiveDraftsService(type);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.WORKFLOWS_GET_TOP_FIVE_DRAFTS,
					payload: response,
				});
		} catch (reason) {
			onApiError();
			console.log("Error in get Automation Rules", reason);
		}
	};
};

export function TransformCompleted(response) {
	let data = [];
	if (response && response.data && Array.isArray(response.data)) {
		response.data.forEach((element) => {
			let obj = new Completed(element);
			let apps = obj.workflow_apps.map((app) => {
				return new CompletedApps(app);
			});
			obj.workflow_apps = apps;
			data.push(obj);
		});
	}
	return data;
}

export const getAllCompletedWorkflows = (type, pageNo, reqBody, onApiError) => {
	return async function (dispatch) {
		try {
			const response = await getAllCompletedWorkflowsServiceV2(
				type,
				pageNo,
				reqBody
			);
			if (!response.error) {
				let data = TransformCompletedV2(response);
				// let data = response?.data;
				dispatch({
					type: ACTION_TYPE.WORKFLOWS_GET_ALL_COMPLETED_WORKFLOWS,
					payload: { meta: response?.meta, data },
				});
			}
		} catch (reason) {
			onApiError();
			console.log("Error in getAllTemplates", reason);
		}
	};
};

export const getAllScheduledRuns = (type, pageNo, reqBody, onApiError) => {
	return async function (dispatch) {
		try {
			const response = await getAllScheduledRunsServiceV2(
				type,
				pageNo,
				reqBody
			);
			if (!response.error) {
				dispatch({
					type: ACTION_TYPE.WORKFLOWS_GET_SCHEDULED_RUNS,
					payload: response,
				});
			}
		} catch (reason) {
			onApiError();
			console.log("Error in getAllTemplates", reason);
		}
	};
};

export const getInProgressWorkflows = (type, pageNo, onApiError) => {
	return async function (dispatch) {
		try {
			const response = await getInProgressWorkflowsService(type, pageNo);
			if (!response.error) {
				let data = TransformCompleted(response);
				dispatch({
					type: ACTION_TYPE.WORKFLOWS_GET_IN_PROGRESS_WORKFLOWS,
					payload: { meta: response?.meta, data },
				});
			}
		} catch (reason) {
			onApiError();
			console.log("Error in getAllTemplates", reason);
		}
	};
};

export const getAllUsers = (page, row, reqBody) => {
	return async function (dispatch) {
		try {
			const response = await getUserslistServiceV2(page, row, reqBody);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.WORKFLOWS_GET_ONBOARDING_USERS,
					payload: response,
				});
		} catch (reason) {
			console.log("Error in fetching users list for onboarding", reason);
		}
	};
};

export const compileWorkflow = (workflowId) => {
	return async function (dispatch) {
		try {
			console.log("calling compile api");
			const response = await compileWorkflowDraft(workflowId);
			if (!response.error) {
				dispatch({
					type: ACTION_TYPE.COMPILED_WORKFLOW_RESPONSE,
					payload: response,
				});
			}
		} catch (error) {
			TriggerIssue("Errors while compiling workflow", error);
		}
	};
};

export const searchDrafts = (payload) => {
	return async function (dispatch) {
		dispatch({
			type: ACTION_TYPE.WORKFLOWS_GET_ALL_DRAFTS,
			payload: payload,
		});
	};
};
export const searchTemplates = (payload) => {
	return async function (dispatch) {
		dispatch({
			type: ACTION_TYPE.WORKFLOWS_GET_ALL_TEMPLATES,
			payload: payload,
		});
	};
};

export const searchCompleted = (payload) => {
	return async function (dispatch) {
		dispatch({
			type: ACTION_TYPE.WORKFLOWS_GET_ALL_COMPLETED_WORKFLOWS,
			payload: payload,
		});
	};
};

export const searchAutomationRules = (payload) => {
	return async function (dispatch) {
		dispatch({
			type: ACTION_TYPE.WORKFLOWS_GET_AUTOMATION_RULES,
			payload: payload,
		});
	};
};

export const searchScheduleRuns = (payload) => {
	return async function (dispatch) {
		dispatch({
			type: ACTION_TYPE.WORKFLOWS_GET_SCHEDULED_RUNS,
			payload: payload,
		});
	};
};

export const getUsersBySearch = (searchTerm, cancelTokenSource, compact) => {
	return async function (dispatch) {
		try {
			searchUsers(searchTerm, cancelTokenSource, compact)
				.then((response) => {
					if (!response.error) {
						let responseData = { data: response.results, meta: [] };
						dispatch({
							type: ACTION_TYPE.WORKFLOWS_GET_SEARCHED_USERS,
							payload: responseData,
						});
					}
				})
				.catch((error) => {
					TriggerIssue(
						"Errors in search users while searching for onboarding/offboarding users",
						error
					);
				});
		} catch (reason) {
			console.log("Error in fetching users list for onboarding", reason);
		}
	};
};

export const searchUsersForDraft = (searchTerm, cancelTokenSource, compact) => {
	return async function (dispatch) {
		try {
			searchUsers(searchTerm, cancelTokenSource, compact)
				.then((response) => {
					if (!response.error) {
						let responseData = { data: response.results, meta: [] };
						dispatch({
							type: ACTION_TYPE.WORKFLOWS_GET_SEARCHED_USERS_FOR_DRAFT,
							payload: responseData,
						});
					}
				})
				.catch((error) => {
					TriggerIssue(
						"Errors in search users while searching for onboarding/offboarding users",
						error
					);
				});
		} catch (reason) {
			console.log("Error in fetching users list for onboarding", reason);
		}
	};
};

export const setEditActionWorkflow = (action) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.SET_EDIT_ACTION,
				payload: { action },
			});
		} catch (reason) {
			console.log("Error in setSelectedUsers", reason);
		}
	};
};

export const setEditApplication = (app) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.SET_EDIT_APP_ID,
				payload: app,
			});
		} catch (reason) {
			console.log("Error in setSelectedUsers", reason);
		}
	};
};

export const setOrgIdApplication = (org_integration_id) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.SET_APP_ORG_ID,
				payload: org_integration_id,
			});
		} catch (reason) {
			console.log("Error in setting org app id", reason);
		}
	};
};

export const fetchListOfRuns = (workflowId, type, errorFunction) => {
	return async function (dispatch) {
		try {
			const response = await getListOfRuns(workflowId, type);
			if (response && !response.error)
				dispatch({
					type: ACTION_TYPE.GET_LIST_OF_RUNS,
					payload: { data: response },
				});
		} catch (err) {
			errorFunction(true);
			console.log(err);
		}
	};
};
export const fetchSummarisedRunLogs = (
	workflowId,
	runId,
	isRefresh,
	type,
	apiError,
	isManualRefresh = false
) => {
	return async function (dispatch) {
		let response = await getSummarisedRunLogData(
			workflowId,
			runId,
			isRefresh,
			type
		);
		if (response && !response.error) {
			response?.run_log?.map((log) => {
				if (
					log?.action?.action_initiated &&
					log?.action?.action_type === "manual" &&
					log?.action?.action_status === "pending" &&
					!log.group_state
				) {
					const obj = {
						type: "pending",
						title: `Awaiting ${
							log?.action?.action_data?.assignee?.[0]
								?.user_name ||
							log?.action?.action_data?.assignee?.[0]
								?.user_email ||
							""
						} to perform ${
							log?.action?.action_data?.title ||
							log?.action?.action_name ||
							""
						}`,
						description:
							"The user has not marked this task as completed yet.",
						timestamp: null,
						group: "n8n",
					};
					log.action.action_log.push(obj);
				}
				if (log.group_state && log.apps.length) {
					return log.apps.map((app) => {
						if (
							app.app_action_status === "pending" &&
							log.action.action_status === "pending"
						) {
							const obj = {
								type: "pending",
								title: `Awaiting user to delete ${
									app.app_name || ""
								} account`,
								description:
									"The user has not marked this task as completed",
								timestamp: null,
								group: "n8n",
								appId: app.app_id,
							};
							log.action.action_log.push(obj);
						}
					});
				}
			});

			dispatch({
				type: ACTION_TYPE.GET_SUMMARISED_RUN_LOGS,
				payload: { data: response },
			});
		}
		if (response && response.error && isManualRefresh) {
			apiError(true);
		}
	};
};
export const fetchRawRunLogs = (
	workflowId,
	runId,
	isRefresh,
	type,
	apiError,
	isManualRefresh = false
) => {
	return async function (dispatch) {
		let response = await getRawRunLogData(
			workflowId,
			runId,
			isRefresh,
			type
		);
		if (response && !response.error) {
			dispatch({
				type: ACTION_TYPE.GET_RAW_RUN_LOGS,
				payload: { data: response },
			});
		}
		if (response && response.error && isManualRefresh) apiError(true);
	};
};

export const clearWorkflow = () => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.CLEAR_WORKFLOW,
			});
		} catch (reason) {
			console.log("Error in setSelectedUsers", reason);
		}
	};
};

export const updateWorkflow = (workflow) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.UPDATE_WORKFLOW,
				payload: workflow,
			});
		} catch (reason) {
			console.log("Error in update workflow details", reason);
		}
	};
};

export const removeTemplateFromStore = (id) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.REMOVE_TEMPLATE,
				payload: id,
			});
		} catch (reason) {
			console.log("Error in update workflow details", reason);
		}
	};
};

export const removeMostUsedTemplateFromStore = (id) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.REMOVE_MOST_USED_TEMPLATE,
				payload: id,
			});
		} catch (reason) {
			console.log("Error in update workflow details", reason);
		}
	};
};
export const workflowExecuted = () => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.SET_WORKFLOW_EXECUTED,
			});
		} catch (reason) {
			console.log("Error while adding new action", reason);
		}
	};
};

export const clearWorkflowLogs = () => {
	return async function (dispatch) {
		dispatch({
			type: ACTION_TYPE.CLEAR_WORKFLOW_LOGS,
		});
	};
};

export const clearListOfWorkflows = () => {
	return async function (dispatch) {
		dispatch({
			type: ACTION_TYPE.CLEAR_LIST_OF_WORKFLOWS,
		});
	};
};

export const getAllManualTaskTemplates = (onlyCustomTemplate) => {
	return async function (dispatch) {
		const response = await getAllManualTaskTemplatesAPI(onlyCustomTemplate);
		if (response && !response.error) {
			dispatch({
				type: ACTION_TYPE.GET_ALL_MANUAL_TASK_TEMPLATES,
				payload: { data: response.data },
			});
		}
		if (response && response.error) {
			console.log(response.error);
		}
	};
};

export const getManualTaskTemplateData = (
	workflow_users,
	appId,
	templateId
) => {
	return async function (dispatch) {
		const response = await getManualTaskTemplateDataAPI(
			workflow_users,
			appId,
			templateId
		);
		if (response && !response.error) {
			dispatch({
				type: ACTION_TYPE.GET_MANUAL_TASK_TEMPLATE_DATA,
				payload: { data: response.data },
			});
		}
		if (response && response.error) {
			console.log(response.error);
		}
	};
};

export const getInegrationAccounts = (appId) => {
	return async function (dispatch) {
		const response = await getIntegrationAccountsAPI(appId);
		if (response && !response.error) {
			dispatch({
				type: ACTION_TYPE.GET_INTEGRATION_ACCOUNTS,
				payload: { data: response, appId },
			});
		}
		if (response && response.error) {
			console.log(response.error);
		}
	};
};

export const getIntegrationAccountsV2 = (appId) => {
	return async function (dispatch) {
		const response = await getIntegrationAccountsV2API(appId);
		if (response && !response.error) {
			dispatch({
				type: ACTION_TYPE.GET_INTEGRATION_ACCOUNTS,
				payload: { data: response, appId },
			});
		}
		if (response && response.error) {
			console.log(response.error);
		}
	};
};

export const addToScopeValidations = (orgIntegrationID) => {
	return async function (dispatch) {
		dispatch({
			type: ACTION_TYPE.ACTION_SCOPE_VALIDATIONS,
			payload: { orgIntegrationID, data: {} },
		});
	};
};

export const runScopeValidations = (workflowId, data, isTemplate) => {
	return async function (dispatch) {
		const response = await actionValidation(workflowId, data, isTemplate);
		if (response) {
			dispatch({
				type: ACTION_TYPE.ACTION_SCOPE_VALIDATIONS,
				payload: {
					orgIntegrationID: data.org_integration_id,
					data: response,
				},
			});
		}
		if (response && response.error) {
			console.log(response.error);
		}
	};
};

export const removeInegrationAccount = (appId) => {
	return async function (dispatch) {
		dispatch({
			type: ACTION_TYPE.REMOVE_INTEGRATION_ACCOUNT,
			payload: { appId },
		});
	};
};

export const clearManualTaskData = () => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.CLEAR_MANUAL_TASK_TEMPLATE_DATA,
			});
		} catch (reason) {
			console.log("Error in setSelectedUsers", reason);
		}
	};
};

export const getOffboardingTasks = ({ workflowId, userId, token }) => {
	return async function (dispatch) {
		const response = await getOffboardingTasksAPI({
			workflowId,
			userId,
			token,
		});
		if (response && !response.error) {
			dispatch({
				type: ACTION_TYPE.GET_OFFBOARDING_TASKS_LIST,
				payload: { data: response },
			});
		}
		if (response && response.error) {
			console.log(response.error);
		}
	};
};

export const markOffboardingTaskAsComplete = ({
	workflowId,
	userId,
	selectedApp,
	token,
}) => {
	return async function (dispatch) {
		const response = await markOffboardingTaskAsCompleteAPI({
			workflowId,
			userId,
			selectedApp,
			token,
		});
		if (response && !response.error) {
			dispatch({
				type: ACTION_TYPE.MARK_OFFBOARDING_TASK_COMPLETE,
				payload: { response, req: selectedApp },
			});
		}
		if (response && response.error) {
			console.log(response.error);
		}
	};
};

export const signOffboardingDeclaration = ({ workflowId, userId, token }) => {
	return async function (dispatch) {
		const response = await signOffboardingDeclarationAPI({
			workflowId,
			userId,
			token,
		});
		if (response && !response.error) {
			dispatch({
				type: ACTION_TYPE.SIGN_OFFBOARDING_DECLARATION_TASK,
				payload: { response },
			});
		}
		if (response && response.error) {
			console.log(response.error);
		}
	};
};

export const getPendingAppList = ({ workflowId }) => {
	return async function (dispatch) {
		const response = await getPendingAppListAPI({
			workflowId,
		});
		if (response && !response.error) {
			dispatch({
				type: ACTION_TYPE.GET_PENDING_APP_LIST,
				payload: { response },
			});
		}
		if (response && response.error) {
			response.error;
		}
	};
};

export const addPendingAppList = ({ workflowId, apps }) => {
	return async function (dispatch) {
		const response = await addPendingAppListAPI({
			workflowId,
			apps,
		});
		if (response && !response.error) {
			dispatch({
				type: ACTION_TYPE.ADD_PENDING_APP_TO_WORKFLOW,
				payload: { response },
			});
		}
		if (response && response.error) {
			console.log(response.error);
		}
	};
};

export const emptyTemplates = () => {
	return async function (dispatch) {
		dispatch({
			type: ACTION_TYPE.EMPTY_TEMPLATES,
		});
	};
};

export const updateSelectedUsers = (selectedUsers) => {
	return async function (dispatch) {
		dispatch({
			type: ACTION_TYPE.SELECTED_USERS,
			payload: selectedUsers,
		});
	};
};

export const getAllTemplatesV2 = (type, pageNo, reqBody, onApiError) => {
	return async function (dispatch) {
		try {
			const response = await getAllPlaybookWorkflowsServiceV2(
				type,
				pageNo,
				reqBody
			);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.WORKFLOWS_GET_ALL_TEMPLATES,
					payload: response,
				});
		} catch (reason) {
			onApiError();
			console.log("Error in getAllTemplates", reason);
		}
	};
};

export const changeIntegrationAccount = (
	workflowId,
	workflowApplicationId,
	reqObj,
	isTemplate,
	type
) => {
	return async function (dispatch) {
		try {
			const response = await changeIntegrationAccountAPI(
				workflowId,
				workflowApplicationId,
				reqObj,
				isTemplate,
				type
			);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.EDIT_APPLICATION_TO_WORKFLOW,
					payload: { data: new WorkFlowApplicationModel(response) },
				});
		} catch (reason) {
			TriggerIssue("Error in changing Integration account", reason);
		}
	};
};

/**
 * STORE
 */
const workflowState = {
	workflow: {},
	editActionWorkflow: null,
	editApplication: null,
	recommendedApps: null,
	recommedendActions: null,
	overviewDrafts: null,
	templates: null,
	mostUsedTemplates: null,
	drafts: null,
	completed: null,
	automationRules: null,
	automationRule: null,
	scheduledRuns: null,
	initialAutomationRuleState: null,
	inProgress: null,
	users: null,
	actions: null,
	selectedUsers: null,
	listOfRuns: {},
	summarisedRunLogs: {},
	rawRunLogs: {},
	appDescription: [],
	allManualTaskTemplates: [],
	manualTaskTemplateById: null,
	manualTaskTemplateData: null,
	integrationAccounts: {},
	offboardingTasks: {},
	scopeValidations: {},
	pendingAppList: [],
};

/**
 * Reducer
 * @param {*} state // state of the current reducer
 * @param {*} action // action dispatched {type:"",payload:{}}
 */
export function workflowsReducer(state = workflowState, action) {
	switch (action.type) {
		case ACTION_TYPE.SET_APP_ORG_ID:
			return Object.assign({}, state, {
				editApplication: Object.assign({}, state.editApplication, {
					orgIntegrationID: action.payload,
				}),
			});
		case ACTION_TYPE.GET_WORKFLOW:
		case ACTION_TYPE.EDIT_WORKFLOW_DETAILS:
		case ACTION_TYPE.EDIT_WORKFLOW_NODE:
			var workflow = new WorkflowModel(action.payload.data);
			return Object.assign({}, state, {
				workflow: refreshActionIndex(workflow),
				editActionWorkflow: null,
			});
		case ACTION_TYPE.GET_APP_DESCRIPTION:
			const data = action.payload.data[0];
			var appDescription = new AppDescriptionModel(data);
			const appDescriptionArray = [...state.appDescription];
			const index = appDescriptionArray.findIndex(
				(element) => element.id === appDescription.id
			);
			if (index === -1) {
				appDescriptionArray.push(appDescription);
			}
			return Object.assign({}, state, {
				appDescription: appDescriptionArray,
			});
		case ACTION_TYPE.GET_INTEGRATION_ACCOUNTS:
			let newData = action.payload.data;
			newData.appId = action.payload.appId;
			if (newData.integration) {
				newData.integration = new Integration(newData.integration);
			}
			const integrationAccounts = { ...state.integrationAccounts };
			integrationAccounts[action.payload.appId] = newData;
			return Object.assign({}, state, {
				integrationAccounts: integrationAccounts,
			});
		case ACTION_TYPE.REMOVE_INTEGRATION_ACCOUNT:
			let appId = action.payload.appId;
			const oldIntegrationAccountsObj = { ...state.integrationAccounts };
			Reflect.deleteProperty(oldIntegrationAccountsObj, appId);
			return Object.assign({}, state, {
				integrationAccounts: oldIntegrationAccountsObj,
			});
		case ACTION_TYPE.ADD_APPLICATION_TO_WORKFLOW:
			var nodes = state.workflow.nodes;
			if (action.payload.positionAt >= 0) {
				nodes.splice(action.payload.positionAt, 0, action.payload.data);
			} else {
				nodes.push(action.payload.data);
			}
			return Object.assign({}, state, {
				workflow: refreshActionIndex(
					Object.assign({}, state.workflow, {
						nodes,
					})
				),
				editActionWorkflow: null,
				editApplication: action.payload.data,
			});
		case ACTION_TYPE.SEPARATE_APP_FROM_MULTI_NODE:
			var nodes = state.workflow.nodes;
			var appIndex = nodes.findIndex(
				(node) =>
					node.workflowApplicationID ===
					action.payload.workflowApplicationId
			);
			var node = nodes[appIndex];
			if (action.payload.appIds.length > 1) {
				node.apps = [];
			} else {
				node.apps = node.apps.filter(
					(app) => app.id != action.payload.appIds[0]
				);
			}
			if (node.apps.length) {
				nodes.splice(appIndex, 1, node);
			} else {
				nodes.splice(appIndex, 1);
			}
			nodes = [...nodes, ...action.payload.data];
			return Object.assign({}, state, {
				workflow: refreshActionIndex(
					Object.assign({}, state.workflow, {
						nodes,
					})
				),
				editActionWorkflow: null,
				editApplication: action.payload.data[0],
			});
		case ACTION_TYPE.EDIT_APPLICATION_TO_WORKFLOW:
		case ACTION_TYPE.DELETE_APP_FROM_MULTI_NODE:
			var application = action.payload.data;
			var nodes = state.workflow.nodes;
			var appIndex = nodes.findIndex(
				(app) =>
					app.workflowApplicationID ===
					application.workflowApplicationID
			);
			if (application) {
				nodes.splice(appIndex, 1, application);
			} else {
				nodes.splice(appIndex, 1);
			}

			return Object.assign({}, state, {
				recommedendActions: null,
				integrationAccounts: {},
				workflow: refreshActionIndex(
					Object.assign({}, state.workflow, { nodes })
				),
			});
		case ACTION_TYPE.REMOVE_TEMPLATE:
			var templates = state.templates.data;
			var ind = templates.findIndex(
				(template) =>
					template.workflow_id || template._id === action.payload
			);
			templates.splice(ind, 1);
			return Object.assign({}, state, {
				templates: {
					data: templates,
					meta: state.templates.meta,
				},
			});
		case ACTION_TYPE.REMOVE_MOST_USED_TEMPLATE:
			var mostUsedTemplates = state.mostUsedTemplates.data;
			var inx = mostUsedTemplates.findIndex(
				(template) =>
					template.workflow_id || template._id === action.payload
			);
			mostUsedTemplates.splice(inx, 1);
			return Object.assign({}, state, {
				mostUsedTemplates: {
					data: mostUsedTemplates,
					meta: state.mostUsedTemplates.meta,
				},
			});
		case ACTION_TYPE.ADD_ACTION_TO_WORKFLOW:
		case ACTION_TYPE.UPDATE_ACTION_TO_WORKFLOW:
			var workflow = state.workflow;
			var nodes = workflow.nodes;

			var appIndex = nodes.findIndex(
				(app) =>
					app.workflowApplicationID ===
					action.payload.workflowApplicationId
			);
			var actionIndex = nodes[appIndex].actions.findIndex(
				(act) =>
					act.workflowActionID ===
					action.payload.action.workflowActionID
			);
			if (actionIndex > -1) {
				nodes[appIndex].actions.splice(
					actionIndex,
					1,
					action.payload.action
				);
			} else {
				nodes[appIndex].actions.push(action.payload.action);
			}
			nodes[appIndex].actions = nodes[appIndex].actions.filter(
				(act) => act.workflowActionID
			);
			return Object.assign({}, state, {
				workflow: refreshActionIndex(
					Object.assign({}, state.workflow, {
						nodes: workflow.nodes,
					})
				),
				editActionWorkflow:
					action.type === ACTION_TYPE.UPDATE_ACTION_TO_WORKFLOW
						? null
						: action.payload.action,
				editApplication: nodes[appIndex],
			});
		case ACTION_TYPE.DELETE_APPLICATION_TO_WORKFLOW:
			var nodes = state.workflow.nodes;
			var appIndex = nodes.findIndex(
				(app) =>
					app.workflowApplicationID ===
					action.payload.workflowApplicationId
			);
			nodes.splice(appIndex, 1);
			return Object.assign({}, state, {
				workflow: refreshActionIndex(
					Object.assign({}, state.workflow, {
						nodes: nodes,
					})
				),
				editApplication: null,
				editActionWorkflow: null,
				recommedendActions: null,
			});
		case ACTION_TYPE.DELETE_ACTION_TO_WORKFLOW:
			var nodes = state.workflow.nodes;
			var appIndex = nodes.findIndex(
				(app) =>
					app.workflowApplicationID ===
					action.payload.workflowApplicationId
			);
			var actionIndex = nodes[appIndex].actions.findIndex(
				(act) =>
					act.workflowActionID === action.payload.workflowActionId
			);
			nodes[appIndex].actions.splice(actionIndex, 1);
			return Object.assign({}, state, {
				workflow: refreshActionIndex(
					Object.assign({}, state.workflow, {
						nodes,
					})
				),
				editActionWorkflow: null,
			});
		case ACTION_TYPE.SET_WORKFLOW_EXECUTED:
			return Object.assign({}, state, {
				workflow: Object.assign({}, state.workflow, {
					isExecuted: true,
					editApplication: null,
					editActionWorkflow: null,
					recommedendActions: null,
				}),
			});
		case ACTION_TYPE.UPDATE_WORKFLOW:
			return Object.assign({}, state, {
				workflow: refreshActionIndex(action.payload),
				editActionWorkflow: null,
			});
		case ACTION_TYPE.WORKFLOWS_GET_ALL_TEMPLATES:
			return { ...state, templates: action.payload };
		case ACTION_TYPE.WORKFLOWS_GET_MOST_USED_TEMPLATES:
			return { ...state, mostUsedTemplates: action.payload };
		case ACTION_TYPE.WORKFLOWS_GET_TOP_FIVE_DRAFTS:
			return { ...state, overviewDrafts: action.payload };
		case ACTION_TYPE.WORKFLOWS_GET_ALL_DRAFTS:
			return { ...state, drafts: action.payload };
		case ACTION_TYPE.EMPTY_TEMPLATES:
			return { ...state, templates: null };
		case ACTION_TYPE.WORKFLOWS_GET_ALL_COMPLETED_WORKFLOWS:
			return { ...state, completed: action.payload };
		case ACTION_TYPE.WORKFLOWS_GET_AUTOMATION_RULES:
			return { ...state, automationRules: action.payload };
		case ACTION_TYPE.WORKFLOWS_GET_SCHEDULED_RUNS:
			return { ...state, scheduledRuns: action.payload };
		case ACTION_TYPE.WORKFLOWS_UPDATE_AUTOMATION_RULES_ORDER:
			return {
				...state,
				automationRules: Object.assign({}, state.automationRules, {
					data: action.payload,
				}),
			};
		case ACTION_TYPE.WORKFLOWS_UPDATE_AUTOMATION_RULES:
			const rules = { ...state.automationRules };
			const i = rules.data.findIndex(
				(rule) => rule._id === action.payload.data._id
			);
			if (i > -1) {
				rules.data[i] = action.payload.response;
			}
			return { ...state, automationRules: rules };
		case ACTION_TYPE.WORKFLOWS_UPDATE_AUTOMATION_RULE:
			return {
				...state,
				automationRule: action.payload.data,
				initialAutomationRuleState: action.payload.data,
			};
		case ACTION_TYPE.WORKFLOWS_GET_AUTOMATION_RULE:
			return {
				...state,
				automationRule: new WorkFlowAutomationRuleResponseModel(
					action.payload
				),
				initialAutomationRuleState:
					new WorkFlowAutomationRuleResponseModel(action.payload),
			};
		case ACTION_TYPE.SET_EDIT_AUTOMATION_RULE:
			return { ...state, automationRule: action.payload.action };
		case ACTION_TYPE.WORKFLOWS_GET_IN_PROGRESS_WORKFLOWS:
			return { ...state, inProgress: action.payload };
		case ACTION_TYPE.WORKFLOWS_GET_ONBOARDING_USERS:
			return { ...state, users: action.payload };
		case ACTION_TYPE.WORKFLOWS_GET_ACTIONS_BY_WORKFLOW_ID:
			return { ...state, actions: action.payload };
		case ACTION_TYPE.WORKFLOWS_GET_SEARCHED_USERS:
			return { ...state, users: action.payload };
		case ACTION_TYPE.WORKFLOWS_GET_SEARCHED_USERS_FOR_DRAFT:
			return { ...state, usersForDraft: action.payload };
		case ACTION_TYPE.GET_RECOMMENDED_APPS:
			return Object.assign({}, state, {
				recommendedApps: action.payload.data
					.map((res) => {
						res.app_id = res._id;
						return res;
					})
					.map((res) => new WorkFlowApplicationModel(res)),
			});
		case ACTION_TYPE.GET_RECOMMENDED_ACTIONS:
			return Object.assign({}, state, {
				recommedendActions:
					action.payload.data.length === 0
						? []
						: action.payload.data.actions
								.map((res) => {
									res.action_id = res._id;
									if (res.inputFields?.length === 0) {
										res.data_reusable = true;
									}
									return res;
								})
								.map((res) => new WorkFlowActionModel(res)),
			});
		case ACTION_TYPE.SET_EDIT_ACTION:
			return Object.assign({}, state, {
				editActionWorkflow: action.payload.action,
			});
		case ACTION_TYPE.SET_EDIT_APP_ID:
			let recommedendAction = state.recommedendActions;
			if (!action.payload) {
				recommedendAction = null;
			}
			return Object.assign({}, state, {
				editApplication: action.payload,
				editActionWorkflow: null,
				recommedendActions: recommedendAction,
			});
		case ACTION_TYPE.GET_LIST_OF_RUNS:
			return { ...state, listOfRuns: action.payload.data };
		case ACTION_TYPE.GET_SUMMARISED_RUN_LOGS:
			let summarisedLogs = { ...action.payload.data };

			if (summarisedLogs?.executions) {
				let validRetryAttempt = getFailedRetriesForWorkflow(
					summarisedLogs?.executions
				);
				summarisedLogs.validRetryAttempt = validRetryAttempt;
				summarisedLogs?.run_log.map((runLog) => {
					if (
						runLog?.action?.action_status === "failed"
						// || runLog?.action?.action_status === "aborted"
					) {
						let actionRetryAttempt =
							getFailedRetriesForWorkflowActions(
								summarisedLogs?.executions,
								true,
								runLog?.action?.action_id
							);
						runLog.action.validRetryAttempt = actionRetryAttempt;
					}
				});
			}
			return { ...state, summarisedRunLogs: summarisedLogs };
		case ACTION_TYPE.GET_RAW_RUN_LOGS:
			let rawLogs = { ...action.payload.data };

			if (rawLogs?.executions) {
				let validRetryAttempt = getFailedRetriesForWorkflow(
					rawLogs?.executions
				);
				rawLogs.validRetryAttempt = validRetryAttempt;
				rawLogs?.run_log.map((rawLog) => {
					if (
						rawLog?.action_status === "failed" ||
						rawLog?.action_status === "aborted"
					) {
						let actionRetryAttempt =
							getFailedRetriesForWorkflowActions(
								rawLogs?.executions,
								true,
								rawLog?.action_id
							);
						rawLog.validRetryAttempt = actionRetryAttempt;
					}
				});
			}
			return { ...state, rawRunLogs: rawLogs };
		case ACTION_TYPE.GET_ALL_MANUAL_TASK_TEMPLATES:
			let template = [];
			if (
				Array.isArray(action.payload.data) &&
				action.payload.data.length > 0
			) {
				template = action.payload.data.map((temp) => {
					return new AllManualTaskTemplatesModel(temp);
				});
			} else {
				template = [];
			}
			return Object.assign({}, state, {
				allManualTaskTemplates: template,
			});
		case ACTION_TYPE.GET_MANUAL_TASK_TEMPLATE_DATA:
			let resp = action.payload.data;
			return Object.assign({}, state, {
				manualTaskTemplateData: resp,
			});
		case ACTION_TYPE.CLEAR_MANUAL_TASK_TEMPLATE_DATA:
			return Object.assign({}, state, {
				manualTaskTemplateData: null,
				allManualTaskTemplates: [],
			});
		case ACTION_TYPE.CLEAR_WORKFLOW:
			return Object.assign({}, state, {
				workflow: {},
				editActionWorkflow: null,
				editApplication: null,
				recommendedApps: null,
				recommedendActions: null,
				listOfRuns: {},
				appDescription: [],
				allManualTaskTemplates: [],
				manualTaskTemplateById: null,
				manualTaskTemplateData: null,
				selected_users: [],
				integrationAccounts: {},
			});
		case ACTION_TYPE.CLEAR_WORKFLOW_LOGS:
			return Object.assign({}, state, {
				summarisedRunLogs: {},
				rawRunLogs: {},
			});
		case ACTION_TYPE.CLEAR_LIST_OF_WORKFLOWS:
			return {
				...state,
				drafts: null,
				overviewDrafts: null,
				templates: null,
				mostUsedTemplates: null,
				inProgress: null,
				completed: null,
				automationRules: null,
				automationRule: null,
			};
		case ACTION_TYPE.GET_OFFBOARDING_TASKS_LIST:
			return Object.assign({}, state, {
				offboardingTasks: new WorkFlowOffboardingDashboardModel(
					action.payload.data
				),
			});
		case ACTION_TYPE.MARK_OFFBOARDING_TASK_COMPLETE:
			const { response, req } = action.payload;
			const newOffboardingTask = { ...state.offboardingTasks };
			if (response) {
				newOffboardingTask.actions.length &&
					newOffboardingTask.actions.forEach((action) => {
						if (action && response.modified_action_ids.length) {
							response.modified_action_ids.forEach((id) => {
								if (
									action.workflowActionId ===
										id.workflow_action_id &&
									action.appId === id.app_id
								) {
									action.actionStatus = "completed";
									action.appActionStatus = "completed";
								}
							});
						}
					});
			}
			return Object.assign({}, state, {
				offboardingTasks: newOffboardingTask,
			});
		case ACTION_TYPE.SIGN_OFFBOARDING_DECLARATION_TASK:
			const rsp = action.payload.response;
			const newOffboardingTasks = { ...state.offboardingTasks };
			if (rsp.success) {
				newOffboardingTasks.declarationSigned = true;
			}
			return Object.assign({}, state, {
				offboardingTasks: newOffboardingTasks,
			});
		case ACTION_TYPE.ACTION_SCOPE_VALIDATIONS:
			const result = {};
			if (action.payload.data.actionMetadata) {
				action.payload.data.actionMetadata.forEach((actionObj) => {
					actionObj.currentScopes =
						action.payload.data.currentScopesObjects;
					result[actionObj.actionId] = actionObj;
				});
			} else {
				result.error = action.payload.data;
			}

			let scopeValidations =
				Object.assign(
					{},
					state.scopeValidations[action.payload.orgIntegrationID]
				) || {};
			return Object.assign({}, state, {
				scopeValidations: Object.assign({}, state.scopeValidations, {
					[action.payload.orgIntegrationID]: Object.assign(
						scopeValidations,
						result
					),
				}),
			});
		case ACTION_TYPE.GET_PENDING_APP_LIST:
			return Object.assign({}, state, {
				pendingAppList: action.payload.response,
			});
		case ACTION_TYPE.ADD_PENDING_APP_TO_WORKFLOW:
			const newWorkflow = { ...state.workflow };
			action.payload.response.map((app) => {
				newWorkflow.nodes.push(new WorkFlowApplicationModel(app));
			});
			return Object.assign({}, state, {
				workflow: refreshActionIndex(newWorkflow),
			});
		case ACTION_TYPE.SELECTED_USERS:
			return Object.assign({}, state, {
				selected_users: action.payload,
			});
		case ACTION_TYPE.COMPILED_WORKFLOW_RESPONSE:
			const exec_docs = action.payload.map((workflow) =>
				refreshActionIndex(workflow)
			);
			return Object.assign({}, state, {
				compiledExecDocs: exec_docs,
			});
		default:
			return state;
	}
}

const refreshActionIndex = (workflow) => {
	let index = 1;
	workflow.nodes = workflow.nodes.map((app) => {
		app.actions = app.actions.map((action) => {
			action.index = index;
			index++;
			return action;
		});
		return app;
	});
	return workflow;
};

const getFailedRetriesForWorkflow = (executions) => {
	let validRetryAttempt = true;

	for (let i = 0; i < executions.length && validRetryAttempt; i++) {
		if (executions[i].type === "workflow" && !executions[i].log_refreshed) {
			if (
				(executions[i].n8n_workflow_status !== "failed" ||
					executions[i].n8n_workflow_status !== "aborted") &&
				!executions[i].log_refresh_error
			) {
				validRetryAttempt = false;
			}
		}
	}
	return validRetryAttempt;
};

const getFailedRetriesForWorkflowActions = (
	executions,
	validRetryAttempt,
	actionId
) => {
	for (let i = 0; i < executions.length && validRetryAttempt; i++) {
		if (executions[i].type === "workflow" && !executions[i].log_refreshed) {
			if (
				(executions[i].n8n_workflow_status !== "failed" ||
					executions[i].n8n_workflow_status !== "aborted") &&
				!executions[i].log_refresh_error
			) {
				validRetryAttempt = false;
			}
		} else if (
			executions[i].type === "action" &&
			executions[i].action_id.toString() === actionId.toString() &&
			!executions[i].log_refreshed
		) {
			if (
				(executions[i].n8n_workflow_status !== "failed" ||
					executions[i].n8n_workflow_status !== "aborted") &&
				!executions[i].log_refresh_error
			) {
				validRetryAttempt = false;
			}
		}
		return validRetryAttempt;
	}
	return validRetryAttempt;
};

export function TransformCompletedV2(response) {
	let data = [];
	if (response && response.data && Array.isArray(response.data)) {
		response.data.forEach((element) => {
			let obj = new CompletedV2(element);
			let apps = obj.workflow_apps.map((app) => {
				return new CompletedApps(app);
			});
			obj.workflow_apps = apps;
			data.push(obj);
		});
	}
	return data;
}
