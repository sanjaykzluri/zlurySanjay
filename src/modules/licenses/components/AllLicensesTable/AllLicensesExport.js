import React from "react";
import ExportModal from "common/Export/ExportModal";
import { exportLicensesCSV } from "services/api/licenses";

export const AllLicensesExport = (checked, metaData, propertyList) => (
	<ExportModal
		title="Export Licenses Data"
		propertyList={propertyList}
		mandatoryFieldId="license_name"
		mandatoryFieldName="License Name"
		hiddenPropertiesArray={["license_id", "license_name", "app_id"]}
		customFieldEntity="licenses"
		exportEntity="Licenses"
		selectedDataFieldId="license_id"
		selectedData={checked}
		metaData={metaData}
		exportCSV={exportLicensesCSV}
		exportScheduleName="Licenses Export"
		scheduleEntity="licenses"
	/>
);
