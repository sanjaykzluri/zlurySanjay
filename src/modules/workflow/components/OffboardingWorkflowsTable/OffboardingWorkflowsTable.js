import React, { useEffect, useState, useRef, useContext } from "react";
import { Loader } from "../../../../common/Loader/Loader";
import "../../../../common/InfiniteTable.css";
import ContentLoader from "react-content-loader";
import { checkSpecialCharacters } from "../../../../services/api/search";
import { Ellipsis } from "react-bootstrap/esm/PageItem";

const OffboardingWorkflowsTable = ({
	data,
	metaData,
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
		if (
			intersectionRatio > 0 &&
			data &&
			data.length &&
			hasMoreData
			// !isLoadingData
		) {
			handleLoadMore();
		}
	}

	return (
		<>
			<table
				style={{
					backgroundColor: "rgba(235, 235, 235, .3)",
					borderRadius: "5px",
					paddingTop: 20,
				}}
				className="table mb-0"
			>
				<thead>
					<tr className="table__header">
						{columns &&
							columns.map(
								(el, key) =>
									columnsMapper[el.column_name] && (
										<th
											key={key}
											style={{
												borderTop: "0px",
												borderBottom: "0px",
											}}
											className="min-width"
										>
											<div className="flex workflow-offboarding-table-header-container">
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
				<tbody style={{ width: "100%" }} id="scrollRoot">
					{Array.isArray(data) && data.length > 0
						? data.map((el, key) => {
								return (
									<React.Fragment key={`${key}`}>
										<tr
											style={{ height: "50px" }}
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
											{columns &&
												columns.map(
													(column, index) =>
														columnsMapper[
															column.column_name
														] && (
															<td
																className={`${
																	column?.column_name ==
																	"app_name"
																		? "pl-3 "
																		: "pl-3 "
																}p-1 `}
																// className="min-width"
																style={{
																	maxWidth:
																		column?.column_name ==
																		"app_link"
																			? "315px"
																			: null,
																	overflow:
																		column?.column_name ==
																		"app_link"
																			? "hidden"
																			: null,
																}}
																key={index}
															>
																{columnsMapper[
																	column
																		.column_name
																]?.formatter
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
						: isLoadingData && loadingData && loadingData.length > 0
						? loadingData.map((el, key) => (
								<tr
									style={{ height: "50px" }}
									key={`${key}`}
									className="table__row"
								>
									{loadingColumns.map((column, index) => (
										<td
											className={`${
												column?.column_name ==
												"app_name"
													? ""
													: "pl-3 "
											}p-1 `}
											key={`${index}`}
										>
											{column.formatter
												? column.formatter(
														el[column.dataField],
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
			<div
				style={{
					display: "block",
				}}
			>
				<div ref={loadingRef}>
					{hasMoreData && <Loader width={60} height={60} />}
				</div>
				{((data && data.length === 0 && !isLoadingData) ||
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

export default OffboardingWorkflowsTable;

const loadingColumns = [
	{
		dataField: "app_name",
		text: "App Name",
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
		dataField: "task",
		text: "Task",
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
		dataField: "recent_activity",
		text: "Recent Activity",
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
		dataField: "role",
		text: "Role",
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
		dataField: "app_link",
		text: "",
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
		dataField: "action",
		text: "",
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

const loadingData = [
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
];
