import { client } from "../../../utils/client";

export async function addRenewalForApplication(applicationID, data) {
	const response = await client.post(
		`applications/${applicationID}/renewal`,
		data
	);
	return response.data;
}

export async function editRenewalForApplication(data) {
	const response = await client.put(`renewals/${data.renewalID}`, data);
	return response.data;
}

export async function addSetReminderForApplication(
	applicationID,
	renewalID,
	data
) {
	const response = await client.post(`renewals/reminder/${renewalID}`, data);
	return response.data;
}

export async function editSetReminderForApplication(
	applicationID,
	renewalID,
	data
) {
	const response = await client.post(
		`renewals/reminder/${renewalID}`,
		data
	);
	return response.data;
}

export async function deleteRenewalForApplication(renewalID) {
	const response = await client.delete(`renewals/${renewalID}`);
	return response.data;
}

export async function getAllRenewals(format) {
	const response = await client.get(`renewals?format=${format}`);
	return response.data;
}

export async function deleteReminderForRenewal(renewalID) {
	const response = await client.delete(`renewals/reminder/${renewalID}`);
	return response.data
}
