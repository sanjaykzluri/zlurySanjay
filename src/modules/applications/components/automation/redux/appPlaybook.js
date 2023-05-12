import { Integration } from "modules/integrations/model/model";
import {
	AllManualTaskTemplatesModel,
	WorkFlowActionModel,
	WorkFlowApplicationModel,
	WorkflowModel,
} from "modules/workflow/model/model";
import {
	actionValidation,
	deleteActionFromWorkflow,
	editApplicationInWorkflow,
	editWorkflowDetails,
	getAllManualTaskTemplatesAPI,
	getIntegrationAccountsAPI,
	getListOfRuns,
	getManualTaskTemplateDataAPI,
	getRawRunLogData,
	getSummarisedRunLogData,
	getWorkflow,
	saveActionToWorkflow,
	updateActionFromWorkflow,
} from "modules/workflow/service/api";
import { addApplicationtoNodes } from "../service/automation-api";

const appPlaybookState = {
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
const ACTION_TYPE = {
	UPDATE_ACTION_TO_PLAYBOOK: "UPDATE_ACTION_TO_PLAYBOOK",
	ADD_ACTION_TO_PLAYBOOK: "ADD_ACTION_TO_PLAYBOOK",
	GET_APPPLAYBOOK: "GET_APPPLAYBOOK",
	ADD_APPLICATION_TO_PLAYBOOK: "ADD_APPLICATION_TO_PLAYBOOK",
	SET_EDIT_ACTION_PLAYBOOK: "SET_EDIT_ACTION_PLAYBOOK",
	DELETE_ACTION_TO_PLAYBOOK: "DELETE_ACTION_TO_PLAYBOOK",
	ACTION_SCOPE_VALIDATIONS_PLAYBOOK: "ACTION_SCOPE_VALIDATIONS_PLAYBOOK",
	GET_INTEGRATION_ACCOUNTS_PLAYBOOK: "GET_INTEGRATION_ACCOUNTS_PLAYBOOK",
	REMOVE_INTEGRATION_ACCOUNT_PLAYBOOK: "REMOVE_INTEGRATION_ACCOUNT_PLAYBOOK",
	EDIT_APPLICATION_TO_PLAYBOOK: "EDIT_APPLICATION_TO_PLAYBOOK",
	EDIT_APPPLAYBOOK_DETAILS: "EDIT_APPPLAYBOOK_DETAILS",
	SET_EDIT_APP_ID_PLAYBOOK: "SET_EDIT_APP_ID_PLAYBOOK",
	GET_SUMMARISED_RUN_LOGS_PLAYBOOK: "GET_SUMMARISED_RUN_LOGS_PLAYBOOK",
	GET_LIST_OF_RUNS_PLAYBOOK: "GET_LIST_OF_RUNS_PLAYBOOK",
	CLEAR_WORKFLOW_IN_PLAYBOOK: "CLEAR_WORKFLOW_IN_PLAYBOOK",
	GET_RAW_RUN_LOGS_PLAYBOOK: "GET_RAW_RUN_LOGS_PLAYBOOK",
	GET_ALL_MANUAL_TASK_TEMPLATES_PLAYBOOK:
		"GET_ALL_MANUAL_TASK_TEMPLATES_PLAYBOOK",
	GET_MANUAL_TASK_TEMPLATE_DATA_PLAYBOOk:
		"GET_MANUAL_TASK_TEMPLATE_DATA_PLAYBOOk",
};

export const editWorkFlowDetails = (id, data, isTemplate) => {
	return async function (dispatch) {
		try {
			const response = await editWorkflowDetails(id, data, isTemplate);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.EDIT_APPPLAYBOOK_DETAILS,
					payload: { data: response },
				});
		} catch (err) {
			console.log(err);
		}
	};
};
export const clearWorkflow = () => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.CLEAR_WORKFLOW_IN_PLAYBOOK,
			});
		} catch (reason) {
			console.log("Error in setSelectedUsers", reason);
		}
	};
};

