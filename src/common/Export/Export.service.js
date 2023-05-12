import { client } from "utils/client";

export async function generateExportReportCSV(exportRequestObj, export_entity, parent_entity_id) {
	const response = await client.post(
		`export`,
		{ 
            ...exportRequestObj,
            export_entity,
            parent_entity_id
        }
	);
	return response.data;
}
