import { client, clientEmployee } from "utils/client";

const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const user_role = userInfo?.user_role;

const reqClient = user_role === "employee" ? clientEmployee : client;

export async function getTaskList(
	req = { filter_by: [], sort_by: [], columns: [] }
) {
	const response = await reqClient.post("tasks", req);
	return response.data;
}

export async function updateTaskActionStatus({
	workflow_id,
	workflow_user_id,
	type,
	status,
	id_array = [],
	zluri_actions_id_array = [],
}) {
	const url = `workflows/${workflow_id}/users/${workflow_user_id}/mark-action-status?type=${type}&status=${status}`;
	const response = await reqClient.put(url, {
		id_array: id_array,
		zluri_actions_id_array: zluri_actions_id_array,
	});
	return response.data;
}
export async function markActionasApproved({
	workflow_id,
	workflow_user_id,
	workflow_action_id,
}) {
	const url = "workflows/mark-action-as-approved";
	const response = await reqClient.post(url, {
		workflow_id,
		workflow_user_id,
		workflow_action_id,
	});
	return response.data;
}
export async function markActionasRejected({
	workflow_id,
	workflow_user_id,
	workflow_action_id,
}) {
	const url = "workflows/mark-action-as-rejected";
	const response = await reqClient.post(url, {
		workflow_id,
		workflow_user_id,
		workflow_action_id,
	});
	return response.data;
}

export async function getSummarisedRunLogs(
	workflowId,
	workflowRunId,
	refreshLog = 0,
	type = "onboarding"
) {
	let response;
	let refreshValue = refreshLog ? 1 : 0;
	try {
		response = await reqClient.get(
			`workflows/${workflowId}/execution/${workflowRunId}/logs?page=0&row=10&type=${type}&refresh=${refreshValue}`
		);
	} catch (error) {
		return {
			error: error,
		};
	}
	return response.data;
}
