import { statusPill } from "modules/licenses/utils/LicensesUtils";
import React from "react";

export default function StatusPillAndDropdown({
	status,
	options = ["active", "cancelled"],
}) {
	return <>{statusPill[status]}</>;
}
