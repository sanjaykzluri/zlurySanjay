import { Loader } from "common/Loader/Loader";
import { push } from "connected-react-router";
import CustomFieldRenderer from "modules/v2InfiniteTable/ColumnFieldRenderers/customFieldRenderer";
import React, {
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import ContentLoader from "react-content-loader";
import { useDispatch } from "react-redux";
import { checkSpecialCharacters } from "services/api/search";
import RoleContext from "services/roleContext/roleContext";
import _ from "underscore";
import { capitalizeFirstLetter, useWindowSize } from "utils/common";
import downArrow from "assets/down_arrow.svg";
import downArrowActive from "assets/down_arrow_Active.svg";
import upArrow from "assets/up_arrow.svg";
import expand from "assets/add-box-outline.svg";
import collapse from "assets/minus-box-outline.svg";
import branch from "assets/branch-arrow.svg";
import upArrowActive from "assets/up_arrow_active.svg";
import "common/InfiniteTable.css";
import "./DepartmentListTable.css";

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

const childDeptLoadingColumns = [
	{
		dataField: "name",
		text: "Department",
		formatter: () => (
			<ContentLoader width={26} height={26}>
				<circle cx="13" cy="13" r="13" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	...loadingColumns,
];
const TableRowLoading = ({ showCheckbox, loadingData, columns }) => {
	return loadingData.map((el, key) => (
		<tr key={key} className="table__row">
			{showCheckbox && (
				<td className="selection-cell">
					<input type="checkbox" readOnly />
				</td>
			)}
			{columns.map((column, index) => (
				<td key={index}>
					{column.formatter
						? column.formatter(el[column.dataField], el)
						: el[column.dataField]}
				</td>
			))}
		</tr>
	));
};

const DepartmentListTable = ({
	data,
	metaData,
	keyField = "_id",
	checked,
	setChecked,
	handleLoadMore,
	columnsMapper,
	handleRefresh,
	v2TableEntity,
	isLoadingData,
	emptyState,
	hasMoreData,
	searchQuery,
	propsInterColumnsStateObject,
	allowFewSpecialCharacters,
	loadingRowsCount = 14,
	disableCheckbox,
	selectedData = [],
	setSelectedData,
	heightFromProps,
	onSort,
	isFiltered,
	fetchChildDepartments,
	setIsChildRowsLoading,
	isChildRowsLoading,
	currentExpandedDeptId,
	allDeptIds,
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
	const [expandedDeptIds, setExpandedDeptIds] = useState(new Set());
	const [deptIds, setDeptIds] = useState(new Set(allDeptIds || []));

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

	useEffect(() => {
		if(allDeptIds?.length > 0) {
			setDeptIds(allDeptIds);
		}
	}, [allDeptIds]);

	useEffect(() => {
		if (!isFiltered) {
			setExpandedDeptIds([]);
		}
	}, [isFiltered]);

	useLayoutEffect(() => {
		setHeight(window.innerHeight - infiniteTableRef?.current?.offsetTop);
	}, []);

	function setInterColumnsStateObject(interColumnsStateObject) {
		set_InterColumnsStateObject(interColumnsStateObject);
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
			// setChecked(ids);
			setChecked(allDeptIds);
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

	// <GenerateTableRow key={key} el={el} />
	const generateTableRow = (el, expandedIds, setExpandedIds, isChild, rowIndex) => {
		const handleExpand = () => {
			let set = new Set(expandedIds);
			setIsChildRowsLoading(true);
			fetchChildDepartments && fetchChildDepartments(el.dept_id, rowIndex);
			// set.add(`${el._id}_${rowIndex}`);
			set.add(el.dept_id);
			let deptIdsSet = new Set(expandedDeptIds);
			deptIdsSet.add(el.dept_id);
			if(isFiltered) {
				setDeptIds(set);
			}
			setExpandedDeptIds(deptIdsSet);
			setExpandedIds(set);
		};

		const handleCollapse = () => {
			let set = new Set(expandedIds);
			// set.delete(`${el._id}_${rowIndex}`);
			let deptIdsSet = new Set(expandedDeptIds);
			deptIdsSet.delete(el.dept_id);
			set.delete(el.dept_id);
			if(isFiltered) {
				setDeptIds(set);
			}
			setExpandedDeptIds(deptIdsSet);
			setExpandedIds(set);
		};

		const enableExpansion = el?.dept_has_children;
		const basePadding = rowIndex * 16;
		const additionalPadding = rowIndex > 1 ? (rowIndex - 1) * 16 : 0;
		const padding = basePadding + additionalPadding;
		let enableCollapse = el?.dept_has_children && expandedIds.has(el.dept_id);
		if(isFiltered) {
			enableCollapse = enableCollapse && el?.children?.length > 0;
		}
		return (
			<>
				<tr className={`table__row`}>
					{!disableCheckbox && !isViewer && (
						<td className="selection-cell min-width">
							<input
								id="preventRowClick"
								type="checkbox"
								checked={checked?.includes(el?.[keyField])}
								onChange={() => handleChecked(el[keyField], el)}
							/>
						</td>
					)}
					{columns &&
						_.sortBy(columns, (cl) =>
							cl.group_name === "ellipsis" ? 1 : -1
						).map((column, index) => {
							return column.group_name === "dept_tree" ? (
								<td>
									{/* {!expandedIds.has(el._id) && (
										<div
											onClick={() => {
												if (enableExpansion) {
													handleExpand();
												}
											}}
											className={`${
												enableExpansion
													? ""
													: "dept-hierarchy-disabled__row-expansion"
											}`}
										>
											<img
												src={
													enableExpansion
														? expand
														: expandDisabled
												}
												alt="expand"
											/>
										</div>
									)} */}
									{enableExpansion && !expandedIds.has(el.dept_id) && (
										<div
											onClick={() => {
												handleExpand();
											}}
											className={`${
												enableExpansion
													? ""
													: "dept-hierarchy-disabled__row-expansion"
											}`}
										>
											<img src={expand} alt="expand" className="dept-expand__svg-color"/>
										</div>
									)}
									{enableCollapse && (
										<div onClick={handleCollapse}>
											<img
												src={collapse}
												alt="collapse"
											/>
										</div>
									)}
								</td>
							) : (
								(columnsMapper[column.group_name] ||
									(Array.isArray(column.field_ids) &&
										column.field_ids?.includes(
											"custom_fields"
										))) && (
									<td
										className={`min-width`}
										key={index}
										style={
											columnsMapper[column.group_name]
												?.cellStyle
												? columnsMapper[
														column.group_name
												  ]?.cellStyle(el)
												: {}
										}
									>
										<div
											className={`d-flex`}
											style={{
												paddingLeft: `${
													column.group_name ===
														"department" &&
													`${padding}px`
												}`,
											}}
										>
											{column.group_name ===
												"department" && !el.dept_id?.endsWith('_direct_users') && 
												isChild && (
													<img
														src={branch}
														alt="child"
														className="pr-2"
													/>
												)}
											{columnsMapper[column.group_name]
												?.formatter
												? columnsMapper[
														column.group_name
												  ].formatter(
														el[
															columnsMapper[
																column
																	.group_name
															].dataField
														],
														el,
														interColumnsStateObject,
														setInterColumnsStateObject
												  )
												: columnsMapper[
														column.group_name
												  ]
												? el[
														columnsMapper[
															column.group_name
														]?.dataField
												  ]
												: column.group_name && (
														<CustomFieldRenderer
															idx={index}
															handleRefresh={
																handleRefresh
															}
															data={el}
															column={column}
															entity={
																v2TableEntity
															}
														/>
												  )}
										</div>
									</td>
								)
							);
						})}
				</tr>
				{isChildRowsLoading && el.dept_id === currentExpandedDeptId && (
					<TableRowLoading
						loadingData={Array(3).fill({ dummy: "Hello" })}
						showCheckbox={!disableCheckbox && !isViewer}
						columns={childDeptLoadingColumns}
					/>
				)}
				{el?.children?.length > 0 &&
					// !expandedIds.has(`${el._id}_${rowIndex}`) &&
					expandedIds.has(el.dept_id) &&
					el?.children?.map((child) => {
						return (
							<React.Fragment key={child.dept_id}>
								{generateTableRow(
									child,
									expandedIds,
									setExpandedIds,
									true,
									rowIndex + 1
								)}
							</React.Fragment>
						);
					})}
			</>
		);
	};

	const GenerateRow = ({ el, existingDeptIds }) => {
		const [expandedIds, setExpandedIds] = useState(new Set(existingDeptIds));

		/* useEffect(() => {
			if(expandedDeptIds?.size > 0) {
				setExpandedIds(new Set([...expandedIds, ...expandedDeptIds]))
			}
		}, [expandedDeptIds]); */

		return generateTableRow(el, expandedIds, setExpandedIds, false, 0);
	};

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
															// data?.length;
															allDeptIds?.length;
													}
												}
											}}
											checked={
												data && data?.length === 0
													? false
													: allDeptIds?.length ===
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
												<div className="flex">
													{el.is_sortable && (
														<div className="table-header-sort-icons">
															<img
																alt=""
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
																alt=""
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
						{Array.isArray(data) && data.length > 0 ? (
							data.map((el) => (
								<GenerateRow
									key={el.dept_id}
									el={el}
									existingDeptIds={
										isFiltered
											? deptIds
											: expandedDeptIds
									}
								/>
							))
						) : isLoadingData &&
						  loadingData &&
						  loadingData.length > 0 ? (
							<TableRowLoading
								loadingData={loadingData}
								showCheckbox={!disableCheckbox && !isViewer}
								columns={loadingColumns}
							/>
						) : null}
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

export default DepartmentListTable;
