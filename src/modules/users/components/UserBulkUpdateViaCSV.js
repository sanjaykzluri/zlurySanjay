import React from "react";
import { bulkUpdateUserData, exportUserCSV } from "services/api/users";
import { BulkUpdate } from "components/Applications/AllApps/BulkUpdate";

export default function UserBulkUpdateViaCSV(checked, metaData, propertyList) {
	return (
		<BulkUpdate
			id={"user_id"}
			name={"user_name"}
			title={"Bulk Update Data"}
			screen={"User"}
			checked={checked}
			metaData={metaData}
			exportData={exportUserCSV}
			propertyList={propertyList}
			bulkUpdateData={bulkUpdateUserData}
			customFieldEntity="users"
			screen_custom_fields="user_custom_fields"
		/>
	);
}
