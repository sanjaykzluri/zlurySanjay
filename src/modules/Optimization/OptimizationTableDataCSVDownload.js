import React from "react";
import CsvDownload from "react-json-to-csv";
import CSV from "components/Uploads/CSV.svg";
import { generateCSVData } from "./utils/OptimizationUtils";

export default function OptimizationTableDataCSVDownload({
	data,
	editMode,
	keyField,
	title,
}) {
	return (
		<CsvDownload
			style={{
				background: "#fff",
				border: "none",
			}}
			className="primary-color"
			data={generateCSVData(data, keyField)}
			filename={`Optimization Table Data - ${title} Licenses.csv`}
		>
			<div hidden={editMode} className="cursor-pointer">
				<img src={CSV} alt="" />
			</div>
		</CsvDownload>
	);
}
