import React, { useState } from "react";
import "./ForecastTable.css";
import { kFormatter } from "constants/currency";
import OverlayTooltip from "UIComponents/OverlayToolTip";
import linkArrow from "assets/linkArrow.svg";
import {
	ComposedChart,
	Line,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
} from "recharts";
import { Tooltip } from "react-bootstrap";
import { LicenseUsersTable } from "./LicenseUsersTable";
import {
	optimizationAmountType,
	optimizationLicenseClassifications,
} from "./constants/OptimizationConstants";
import { MONTH } from "utils/DateUtility";
import { useContext } from "react";
import RoleContext from "services/roleContext/roleContext";

export default function OptimizationTableEditableCell({
	data,
	index,
	editMode,
	setEditedData,
	editedData,
	title,
	startOfEditableCell,
	application,
	keyField,
	licenseList,
}) {
	const [value, setValue] = useState(data?.monthly_data?.[index]?.[keyField]);
	const [showLicenseTable, setShowLicenseTable] = useState(false);
	const [maxTick, setMaxTick] = useState();
	const [hovered, setHovered] = useState(false);
	const { partner } = useContext(RoleContext);
	let graphData = data?.monthly_data;

	if (title === "Under Used" && hovered) {
		let lastCurrentMonthLicenseCount =
			graphData[startOfEditableCell]?.[keyField];
		graphData.forEach((monthData, i) => {
			if (i >= startOfEditableCell) {
				monthData.high =
					lastCurrentMonthLicenseCount +
					(i - startOfEditableCell) *
						lastCurrentMonthLicenseCount *
						0.34;
				monthData.median =
					lastCurrentMonthLicenseCount +
					(i - startOfEditableCell) *
						lastCurrentMonthLicenseCount *
						0.12;
				monthData.low =
					lastCurrentMonthLicenseCount -
					(i - startOfEditableCell) *
						lastCurrentMonthLicenseCount *
						0.1;
				monthData.max = maxTick;
			}
		});
		graphData = graphData.slice(
			index - 3,
			Math.min(index + 3, graphData.length - 1)
		);
	}

	const handleInputChange = (val) => {
		setValue(val);
		let tempData = { ...data };
		let monthlyData = { ...tempData.monthly_data };
		let indexValue = {
			...monthlyData[index],
			[keyField]: parseInt(val) || 0,
		};
		monthlyData = { ...tempData.monthly_data, [index]: indexValue };
		tempData = { ...data, monthly_data: monthlyData };
		let tempArray = [...editedData];
		let indexOfObj = tempArray.findIndex(
			({ contract_id }) => contract_id === tempData.contract_id
		);
		if (indexOfObj === -1) {
		} else {
			tempArray[indexOfObj] = tempData;
		}
		setEditedData(tempArray);
	};

	return (
		<div
			style={{ width: 40 }}
			onMouseEnter={() =>
				!data?.monthly_data?.[index]?.forecast && setHovered(true)
			}
			onMouseLeave={() => setHovered(false)}
		>
			{editMode &&
			data?.monthly_data?.[index]?.forecast &&
			data?.monthly_data?.[index]?.auto_increment ? (
				<input
					type="text"
					className="w-100"
					value={value}
					onChange={(e) => {
						handleInputChange(e.target.value);
					}}
				/>
			) : (
				<div className="d-flex flex-column justify-content-center align-items-center">
					<div
						onClick={() =>
							keyField !==
								optimizationLicenseClassifications.UNASSIGNED &&
							!data?.monthly_data?.[index]?.forecast &&
							setShowLicenseTable(true)
						}
						className={`font-13 ${
							keyField !==
								optimizationLicenseClassifications.UNASSIGNED &&
							!data?.monthly_data?.[index]?.forecast
								? "cursor-pointer"
								: ""
						}`}
					>
						{Number(
							(
								data?.monthly_data?.[index]?.[keyField] || 0
							)?.toFixed(2)
						)}
					</div>
					{title !== "Actively Used" ? (
						<OverlayTooltip
							placement="bottom"
							isStickyTooltip
							overlay={
								<Tooltip bsPrefix="forecasttable-tooltip">
									<div className="forecasttable-tooltip-content d-flex flex-column pb-0 cursor-default">
										{(!data?.monthly_data?.[index]
											?.forecast ||
											!data?.monthly_data?.[index]
												?.auto_increment) && (
											<>
												<div className="font-13 grey">
													{Number(
														(
															data
																?.monthly_data?.[
																index
															]?.[keyField] || 0
														)?.toFixed(2)
													) +
														" " +
														title +
														" licenses"}
												</div>
												<div
													className="font-10 mt-2"
													style={{
														color:
															data
																?.monthly_data?.[
																index
															]
																?.license_savings_type ===
															optimizationAmountType.SAVINGS
																? "#5FCF64"
																: "#FFC117",
													}}
												>
													{kFormatter(
														data?.monthly_data?.[
															index
														]?.[`${keyField}_cost`]
													) +
														` ${
															data
																?.monthly_data?.[
																index
															]
																?.license_savings_type
																? data
																		?.monthly_data?.[
																		index
																  ]
																		?.license_savings_type
																: "wastage"
														}`}
												</div>
												{keyField !==
													optimizationLicenseClassifications.UNASSIGNED &&
												!data?.monthly_data?.[index]
													?.forecast ? (
													<div
														className="grey-1 font-8 mt-2 mb-3 cursor-pointer"
														onClick={() =>
															setShowLicenseTable(
																true
															)
														}
													>
														Click to view users
													</div>
												) : (
													<div className="grey-1 font-8 mt-2 mb-3" />
												)}
											</>
										)}
										{data?.monthly_data?.[index]
											?.forecast &&
										data?.monthly_data?.[index]
											?.auto_increment ? (
											title === "Under Used" ? (
												<>
													<div className="d-flex align-items-center">
														<div className="font-13 grey">{`${MONTH[
															data
																?.monthly_data?.[
																index
															]?.month_id - 1
														]?.toUpperCase()} '${data?.monthly_data?.[
															index
														]?.year_id
															.toString()
															.slice(
																2
															)}`}</div>{" "}
														<div
															className="font-10 d-flex justify-content-end"
															style={{
																color: "#5FCF64",
																width: "230px",
															}}
														>
															{kFormatter(
																data
																	?.monthly_data?.[
																	index
																]?.[
																	`${keyField}_cost`
																]
															) + " savings"}
														</div>
													</div>
													<hr className="m-0"></hr>
													<div className="d-flex flex-row glow_blue font-12 mt-2 cursor-pointer">
														<a
															target="_blank"
															rel="noreferrer"
															style={{
																textDecoration:
																	"none",
															}}
														>
															How does{" "}
															{partner?.name}
															forecast work
															<img
																src={linkArrow}
																className="ml-1"
															/>
														</a>
													</div>
													<div className="w-100">
														<ComposedChart
															width={270}
															height={118}
															data={graphData}
														>
															<CartesianGrid
																stroke="#F1F1F5"
																horizontal={
																	false
																}
															/>
															<XAxis
																dataKey="month_id"
																tickFormatter={(
																	tick
																) =>
																	MONTH[
																		tick - 1
																	]?.toUpperCase()
																}
																tick={{
																	fontSize: 7,
																	color: "#717171",
																}}
																tickLine={false}
																axisLine={false}
																scale="point"
																interval={0}
																height={20}
																minTickGap={3}
															/>

															<YAxis
																tickLine={false}
																axisLine={false}
																tick={{
																	fontSize: 6,
																	color: "#717171",
																}}
																width={20}
																tickFormatter={(
																	tick
																) => {
																	setMaxTick(
																		tick
																	);
																	return tick;
																}}
															/>
															<Area
																dataKey="license_actively_used_monthly_count"
																fill="#3dd598"
																stroke="#3dd598"
																stackId={1}
															/>
															<Area
																dataKey="max"
																fill="#dddddd"
																stroke="none"
																stackId={2}
																connectNulls={
																	false
																}
															/>
															<Line
																type="monotone"
																dataKey="high"
																stroke="#2266E2"
																dot={false}
															/>
															<Line
																type="monotone"
																dataKey="median"
																stroke="#717171"
																dot={false}
															/>
															<Line
																type="monotone"
																dataKey="low"
																stroke="#FF6767"
																dot={false}
															/>
														</ComposedChart>
													</div>
												</>
											) : (
												<>
													<div className="font-13 grey">
														{Number(
															(
																data
																	?.monthly_data?.[
																	index
																]?.[keyField] ||
																0
															)?.toFixed(2)
														) +
															" " +
															"buffer" +
															" licenses"}
													</div>
													<div
														className="font-10 mt-2 mb-3"
														style={{
															color: "#5FCF64",
														}}
													>
														{kFormatter(
															data
																?.monthly_data?.[
																index
															]?.[
																`${keyField}_cost`
															]
														) + " savings"}
													</div>
												</>
											)
										) : null}
									</div>
								</Tooltip>
							}
						>
							<div
								className="bold-600 mt-1 font-11"
								style={{
									color:
										data?.monthly_data?.[index]
											?.license_savings_type ===
										optimizationAmountType.SAVINGS
											? "#5FCF64"
											: "#FFC117",
								}}
							>
								{kFormatter(
									data?.monthly_data?.[index]?.[
										`${keyField}_cost`
									]
								)}
							</div>
						</OverlayTooltip>
					) : (
						<div
							className="font-8 glow_blue cursor-pointer"
							hidden={!hovered}
							onClick={() => setShowLicenseTable(true)}
						>
							View Users
						</div>
					)}
				</div>
			)}
			{showLicenseTable && (
				<LicenseUsersTable
					keyField={keyField}
					show={showLicenseTable}
					handleClose={() => setShowLicenseTable(false)}
					application={application}
					licenseData={data}
					month={data?.monthly_data?.[index]?.month_id}
					year={data?.monthly_data?.[index]?.year_id}
					licenseList={licenseList}
				/>
			)}
		</div>
	);
}
