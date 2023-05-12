import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Empty } from "../../Empty/Empty";
import { NameBadge } from "../../../../../common/NameBadge";
import ContentLoader from "react-content-loader";
import { InfiniteTable } from "../../../../../components/Departments/InfiniteTable";
import {
	getAllCritcialApps,
	searchAllCriticalAppsV2,
} from "../../../../../services/api/security";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import {
	DottedRisk,
	getRiskStatus,
} from "../../../../../common/DottedRisk/DottedRisk";
import { ChangeStatus } from "../../../../../components/Applications/Overview/ChangeStatus";
import { EmptySearch } from "../../../../../common/EmptySearch";
import { client } from "../../../../../utils/client";
import "./CriticalAppsTable.css";
import RiskModal from "../../Modal/RiskModal";
import { useDidUpdateEffect } from "../../../../../utils/componentUpdateHook";
import { AppAuthStatusIconAndTooltip } from "../../../../../common/AppAuthStatus";
import { checkSpecialCharacters } from "../../../../../services/api/search";
import AppTableComponent from "../../../../../common/AppTableComponent";
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
			<div
				className={
					(row.user_app_status || row.user_status) === "active"
						? "d-flex"
						: "o-6 d-flex"
				}
			>
				<DottedRisk size="sm" value={data || 0} />
			</div>
			{getRiskStatus(data || 0).toUpperCase()} RISK
		</div>
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

export function CriticalAppsTable(props) {
	const [showModal, setShowModal] = useState(false);
	const [rowDetails, setRowDetails] = useState();
	const [tableData, setTableData] = useState();
	const refreshTable = useSelector((state) => state.ui["criticalAppsTable"]);
	const [totalCount, setTotalCount] = useState();
	const [tempCount, setTempCount] = useState(0);
	const cancelToken = useRef();
	const columns = [
		{
			dataField: "app_name",
			text: "Name",
			formatter: (row, data, rowindex) => (
				<div className="flex flex-row align-items-center">
					{data.app_logo && (
						<img
							src={data.app_logo}
							alt={data.app_name}
							style={{
								height: "auto",
								width: "28px",
							}}
						/>
					)}
					{!data.app_logo && (
						<NameBadge width={28} name={data.app_name} />
					)}
					<OverlayTrigger
						placement="top"
						overlay={<Tooltip>{row}</Tooltip>}
					>
						<div
							className="truncate_10vw"
							style={{ marginLeft: "8px" }}
						>
							{row}
						</div>
					</OverlayTrigger>
				</div>
			),
		},
		{
			dataField: "app_status",
			text: "Status",
			formatter: statusFormatter,
		},
		{
			dataField: "user_count",
			text: "Users",
			formatter: (row, data, rowindex) => (
				<div className="flex flex-row align-items-center">
					{row} Users
				</div>
			),
		},
		{
			dataField: "scope_count",
			text: "Scopes",
			formatter: (row, data, rowindex) => (
				<div className="flex flex-row align-items-center">
					{row} Scopes
				</div>
			),
		},
		{
			dataField: "risk",
			text: "Risk",
			formatter: riskFormatter,
		},
	];
	const handleRowClick = (
		row,
		interColumnsStateObject,
		setInterColumnsStateObject
	) => {
		setShowModal(true);
		setRowDetails({
			row: row,
			interColumnsStateObject: interColumnsStateObject,
			setInterColumnsStateObject: setInterColumnsStateObject,
		});
	};
	useEffect(() => {
		if (totalCount > 0) {
			setTempCount(totalCount);
		}
	}, [totalCount]);
	useDidUpdateEffect(() => {
		refreshTable();
	}, [props.searchQuery]);

	const fetchDataFn = (page, row) => {
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		if (props.searchQuery && props.searchQuery.length > 0) {
			cancelToken.current = client.CancelToken.source();
			return searchAllCriticalAppsV2(
				props.searchQuery,
				page,
				row,
				cancelToken.current
			);
		}
		return getAllCritcialApps(page, row);
	};
	return (
		<>
			<div style={{ padding: "0px 40px" }}>
				<InfiniteTable
					perPage={30}
					loadingData={loadingData}
					loadingColumns={loaderColumns}
					fetchData={fetchDataFn}
					columns={columns}
					apiDataKey={"data"}
					setTableData={setTableData}
					keyField="app_id"
					emptyState={
						props.searchQuery ? (
							<EmptySearch searchQuery={props.searchQuery} />
						) : (
							totalCount === 0 && tempCount === 0 && <Empty />
						)
					}
					componentWithoutRedux
					searchQuery={props.searchQuery}
					handleRowClick={handleRowClick}
					renderedFrom="criticalAppsTable"
					setCount={setTotalCount}
				/>
				{showModal && rowDetails && (
					<RiskModal
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
