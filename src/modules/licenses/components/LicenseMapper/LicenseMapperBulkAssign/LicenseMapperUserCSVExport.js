import React from "react";
import _ from "underscore";
import { useSelector } from "react-redux";
import { CSVLink } from "react-csv";
import { getBulkAssignLicenseCSVData } from "modules/licenses/utils/LicensesUtils";

export default function LicenseMapperUserCSVExport() {
	const { data } = useSelector((state) => state.licenseMapper);

	return (
		<>
			<CSVLink
				style={{
					background: "#fff",
					border: "none",
					textDecoration: "none",
				}}
				data={getBulkAssignLicenseCSVData(data || [])}
				filename={`Bulk Assign Licenses.csv`}
			>
				<div className="primary_bg_2 border-radius-8 padding_4 font-10 bold-500 font-white">
					Download Users
				</div>
			</CSVLink>
		</>
	);
}
