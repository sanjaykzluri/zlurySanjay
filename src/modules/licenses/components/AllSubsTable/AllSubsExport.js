import React from "react";
import ExportModal from "common/Export/ExportModal";
import { exportSubscriptionCSV } from "services/api/licenses";

export const AllSubsExport = (checked, metaData, propertyList) => (
	<ExportModal
		title="Export Subscription Data"
		propertyList={propertyList}
		mandatoryFieldId="contract_name"
		mandatoryFieldName="Subscription Name"
		hiddenPropertiesArray={["contract_id", "contract_name"]}
		customFieldEntity="contracts"
		exportEntity="Subscriptions"
		selectedDataFieldId="contract_id"
		selectedData={checked}
		metaData={metaData}
		exportCSV={exportSubscriptionCSV}
		exportScheduleName="Subscriptions Export"
		scheduleEntity="license_subscriptions"
		customFieldPropertyId="subscription_custom_fields"
	/>
);
