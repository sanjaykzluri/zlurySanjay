import React, { useState, useEffect } from "react";
import "./ForecastTable.css";
import forecastbackground from "assets/optimization/forecastbackground.svg";
import OldInfiniteTable from "common/oldInfiniteTable";
import LicenseTableCell from "modules/licenses/components/AllLicensesTable/LicenseTableCell";
import { MONTH } from "utils/DateUtility";
import OptimizationTableEditableCell from "./OptimizationTableEditableCell";

export default function ForecastTable({
	data,
	editMode,
	loading,
	title,
	application,
	keyField,
	licenseList,
	generatingPdf,
}) {
	const licenseColumn = {
		group_name: "license",
	};
	const [tableData, setTableData] = useState();
	const [editedData, setEditedData] = useState();
	const [monthdata, setmonthdata] = useState();
	const [metaData, setMetaData] = useState();
	const columnsMapper = {
		license: {
			dataField: "license_name",
			text: "LICENSE",
			sortKey: "",
			formatter: (row, data) => (
				<LicenseTableCell
					license={{
						...data,
						app_id: application?.app_id,
						app_name: application?.app_name,
						app_logo: application?.app_logo,
					}}
					generatingPdf={generatingPdf}
				/>
			),
		},
	};
	useEffect(() => {
		setTableData(data);
		setEditedData(data);
		let x = data?.[0]?.monthly_data.map((row) => {
			return {
				group_name: `${MONTH[row.month_id - 1]?.toUpperCase()} '${
					row.year_id
				}`,
			};
		});
		if (x) {
			setMetaData({
				columns: [licenseColumn, ...x],
			});
		}
		setmonthdata(x);
	}, [data]);
	let startOfEditableCell = data?.[0]?.monthly_data.findIndex(
		(x, i) => x.forecast === true
	);
	let x = data?.[0]?.monthly_data.forEach((row, index) => {
		const year_text = row?.year_id?.toString()?.slice(2);
		const mapper = {
			text:
				row.month_id === 1
					? `${MONTH[row.month_id - 1]?.toUpperCase()} '${year_text}`
					: `${MONTH[row.month_id - 1]?.toUpperCase()}`,
			sortKey: "",
			cellStyle: (data) => {
				return {
					background: data?.monthly_data?.[index]?.forecast
						? `url(${forecastbackground})`
						: "",
				};
			},
			formatter: (row, data) => (
				<OptimizationTableEditableCell
					data={data}
					index={index}
					editMode={editMode}
					setEditedData={setEditedData}
					editedData={editedData}
					title={title}
					startOfEditableCell={startOfEditableCell}
					application={application}
					keyField={keyField}
					licenseList={licenseList}
				/>
			),
		};
		columnsMapper[
			`${MONTH[row.month_id - 1]?.toUpperCase()} '${row.year_id}`
		] = mapper;
	});
	return (
		<div className={"new-infinite-table-container p-0 mt-0"}>
			<OldInfiniteTable
				isLoadingData={loading}
				data={editedData}
				metaData={metaData}
				disableCheckbox
				columnsMapper={columnsMapper}
				loadingRowsCount={3}
			/>
		</div>
	);
}
