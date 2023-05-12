import React from "react";
import ExportModal from "common/Export/ExportModal";
import { exportAuditlogsCSV } from "services/api/auditlogs";

export const AllAuditLogsExport = (checked, metaData, propertyList) => (
	<ExportModal
		title="Export AuditLogs Data"
		propertyList={propertyList}
		mandatoryFieldId="event_name"
		mandatoryFieldName="Event Name"
		hiddenPropertiesArray={["_id"]}
		customFieldEntity="licenses"
		exportEntity="AuditLogs"
		selectedDataFieldId="_id"
		selectedData={checked}
		metaData={metaData}
		exportCSV={exportAuditlogsCSV}
		exportScheduleName="AuditLogs Export"
		scheduleEntity="auditlogs"
	/>
);
