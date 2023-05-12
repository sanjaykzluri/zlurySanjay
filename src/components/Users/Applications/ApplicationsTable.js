import React from "react";
import adobe from "../../../assets/transactions/adobe.svg";
import { Table } from "../../../common";
import PropTypes from "prop-types";
import check from "../../../assets/applications/check.svg";
import { Link } from "react-router-dom";
import "./Applications.css";
import { DottedProgress } from "../../../common/DottedProgress/DottedProgress";
import inactivecheck from "../../../assets/applications/inactivecheck.svg";
import ContentLoader from "react-content-loader";
import { capitalizeFirstLetter } from "../../../utils/common";

const loadingData = [
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
];
const loaderColumns = [
	{
		dataField: "name",
		text: "Department",
		formatter: () => (
			<div className="d-flex flex-row align-items-center">
				<ContentLoader
					style={{ marginRight: 8 }}
					width={26}
					height={26}
				>
					<circle cx="13" cy="13" r="13" fill="#EBEBEB" />
				</ContentLoader>
				<ContentLoader width={91} height={10}>
					<rect width="91" height="10" rx="2" fill="#EBEBEB" />
				</ContentLoader>
			</div>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "head",
		text: "Head",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "usersCount",
		text: "Users",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "appsCount",
		text: "Apps Used",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "",
		text: "Budget",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
];

const columns = [
	{
		dataField: "name",
		text: "Application",
		displayName: "a",
		formatter: (row, data, rowindex) => (
			<div className="d-flex flex-row center align-items-center">
				<img
					src={data.image}
					alt="adobe"
					style={{ height: "26px", width: "26px" }}
				/>
				<Link
					to={`/applications/${data._id}#overview`}
					style={{ textDecoration: "none" }}
					className="custom__app__name__css"
					
				>
					<div
						className="flex flex-row justify-content-center align-items-center"
						style={{ marginLeft: "8px" }}
					>
						{row}
					</div>
				</Link>
			</div>
		),
	},
	{
		dataField: "cost",
		text: "Spend",
		formatter: (row, data, rowindex) => (
			<div className="flex flex-row center">
				<div className="ml-3 flex flex-row justify-content-center align-items-center">
					${Number(row).toFixed(0)}
				</div>
			</div>
		),
	},
	{
		dataField: "lastused",
		text: "Last Used",
		formatter: () => <></>,
	},
	{
		dataField: "usage",
		text: "Usage",
		formatter: (row, data) => (
			<DottedProgress value={data.usage}></DottedProgress>
		),
	},
	{
		dataField: "category",
		text: "Source",
	},

	{
		dataField: "status",
		text: "Status",
		formatter: (row, data) => (
			<div className="flex flex-row center">
				{data.status === "active" ? (
					<img src={check} alt="" />
				) : (
					<img src={inactivecheck}></img>
				)}
				<div
					className="flex flex-row justify-content-center align-items-center"
					style={{ marginLeft: "8px" }}
				>
					{data.status && capitalizeFirstLetter(data.status)}
				</div>
			</div>
		),
	},
];
export default function ApplicationsTable(props) {
	const selectRow = {
		mode: "checkbox",
		clickToSelect: true,
	};
	return (
		<Table
			columns={props.data.length === 0 ? loaderColumns : columns}
			data={props.data.length === 0 ? loadingData : props.data}
			hover
			remote={false}
			keyField="id"
			selectRow={selectRow}
		/>
	);
}

ApplicationsTable.propTypes = {
	data: PropTypes.array,
};
