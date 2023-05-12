import React from "react";
import ExportModal from "common/Export/ExportModal";
import { exportContractCSV } from "services/api/licenses";

export const AllContractsExport = (checked, metaData, propertyList) => (
	<ExportModal
		title="Export Contract Data"
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
		exportEntity="Contracts"
		selectedDataFieldId="contract_id"
		selectedData={checked}
		metaData={metaData}
		exportCSV={exportContractCSV}
		exportScheduleName="Contracts Export"
		scheduleEntity="license_contracts"
		customFieldPropertyId="contract_custom_fields"
	/>
);
