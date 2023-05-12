import React from "react";
import { CSVLink } from "react-csv";
import summaryCSV from "assets/optimization/summaryCSV.svg";
import { optimizationSummaryColumns } from "../constants/OptimizationConstants";

export default function OptimizationSummaryTableGenerateCSV({
	summary,
	selected_filter,
}) {
	return (
		<CSVLink
			style={{
				border: "none",
				textDecoration: "none",
				color: "#000000",
			}}
			data={
				summary?.[selected_filter]?.data?.map((row) => {
					const csvRow = {};
					for (const column of optimizationSummaryColumns) {
						csvRow[column.header] = row[column.dataField];
					}
					return csvRow;
				}) || []
			}
			filename={`Optimization Summary.csv`}
		>
			<div className="d-flex align-items-center" style={{ gap: "4px" }}>
				<img src={summaryCSV} width={20} height={20} />
				<div className="d-flex align-items-center">CSV</div>
			</div>
		</CSVLink>
	);
}
