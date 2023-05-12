import React from "react";
import ExportModal from "../../../../common/Export/ExportModal";
import { exportApplicationsCSV } from "../../../../services/api/applications";

export const AppExport = (checked, metaData, propertyList) => (
	<ExportModal
		title="Export App Data"
		propertyList={propertyList}
		mandatoryFieldId="app_name"
		mandatoryFieldName="Application Name"
		hiddenPropertiesArray={[
			"app_id",
			"app_name",
			"app_sub_categories.sub_category_id",
		]}
		customFieldPropertyId="app_custom_fields"
		customFieldEntity="applications"
		exportEntity="Applications"
		selectedDataFieldId="app_id"
		selectedData={checked}
		metaData={metaData}
		exportCSV={exportApplicationsCSV}
		exportScheduleName="Applications Export"
		scheduleEntity="applications"
	/>
);
