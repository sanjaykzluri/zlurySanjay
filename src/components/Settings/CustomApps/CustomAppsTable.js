import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import "../../../App.css";
import { Link } from "react-router-dom";
import "./CustomApps.css";
import { getAllCustomApps } from "../../../services/api/settings";
import { Empty } from "../../Applications/AllApps/Empty";
import { InfiniteTable } from "../../Departments/InfiniteTable";
import ContentLoader from "react-content-loader";
import dayjs from "dayjs";
import AppTableComponent from "../../../common/AppTableComponent";
import {
	checkSpecialCharacters,
	searchCustomApps,
} from "../../../services/api/search";
import search from "../../../assets/search.svg";
import { client } from "../../../utils/client";
import { SearchInputArea } from "../../searchInputArea";
import { useSelector } from "react-redux";
import { useDidUpdateEffect } from "../../../utils/componentUpdateHook";
import { EmptySearch } from "../../../common/EmptySearch";
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

const showTooltipLength = 10;

const loaderColumns = [
	{
		dataField: "name",
		text: "Name",
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
		dataField: "category",
		text: "Category",
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
		dataField: "addedon",
		text: "Added On",
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
function clickedOnApp(id, name) {
	//Segment Implementation
	window.analytics.track("Clicked on Single Application", {
		currentCategory: "Settings",
		currentPageName: "Custom Apps",
		clickedAppId: id,
		clickedAppName: name,
		orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
		orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
	});
}
const columns = [
	{
		dataField: "app_name",
		text: "Name",
		displayName: "a",
		formatter: (row, data) => (
			<AppTableComponent
				app_name={data?.app_name}
				app_logo={data?.app_logo}
				app_auth_status={data?.app_state}
				app_id={data?.app_id}
				logo_height="auto"
				logo_width={28}
			/>
		),
	},
	{
		dataField: "app_category",
		text: "Category",
		formatter: (row) => (
			<>{row && row.length > 0 && <div>{row[0].category_name}</div>}</>
		),
	},
	{
		dataField: "app_added_on",
		text: "Added On",
		formatter: (row) => {
			if (row) {
				return dayjs(row).format("D MMM");
			}
		},
	},
	{
		dataField: "viewapp",
		text: "",
		formatter: (row, data) => (
			<div style={{ minWidth: 60 }}>
				<Link
					to={`/applications/${encodeURI(data.app_id)}#overview`}
					className="text-decoration-none"
					onClick={() => clickedOnApp(data.app_id, data.app_name)}
				>
					View App
				</Link>
			</div>
		),
	},
];
export function CustomAppsTable(props) {
	const cancelToken = useRef();
	const [searchQuery, setSearchQuery] = useState("");
	const { refreshTable } = useSelector((state) => state.ui);

	useEffect(() => {
		//Segment Implementation
		window.analytics.page("Settings", "Custom Apps", {
			orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
			orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
		});
	}, []);

	const fetchDataFn = (page, row) => {
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		if (searchQuery && searchQuery.length > 0) {
			cancelToken.current = client.CancelToken.source();
			if (checkSpecialCharacters(searchQuery, true)) {
				return [];
			}
			return searchCustomApps(
				searchQuery,
				page,
				row,
				cancelToken.current
			);
		}
		return getAllCustomApps(page, row);
	};

	useDidUpdateEffect(() => {
		refreshTable();
	}, [searchQuery]);

	return (
		<>
			<div className="d-flex justify-content-end">
				<div className="inputWithIconApps mr-3 ml-auto mb-2">
					<SearchInputArea
						placeholder="Search Custom Apps"
						setSearchQuery={setSearchQuery}
						style={{ minWidth: "180px" }}
					/>
					<img src={search} aria-hidden="true" />
				</div>
			</div>
			<InfiniteTable
				handleCheckedChange={(ch) => {}}
				loadingData={loadingData}
				loadingColumns={loaderColumns}
				fetchData={fetchDataFn}
				columns={columns}
				apiDataKey={"custom_apps"}
				keyField="app_id"
				emptyState={
					searchQuery ? (
						<EmptySearch searchQuery={searchQuery} />
					) : (
						<Empty />
					)
				}
				componentWithoutRedux
				searchQuery={searchQuery}
				perPage={10}
			/>
		</>
	);
}

CustomAppsTable.propTypes = {
	data: PropTypes.array,
};
