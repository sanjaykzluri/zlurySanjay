import React from "react";
import {
	bulkUpdateAppData,
	exportApplicationsCSV,
} from "services/api/applications";
import { BulkUpdate } from "components/Applications/AllApps/BulkUpdate";

export default function AppBulkUpdateViaCSV(checked, metaData, propertyList) {
	return (
		<BulkUpdate
			id={"app_id"}
			name={"app_name"}
			title={"Bulk Update Data"}
			screen={"Application"}
			checked={checked}
			metaData={metaData}
			exportData={exportApplicationsCSV}
			propertyList={propertyList}
			bulkUpdateData={bulkUpdateAppData}
			customFieldEntity="applications"
			screen_custom_fields="app_custom_fields"
		/>
	);
}
