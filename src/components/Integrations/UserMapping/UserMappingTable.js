import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ContentLoader from "react-content-loader";
import { InfiniteTable } from "../../Departments/InfiniteTable";
import { client } from "../../../utils/client";
import { useDidUpdateEffect } from "../../../utils/componentUpdateHook";
import { UserSelect } from "./UserSelect";
import { EmptySearch } from "../../../common/EmptySearch";
import { Empty } from "./Empty";
import "./styles.css";
import { defaults } from "../../../constants";
import { NameBadge } from "../../../common/NameBadge";
import {
	getIntegrationUserMapping,
	searchIntegrationUserMapping,
} from "modules/integrations/service/api";
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
];

const userMapColumn = {
	dataField: "org_user",
	text: "Map User",
	formatter: (orgUser, row, interColumnsStateObject) => (
		<UserSelect
			user={orgUser}
			row={row}
			refreshTable={interColumnsStateObject.refreshTable}
		/>
	),
};

function userMappingSelector(state) {
	return state.integrations.userMapping;
}
export function UserMappingTable({ filters, integrationId, onChecked }) {
	const [columns, setColumns] = useState([]);
	const { refreshTable } = useSelector((state) => state.ui);
	const cancelToken = useRef();
	const dispatch = useDispatch();

	useDidUpdateEffect(() => {
		if (refreshTable) refreshTable();
		resetKey();
	}, [filters]);

	const resetKey = () => {
		if (filters.searchTerm.length === 0) {
			if (cancelToken.current)
				cancelToken.current.cancel(
					"Operation cancelled in favor of a new request"
				);
			setTimeout(() => {}, 500);
		}
	};

	const fetchDataFn = (page, row) => {
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		if (filters.searchTerm && filters.searchTerm.length > 0) {
			cancelToken.current = client.CancelToken.source();

			return searchIntegrationUserMapping(
				page,
				row,
				integrationId,
				filters,
				cancelToken.current
			);
		} else {
			cancelToken.current = client.CancelToken.source();

			return getIntegrationUserMapping(
				page,
				row,
				integrationId,
				filters,
				cancelToken.current
			).then((resp) => {
				if (page === 0 && resp?.[0]) {
					const integrationColumns = resp[0]?.integration_keys.map(
						(item, columnIndex) => ({
							dataField: "integration_keys",
							text: item.name,
							formatter: (data, item) =>
								data[columnIndex] && (
									<div className="d-flex flex-row">
										{columnIndex === 0 &&
											(item?.profile_img_url ? (
												<img
													src={item?.profile_img_url}
													alt={row}
													style={{
														height: "26px",
														width: "26px",
														borderRadius: "50%",
													}}
												/>
											) : (
												<NameBadge
													name={
														data[columnIndex]?.value
													}
													width={26}
													className="rounded-circle"
												/>
											))}
										<span style={{ margin: 5 }}>
											{data[columnIndex]?.value}
										</span>
									</div>
								),
						})
					);
					setColumns([...integrationColumns, userMapColumn]);
				}
				return resp;
			});
		}
	};

	return (
		<div className="hide-scrollbar usermapping__table__wrapper">
			<InfiniteTable
				fetchData={fetchDataFn}
				handleCheckedChange={(ch) => onChecked(ch)}
				disableCheckColumn
				componentWithoutRedux
				perPage={defaults.USERMAPPING_ROW}
				loadingData={loadingData}
				loadingColumns={loaderColumns}
				columns={columns}
				interColumnsStateObject={refreshTable}
				keyField="_id"
				emptyState={
					filters.searchTerm ? (
						<EmptySearch searchQuery={filters.searchTerm} />
					) : (
						<Empty title={`No Users found!`} />
					)
				}
				searchQuery={filters.searchTerm}
				resetKey={resetKey}
			/>
		</div>
	);
}
