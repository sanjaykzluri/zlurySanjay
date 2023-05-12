import { getValueFromLocalStorage } from "utils/localStorage";
import { client } from "../../utils/client";

export async function getAllNotifications(page, rows) {
	const userId = getValueFromLocalStorage("userInfo")?.user_id;
	if (userId) {
		const response = await client.get(
			`users/${userId}/notifications?page=${page || 0}&row=${rows || 10}`
		);
		return response;
	} else {
		return {};
	}
}

export async function markNotification(
	notification_ids,
	notificationStatus, //boolean
	cancelToken = null
) {
	let options = {};
	let apiEndPoint;
	options = {
		notification_ids: notification_ids,
		cancelToken: cancelToken?.token,
	};
	apiEndPoint = notificationStatus
		? "notifications/mark-as-read"
		: "notifications/mark-as-unread";
	const response = client.put(apiEndPoint, options);
	return response;
}

export async function getS3LinkForDownload(token) {
	const response = await client.get(
		`notifications/download-link?token=${token}`
	);
	return response.data;
}
