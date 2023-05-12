import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import ContentLoader from "react-content-loader";
import { arrayOfFirstGivenNumbers } from "utils/common";
import { getOptimizationTableColumnGroups } from "../utils/OptimizationUtils";
import { optimizationSummaryColumns } from "../constants/OptimizationConstants";
import OptimizationSummaryAppLicenseRows from "./OptimizationSummaryAppLicenseRows";
import emptyOptimizationSummary from "assets/optimization/emptyOptimizationSummary.svg";

export default function OptimizationSummaryTable({
	error,
	loading,
	summary,
	selected_filter,
}) {
	const history = useHistory();
	const columnsMapper = getOptimizationTableColumnGroups(
		"optimization_summary"
	);
	const active_license_row_apps = useSelector(
		(state) =>
			state.optimization.optimization_summary.active_license_row_apps
	);

	return (
		<>
			<div className="optimization_summary_table_container">
				{loading ? (
					<OptimizationSummaryTableLoader />
				) : Array.isArray(summary?.[selected_filter]?.data) &&
				  summary?.[selected_filter]?.data?.length > 0 &&
				  !error ? (
					<table
						className="optimization_summary_table"
						id="optimization_summary_table"
						key={selected_filter}
					>
						<OptimizationSummaryTableHeaderRow />
						<tbody
							className="optimization_summary_table_body"
							id="scrollRoot"
						>
							{summary?.[selected_filter]?.data?.map(
								(row, rowIndex) => (
									<React.Fragment key={rowIndex}>
										<tr className="optimization_summary_table_body_row">
											{optimizationSummaryColumns.map(
												(column, columnIndex) => (
													<td
														key={`${rowIndex}_${columnIndex}`}
														className={
															column.cellContainerClassName ||
															"optimization_summary_table_body_row_cell"
														}
													>
														<div
															className={`${
																column.cellClassName ||
																"d-flex justify-content-center"
															}${
																column?.navigateTo
																	? " cursor-pointer text-underline"
																	: ""
															}`}
															onClick={() =>
																column?.navigateTo &&
																column?.navigateTo(
																	history,
																	row?.app_id,
																	selected_filter
																)
															}
														>
															{columnsMapper[
																column
																	.group_name
															].formatter(
																row[
																	column
																		.dataField
																],
																row
															)}
														</div>
													</td>
												)
											)}
										</tr>
										{active_license_row_apps?.includes(
											row.app_id
										) && (
											<OptimizationSummaryAppLicenseRows
												appId={row.app_id}
												loadingRowCount={
													row.license_types
												}
											/>
										)}
									</React.Fragment>
								)
							)}
						</tbody>
					</table>
				) : (
					<OptimizationSummaryEmptyTable />
				)}
			</div>
		</>
	);
}

function OptimizationSummaryTableHeaderRow() {
	return (
		<thead className="optimization_summary_table_head">
			<tr className="optimization_summary_table_head_row">
				{optimizationSummaryColumns.map((column, headerIndex) => (
					<th
						key={headerIndex}
						className={
							column.headerContainerClassName ||
							"optimization_summary_table_head_row_cell"
						}
					>
						<div
							className={
								column.headerClassName ||
								"d-flex justify-content-center"
							}
						>
							{column.header}
						</div>
					</th>
				))}
			</tr>
		</thead>
	);
}

function OptimizationSummaryTableLoader() {
	return (
		<table className="optimization_summary_table">
			<OptimizationSummaryTableHeaderRow />
			<tbody className="optimization_summary_table_body" id="scrollRoot">
				{arrayOfFirstGivenNumbers(20).map((rowIndex) => (
					<tr
						key={rowIndex}
						className="optimization_summary_table_body_row"
					>
						{optimizationSummaryColumns.map(
							(column, columnIndex) => (
								<td
									key={`${rowIndex}_${columnIndex}`}
									className={
										column.cellContainerClassName ||
										"optimization_summary_table_body_row_cell"
									}
								>
									<div
										className={
											column.cellClassName ||
											"d-flex justify-content-center"
										}
									>
										<ContentLoader
											width={
												column.cellContainerClassName
													? 30
													: 150
											}
											height={14}
										>
											<rect
												width={
													column.cellContainerClassName
														? "30"
														: "150"
												}
												height="14"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</td>
							)
						)}
					</tr>
				))}
			</tbody>
		</table>
	);
}

function OptimizationSummaryEmptyTable() {
	return (
		<>
			<div className="optimization_summary_empty_table">
				<img
					src={emptyOptimizationSummary}
					alt="EMPTY"
					width={300}
					height={181}
				/>
				<div>
					Optimization insights are unavailable for the applied
					filters.
				</div>
			</div>
		</>
	);
}
