import { TriggerIssue } from "utils/sentry";
import { cacheClient, client, clientV2 } from "../../../utils/client";
import _ from "underscore";
import { getSearchReqObj } from "../constants/constant";

export async function fetchRecommendedApps(
	workflowId,
	entity = "user",
	entity_id,
	isTemplate
) {
	let response;
	const url = isTemplate
		? `workflows/recommended-apps?entity=${entity}&workflowId=${workflowId}&module=template`
		: `workflows/recommended-apps?entity=${entity}&workflowId=${workflowId}`;
	try {
		response = await cacheClient.post(url, {
			entity_id: entity_id,
		});
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data || [];
}

export async function fetchRecommendedActions(
	applicationId,
	parent_integration_id,
	type
) {
	let response;
	try {
		let url = "";
		if (parent_integration_id) {
			url = `workflows/recommended-actions?app_id=${applicationId}&type=${type}&parent_integration_id=${parent_integration_id}`;
		} else {
			url = `workflows/recommended-actions?app_id=${applicationId}&type=${type}`;
		}
		response = await cacheClient.get(url);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function createWorkflow(data) {
	const response = await client.post(`workflows/create`, data);
	return response.data;
}

export async function getWorkflow(obj) {
	const url = obj.isTemplate
		? `workflows/${obj.id}?module=template`
		: `workflows/${obj.id}`;
	const response = await client.get(url);
	return response.data;
}

export async function cancelScheduledRunWorkflow(data) {
	const response = await client.put(`workflows/scheduled/bulk-cancel`, data);
	return response.data;
}

export async function archiveRunWorkflow(id) {
	const response = await client.get(`workflows/${id}/archive`);
	return response.data;
}

export async function unArchiveRunWorkflow(id) {
	const response = await client.get(`workflows/${id}/unarchive`);
	return response.data;
}

export async function deleteDraft(workflow_id) {
	const response = await client.delete(`workflows/${workflow_id}`);
	return response.data;
}

export async function deleteTemplate(template_id) {
	const response = await client.delete(`workflows/templates/${template_id}`);
	return response.data;
}

export async function deleteRule(rule_id, tag, order) {
	const response = await client.delete(
		`rules/${rule_id}?tag=${tag}&priority_order=${order}`
	);
	return response.data;
}

export async function deleteAppFromMultiNodeService(workflowId, nodeId, appId) {
	const response = await client.delete(
		`workflows/${workflowId}/offboarding/node/${nodeId}/application/${appId}`
	);
	return response.data;
}

export async function seperateAppFromMultiNodeService(
	workflowId,
	nodeId,
	appIds
) {
	const response = await client.put(
		`workflows/${workflowId}/offboarding/node/${nodeId}/unmanaged-apps`,
		{ app_ids: appIds }
	);
	return response.data;
}

export async function createWorkflowTemplate(data) {
	const response = await client.post(`workflows/create/template`, data);
	return response.data;
}

export async function createWorkflowFromTemplate(data) {
	const response = await client.post(`workflows/template/use`, data);
	return response.data;
}

export async function editWorkflowDetails(id, data, isTemplate) {
	const url = isTemplate
		? `workflows/${id}/details?module=template`
		: `workflows/${id}/details`;
	const response = await client.put(url, data);
	return response.data;
}

export async function editWorkflowetailsviaTemplate(id, data, isTemplate) {
	const url = isTemplate
		? `workflows/${id}/viatemplate/details?module=template`
		: `workflows/${id}/viatemplate/details`;
	const response = await client.put(url, data);
	return response.data;
}

export async function editWorkflowTemplate(data, id) {
	const response = await client.patch(`workflows/template/${id}/`, data);
	return response.data;
}

export async function editWorkflowNodesService(id, data) {
	const response = await client.put(`workflows/${id}/nodes`, data);
	return response.data;
}

export async function getIntegrationAccountsAPI(orgIntegrationId) {
	let response;
	try {
		response = await client.get(
			`applications/${orgIntegrationId}/integration/accounts`
		);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function getIntegrationAccountsV2API(orgIntegrationId) {
	let response;
	try {
		response = await client.get(
			`workflows/applications/${orgIntegrationId}/integration/accounts`
		);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function getAppDescriptionAPI(reqObj) {
	const response = await clientV2.post("applications", reqObj);
	return response.data;
}

export async function getApplicationsActions(
	appID,
	parent_integration_id,
	type
) {
	let response;
	try {
		let url = "";
		if (parent_integration_id) {
			url = `workflows/actions?app_id=${appID}&type=${type}&parent_integration_id=${parent_integration_id}`;
		} else {
			url = `workflows/actions?app_id=${appID}&type=${type}`;
		}
		response = await cacheClient.get(url);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function getStaticApplicationsActions(type) {
	let response;
	try {
		response = await cacheClient.get(
			`workflows/default-nodes/actions?node_type=${type}`
		);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function getAllTemplatesService(type, pageNo) {
	const response = await client.get(
		`workflows/templates?page=${pageNo}&row=30&type=${type}`
	);
	return response?.data;
}

export async function getMostUsedTemplatesService(type, pageNo, row = 3) {
	const response = await client.get(
		`workflows/templates/most-used?page=${pageNo}&row=${row}&type=${type}`
	);
	return response?.data;
}

export async function getAllDraftsService(type, pageNo) {
	const response = await client.get(
		`workflows/drafts?page=${pageNo}&row=30&type=${type}`
	);
	return response?.data;
}

export async function getAutomationRulesService(type, pageNo) {
	const response = await client.get(
		`rules?page=${pageNo}&row=30&tag=${type}`
	);
	return response?.data;
}

export async function getAutomationRuleService(ruleId) {
	const response = await client.get(`rules/${ruleId}`);
	return response?.data;
}

export async function patchAutomationStatusService(data, status) {
	const ruleId = data._id;
	const response = await client.patch(`rules/${ruleId}`, { status });
	return response?.data;
}

export async function updateAutomationRulesService(data) {
	const ruleId = data._id;
	const response = await client.put(`rules/${ruleId}`, data);
	return response?.data;
}

export async function updateAutomationRuleService(data) {
	const ruleId = data._id;
	const response = await client.put(`rules/${ruleId}`, data);
	return response?.data;
}

export async function createAutomationRule(data) {
	const response = await client.post(`rules/create`, data);
	return response.data;
}

export async function getTopFiveDraftsService(type) {
	const response = await client.get(
		`workflows/drafts?page=0&row=5&type=${type}`
	);
	return response?.data;
}

export async function getAllCompletedWorkflowsService(type, pageNo) {
	const response = await client.get(
		`workflows/completed?page=${pageNo}&row=30&type=${type}`
	);
	return response?.data;
}

export async function getInProgressWorkflowsService(type, pageNo) {
	const response = await client.get(
		`workflows/in-progress?page=${pageNo}&row=3&type=${type}`
	);
	return response?.data;
}

export async function getUserslistServiceV2(page = 0, row = 10, reqObj = {}) {
	const response = await clientV2.post(
		"users?page=" + page + "&row=" + row,
		reqObj
	);
	return response.data;
}

export async function getUsersServiceV2(
	reqObj,
	cancelTokenSource = null,
	compact
) {
	let options = {};
	let searchReqObj = {};
	if (!reqObj.filter_by) {
		searchReqObj.filter_by = [
			getSearchReqObj(reqObj, "user_name", "User Name"),
		];
		searchReqObj.sort_by = [];
		searchReqObj.columns = [];
	} else {
		searchReqObj = reqObj;
	}

	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await clientV2.post(
		"users?page=0" + "&row=" + 30,
		searchReqObj,
		options
	);
	return response.data;
}

export async function compileWorkflowDraft(workflowId) {
	const response = await client.get(`workflows/${workflowId}/compile`);
	return response?.data;
}

export async function searchDraftsService(type, term, cancelTokenSource) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await client.get(
		`workflows/drafts/search?page=0&row=30&type=${type}&q=${term}`,
		options
	);
	return response?.data;
}

export async function searchTemplatesService(type, term, cancelTokenSource) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await client.get(
		`workflows/templates/search?page=0&row=30&type=${type}&q=${term}`,
		options
	);
	return response?.data;
}

export async function searchCompletedService(type, term, cancelTokenSource) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await client.get(
		`workflows/completed/search?page=0&row=30&q=${term}&type=${type}`,
		options
	);
	return response?.data;
}

export async function searchAutomationRulesService(
	type,
	term,
	cancelTokenSource
) {
	let options = {};
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}

	const response = await client.get(
		`rules/search?page=0&row=30&q=${term}&tag=${type}`,
		options
	);

	return response?.data;
}

export async function actionValidation(workflowID, data) {
	const response = await client.post(
		`workflows/${workflowID}/actions/scope-validation`,
		data
	);
	return response?.data;
}

export async function getActionSetUpForm(actionID) {
	const response = await cacheClient.get(
		`workflows/actions/${actionID}/set-up`
	);
	return response?.data;
}

export async function getActionSetUpFormStaticNode(type, actionID) {
	const response = await cacheClient.get(
		`workflows/internal-actions/set-up?node_type=${type}&uniqId=${actionID}`
	);
	return response?.data;
}

export async function executeWorkflow(workflowID) {
	const response = await client.post(`workflows/${workflowID}/run`);
	return response?.data;
}

export async function resolveActionDepTrigger(
	workflowId,
	actionID,
	key,
	depTriggerId,
	data = {},
	cancelTokenSource,
	isTemplate
) {
	let options = {};
	const url = isTemplate
		? `workflows/${workflowId}/actions/${actionID}/dynamic-input?key=${key}&depTriggerId=${depTriggerId}&module=template`
		: `workflows/${workflowId}/actions/${actionID}/dynamic-input?key=${key}&depTriggerId=${depTriggerId}`;
	if (cancelTokenSource) {
		options = {
			cancelToken: cancelTokenSource.token,
		};
	}
	const response = await client.post(url, data);
	return response?.data;
}

export async function getListOfRuns(workflowId, type = "onboarding") {
	let response;
	try {
		response = await client.get(
			`workflows/${workflowId}/logs?type=${type}`
		);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function refreshRunsAPI(data) {
	let response;
	try {
		response = await client.post(`workflows/refresh-workflow-logs`, {
			un_refreshed_workflow_executions: data,
		});
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function getSummarisedRunLogData(
	workflowId,
	workflowRunId,
	refreshLog = 0,
	type = "onboarding"
) {
	let response;
	let refreshValue = refreshLog ? 1 : 0;
	try {
		response = await client.get(
			`workflows/${workflowId}/execution/${workflowRunId}/logs?page=0&row=10&type=${type}&refresh=${refreshValue}`
		);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function getRawRunLogData(
	workflowId,
	workflowRunId,
	refreshLog = 0,
	type = "onboarding"
) {
	let response;
	let refreshValue = refreshLog ? 1 : 0;
	try {
		response = await client.get(
			`workflows/${workflowId}/execution/${workflowRunId}/logs/simplified?page=0&row=10&type=${type}&refresh=${refreshValue}`
		);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function sendWorkflowActionReminder(
	workflowId,
	actionId,
	actionData,
	otherData
) {
	let { runId, group_state, app_id } = otherData;
	let reqBody = {
		runId: runId,
	};
	if (group_state) {
		reqBody.group_state = group_state;
	}
	if (app_id) {
		reqBody.app_id = app_id;
	}
	let response;
	try {
		response = await client.post(
			`workflows/${workflowId}/actions/${actionId}/send-reminder`,
			reqBody
		);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function reassignManualTask(
	workflowId,
	actionId,
	actionData,
	otherData
) {
	let { runId } = otherData;
	let reqBody = {
		action_data: actionData.action_data,
		dueDateData: actionData.dueDateData,
		runId: runId,
		action_type: "manual",
	};
	let response;
	try {
		response = await client.put(
			`workflows/${workflowId}/actions/${actionId}/reassign`,
			reqBody
		);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function convertToManualTask(
	workflowId,
	actionId,
	actionData,
	otherData
) {
	let { runId } = otherData;
	let reqBody = {
		action_data: actionData.action_data,
		dueDateData: actionData.dueDateData,
		runId: runId,
		action_type: "manual",
	};
	let response;
	try {
		response = await client.put(
			`workflows/${workflowId}/actions/${actionId}/manual-action`,
			reqBody
		);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function saveApplicationToWorkflow(workflowId, data, isTemplate) {
	let response;
	const url = isTemplate
		? `workflows/${workflowId}/nodes/add/application?module=template`
		: `workflows/${workflowId}/nodes/add/application`;
	try {
		response = await client.put(url, data);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function saveStaticApplicationToWorkflow(
	workflowId,
	data,
	isTemplate
) {
	let response;
	const url = isTemplate
		? `workflows/${workflowId}/default-nodes/add?module=template`
		: `workflows/${workflowId}/default-nodes/add`;
	try {
		response = await client.post(url, data);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function editApplicationInWorkflow(
	workflowId,
	workflowApplicationId,
	data,
	isTemplate
) {
	let response;
	const url = isTemplate
		? `workflows/${workflowId}/nodes/application/${workflowApplicationId}?module=template`
		: `workflows/${workflowId}/nodes/application/${workflowApplicationId}`;
	try {
		response = await client.put(url, {
			application: data,
		});
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function saveActionToWorkflow(
	workflowId,
	workflowApplicationId,
	data,
	isTemplate
) {
	let response;
	const url = isTemplate
		? `workflows/${workflowId}/nodes/application/${workflowApplicationId}/action?module=template`
		: `workflows/${workflowId}/nodes/application/${workflowApplicationId}/action`;
	try {
		response = await client.post(url, data);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function saveActionToWorkflowStaticNode(
	workflowId,
	data,
	isTemplate
) {
	let response;
	const url = isTemplate
		? `workflows/${workflowId}/default-nodes/action?module=template`
		: `workflows/${workflowId}/default-nodes/action`;
	try {
		response = await client.post(url, data);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function updateActionFromWorkflow(
	workflowId,
	workflowApplicationId,
	workflowActionId,
	data,
	isTemplate
) {
	let response;
	const url = isTemplate
		? `workflows/${workflowId}/nodes/application/${workflowApplicationId}/action/${workflowActionId}?module=template`
		: `workflows/${workflowId}/nodes/application/${workflowApplicationId}/action/${workflowActionId}`;
	try {
		response = await client.put(url, data);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function updateActionFromWorkflowStaticNode(
	workflowId,
	workflowActionId,
	data,
	isTemplate
) {
	let response;
	const url = isTemplate
		? `workflows/${workflowId}/default-nodes/action/${workflowActionId}?module=template`
		: `workflows/${workflowId}/default-nodes/action/${workflowActionId}`;
	try {
		response = await client.put(url, data);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function deleteApplicationFromWorkflow(
	workflowId,
	workflowApplicationId,
	isTemplate
) {
	let response;
	const url = isTemplate
		? `workflows/${workflowId}/nodes/application/${workflowApplicationId}?module=template`
		: `workflows/${workflowId}/nodes/application/${workflowApplicationId}`;
	try {
		response = await client.delete(url);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function deleteActionFromWorkflow(
	workflowId,
	workflowApplicationId,
	workflowActionId,
	isTemplate
) {
	let response;
	const url = isTemplate
		? `workflows/${workflowId}/nodes/application/${workflowApplicationId}/action/${workflowActionId}?module=template`
		: `workflows/${workflowId}/nodes/application/${workflowApplicationId}/action/${workflowActionId}`;
	try {
		response = await client.delete(url);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function getAllManualTaskTemplatesAPI(onlyCustomTemplate = false) {
	const url = onlyCustomTemplate
		? `workflows/manual-action/templates?only_custom_template=${onlyCustomTemplate}`
		: `workflows/manual-action/templates`;
	let response;
	try {
		response = await client.get(url);
	} catch (error) {
		TriggerIssue("Error in get All Manual Task Templates API", error);
	}
	return response.data;
}

export async function getManualTaskTemplateByIdAPI(templateId) {
	let response;
	try {
		response = await client.get(`workflows/manual-action/${templateId}`);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function getManualTaskTemplateDataAPI(
	workflow_users = [],
	appId,
	templateId
) {
	let response;
	try {
		if (appId) {
			response = await client.post(
				`workflows/manual-action/${appId}/action-data?templateId=${templateId}`,
				{ workflow_users, templateId }
			);
		} else {
			response = await client.get(
				`workflows/default-nodes/manual-action-data/${templateId}`
			);
		}
	} catch (error) {
		TriggerIssue("Error in get Manual Task Template Data API", error);
	}
	return response.data;
}

export async function getManualTaskAssigneeSuggestionsAPI(
	appId,
	workflowId,
	isTemplate
) {
	let response;
	try {
		if (isTemplate) {
			response = await client.get(
				`applications/${appId}/suggestions/users?workflowId=${workflowId}&module=template`
			);
		} else {
			response = await client.get(
				`applications/${appId}/suggestions/users?workflowId=${workflowId}`
			);
		}
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function getDefaultNodeManualTaskAssigneeSuggestionsAPI(
	workflowId,
	isTemplate
) {
	let response;
	if (isTemplate) {
		response = await client.get(
			`workflows/default-nodes/suggestions/users?workflowId=${workflowId}&module=template`
		);
	} else {
		response = await client.get(
			`workflows/default-nodes/suggestions/users?workflowId=${workflowId}`
		);
	}
	return response.data;
}

export async function getUserRolesSuggestion({ appId, userId }) {
	let response;
	let params;
	if (appId || userId) {
		params = {
			appId,
			userId,
		};
	}
	try {
		response = await client.get(`users/suggestions/userroles`, {
			params,
		});
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}

export async function getOffboardingTasksAPI({ workflowId, userId, token }) {
	let response = {};
	try {
		response = await client.get(
			`/workflows/${workflowId}/user/${userId}/offboarding/manual-task-list?token=${token}`
		);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function markOffboardingTaskAsCompleteAPI({
	workflowId,
	userId,
	selectedApp,
	token,
}) {
	const data = {
		id_array: [
			{
				...selectedApp,
				workflow_action_id: selectedApp.workflowActionId,
				app_id: selectedApp.appId,
			},
		],
	};
	let response = {};
	try {
		response = await client.put(
			`/workflows/${workflowId}/user/${userId}/offboarding/mark-action-as-completed?token=${token}`,
			data
		);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function signOffboardingDeclarationAPI({
	workflowId,
	userId,
	token,
}) {
	let response = {};
	try {
		response = await client.put(
			`/workflows/${workflowId}/user/${userId}/offboarding/sign-declaration?token=${token}`
		);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function getPendingAppListAPI({ workflowId }) {
	let response = {};
	try {
		response = await client.get(`workflows/${workflowId}/latent-apps`);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function addPendingAppListAPI({ workflowId, apps }) {
	let response = {};
	try {
		response = await client.post(`workflows/${workflowId}/add-apps`, {
			app_ids: apps,
		});
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function retryAllFailedActionAPI({ workflowExecutionId }) {
	let response = {};
	try {
		response = await client.post(
			`workflows/${workflowExecutionId}/run/retry-workflow`
		);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function retryFailedActionAPI({ workflowExecutionId, actionId }) {
	let response = {};
	try {
		response = await client.post(
			`workflows/${workflowExecutionId}/run/retry-action/${actionId}`
		);
	} catch (error) {
		return { error: error };
	}
	return response.data;
}

export async function runAbortedActionAPI({ workflowExecutionId, actionId }) {
	let response = {};
	try {
		response = await client.post(
			`workflows/${workflowExecutionId}/run/action/${actionId}`
		);
	} catch (error) {
		// return { error: error };
		TriggerIssue("Error in Run Aborted Action", error);
	}
	return response.data;
}

export async function getRuleAttributes(facts) {
	const fact = facts?.join(",");
	let response = {};
	try {
		response = await client.get(
			`rules/attributes?page=0&row=30${fact ? `&facts=${fact}` : ``}`
		);
	} catch (err) {
		return { error: err };
	}

	return response?.data;
}

export async function getRuleTriggers(workflowType) {
	let response = {};
	try {
		response = await client.get(`rules/triggers?tag=${workflowType}`);
	} catch (err) {
		return { error: err };
	}

	return response?.data;
}

export async function updateOrderOfRule({ id, type, currentOrder, newOrder }) {
	const response = await client.put(
		`rules/${id}/order?tag=${type}&current_order=${currentOrder}&new_order=${newOrder}`
	);
	return response.data;
}

export async function onboardingUsersViaCSV(uploadObj) {
	uploadObj.source_url = decodeURI(uploadObj.source_url);
	const { data } = await client.post(
		"users/onboarding-users-via-csv",
		uploadObj
	);
	return data;
}

export async function getAllCompletedWorkflowsServiceV2(
	type,
	pageNo,
	reqBody,
	searchReqParams
) {
	let options = {};
	let url =
		"workflows/completed?page=" + pageNo + "&row=30" + "&type=" + type;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `workflows/completed?is_search=${true}&search_query=${
			searchReqParams?.search_query
		}&page=${pageNo}&row=30&type=${type}`;
	}

	const response = await clientV2.post(url, reqBody, options);
	return response?.data;
}

export async function getAllScheduledRunsServiceV2(
	type,
	pageNo,
	reqBody,
	searchReqParams
) {
	let options = {};
	let url =
		"workflows/scheduled?page=" + pageNo + "&row=30" + "&type=" + type;
	if (
		_.isObject(searchReqParams) &&
		Object.keys(searchReqParams).length > 0
	) {
		url = `workflows/scheduled?is_search=${true}&search_query=${
			searchReqParams?.search_query
		}&page=${pageNo}&row=30&type=${type}`;
	}

	const response = await clientV2.post(url, reqBody, options);
	return response?.data;
}

export async function getAllCompletedMiniplaybooks(appId, reqBody, pageNo) {
	const response = await clientV2.post(
		`mini-playbooks/applications/${appId}/runs?page=${pageNo}&row=30&type=onboarding`,
		reqBody
	);
	return response?.data;
}

export async function getAllCompletedWorkflowsPropertiesListV2() {
	const response = await clientV2.get(`workflows/completed/filters`);
	// let newResponseData = filterPropertiesHelper(response.data);
	// response.data = newResponseData;
	return response;
}

export async function getAllScheduledRunsPropertiesListV2() {
	const response = await clientV2.get(`workflows/scheduled/filters`);
	return response;
}

export async function bulkScheduleRuns(type, data, module) {
	const response = await client.post(
		`workflows/schedule?type=${type}&module=${module}`,
		data
	);
	return response.data;
}

export async function reScheduleRuns(scheduleId, data) {
	const response = await client.put(
		`workflows/${scheduleId}/re-schedule`,
		data
	);
	return response.data;
}

export async function bulkRunAPlaybookForUsers(id, data) {
	const response = await client.post(`workflows/${id}/bulk-create-run`, data);
	return response.data;
}
export async function runCompiledWorkflow(workflowId, data) {
	const response = await clientV2.post(`workflows/${workflowId}/run`, {});
	return response.data;
}
export async function modifyScheduleAPI(
	workflowId,
	actionId,
	{ scheduledData },
	{ runId }
) {
	const data = { scheduledData, jobId: scheduledData?.jobId || "jobId" };
	delete data.scheduledData.jobId;
	delete data.scheduledData.nextRunAt;
	let response = {};
	try {
		response = await client.post(
			`workflows/${runId}/action/${actionId}/reschedule`,
			data
		);
	} catch (error) {
		// return { error: error };
		TriggerIssue("Error in Modify Schedule", error);
	}
	return response.data;
}

export async function scheduleNowAPI(
	workflowId,
	actionId,
	{ scheduledData },
	{ runId }
) {
	const data = { jobId: scheduledData?.jobId || "jobId" };
	let response = {};
	try {
		response = await client.post(
			`workflows/${runId}/action/${actionId}/runNow`,
			data
		);
	} catch (error) {
		// return { error: error };
		TriggerIssue("Error in Schedule now", error);
	}
	return response.data;
}

export async function cancelScheduleAPI(
	workflowId,
	actionId,
	{ scheduledData },
	{ runId }
) {
	const data = { jobId: scheduledData?.jobId || "jobId" };
	let response = {};
	try {
		response = await client.post(
			`workflows/${runId}/action/${actionId}/cancelScheduled`,
			data
		);
	} catch (error) {
		// return { error: error };
		TriggerIssue("Error in Cancel Schedule", error);
	}
	return response.data;
}

export async function runNowApprovalAPI(
	workflowId,
	actionId,
	{ scheduledData },
	{ runId }
) {
	let response = {};
	try {
		response = await client.post(
			`workflows/${runId}/action/${actionId}/approval/runNow`
		);
	} catch (error) {
		// return { error: error };
		TriggerIssue("Error in Schedule now", error);
	}
	return response.data;
}

export async function cancelApprovalAPI(
	workflowId,
	actionId,
	{ scheduledData },
	{ runId }
) {
	let response = {};
	try {
		response = await client.post(
			`workflows/${runId}/action/${actionId}/approval/cancel`
		);
	} catch (error) {
		// return { error: error };
		TriggerIssue("Error in Cancel Schedule", error);
	}
	return response.data;
}

export async function getAllPlaybookWorkflowsServiceV2(type, pageNo, reqBody) {
	let searchReqObj = {};
	if (!reqBody.filter_by) {
		const isPublishedObj = {
			field_values: [true],
			field_order: "contains",
			field_id: "is_published",
			filter_type: "boolean",
			field_name: "Published",
			negative: false,
			is_custom: false,
		};
		searchReqObj.filter_by = [
			getSearchReqObj(reqBody, "name", "Workflow Name"),
		];
		searchReqObj.filter_by.push(isPublishedObj);
		searchReqObj.sort_by = [];
		searchReqObj.columns = [];
	} else {
		searchReqObj = reqBody;
	}
	const response = await clientV2.post(
		`workflows/templates?page=${pageNo}&row=30&type=${type}`,
		searchReqObj
	);
	return response?.data;
}

export async function getAllPlaybookWorkflowsPropertiesListV2() {
	const response = await clientV2.get(`workflows/templates/filters`);
	return response;
}

export async function getAllScheduledRunServiceV2(type, pageNo, reqBody) {
	let searchReqObj = {};
	if (!reqBody.filter_by) {
		searchReqObj.filter_by = [
			getSearchReqObj(reqBody, "workflow_template_name", "Playbook Name"),
		];
		searchReqObj.sort_by = [];
		searchReqObj.columns = [];
	} else {
		searchReqObj = reqBody;
	}
	const response = await clientV2.post(
		`workflows/scheduled?page=${pageNo}&row=30&type=${type}`,
		searchReqObj
	);
	return response?.data;
}

export async function getAllScheduledRunPropertiesListV2() {
	const response = await clientV2.get(`workflows/scheduled/filters`);
	return response;
}

export async function forceUpdateManualTaskAPI(
	workflowId,
	userId,
	type,
	status,
	reqObj
) {
	let response = {};
	try {
		response = await client.put(
			`workflows/${workflowId}/users/${userId}/mark-action-status?type=${type}&status=${status}`,
			reqObj
		);
	} catch (error) {
		// return { error: error };
		TriggerIssue("Error in force Update Manual Task", error);
	}
	return response.data;
}

export async function duplicateWorkflowPlaybook(workflowTemplateId, reqObj) {
	const response = await client.post(
		`workflows/${workflowTemplateId}/duplicate`,
		reqObj
	);
	return response.data;
}

export const changeIntegrationAccountAPI = async (
	workflowId,
	workflowApplicationId,
	reqObj,
	isTemplate,
	type
) => {
	let url = "";
	if (isTemplate) {
		url = `workflows/${workflowId}/nodes/application/${workflowApplicationId}/changeIntegrationAccount?type=${type}&module=template`;
	} else {
		url = `workflows/${workflowId}/nodes/application/${workflowApplicationId}/changeIntegrationAccount?type=${type}`;
	}
	const response = await client.put(url, reqObj);
	return response.data;
};
