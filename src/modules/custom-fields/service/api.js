import { client } from "../../../utils/client";

export async function addCustomFieldService( data) {
	const response = await client.post(`custom-fields`, data);
	return response.data;
}

export async function editCustomFieldService(data) {
	const response = await client.put(`custom-fields/${data._id}`, data);
	return response.data;
}

export async function deleteCustomFieldService(data) {
	const response = await client.post(`custom-fields/${data._id}`, data);
	return response.data;
}

export async function getAllCustomFieldService() {
	const response = await client.get(`settings/fields`);
	return response.data;
}
