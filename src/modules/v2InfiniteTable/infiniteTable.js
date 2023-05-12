import React, {
	useEffect,
	useState,
	useRef,
	useContext,
	useLayoutEffect,
} from "react";
import { Loader } from "../../common/Loader/Loader";
import "./infiniteTable.css";
import downArrow from "../../assets/down_arrow.svg";
import upArrow from "../../assets/up_arrow.svg";
import upArrowActive from "../../assets/up_arrow_active.svg";
import downArrowActive from "../../assets/down_arrow_Active.svg";
import ContentLoader from "react-content-loader";
import { push } from "connected-react-router";
import { useDispatch, useSelector } from "react-redux";
import RoleContext from "../../services/roleContext/roleContext";
import { LicenseCardsContainer } from "../../components/Applications/AllApps/Contracts/ContractsTable";
import { checkSpecialCharacters } from "../../services/api/search";
import { capitalizeFirstLetter, useWindowSize } from "utils/common";
import { v2updateScrollPosition } from "./redux/v2infinite-action";
import { debounce } from "underscore";
import CustomFieldRenderer from "./ColumnFieldRenderers/customFieldRenderer";
import { getAllCustomField } from "modules/custom-fields/redux/custom-field";
import _ from "underscore";
const InfiniteTable = ({
	data,
	metaData,
	keyField,
	checked,
	setChecked,
	handleLoadMore,
	columnsMapper,
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
	selectedData = [],
	setSelectedData,
	fullRowMapper,
	fullRowArray,
	onSort,
	isPaginatedTable = false,
	checkAll,
	setCheckAll,
	checkAllExceptionData,
	setCheckAllExceptionData,
	chipText,
	set_all_present,
	updateScrollPosition,
	scrollTop,
	hasExpandedRow,
	loadexpandedRowComponent,
	v2TableEntity,
	handleRefresh,
	tablePadding = "0 40px",
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
	const [activeColumnLength, setActiveColumnLength] = useState();
	const loadingData = Array(loadingRowsCount).fill({ dummy: "Hello" });
	const [height, setHeight] = useState();
	const { customFields } = useSelector((state) => state);

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

	useEffect(() => {
		setHeight(window?.innerHeight - infiniteTableRef?.current?.offsetTop);
	});

	useEffect(() => {
		dispatch(getAllCustomField());
		function updateScroll() {
			infiniteTableRef?.current &&
				updateScrollPosition &&
				updateScrollPosition(infiniteTableRef?.current?.scrollTop);
		}

		if (infiniteTableRef && infiniteTableRef.current) {
			infiniteTableRef.current.addEventListener(
				"scroll",
				debounce(updateScroll, 200),
				false
			);
			return function cleanup() {
				infiniteTableRef.current.removeEventListener(
					"scroll",
					updateScroll,
					false
				);
			};
		}
	}, []);

	useEffect(() => {
		if (isPaginatedTable) {
			return;
		}
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
		window.iref = infiniteTableRef;

		return () => observer.disconnect();
	}, [loadingRef, data]);

	useEffect(() => {
		infiniteTableRef.current.scrollTop = scrollTop;
	}, [data, loadingRef, infiniteTableRef.current]);

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
		if (checkAll) {
			if (!checkAllExceptionData.includes(id)) {
				const checkedCopy = [...checkAllExceptionData];
				checkedCopy.push(id);
				let checkedCopy2 = [...checked];
				checkedCopy2 = checkedCopy2.filter((el) => el !== id);
				setChecked(checkedCopy2);
				setCheckAllExceptionData(checkedCopy);
				if (checkedCopy.length === metaData.total) {
					setCheckAll(false);
					// setCheckAllExceptionData([]);
				}
			} else {
				let checkedCopy = [...checkAllExceptionData];
				checkedCopy = checkedCopy.filter((el) => el !== id);
				let checkedCopy2 = [...checked];
				checkedCopy2.push(id);
				setChecked(checkedCopy2);
				setCheckAllExceptionData(checkedCopy);
			}
		} else {
			if (!checked.includes(id)) {
				const checkedCopy = [...checked];
				checkedCopy.push(id);
				setChecked(checkedCopy);
				setSelectedData && setSelectedData([...selectedData, item]);
				if (checkedCopy.length === metaData.total) {
					setCheckAll(true);
					// setChecked([]);
				}
				let checkedCopy2 = [...checkAllExceptionData];
				checkedCopy2 = checkedCopy2.filter((el) => el !== id);
				setCheckAllExceptionData(checkedCopy2);
			} else {
				let checkedCopy = [...checked];
				checkedCopy = checkedCopy.filter((el) => el !== id);
				setChecked(checkedCopy);
				let selectedDataCopy = [...selectedData];
				selectedDataCopy = selectedDataCopy.filter(
					(el) => el[keyField] !== id
				);
				setSelectedData && setSelectedData(selectedDataCopy);
			}
		}
	}

	function handleCheckedAll() {
		if (checked?.length > 0 || checkAll) {
			setChecked([]);
			setSelectedData && setSelectedData([]);
			setSelectAll(false);
			setCheckAll(false);
			setCheckAllExceptionData && setCheckAllExceptionData([]);
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
			if (ids.length === metaData?.total) {
				set_all_present && setCheckAll(true);
			}
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
					: searchQuery
					? `?metaData=${meta}&searchQuery=${searchQuery}${hash}`
					: `?metaData=${meta}${hash}`;
				dispatch(push(url));
				onSort && onSort();
			} catch (err) {
				console.log(err);
			}
		});
	}

	const isRenderable = (el) => {
		return (
			columnsMapper[el.group_name] ||
			(Object.values(customFields).filter(Array.isArray)?.length > 0 &&
				Object.values(customFields)
					.filter(Array.isArray)
					.reduce(_.union)
					.find((field) => field.name === el.group_name))
		);
		// Object.values(customFields).find(fields => fields?.find(field => field.find(i => i.name === el.group_name))))
	};

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
								onChange={() => handleChecked(row[keyField])}
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

	return (
		<>
			{set_all_present &&
				data &&
				data.length > 0 &&
				(checked.length > 0 || checkAll) && (
					<div
						style={{
							padding: "0 40px",
							height: "31px",
							background: "rgba(90, 186, 255, 0.1)",
						}}
						className="d-flex align-items-center bg_greyish"
					>
						<div className="font-13 grey-1 d-flex">
							<div className="bold-600 mr-1 ml-1">{`Selected ${
								checkAll
									? metaData?.total -
											checkAllExceptionData.length ||
									  (metaData?.filter_by?.length && 0)
									: checked.length
							}`}</div>
							out of
							<div className="bold-600 ml-1 mr-1">{`
								${metaData?.total || (metaData?.filter_by?.length && 0)}`}</div>
							<div>{`${chipText}`}</div>
						</div>
						<div
							className="cursor-pointer glow_blue font-13 bold-600 ml-3"
							onClick={() => {
								setCheckAll(!checkAll);
								setChecked([]);
								setSelectedData && setSelectedData([]);
								setCheckAllExceptionData([]);
							}}
						>
							{checkAll ? " Unselect All " : "Select All"}
						</div>
					</div>
				)}

			<div
				ref={infiniteTableRef}
				style={{
					height: height,
					padding: tablePadding,
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
														if (
															checked?.length ===
															0
														)
															input.indeterminate = false;
														else {
															input.indeterminate =
																checked?.length !==
																data?.length;
														}
													}
												}}
												checked={
													checkAll
														? checkAll
														: data &&
														  data?.length === 0
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
									)
										.filter(isRenderable)
										.map(
											(el, key) =>
												(columnsMapper[el.group_name] ||
													(Array.isArray(
														el.field_ids
													) &&
														el.field_ids?.includes(
															"custom_fields"
														))) && (
													<th
														key={key}
														className="min-width"
													>
														<div className="flex">
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
																			]
																				?.sortKey
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
																			]
																				?.sortKey
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
																	el
																		.group_name
																]
																	?.headerFormatter ? (
																	<>
																		{columnsMapper[
																			el
																				.group_name
																		]?.headerFormatter()}
																	</>
																) : (
																	columnsMapper[
																		el
																			.group_name
																	]?.text ||
																	(el.group_name !==
																		"ellipsis" &&
																		!el.hide_header &&
																		capitalizeFirstLetter(
																			el.group_name
																		))
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
														handleTableRowClick(
															e,
															el
														)
													}
												>
													{!disableCheckbox &&
														!isViewer && (
															<td className="selection-cell min-width">
																<input
																	id="preventRowClick"
																	type="checkbox"
																	checked={
																		checkAll
																			? !checkAllExceptionData?.includes(
																					el?.[
																						keyField
																					]
																			  )
																			: checked?.includes(
																					el?.[
																						keyField
																					]
																			  )
																	}
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
														_.sortBy(
															columns,
															(cl) =>
																cl.group_name ===
																"ellipsis"
																	? 1
																	: -1
														)

															.filter(
																isRenderable
															)
															.map(
																(
																	column,
																	index
																) =>
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
																					?.skipCellFormat
																					? rowFormatClassName
																					: ""
																			}`}
																			key={
																				index
																			}
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
																			]
																				?.formatter
																				? columnsMapper[
																						column
																							.group_name
																				  ].formatter(
																						el[
																							columnsMapper[
																								column
																									.group_name
																							]
																								?.dataField
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
												{hasExpandedRow &&
													loadexpandedRowComponent(
														el
													)}
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
											{loadingColumns.map(
												(column, index) => (
													<td key={index}>
														{column.formatter
															? column.formatter(
																	el[
																		column
																			.dataField
																	],
																	el
															  )
															: el[
																	column
																		.dataField
															  ]}
													</td>
												)
											)}
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
					{!isPaginatedTable && (
						<div ref={loadingRef}>
							{hasMoreData && <Loader width={60} height={60} />}
						</div>
					)}

					{((data &&
						data.length === 0 &&
						metaData &&
						!isLoadingData) ||
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
		</>
	);
};

export default InfiniteTable;

const FORMATTER = () => (
	<ContentLoader width={91} height={10}>
		<rect width="91" height="10" rx="2" fill="#EBEBEB" />
	</ContentLoader>
);

const HEADERFORMATTER = () => (
	<ContentLoader width={80} height={10}>
		<rect width="80" height="10" rx="2" fill="#EBEBEB" />
	</ContentLoader>
);

export const loadingColumns = [
	{
		dataField: "name",
		text: "Department",
		formatter: FORMATTER,
		headerFormatter: HEADERFORMATTER,
	},
	{
		dataField: "head",
		text: "Head",
		formatter: FORMATTER,
		headerFormatter: HEADERFORMATTER,
	},
	{
		dataField: "usersCount",
		text: "Users",
		formatter: FORMATTER,
		headerFormatter: HEADERFORMATTER,
	},
	{
		dataField: "appsCount",
		text: "Apps Used",
		formatter: FORMATTER,
		headerFormatter: HEADERFORMATTER,
	},
	{
		dataField: "",
		text: "Budget",
		formatter: FORMATTER,
		headerFormatter: HEADERFORMATTER,
	},
	{
		dataField: "",
		text: "Budget",
		formatter: FORMATTER,
		headerFormatter: HEADERFORMATTER,
	},
	{
		dataField: "",
		text: "Budget",
		formatter: FORMATTER,
		headerFormatter: HEADERFORMATTER,
	},
];
