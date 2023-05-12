import React, { useEffect } from "react";

const MoreInfo = ({
	showdescription,
	id,
	columns,
	columnsMapper,
	dataRow,
	parentHeader,
}) => {
	return (
		<>
			{showdescription.includes(id) && (
				<>
					<tr className="new_workflow_table">
						<td
							colSpan={parentHeader}
							style={{
								background: "#f6f7fa",
							}}
						>
							<div
								className="d-flex m-1"
								style={{ columnGap: "70px" }}
							>
								<div></div>
								{columns &&
									columns.map(
										(column, index) =>
											columnsMapper[
												column.column_name
											] && (
												<div key={index} className="">
													<div
														className="more-info-table-header"
														style={{
															fontWeight: "bold",
														}}
													>
														{columnsMapper[
															column.column_name
														]?.text.toUpperCase()}
													</div>
													<div className="">
														{columnsMapper[
															column.column_name
														]?.formatter
															? columnsMapper[
																	column
																		.column_name
															  ].formatter(
																	dataRow[
																		columnsMapper[
																			column
																				.column_name
																		]
																			.dataField
																	],
																	dataRow
															  )
															: dataRow[
																	columnsMapper[
																		column
																			.column_name
																	].dataField
															  ]}
													</div>
												</div>
											)
									)}
							</div>
						</td>
					</tr>
				</>
			)}
		</>
	);
};

export default MoreInfo;
