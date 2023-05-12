import React, { useEffect, useState, useRef } from "react";
import "./WorkflowsTable.css";
import { Loader } from "../../../../common/Loader/Loader";
import "../../../../common/InfiniteTable.css";
import ContentLoader from "react-content-loader";
import { checkSpecialCharacters } from "../../../../services/api/search";
import {
	sortableContainer,
	sortableElement,
	sortableHandle,
} from "react-sortable-hoc";

const SortableContainer = sortableContainer(({ children }) => {
	return children;
});

const WorkflowsTable = ({
	data,
	metaData,
	type,
	handleLoadMore,
	columnsMapper,
	searchQuery,
	isLoadingData,
	hasMoreData,
	allowFewSpecialCharacters,
	columns,
	emptyState,
	handleRowClick,
	propsInterColumnsStateObject,
	onSort,
	selectedTab,
}) => {
	const loadingRef = useRef(null);
	const [interColumnsStateObject, set_InterColumnsStateObject] = useState(
		propsInterColumnsStateObject || {}
	);

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

	// invoke has more function
	function handleObserver(entities, observer) {
		const { intersectionRatio } = entities[0];
		if (intersectionRatio > 0 && data && data.length && hasMoreData) {
			handleLoadMore();
		}
	}

	function onSortEnd({ oldIndex, newIndex }) {
		onSort({ oldIndex, newIndex });
	}

	const DragHandle = sortableHandle(({ el }) => el);

	const SortableItem = sortableElement(({ el, columns, index, key }) => {
		return (
			<tr
				style={{
					opacity: el?.archive ? 0.5 : 1,
				}}
				className={`table__row ${handleRowClick && "cursor-pointer"}`}
				onClick={(e) =>
					e.target.id !== "preventRowClick" &&
					handleTableRowClick(e, el)
				}
			>
				{columns &&
					columns.map(
						(column, index) =>
							columnsMapper[column.column_name] && (
								<td
									className="min-width"
									style={{
										minWidth:
											column?.column_name == "users"
												? "315px"
												: null,
										overflow:
											column?.column_name == "user"
												? "hidden"
												: null,
									}}
									key={index}
								>
									{column.column_name === "order" &&
									columnsMapper[column.column_name]
										?.formatter ? (
										<DragHandle
											el={columnsMapper[
												column.column_name
											].formatter(
												el[
													columnsMapper[
														column.column_name
													].dataField
												],
												el,
												interColumnsStateObject,
												setInterColumnsStateObject
											)}
										/>
									) : columnsMapper[column.column_name]
											?.formatter ? (
										columnsMapper[
											column.column_name
										].formatter(
											el[
												columnsMapper[
													column.column_name
												].dataField
											],
											el,
											interColumnsStateObject,
											setInterColumnsStateObject
										)
									) : (
										el[
											columnsMapper[column.column_name]
												.dataField
										]
									)}
								</td>
							)
					)}
			</tr>
		);
	});

	return (
		<>
			<div>
				<table
					className={`table table-hover mb-0 ${
						selectedTab === "#rules" ? "new_workflow_table" : ""
					}`}
				>
					<thead className="new-infinite-table-header">
						<tr className="table__header">
							{Array.isArray(data) &&
								data.length > 0 &&
								!isLoadingData &&
								columns &&
								columns.map(
									(el, key) =>
										columnsMapper[el.column_name] && (
											<th key={key} className="min-width">
												<div className="flex workflow-table-header-container">
													<div className="table-header-text">
														{
															columnsMapper[
																el.column_name
															]?.text
														}
													</div>
												</div>
											</th>
										)
								)}
						</tr>
					</thead>
					{type === "rules" ? (
						<>
							{Array.isArray(data) && data.length > 0 ? (
								<SortableContainer
									onSortEnd={onSortEnd}
									useDragHandle
									helperClass="draggable-item"
								>
									<tbody
										style={{ width: "100%" }}
										id="scrollRoot"
									>
										{data.map((el, index) => {
											const isDisabled = el?.is_default
												? 1
												: 0;
											return (
												<SortableItem
													collection={isDisabled}
													el={el}
													columns={columns}
													index={index}
													key={`item-${index}`}
													disabled={el?.is_default}
												/>
											);
										})}
									</tbody>
								</SortableContainer>
							) : (
								isLoadingData && (
									<tbody
										style={{ width: "100%" }}
										id="scrollRoot"
									>
										{[...Array(15).keys()].map(
											(el, key) => (
												<tr
													key={`${key}`}
													className="table__row"
												>
													{loadingColumns.map(
														(column, index) => (
															<td
																key={`${index}`}
															>
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
											)
										)}
									</tbody>
								)
							)}
						</>
					) : (
						<tbody style={{ width: "100%" }} id="scrollRoot">
							{Array.isArray(data) && data.length > 0
								? data.map((el, key) => {
										return (
											<React.Fragment key={`${key}`}>
												<tr
													style={{
														opacity: el?.archive
															? 0.5
															: 1,
													}}
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
													{columns &&
														columns.map(
															(column, index) =>
																columnsMapper[
																	column
																		.column_name
																] && (
																	<td
																		className="min-width"
																		style={{
																			minWidth:
																				column?.column_name ==
																				"users"
																					? "315px"
																					: null,
																			overflow:
																				column?.column_name ==
																				"user"
																					? "hidden"
																					: null,
																		}}
																		key={
																			index
																		}
																	>
																		{columnsMapper[
																			column
																				.column_name
																		]
																			?.formatter
																			? columnsMapper[
																					column
																						.column_name
																			  ].formatter(
																					el[
																						columnsMapper[
																							column
																								.column_name
																						]
																							.dataField
																					],
																					el,
																					interColumnsStateObject,
																					setInterColumnsStateObject
																			  )
																			: el[
																					columnsMapper[
																						column
																							.column_name
																					]
																						.dataField
																			  ]}
																	</td>
																)
														)}
												</tr>
											</React.Fragment>
										);
								  })
								: isLoadingData &&
								  [...Array(15).keys()].map((el, key) => (
										<tr
											key={`${key}`}
											className="table__row"
										>
											{loadingColumns.map(
												(column, index) => (
													<td key={`${index}`}>
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
								  ))}
						</tbody>
					)}
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
		</>
	);
};

export default WorkflowsTable;

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
