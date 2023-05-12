import React from "react";
import adobe from "../../../assets/transactions/adobe.svg";
import { Table } from "../../../common";
import PropTypes from "prop-types";
import "./ApplicationsDepTable.scss";
import profilephoto from "../../../assets/applications/profilephoto.svg";
import check from "../../../assets/applications/check.svg";
import { Link } from "react-router-dom";
import { NameBadge } from "../../../common/NameBadge";

const columns = [
	{
		dataField: "applications",
		text: "Application",
		displayName: "a",
		formatter: (row, data, rowindex) => (
			<div className="flex flex-row center">
				<img
					src={adobe}
					alt="adobe"
					style={{ height: "26px", width: "26px" }}
				/>
				<div
					className="flex flex-row justify-content-center align-items-center"
					style={{ marginLeft: "8px" }}
				>
					{row}
				</div>
			</div>
		),
	},
	{
		dataField: "type",
		text: "Type",
		formatter:(row, data) => <span style={{textTransform:'capitalize'}}>{data.type}</span>
	},
	{
		dataField: "spend",
		text: "Spend",
	},
	{
		dataField: "userswithindept",
		text: "Users Within Dept",
	},
	{
		dataField: "source",
		text: "Source",
		displayName: "b",
		formatter: (row) => (
			<div className="flex flex-row center">
				{/*TODO ADD checks for logo*/}
				{/*<img src={check} alt="" style={{ height: "19px", width: "19px" }} />*/}
				<NameBadge name={row} borderRadius={50} width={40}></NameBadge>
				<div
					className="flex flex-row justify-content-center align-items-center"
					style={{ marginLeft: "8px" }}
				>
					{row}
				</div>
			</div>
		),
	},
	{
		dataField: "status",
		text: "Status",
		displayName: "c",
		formatter: (row) => (
			<div className="flex flex-row center">
				<img src={check} alt="" />
				<div
					className="flex flex-row justify-content-center align-items-center"
					style={{ marginLeft: "8px" }}
				>
					{row}
				</div>
			</div>
		),
	},
];
export function ApplicationDepTable(props) {
	const selectRow = {
		mode: "checkbox",
		clickToSelect: true,
	};
	return (
		<Table
			columns={columns}
			data={props.data}
			remote={false}
			hover
			keyField="id"
			selectRow={selectRow}
		/>
	);
}

ApplicationDepTable.propTypes = {
	data: PropTypes.array,
};
