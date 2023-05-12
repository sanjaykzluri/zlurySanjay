import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { NameBadge } from "../../../../../common/NameBadge";
import ContentLoader from "react-content-loader";
import { InfiniteTable } from "../../../../../components/Departments/InfiniteTable";
import {
	getAllCritcialUsers,
	searchAllCriticalUsersV2,
} from "../../../../../services/api/security";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { ChangeStatus } from "../../../../../components/Applications/Overview/ChangeStatus";
import { unescape } from "../../../../../utils/common";
import { client } from "../../../../../utils/client";
import {
	DottedRisk,
	getRiskStatus,
} from "../../../../../common/DottedRisk/DottedRisk";
import { useDidUpdateEffect } from "../../../../../utils/componentUpdateHook";
import { EmptySearch } from "../../../../../common/EmptySearch";
import RiskModal2 from "../../Modal/RiskModal2";
import { Empty } from "../../Empty/Empty";
import "./CriticalUsersTable.css";
function statusFormatter(cell, row) {
	return (
		<ChangeStatus
			disableEdit={true}
			status={row.app_archive || row.archive ? "archived" : cell}
		/>
	);
}
function riskFormatter(data, row) {
	return (
		<div className="riskFormatter_div">
			<div>
				<DottedRisk size="sm" value={data || 0} />
			</div>
			{getRiskStatus(data || 0).toUpperCase()} RISK
		</div>
	);
}
function AppsListFormatter({ row, data }) {
	return (
		<>
			<div className="flex flex-row align-items-center">
				{row.slice(0, 6).map((el) => (
					<>
						<OverlayTrigger
							placement="top"
							overlay={<Tooltip>{el.app_name}</Tooltip>}
						>
							<img
								src={unescape(el.app_logo)}
								style={{
									marginRight: "10px",
									height: "auto",
									width: "22px",
								}}
							></img>
						</OverlayTrigger>
					</>
				))}
				{row.length > 6 && (
					<>
						<div className="criticalusertable__applistformatter">
							{row.length - 6} more
						</div>
					</>
				)}
			</div>
		</>
	);
}
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
];

export function CriticalUsersTable(props) {
	const [showModal, setShowModal] = useState(false);
	const [rowDetails, setRowDetails] = useState();
	const [totalCount, setTotalCount] = useState();
	const [tempCount, setTempCount] = useState(0);

	return (
		<>
			<div style={{ padding: "0px 40px" }}>
				{showModal && rowDetails && (
					<RiskModal2
						closeModal={() => setShowModal(false)}
						isUser={true}
						rowDetails={rowDetails}
						refresh={() => {
							props.refreshReduxState();
							setShowModal(false);
						}}
						app_name={props.app_name}
						app_image={props.app_logo}
					/>
				)}
			</div>
		</>
	);
}