export const updateActiontoPlaybook = (
	workflowId,
	workflowApplicationId,
	workflowActionId,
	data,
	isTemplate
) => {
	return async function (dispatch) {
		let response;
		try {
			response = await updateActionFromWorkflow(
				workflowId,
				workflowApplicationId,
				workflowActionId,
				data,
				isTemplate
			);

			if (!response.error)
				dispatch({
					type: ACTION_TYPE.UPDATE_ACTION_TO_PLAYBOOK,
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

export const runScopeValidations = (workflowId, data, isTemplate) => {
	return async function (dispatch) {
		const response = await actionValidation(workflowId, data, isTemplate);
		if (response) {
			dispatch({
				type: ACTION_TYPE.ACTION_SCOPE_VALIDATIONS_PLAYBOOK,
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

export const getAppPlaybook = (obj) => {
	return async function (dispatch) {
		try {
			const response = await getWorkflow(obj);
			if (response && !response.error)
				dispatch({
					type: ACTION_TYPE.GET_APPPLAYBOOK,
					payload: { data: response },
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const setEditApplication = (app) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.SET_EDIT_APP_ID_PLAYBOOK,
				payload: app,
			});
		} catch (reason) {
			console.log("Error in setSelectedUsers", reason);
		}
	};
};
export const fetchListOfRuns = (workflowId, type, errorFunction) => {
	return async function (dispatch) {
		try {
			const response = await getListOfRuns(workflowId, type);
			if (response && !response.error)
				dispatch({
					type: ACTION_TYPE.GET_LIST_OF_RUNS_PLAYBOOK,
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
				type: ACTION_TYPE.GET_SUMMARISED_RUN_LOGS_PLAYBOOK,
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
				type: ACTION_TYPE.GET_RAW_RUN_LOGS_PLAYBOOK,
				payload: { data: response },
			});
		}
		if (response && response.error && isManualRefresh) apiError(true);
	};
};

export const setEditActionPlaybook = (action) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.SET_EDIT_ACTION_PLAYBOOK,
				payload: { action },
			});
		} catch (reason) {
			console.log("Error in setSelectedUsers", reason);
		}
	};
};

export const getIntegrationAccountsPlaybook = (appId) => {
	return async function (dispatch) {
		const response = await getIntegrationAccountsAPI(appId);
		if (response && !response.error) {
			dispatch({
				type: ACTION_TYPE.GET_INTEGRATION_ACCOUNTS_PLAYBOOK,
				payload: { data: response, appId },
			});
		}
		if (response && response.error) {
			console.log(response.error);
		}
	};
};
export const getAllManualTaskTemplatesPlaybook = () => {
	return async function (dispatch) {
		const response = await getAllManualTaskTemplatesAPI();
		if (response && !response.error) {
			dispatch({
				type: ACTION_TYPE.GET_ALL_MANUAL_TASK_TEMPLATES_PLAYBOOK,
				payload: { data: response.data },
			});
		}
		if (response && response.error) {
			console.log(response.error);
		}
	};
};
export const getManualTaskTemplateDataPlaybook = (
	workflowusers,
	appId,
	templateId
) => {
	return async function (dispatch) {
		const response = await getManualTaskTemplateDataAPI(
			workflowusers,
			appId,
			templateId
		);
		if (response && !response.error) {
			dispatch({
				type: ACTION_TYPE.GET_MANUAL_TASK_TEMPLATE_DATA_PLAYBOOk,
				payload: { data: response.data },
			});
		}
		if (response && response.error) {
			console.log(response.error);
		}
	};
};
export const addApptoNodes = (workflowId, appId, folderType) => {
	return async function (dispatch) {
		try {
			const response = await addApplicationtoNodes(
				workflowId,
				appId,
				folderType
			);
			dispatch({
				type: ACTION_TYPE.ADD_APPLICATION_TO_PLAYBOOK,
				payload: {
					data: {
						...new WorkFlowApplicationModel(response),
						isAppAdded: response?.isAppAdded || false,
					},
					positionAt: response.positionAt,
				},
			});
		} catch (err) {
			console.log(err);
		}
	};
};
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

export const deleteActionfromPlaybook = (
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
					type: ACTION_TYPE.DELETE_ACTION_TO_PLAYBOOK,
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

export const addActiontoPlaybook = (
	workflowId,
	workflowApplicationId,
	data,
	isTemplate
) => {
	return async function (dispatch) {
		let response;
		try {
			response = await saveActionToWorkflow(
				workflowId,
				workflowApplicationId,
				data,
				isTemplate
			);

			if (!response.error)
				dispatch({
					type: ACTION_TYPE.ADD_ACTION_TO_PLAYBOOK,
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

export const addToScopeValidations = (orgIntegrationID) => {
	return async function (dispatch) {
		dispatch({
			type: ACTION_TYPE.ACTION_SCOPE_VALIDATIONS_PLAYBOOK,
			payload: { orgIntegrationID, data: {} },
		});
	};
};

export const removeInegrationAccount = (appId) => {
	return async function (dispatch) {
		dispatch({
			type: ACTION_TYPE.REMOVE_INTEGRATION_ACCOUNT_PLAYBOOK,
			payload: { appId },
		});
	};
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
	}
	return validRetryAttempt;
};

export const editApplicationOfPlaybook = (
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
					type: ACTION_TYPE.EDIT_APPLICATION_TO_PLAYBOOK,
					payload: { data: new WorkFlowApplicationModel(response) },
				});
		} catch (err) {
			console.log(err);
		}
	};
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

export function appPlaybooksReducer(state = appPlaybookState, action) {
	switch (action.type) {
		case ACTION_TYPE.GET_APPPLAYBOOK:
		case ACTION_TYPE.EDIT_APPPLAYBOOK_DETAILS:
		case ACTION_TYPE.EDIT_APPPLAYBOOK_NODE:
			var workflow = new WorkflowModel(action.payload.data);
			return Object.assign({}, state, {
				workflow: refreshActionIndex(workflow),
				editActionWorkflow: null,
			});
		case ACTION_TYPE.ADD_ACTION_TO_PLAYBOOK:
		case ACTION_TYPE.UPDATE_ACTION_TO_PLAYBOOK:
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
					action.type === ACTION_TYPE.UPDATE_ACTION_TO_PLAYBOOK
						? null
						: action.payload.action,
				editApplication: nodes[appIndex],
			});
		case ACTION_TYPE.ADD_APPLICATION_TO_PLAYBOOK:
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
		case ACTION_TYPE.SET_EDIT_ACTION_PLAYBOOK:
			return Object.assign({}, state, {
				editActionWorkflow: action.payload.action,
			});
		case ACTION_TYPE.DELETE_ACTION_TO_PLAYBOOK:
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
		case ACTION_TYPE.EDIT_APPLICATION_TO_PLAYBOOK:
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
				workflow: refreshActionIndex(
					Object.assign({}, state.workflow, { nodes })
				),
			});
		case ACTION_TYPE.ACTION_SCOPE_VALIDATIONS_PLAYBOOK:
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
		case ACTION_TYPE.GET_INTEGRATION_ACCOUNTS_PLAYBOOK:
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
		case ACTION_TYPE.REMOVE_INTEGRATION_ACCOUNT_PLAYBOOK:
			let appId = action.payload.appId;
			const oldIntegrationAccountsObj = { ...state.integrationAccounts };
			Reflect.deleteProperty(oldIntegrationAccountsObj, appId);
			return Object.assign({}, state, {
				integrationAccounts: oldIntegrationAccountsObj,
			});

		case ACTION_TYPE.SET_EDIT_APP_ID_PLAYBOOK:
			let recommedendAction = state.recommedendActions;
			if (!action.payload) {
				recommedendAction = null;
			}
			return Object.assign({}, state, {
				editApplication: action.payload,
				editActionWorkflow: null,
				recommedendActions: recommedendAction,
			});
		case ACTION_TYPE.GET_LIST_OF_RUNS_PLAYBOOK:
			return { ...state, listOfRuns: action.payload.data };
		case ACTION_TYPE.GET_SUMMARISED_RUN_LOGS_PLAYBOOK:
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
		case ACTION_TYPE.GET_RAW_RUN_LOGS_PLAYBOOK:
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
		case ACTION_TYPE.CLEAR_WORKFLOW_IN_PLAYBOOK:
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
				integrationAccounts: {},
			});
		case ACTION_TYPE.GET_ALL_MANUAL_TASK_TEMPLATES_PLAYBOOK:
			let res;
			if (
				Array.isArray(action.payload.data) &&
				action.payload.data.length > 0
			) {
				res = action.payload.data.map(
					(res) => new AllManualTaskTemplatesModel(res)
				);
			} else {
				res = [];
			}
			return Object.assign({}, state, {
				allManualTaskTemplates: res,
			});
		case ACTION_TYPE.GET_MANUAL_TASK_TEMPLATE_DATA_PLAYBOOk:
			let resp = action.payload.data;
			return Object.assign({}, state, {
				manualTaskTemplateData: resp,
			});
		default:
			return state;
	}
}
