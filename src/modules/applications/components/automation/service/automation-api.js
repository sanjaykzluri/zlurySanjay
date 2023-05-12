import { TriggerIssue } from "utils/sentry";
import { clientV2, client } from "../../../../../utils/client";
import { filterPropertiesHelper } from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";
import { MONTH } from "utils/DateUtility";
import { folder_type } from "modules/applications/components/automation/appPlaybooks/appPlaybooks-constants";
import {
	appPlaybooksColumns,
	automationRulesColumns,
} from "../automationTablesConstants";

export async function getAllCompletedMiniplaybooks(
	reqBody,
	page,
	row,
	cancelTokenSource
) {
	let options = {
		params: {
			page,
			row,
			type: "onboarding",
		},
	};
	if (cancelTokenSource) {
		options.cancelToken = cancelTokenSource.token;
	}
	let currentappId = window.location.pathname.split("/")[2];
	const response = await clientV2.post(
		`mini-playbooks/applications/${currentappId}/runs`,
		reqBody
	);
	return response?.data;
}

export async function getAllAppPlaybooksV2(
	type,
	pageNo,
	row,
	reqBody,
	currentappId
) {
	const response = await clientV2.post(
		`mini-playbooks/applications/${currentappId}/templates?page=${pageNo}&row=${row}&folder_type=${type}`,
		reqBody
	);
	return response?.data;
}

export async function getAllAppRulesV2(
	type,
	pageNo,
	row,
	reqBody,
	currentappId
) {
	const response = await clientV2.post(
		`mini-playbooks/${currentappId}/rules?page=${pageNo}&row=${row}&folder_type=${type}`,
		reqBody
	);
	return response?.data;
}

export async function getAppPlaybookData(pageNo, row, name) {
	let currentappId = window.location.pathname.split("/")[2];
	let response = await client.get(
		`mini-playbooks/applications/${currentappId}/templates?page=${pageNo}&row=${row}&folder_type=${name}`
	);

	if (response && response.data && response.data.meta) {
		response.data.meta.columns = appPlaybooksColumns.columns;
	}
	return response?.data;
}
export async function addApplicationtoNodes(workflowId, appId, folderType) {
	const response = await client.put(
		`workflows/${workflowId}/nodes/add/application?module=template&type=license_optimization`,

		{
			app_id: appId,
			isAppAdded: true,
		}
	);
	return response.data;
}

export async function saveWorkFlowTemplate(workflowId, body) {
	const url = `mini-playbooks/${workflowId}/save/template?module=template`;
	const response = await client.post(url, body);
	return response.data;
}
export async function createTemplate(folderType) {
	let currentappId = window.location.pathname.split("/")[2];
	const response = await client.post(
		`mini-playbooks/applications/${currentappId}/create/template`,
		{
			workflow: {
				folder_type: folderType,
				name: `${
					folder_type[folderType]
				} Playbook on ${new Date().getDate()} ${
					MONTH[new Date().getMonth()]
				}`,
			},
		}
	);
	return response?.data;
}

export async function getAppRunsFilters() {
	const response = await clientV2.get("mini-playbooks/runs/filters");
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function getAppRulesFilters() {
	const response = await clientV2.get("rules/filters");
	let newResponseData = filterPropertiesHelper(response.data);
	response.data = newResponseData;
	return response;
}

export async function searchPlaybookData(page, row, query, template) {
	let currentappId = window.location.pathname.split("/")[2];
	const response = await client.get(
		`mini-playbooks/applications/${currentappId}/templates/search?page=${page}&row=${row}&q=${query}${
			template ? `&folder_type=${template}` : ""
		}`
	);
	return response?.data;
}

export async function getAppPlaybookRules(pageNo, row, name) {
	let currentappId = window.location.pathname.split("/")[2];
	let response = await client.get(
		`mini-playbooks/${currentappId}/rules?page=${pageNo}&row=${row}&folder_type=${name}`
	);

	if (response && response.data && response.data.meta) {
		response.data.meta.columns = automationRulesColumns.columns;
	}
	return response?.data;
}

export async function searchAppPlaybookRules(page, row, query, name) {
	let currentappId = window.location.pathname.split("/")[2];
	const response = await client.get(
		`mini-playbooks/${currentappId}/rules/search?page=${page}&row=${row}&q=${query}&folder_type=${name}`
	);
	return response?.data;
}

export async function searchAllPlaybooks(name) {
	let currentappId = window.location.pathname.split("/")[2];
	const body = {
		filter_by: [
			{
				field_values: ["license_management"],
				field_id: "mini_playbook_data.folder_type",
				filter_type: "string",
				negative: true,
			},
			{
				field_values: [true],
				field_id: "is_published",
				filter_type: "boolean",
				negative: false,
			},
			{
				field_values: [currentappId],
				field_id: "mini_playbook_data.app_id",
				filter_type: "objectId",
				negative: false,
			},
		],
		sort_by: [{ name: -1 }],
		columns: [
			{
				group_name: "list",
				field_ids: ["_id", "name"],
			},
		],
	};
	if (name) {
		body.filter_by.push({
			field_values: [name],
			field_id: "name",
			filter_type: "search_in_string",
			field_order: ["contains"],
			negative: false,
		});
	}
	const response = await clientV2.post(
		"workflows/templates?page=0&row=10",
		body
	);
	return response?.data;
}

export async function updateRule(body) {
	const ruleId = body?._id;
	const url = `mini-playbooks/rules/${ruleId}`;
	const response = await client.put(url, body);
	return response.data;
}

export async function createRule(folderType, entity = "application") {
	let currentappId = window.location.pathname.split("/")[2];
	const folder_map = {
		provision: "Provision",
		deprovision: "Deprovision",
		app_management: "App Management",
		license_management: "License Management",
	};
	const response = await client.post(
		`mini-playbooks/${currentappId}/rules?folder_type=${folderType}&entity=${entity}`,
		{
			name: `Automation rule for ${
				folder_map[folderType]
			} on ${new Date().getDate()} ${MONTH[new Date().getMonth()]}`,
			description: `Created ${entity} rule`,
		}
	);
	return response?.data;
}

export async function deleteAppRule(ruleId) {
	const url = `mini-playbooks/rules/${ruleId}`;
	const response = await client.delete(url);
	return response.data;
}

export async function getMostUsedAppPlaybookService(type, pageNo, row = 3) {
	const response = await client.get(
		`mini-playbooks/templates/most-used?page=${pageNo}&row=${row}&folder_type=${type}`
	);
	return response?.data;
}

export async function updateOrderOfRule({ id, type, currentOrder, newOrder }) {
	const response = await client.put(
		`mini-playbooks/rules/${id}/order?folder_type=${type}&current_order=${currentOrder}&new_order=${newOrder}`
	);
	return response.data;
}
