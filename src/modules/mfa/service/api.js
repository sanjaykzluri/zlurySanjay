import { client } from "../../../utils/client";

export async function getEnrolledMFA(userID, data) {
	const response = await client.post(`user/${userID}/mfa`, data);
	return response.data;
}

export async function enrollMFA(userID, data) {
	const response = await client.post(`user/${userID}/mfa/enrollment`, data);
	return response.data;
}

export async function confirmMFAEnrollment(userID, data) {
	const response = await client.post(
		`user/${userID}/mfa/enrollment/confirm`,
		data
	);
	return response.data;
}

export async function deleteMFAEnrollment(userID, mfaID, data) {
	const response = await client.delete(`user/${userID}/mfa/${mfaID}`, {
		data,
	});
	return response.data;
}

export async function generateRecoverCode(userID, data) {
	const response = await client.post(
		`user/${userID}/mfa/enrollment/recovery-code`,
		data
	);
	return response.data;
}
