import React from "react";
import ExportModal from "common/Export/ExportModal";
import { exportRecognisedTransactionCSV } from "services/api/transactions";

export const RecognisedExport = (checked, metaData, propertyList, checkAll) => {
	return (
		<ExportModal
			title="Export Recognised Transactions Data"
			propertyList={propertyList}
			mandatoryFieldId="app_name"
			mandatoryFieldName="Application Name"
			hiddenPropertiesArray={[
				"app_name",
				"transaction_id",
				"source_id",
				"payment_method_id",
			]}
			exportEntity="Transactions"
			selectedDataFieldId="_id"
			selectedData={checked}
			exportCSV={exportRecognisedTransactionCSV}
			exportScheduleName="Recognised Transactions Export"
			scheduleEntity="recognized_transactions"
			checkAll={checkAll}
		/>
	);
};
