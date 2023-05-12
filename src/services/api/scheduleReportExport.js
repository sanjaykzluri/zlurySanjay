import { client } from "../../utils/client";

export async function scheduleReportExport(req) {
	const response = await client.post(`schedule-reports`, req);
	return response.data;
}

export async function getScheduleReportList(page, row) {
	const response = await client.get(
		`schedule-reports?type=report&page=${page}&row=${row}`
	);
	return response.data;
}

export async function getScheduleExportList(page, row, filterBy) {
	const response = await client.get(
		`schedule-reports?type=export${
			filterBy ? `&export_entity=${filterBy}` : ""
		}&page=${page}&row=${row}`
	);
	return response.data;
}

export async function deleteScheduleExportReport(
	scheduleId,
	scheduleType,
	scheduleEntity
) {
	const response = await client.put(`delete-schedule-reports/${scheduleId}`, {
		type: scheduleType,
		export_entity: scheduleEntity,
	});
	return response.data;
}

export async function patchScheduleName(patchObj, id) {
	const response = await client.patch(`schedule-reports/${id}`, patchObj);
	return response.data;
}

export async function updateSchedule(reqObj, id) {
	const response = await client.put(`update-schedule-reports/${id}`, reqObj);
	return response.data;
}
