import { client } from "../../utils/client";

export async function addNewNote(noteObj) {
	const response = await client.post(`notes`, noteObj);
	return response.data;
}

export async function updateNote(id, noteObj) {
	const response = await client.put(`notes/${id}`, noteObj);
	return response.data;
}

export async function deleteNote(id, noteObj) {
	const response = await client.post(`notes/${id}`, noteObj);
	return response.data;
}

export async function add_edit_Reminder(id, noteObj) {
	const response = await client.put(`notes/${id}/reminder`, noteObj);
	return response.data;
}

export async function delete_Reminder(id, noteObj) {
	const response = await client.put(`notes/${id}/deletereminder`, noteObj);
	return response.data;
}
