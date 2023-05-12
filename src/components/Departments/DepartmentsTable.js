import React, { useState, useRef, useEffect } from "react";
import { Table } from "../../common";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./Departments.css";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import ContentLoader from "react-content-loader";
import { client } from "../../utils/client";
import {
	getAllDepartments,
	patchDepartments,
} from "../../services/api/departments";
import { InfiniteTable } from "./InfiniteTable";
import { useDispatch, useSelector } from "react-redux";
import { useDidUpdateEffect } from "../../utils/componentUpdateHook";
import {
	checkSpecialCharacters,
	searchAllDepartments,
} from "../../services/api/search";
import { ChangeOwner } from "../Applications/Overview/ChangeOwner";
import { Empty } from "./Empty";
import { EmptySearch } from "../../common/EmptySearch";
import { NameBadge } from "../../common/NameBadge";
import { fetchAllDepartments } from "../../actions/departments-action";
import { departmentConstants, ENTITIES } from "../../constants";
import { kFormatter } from "../../constants/currency";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { getValueFromLocalStorage } from "utils/localStorage";

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

function ownerFormatter(cell, row) {
	return (
		<>
			<ChangeOwner
				fieldName="head"
				updateFunc={patchDepartments}
				idFromTable={row.department_id}
				userId={cell.owner_id}
				userName={cell.owner_name}
				userImage={cell.owner_profile_url}
			/>
		</>
	);
}

const showTooltipLength = 20;
function clickedOnDepartment(id, name) {
	//Segment Implementation
	window.analytics.track("Clicked on Single Department", {
		currentCategory: "Departments",
		currentPageName: "All-Departments",
		clickedDeptId: id,
		clickedDeptName: name,
		orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
		orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
	});
}
const columns = [
	{
		dataField: "department_name",
		text: "Department",
		formatter: (dataField, data) => (
			<Link
				to={`/departments/${encodeURI(data.department_id)}#overviewdep`}
				onClick={() =>
					clickedOnDepartment(
						data.department_id,
						data.department_name
					)
				}
			>
				<div className="flex flex-row center">
					{data.img ? (
						<img
							src={data.img}
							alt={dataField}
							style={{
								height: "26px",
								width: "26px",
								borderRadius: "50%",
							}}
						/>
					) : (
						<NameBadge
							name={dataField}
							fontSize={14}
							borderRadius={50}
							width={26}
						></NameBadge>
					)}
					<OverlayTrigger
						placement="top"
						overlay={<Tooltip>{dataField}</Tooltip>}
					>
						<div className="flex flex-row align-items-center justify-content-center">
							<div
								className="truncate_name"
								style={{ marginLeft: "8px", color: "#222222" }}
							>
								{dataField}
							</div>
						</div>
					</OverlayTrigger>
				</div>
			</Link>
		),
	},
	{
		dataField: "department_owner",
		text: "Head",
		displayName: "b",
		formatter: ownerFormatter,
	},
	{
		dataField: "department_users_count",
		text: "Users",
	},
	{
		dataField: "department_apps_count",
		text: "Apps Used",
	},
	{
		dataField: "",
		text: "Budget",
		formatter: (row, data) => (
			<div className="flex flex-row center align-items-center">
				<div style={{ width: "20px" }}>
					<CircularProgressbar
						value={data.department_budget_used}
						maxValue={data.department_budget_allocated}
					/>
				</div>
				<div style={{ marginLeft: "8px" }}>
					{kFormatter(data.department_budget_used || 0)}
				</div>
				<div style={{ marginLeft: "5px" }}> of </div>
				<div style={{ marginLeft: "5px" }}>
					{" "}
					{kFormatter(data.department_budget_allocated || 0)}{" "}
				</div>
				<div style={{ marginLeft: "5px" }}> used </div>
			</div>
		),
	},
];

export function DepartmentsTable(props) {
	const { searchQuery } = props;
	const { refreshTable } = useSelector((state) => state.ui);
	const filterResponseKey = "results";
	const initialResponseKey = "departments";
	const [apiDataKey, setApiDataKey] = useState(initialResponseKey);
	const cancelToken = useRef();
	const dispatch = useDispatch();

	useDidUpdateEffect(() => {
		//only when there is change to element not when creation of element.
		if (refreshTable) refreshTable();
		resetKey();
	}, [searchQuery]);

	const resetKey = () => {
		if (searchQuery.length === 0) {
			if (cancelToken.current)
				cancelToken.current.cancel(
					"Operation cancelled in favor of a new request"
				);
			setTimeout(() => {
				setApiDataKey(initialResponseKey);
			}, 500);
		}
	};

	const fetchDataFn = (page, row) => {
		if (cancelToken.current)
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);

		if (searchQuery && searchQuery.length > 0) {
			if (checkSpecialCharacters(searchQuery)) {
				dispatch({
					type: departmentConstants.DEPARTMENTS_FETCHED,
					payload: {
						data: [],
					},
				});
			} else {
				setApiDataKey(filterResponseKey);
				cancelToken.current = client.CancelToken.source();
				return searchAllDepartments(searchQuery, cancelToken.current);
			}
		}
	};

	function departmentsSelector(state) {
		return state.departments.departments;
	}

	return (
		<InfiniteTable
			searchQuery={searchQuery}
			fetchData={fetchDataFn}
			keyField="department_id"
			loadingColumns={loaderColumns}
			loadingData={loadingData}
			handleCheckedChange={(ch) => props.onChecked(ch)}
			fetchDatafunctionViaRedux={fetchAllDepartments}
			dataFunctionInStore={departmentsSelector}
			columns={columns}
			apiDataKey={apiDataKey}
			emptyState={
				searchQuery ? (
					<EmptySearch searchQuery={searchQuery} />
				) : (
					<Empty />
				)
			}
			resetKey={resetKey}
			type={ENTITIES.DEPARTMENT}
		/>
	);
}

DepartmentsTable.propTypes = {
	data: PropTypes.array.isRequired,
	loading: PropTypes.bool,
	searchQuery: PropTypes.string,
};
