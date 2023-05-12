import React from "react";
import ExportModal from "../../../common/Export/ExportModal";
import { exportUserCSV } from "../../../services/api/users";

export const UserExport = (checked, metaData, propertyList) => (
	<ExportModal
		title="Export User Data"
		propertyList={propertyList}
		mandatoryFieldId="user_name"
		mandatoryFieldName="User Name"
		hiddenPropertiesArray={["user_id", "user_name", "user_department_id"]}
		customFieldPropertyId="user_custom_fields"
		customFieldEntity="users"
		exportEntity="users"
		selectedDataFieldId="user_id"
		selectedData={checked}
		metaData={metaData}
		exportCSV={exportUserCSV}
		exportScheduleName="Users Export"
		scheduleEntity="users"
	/>
);
