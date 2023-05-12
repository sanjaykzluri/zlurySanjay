import React from "react";
import { CSVLink } from "react-csv";
import { useDispatch } from "react-redux";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import {
	filterStringArrIndex,
	optimizationFilters,
} from "../constants/OptimizationConstants";
import { setOptimizationSummaryFilter } from "../redux/Optimization-action";
import OptimizationSummaryTableGenerateCSV from "./OptimizationSummaryTableGenerateCSV";
import OptimizationSummaryTableGeneratePDF from "./OptimizationSummaryTableGeneratePDF";

export default function OptimizationSummaryTableFilter({
	loaded,
	summary,
	selected_filter,
}) {
	const dispatch = useDispatch();
	let filterStringArr = selected_filter.split("_");

	const filterPillIsActive = (filterType, filter) => {
		let filterIndex = filterStringArrIndex[filterType];
		return filter.value?.toString() === filterStringArr[filterIndex];
	};

	const handleFilterChange = (filterType, filter) => {
		let filterIndex = filterStringArrIndex[filterType];
		filterStringArr[filterIndex] = filter.value?.toString();
		dispatch(setOptimizationSummaryFilter(filterStringArr?.join("_")));
	};

	return (
		<>
			<div className="optimization_summary_table_filter_section">
				<div
					className="d-flex align-items-center"
					style={{ gap: "8px" }}
				>
					{Object.keys(optimizationFilters).map(
						(filterType, typeIndex) => (
							<div
								key={typeIndex}
								className="d-flex align-items-center"
								style={{ gap: "8px" }}
							>
								{optimizationFilters[filterType].map(
									(filter, filterIndex) => (
										<NumberPill
											key={filterIndex}
											number={filter.tableLabel}
											pillBackGround={
												filterPillIsActive(
													filterType,
													filter
												)
													? "#E8F0FC"
													: "#F6F7FA"
											}
											fontColor={
												filterPillIsActive(
													filterType,
													filter
												)
													? "#2266E2"
													: "#717171"
											}
											pillHeight={32}
											pillWidth="fit-content"
											borderRadius="8px"
											style={{
												padding: "8.5px 16px",
												cursor: "pointer",
											}}
											fontWeight={400}
											fontSize={10}
											onClick={() =>
												handleFilterChange(
													filterType,
													filter
												)
											}
										/>
									)
								)}
								{typeIndex === 0 && (
									<hr
										style={{
											width: "1px",
											height: "16px",
											background: "#DDDDDD",
										}}
									/>
								)}
							</div>
						)
					)}
				</div>
				<Dropdown
					className="d-flex align-items-center"
					toggler={
						<div className="d-flex align-items-center bold-700  font-18">
							...
						</div>
					}
					top={35}
					right={0}
					options={[
						<OptimizationSummaryTableGenerateCSV
							summary={summary}
							selected_filter={selected_filter}
						/>,
						// <OptimizationSummaryTableGeneratePDF />,
					]}
					optionFormatter={(option) => option}
					isEnabled={
						loaded && summary?.[selected_filter]?.data?.length > 0
					}
				/>
			</div>
		</>
	);
}
