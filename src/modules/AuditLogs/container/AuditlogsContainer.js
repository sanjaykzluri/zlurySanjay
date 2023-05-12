import React from "react";
import HeaderTitleBC from "components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { AuditLogsTable } from "../components/Auditlogs";

export function AuditLogs() {
	return (
		<>
			<HeaderTitleBC title="Audit Logs" />
			<AuditLogsTable />
		</>
	);
}
