import React, {
	useEffect,
	useState,
	useRef,
	useContext,
	useLayoutEffect,
} from "react";
import { Loader } from "./Loader/Loader";
import { uiConstants } from "../constants/ui";
import "./InfiniteTable.css";
import { Link } from "react-router-dom";
import downArrow from "../assets/down_arrow.svg";
import upArrow from "../assets/up_arrow.svg";
import upArrowActive from "../assets/up_arrow_active.svg";
import downArrowActive from "../assets/down_arrow_Active.svg";
import ContentLoader from "react-content-loader";
import { push } from "connected-react-router";
import { useDispatch, useSelector } from "react-redux";
import RoleContext from "../services/roleContext/roleContext";
import { LicenseCardsContainer } from "../components/Applications/AllApps/Contracts/ContractsTable";
import { checkSpecialCharacters } from "../services/api/search";
import { filtersRequestBodyGenerator } from "./infiniteTableUtil";
import { capitalizeFirstLetter, useWindowSize } from "../utils/common";
import CustomFieldRenderer from "modules/v2InfiniteTable/ColumnFieldRenderers/customFieldRenderer";
import _ from "underscore";

const OldInfiniteTable = ({
	data,
	metaData,
	keyField = "_id",
	checked,
	setChecked,
	disableCheckColumn,
	handleLoadMore,
	columnsMapper,
	handleRefresh,
	v2TableEntity,
	isLoadingData,
	emptyState,
	hasMoreData,
	searchQuery,
	handleRowClick,
	propsInterColumnsStateObject,
	isContractsTable,
	activeContractIds,
	allowFewSpecialCharacters,
	loadingRowsCount = 14,
	disableCheckbox,
	rowFormatRequired,
	rowFormatClassName,
	fullRowMapper,
	fullRowArray,
	selectedData = [],
	setSelectedData,
	heightFromProps,
	onSort,
}) => {
	const infiniteTableRef = useRef();
	const [selectAll, setSelectAll] = useState(false);
	const dispatch = useDispatch();
	const { isViewer } = useContext(RoleContext);
	const loadingRef = useRef(null);
	const { columns, sort_by: sortBy, filter_by: filterBy } = Object(metaData);
	const [interColumnsStateObject, set_InterColumnsStateObject] = useState(
		propsInterColumnsStateObject || {}
	);
	const [height, setHeight] = useState();

	useWindowSize();

	useEffect(() => {
		if (Object.keys(columnsMapper).includes("ellipsis")) {
			if (Array.isArray(columns)) {
				let i = columns.findIndex(
					(col) => col.group_name === "ellipsis"
				);
				if (i < 0) {
					columns.push({
						field_ids: [],
						group_name: "ellipsis",
					});
				}
			}
		}
	}, [columns]);

	useLayoutEffect(() => {
		setHeight(window.innerHeight - infiniteTableRef?.current?.offsetTop);
	});

	function setInterColumnsStateObject(interColumnsStateObject) {
		set_InterColumnsStateObject(interColumnsStateObject);
	}

	function handleTableRowClick(e, el) {
		e.stopPropagation();
		e.preventDefault();
		handleRowClick &&
			handleRowClick(
				el,
				interColumnsStateObject,
				setInterColumnsStateObject
			);
	}

	useEffect(() => {
		const options = {
			root: null,
			rootMargin: "40px",
			threshold: 0.2,
		};

		// create observer
		let observer = new IntersectionObserver(
			handleObserver.bind(this),
			options
		);

		// observe the `loadingRef`
		observer.observe(loadingRef.current);
		return () => observer.disconnect();
	}, [loadingRef, data]);

	function handleObserver(entities, observer) {
		const { intersectionRatio } = entities[0];
		if (
			intersectionRatio > 0 &&
			data &&
			data.length &&
			hasMoreData &&
			!isLoadingData
		) {
			handleLoadMore();
		}
	}

	function handleChecked(id, item) {
		let checkedCopy = [...checked];
		let selectedDataCopy = [...selectedData];
		if (!checked.includes(id)) {
			checkedCopy.push(id);
			item && selectedDataCopy.push(item);
			setChecked(checkedCopy);
			setSelectedData && setSelectedData(selectedDataCopy);
		} else {
			checkedCopy = checkedCopy.filter((el) => el !== id);
			selectedDataCopy = selectedDataCopy.filter(
				(el) => el[keyField] !== id
			);
			setChecked(checkedCopy);
			setSelectedData && setSelectedData(selectedDataCopy);
		}
	}

	function handleCheckedAll() {
		if (checked?.length > 0) {
			setChecked([]);
			setSelectedData && setSelectedData([]);
			setSelectAll(false);
		} else {
			const ids = [];
			const rows = [];
			data &&
				data.forEach((el) => {
					ids.push(el[keyField]);
				});
			setSelectedData && setSelectedData(data);
			setChecked(ids);
			setSelectAll(true);
		}
	}

	function handleSort(element, value) {
		sortBy[element.sortKey] = value;
		let sort = element.sortKey;

		dispatch(async function (dispatch, getState) {
			try {
				const { router } = getState();
				const { hash, query } = router.location;
				let viewId;
				let reqObj = {};
				if (query.viewId) {
					viewId = query.viewId;
				}
				reqObj.sort_by = [{ [sort]: value }];
				reqObj.filter_by = metaData?.filter_by;
				reqObj.columns = metaData?.columns;
				let url;
				let meta = encodeURIComponent(JSON.stringify(reqObj));
				url = viewId
					? `?metaData=${meta}&viewId=${viewId}${hash}`
					: `?metaData=${meta}${hash}`;
				onSort && onSort();
				dispatch(push(url));
			} catch (err) {
				console.log(err);
			}
		});
	}
	const loadingData = Array(loadingRowsCount).fill({ dummy: "Hello" });

	const renderFullRow = (row, id, whatsNext) => {
		return (
			<>
				<tr style={{ background: " rgba(90, 186, 255, 0.1)" }}>
					{!disableCheckbox && !isViewer && (
						<td className="selection-cell min-width">
							<input
								id="preventRowClick"
								type="checkbox"
								checked={checked?.includes(row?.[keyField])}
								onChange={() =>
									handleChecked(row[keyField], row)
								}
							/>
						</td>
					)}
					{fullRowMapper.map((el, index) => (
						<td
							colSpan={
								el.fullRow &&
								activeColumnLength - fullRowMapper.length + 1
							}
							className="min-width"
						>
							{el?.formatter(row)}
						</td>
					))}
				</tr>
			</>
		);
	};
	const [activeColumnLength, setActiveColumnLength] = useState();
	useEffect(() => {
		if (columns && columnsMapper) {
			let tempLength = 0;
			columns.forEach((el) => {
				if (columnsMapper[el.group_name]) {
					tempLength++;
				}
			});
			setActiveColumnLength(tempLength);
		}
	}, [columns, columnsMapper]);

	return (
		<div
			ref={infiniteTableRef}
			style={{
				height: heightFromProps || height,
				padding: "0 40px",
				overflowX: "auto",
				marginTop: "5px",
			}}
		>
			<div>
				<table className="table table-hover mb-0">
					<thead className="new-infinite-table-header">
						<tr className="table__header">
							{!disableCheckbox && !isViewer && (
								<th
									className="selection-cell-header"
									data-row-selection="true"
								>
									{data && data.length > 0 && (
										<input
											type="checkbox"
											ref={(input) => {
												if (input) {
													if (checked?.length === 0)
														input.indeterminate = false;
													else {
														input.indeterminate =
															checked?.length !==
															data?.length;
													}
												}
											}}
											checked={
												data && data?.length === 0
													? false
													: data?.length ===
													  checked?.length
											}
											onChange={() => {
												handleCheckedAll();
												setSelectAll(!selectAll);
											}}
										/>
									)}
								</th>
							)}
							{columns &&
								_.sortBy(columns, (cl) =>
									cl.group_name === "ellipsis" ? 1 : -1
								).map(
									(el, key) =>
										(columnsMapper[el.group_name] ||
											(Array.isArray(el.field_ids) &&
												el.field_ids?.includes(
													"custom_fields"
												))) && (
											<th key={key} className="min-width">
												<div
													className="flex"
													style={{
														alignItems: "center",
													}}
												>
													{columnsMapper[
														el.group_name
													].headerImg &&
														columnsMapper[
															el.group_name
														].headerImg()}
													{el.is_sortable && (
														<div className="table-header-sort-icons">
															<img
																onClick={() =>
																	handleSort(
																		columnsMapper[
																			el
																				.group_name
																		],
																		1
																	)
																}
																width="9px"
																style={{
																	display:
																		"block",
																	marginBottom:
																		"-1px",
																	cursor: "pointer",
																}}
																src={
																	columnsMapper[
																		el
																			.group_name
																	]?.sortKey
																		? sortBy.length >
																				0 &&
																		  sortBy[0][
																				columnsMapper[
																					el
																						.group_name
																				]
																					.sortKey
																		  ] ===
																				1
																			? upArrowActive
																			: upArrow
																		: null
																}
															/>
															<img
																onClick={() =>
																	handleSort(
																		columnsMapper[
																			el
																				.group_name
																		],
																		-1
																	)
																}
																width="9px"
																style={{
																	cursor: "pointer",
																}}
																src={
																	columnsMapper[
																		el
																			.group_name
																	]?.sortKey
																		? sortBy.length >
																				0 &&
																		  sortBy[0][
																				columnsMapper[
																					el
																						.group_name
																				]
																					.sortKey
																		  ] ===
																				-1
																			? downArrowActive
																			: downArrow
																		: null
																}
															/>
														</div>
													)}
													<div className="table-header-text">
														{columnsMapper[
															el.group_name
														]?.headerFormatter ? (
															<>
																{columnsMapper[
																	el
																		.group_name
																]?.headerFormatter()}
															</>
														) : columnsMapper[
																el.group_name
														  ] ? (
															columnsMapper[
																el.group_name
															]?.text
														) : (
															Array.isArray(
																el.field_ids
															) &&
															capitalizeFirstLetter(
																el.group_name
															)
														)}
													</div>
												</div>
											</th>
										)
								)}
						</tr>
					</thead>
					<tbody style={{ width: "100%" }} id="scrollRoot">
						{Array.isArray(data) && data.length > 0
							? data.map((el, key) =>
									fullRowArray?.includes(el[keyField]) ? (
										renderFullRow(el)
									) : (
										<>
											<tr
												key={key}
												className={`table__row ${
													handleRowClick &&
													"cursor-pointer"
												}`}
												onClick={(e) =>
													e.target.id !==
														"preventRowClick" &&
													handleTableRowClick(e, el)
												}
											>
												{!disableCheckbox && !isViewer && (
													<td className="selection-cell min-width">
														<input
															id="preventRowClick"
															type="checkbox"
															checked={checked?.includes(
																el?.[keyField]
															)}
															onChange={() =>
																handleChecked(
																	el[
																		keyField
																	],
																	el
																)
															}
														/>
													</td>
												)}
												{columns &&
													_.sortBy(columns, (cl) =>
														cl.group_name ===
														"ellipsis"
															? 1
															: -1
													).map(
														(column, index) =>
															(columnsMapper[
																column
																	.group_name
															] ||
																(Array.isArray(
																	column.field_ids
																) &&
																	column.field_ids?.includes(
																		"custom_fields"
																	))) && (
																<td
																	className={`min-width ${
																		rowFormatRequired &&
																		rowFormatRequired(
																			el
																		) &&
																		!columnsMapper[
																			column
																				.group_name
																		]
																			.skipCellFormat
																			? rowFormatClassName
																			: ""
																	}`}
																	key={index}
																	style={
																		columnsMapper[
																			column
																				.group_name
																		]
																			?.cellStyle
																			? columnsMapper[
																					column
																						.group_name
																			  ]?.cellStyle(
																					el
																			  )
																			: {}
																	}
																>
																	{columnsMapper[
																		column
																			.group_name
																	]?.formatter
																		? columnsMapper[
																				column
																					.group_name
																		  ].formatter(
																				el[
																					columnsMapper[
																						column
																							.group_name
																					]
																						.dataField
																				],
																				el,
																				interColumnsStateObject,
																				setInterColumnsStateObject
																		  )
																		: columnsMapper[
																				column
																					.group_name
																		  ]
																		? el[
																				columnsMapper[
																					column
																						.group_name
																				]
																					?.dataField
																		  ]
																		: column.group_name && (
																				<CustomFieldRenderer
																					idx={
																						key
																					}
																					handleRefresh={
																						handleRefresh
																					}
																					data={
																						el
																					}
																					column={
																						column
																					}
																					entity={
																						v2TableEntity
																					}
																				/>
																		  )}
																</td>
															)
													)}
											</tr>
											<tr className="license__row__container">
												{isContractsTable &&
													activeContractIds.includes(
														el.contract_id
													) && (
														<>
															<td></td>
															<td colSpan="8">
																<LicenseCardsContainer
																	id={
																		el.contract_id
																	}
																/>
															</td>
														</>
													)}
											</tr>
										</>
									)
							  )
							: isLoadingData &&
							  loadingData &&
							  loadingData.length > 0
							? loadingData.map((el, key) => (
									<tr key={key} className="table__row">
										{!disableCheckbox && !isViewer && (
											<td className="selection-cell">
												<input
													type="checkbox"
													readOnly
												/>
											</td>
										)}
										{loadingColumns.map((column, index) => (
											<td key={index}>
												{column.formatter
													? column.formatter(
															el[
																column.dataField
															],
															el
													  )
													: el[column.dataField]}
											</td>
										))}
									</tr>
							  ))
							: null}
					</tbody>
				</table>
			</div>
			<div
				style={{
					display: "block",
				}}
			>
				<div ref={loadingRef}>
					{hasMoreData && <Loader width={60} height={60} />}
				</div>
				{((data && data.length === 0 && metaData && !isLoadingData) ||
					checkSpecialCharacters(
						searchQuery,
						allowFewSpecialCharacters
					)) && (
					<div style={{ display: "flex", height: "50vh" }}>
						{emptyState}
					</div>
				)}
			</div>
		</div>
	);
};

export default OldInfiniteTable;

const loadingColumns = [
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
