import React from "react";
import { CSVLink } from "react-csv";
import { getLicensesForLicenseMapperCSVExport } from "modules/licenses/utils/LicensesUtils";
import NumberPill from "UIComponents/NumberPill/NumberPill";

export default function LicenseMapperLicenseCSVExport({ licenses = [] }) {
	return (
		<>
			<CSVLink
				style={{
					background: "#fff",
					border: "none",
					textDecoration: "none",
				}}
				data={getLicensesForLicenseMapperCSVExport(licenses)}
				filename={`Licenses.csv`}
			>
				<div className="primary_bg_2 border-radius-8 padding_4 font-10 bold-500 font-white">
					Download Licenses
				</div>
			</CSVLink>
			<div
				className="d-flex cursor-pointer align-items-center mt-1"
				onClick={() =>
					window.open(
						"https://help.zluri.com/en/articles/6704568-how-zluri-bulk-license-mapping-works"
					)
				}
			>
				<div className="d-flex primary-color bold-600 font-12 mr-1">
					How to edit CSV?
				</div>
				<NumberPill
					number="?"
					pillBackGround="#2266E2"
					fontColor="white"
					pillSize={15}
					fontSize={10}
				/>
			</div>
		</>
	);
}
