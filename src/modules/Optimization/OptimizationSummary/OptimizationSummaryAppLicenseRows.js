import React, { useEffect } from "react";
import {
	getOptimizationTableColumnGroups,
	getOptimizationSummaryLicenseBreakdownColumns,
} from "../utils/OptimizationUtils";
import { useHistory } from "react-router-dom";
import ContentLoader from "react-content-loader";
import { useDispatch, useSelector } from "react-redux";
import { arrayOfFirstGivenNumbers } from "utils/common";
import { checkAndFetchOptimizationSummaryLicenseBreakdown } from "../redux/Optimization-action";

export default function OptimizationSummaryAppLicenseRows({
	appId,
	loadingRowCount,
}) {
	const history = useHistory();
	const dispatch = useDispatch();
	const columnsMapper = getOptimizationTableColumnGroups(
		"optimization_summary_license_breakdown"
	);
	const { selected_filter } = useSelector(
		(state) => state.optimization.optimization_summary
	);
	const { license_summary, loaded, loading, error } = useSelector(
		(state) =>
			state.optimization.optimization_summary.license_summary?.[appId] ||
			{}
	);

	useEffect(() => {
		if (!loaded && !loading) {
			dispatch(checkAndFetchOptimizationSummaryLicenseBreakdown(appId));
		}
	}, [loaded, loading]);

	return (
		<>
			{loading ? (
				<>
					{arrayOfFirstGivenNumbers(loadingRowCount).map(
						(rowIndex) => (
							<tr
								key={rowIndex}
								className="optimization_summary_table_body_row"
							>
								<td className="optimization_summary_toggle_license_display_cell">
									<div className="d-flex justify-content-center" />
								</td>
								{getOptimizationSummaryLicenseBreakdownColumns().map(
									(column, columnIndex) => (
										<td
											key={`${rowIndex}_${columnIndex}`}
											className="optimization_summary_table_body_row_cell"
										>
											<div
												className={
													column.cellClassName ||
													"d-flex justify-content-center"
												}
											>
												<ContentLoader
													width={150}
													height={14}
												>
													<rect
														width="150"
														height="14"
														fill="#EBEBEB"
													/>
												</ContentLoader>
											</div>
										</td>
									)
								)}
							</tr>
						)
					)}
				</>
			) : (
				<>
					<tr className="optimization_summary_table_head_row">
						<td
							className="optimization_summary_toggle_license_display_cell"
							style={{
								background: "#f6f7fa",
							}}
						>
							<div className="d-flex justify-content-center" />
						</td>
						<td
							key={"license_name"}
							className={
								"optimization_summary_table_head_row_cell"
							}
							style={{
								background: "#f6f7fa",
							}}
						>
							<div className={"d-flex bold-600"}>
								License Name
							</div>
						</td>
						{arrayOfFirstGivenNumbers(9).map((index) => (
							<td
								key={index}
								className={
									"optimization_summary_table_head_row_cell"
								}
								style={{
									background: "#f6f7fa",
								}}
							>
								<div />
							</td>
						))}
					</tr>
					{Array.isArray(license_summary?.[selected_filter]?.data) &&
						license_summary?.[selected_filter]?.data?.map(
							(row, rowIndex) => (
								<React.Fragment key={rowIndex}>
									<tr className="optimization_summary_table_body_row">
										<td
											className="optimization_summary_toggle_license_display_cell"
											style={{
												background: "#f6f7fa",
											}}
										>
											<div className="d-flex justify-content-center" />
										</td>
										{getOptimizationSummaryLicenseBreakdownColumns().map(
											(column, columnIndex) => (
												<td
													key={`${rowIndex}_${columnIndex}`}
													className="optimization_summary_table_body_row_cell"
													style={{
														background: "#f6f7fa",
													}}
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
																appId,
																selected_filter,
																row?.license_id
															)
														}
													>
														{columnsMapper[
															column.group_name
														]?.formatter(
															row[
																column.dataField
															],
															row
														)}
													</div>
												</td>
											)
										)}
									</tr>
								</React.Fragment>
							)
						)}
				</>
			)}
		</>
	);
}
