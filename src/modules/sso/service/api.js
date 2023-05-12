import { client } from "../../../utils/client";

export async function createConnection(data) {
	const response = await client.post(`sso/connection/create`, data);
	return response.data;
}

export async function editConnection(id, data) {
	const response = await client.post(`sso/connection/${id}`, data);
	return response.data;
}

export async function getAllConnections() {
	const response = await client.get(`sso/connections`);
	return response.data;
}

export async function deleteConnection(id) {
	const response = await client.delete(`sso/connection/${id}`);
	return response.data;
}
