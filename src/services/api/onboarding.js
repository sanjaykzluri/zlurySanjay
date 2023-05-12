import { client } from "../../utils/client";
import { integration as integrationAPI } from "../../utils/integration";

export async function addOrg(orgObj) {
	await client.post("organizations", orgObj);
}

export async function getOrgOnboardingStatus(orgId) {
	const response = await client.get(
		`organization/${orgId}/org-onboarding-status`
	);
	return response.data;
}

export async function getGettingStartedStatus(orgId) {
	const response = await client.get(`getting-started-status`);
	return response.data;
}

export async function step(orgId, onboarding_step, onboarding_data) {
	//console.log({ onboarding_data });
	const response = await client.put(`organization/${orgId}/onboarding`, {
		onboarding_step,
		onboarding_data,
	});
	return response.data;
}

export async function getConnectedIntegrations(
	userInfo,
	user,
	coWorker,
	integration,
) {
	var data = {
		org_id: userInfo.org_id,
		integration_id: integration.integration_id,
		message: coWorker.message,
		to_email: coWorker.email,
		to_name: coWorker.name,
		sender_email: user.email,
		sender_name: user.nickname,
		integration_name: integration.integration_name,
		user_id: userInfo.user_id,
	};

	const response = await integrationAPI.post("/invite/add", data);
	return response.data;
}
