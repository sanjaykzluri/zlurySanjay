import React from "react";
import ExportModal from "common/Export/ExportModal";
import { exportUnrecognisedTransactionCSV } from "services/api/transactions";

export const UnRecognizedExport = (checked, metaData, propertyList) => (
	<ExportModal
		title="Export Unrecognised Transactions Data"
		mandatoryFieldId="transaction_description"
		mandatoryFieldName="Transaction Description"
		propertyList={propertyList}
		hiddenPropertiesArray={[
			"transaction_description",
			"source_id",
			"payment_method_id",
		]}
		exportEntity="Transactions"
		selectedDataFieldId="_id"
		selectedData={checked}
		exportCSV={exportUnrecognisedTransactionCSV}
		exportScheduleName="Unrecognised Transactions Export"
		scheduleEntity="unrecognized_transactions"
	/>
);
