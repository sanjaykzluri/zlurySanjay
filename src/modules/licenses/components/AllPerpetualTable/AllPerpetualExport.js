import React from "react";
import ExportModal from "common/Export/ExportModal";
import { exportPerpetualCSV } from "services/api/licenses";

export const AllPerpetualExport = (checked, metaData, propertyList) => (
	<ExportModal
		title="Export Perpetual Data"
		propertyList={propertyList}
		mandatoryFieldId="contract_name"
		mandatoryFieldName="Contract Name"
		hiddenPropertiesArray={[
			"contract_id",
			"contract_name",
			"app_id",
			"vendor_id",
		]}
		customFieldEntity="contracts"
		exportEntity="Perpetuals"
		selectedDataFieldId="contract_id"
		selectedData={checked}
		metaData={metaData}
		exportCSV={exportPerpetualCSV}
		exportScheduleName="Perpetuals Export"
		scheduleEntity="license_perpetuals"
		customFieldPropertyId="perpetual_custom_fields"
	/>
);
