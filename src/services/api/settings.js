import { client } from "../../utils/client";

export async function getAdmins(q) {
	const response = await client.get(`settings/admin${q ? `?q=${q}` : ""}`);
	return response.data;
}

export async function addMember(member) {
	const response = await client.post("settings/admin", member);
	return response.data;
}

export async function getAllCustomApps(page = 0, row = 10) {
	const response = await client.get(
		`settings/custom-apps?page=${page}&row=${row}`
	);
	return response.data.custom_apps;
}

export async function getGeneralOrgSettings() {
	const response = await client.get("settings/general");
	return response.data;
}

export async function updateUserAccountDetails(accountDetails) {
	const response = await client.put("settings/user-account", accountDetails);
	return response.data;
}

export async function updateOrgDetails(orgDetails) {
	const response = await client.put(
		"settings/general/org-details",
		orgDetails
	);
	return response.data;
}

export async function updateOrgOwners(data) {
	const response = await client.put("settings/organization-owners", data);
	return response;
}

export async function resetPasswordEmail(userEmail) {
	const response = await client.get(`settings/reset-password/${userEmail}`);
	return response.data;
}

export async function removeMember(memberId) {
	const response = await client.put(`settings/unsetadmin`, {
		user_ids: [memberId],
	});
	return response.data;
}

export async function resendRoleInvitation(email) {
	const response = await client.get(
		`settings/resend-role-invitation?email=${email}`
	);
	return response;
}

export async function getNotificationSettings() {
	const response = await client.get(`settings/notifications`);
	return response;
}
export async function fetchTrustedDomains() {
	const response = await client.get(`trusted-domains`);
	return response.data;
}
export async function fetchPrimarySources() {
	const response = await client.get(`primary-sources`);
	return response.data;
}
export async function updatePrimarySource(body) {
	const response = await client.put("primary-sources", body);
	return response;
}

export async function updateNotificationSettings(grpId, enabled) {
	const body = {
		enabled: enabled,
	};
	const response = await client.put(`settings/notifications/${grpId}`, body);
	return response.data;
}
