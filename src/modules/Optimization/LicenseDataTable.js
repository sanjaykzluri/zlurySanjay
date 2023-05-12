import React, { useState, useEffect } from "react";
import { kFormatter } from "../../constants/currency";
import "./LicenseDataTable.css";
import ContentLoader from "react-content-loader";
import { useHistory } from "react-router-dom";
import SavingsWastageArrow from "./SavingsWastageArrow";
import { optimizationAmountType } from "./constants/OptimizationConstants";
import LicenseListTooltip from "./LicenseListTooltip";
import { getLicenseListForOverviewTableTooltip } from "./utils/OptimizationUtils";

export default function LicenseDataTable({
	data,
	start,
	end,
	executeScroll,
	loading,
	application,
	optimizationData,
}) {
	const [tableData, setTableData] = useState(data);
	const history = useHistory();
	const loadingObject = { a: 1, b: 2, c: 3, d: 4, e: 5 };

	useEffect(() => {
		setTableData(data);
	}, [data]);

	return (
		<>
			{loading ? (
				<div
					className="d-flex flex-column"
					style={{
						position: "relative",
					}}
				>
					{Object.keys(loadingObject).map((key, i) => {
						return (
							<div
								className="licenseinfotable__row w-100 d-flex align-items-center"
								style={{
									height: "59px",
									backgroundColor: "rgba(245, 245, 245, 0.6)",
								}}
							>
								<div
									style={{
										width: "35%",
										paddingLeft: "18px",
									}}
									className="h-100 d-flex flex-row"
								>
									<div
										style={{
											backgroundColor: "#EBEBEB",
											height: "9px",
											width: "9px",
											borderRadius: "50%",
											marginTop: "16px",
										}}
									></div>
									<div className="text-capitalize font-14">
										<ContentLoader
											width={87}
											height={30}
											backgroundColor={"#EBEBEB"}
										>
											<rect
												y="14"
												width="91"
												height="14"
												rx="2"
												fill="#EBEBEB"
												x="5"
											/>
										</ContentLoader>
									</div>
								</div>
								<div
									style={{ width: "13%" }}
									className="h-100 d-flex justify-content-center align-items-center font-14 bold-600"
								>
									<ContentLoader
										width={51}
										height={14}
										backgroundColor={"#EBEBEB"}
									>
										<rect
											width="51"
											height="14"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
								<div
									style={{
										width: "10%",
										position: "relative",
									}}
									className="h-100 d-flex justify-content-center align-items-center "
								>
									<div className="licenseinfotable__row__greyarrow"></div>
								</div>
								<div
									style={{ width: "13%" }}
									className="h-100 d-flex justify-content-center align-items-center font-14 bold-600"
								>
									<ContentLoader
										width={51}
										height={14}
										backgroundColor={"#EBEBEB"}
									>
										<rect
											width="51"
											height="14"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
								<div
									style={{
										width: "10%",
										position: "relative",
									}}
									className="h-100 d-flex justify-content-center align-items-center "
								>
									<div className="licenseinfotable__row__greyarrow"></div>
								</div>
								<div
									style={{ width: "13%" }}
									className="h-100 d-flex justify-content-center align-items-center font-14 bold-600"
								>
									<ContentLoader
										width={51}
										height={14}
										backgroundColor={"#EBEBEB"}
									>
										<rect
											width="51"
											height="14"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
							</div>
						);
					})}
					<div
						className="licenseinfotable__row w-100 d-flex align-items-center font-14"
						style={{ height: "74px" }}
					>
						<div
							className="h-100 d-flex align-items-center"
							style={{
								width: "35%",
								paddingLeft: "21px",
							}}
						>
							<ContentLoader
								width={51}
								height={14}
								backgroundColor={"#EBEBEB"}
							>
								<rect
									width="51"
									height="14"
									rx="2"
									fill="#EBEBEB"
								/>
							</ContentLoader>
						</div>
						<div
							className="h-100 d-flex align-items-center justify-content-center"
							style={{ width: "13%" }}
						>
							<ContentLoader
								width={51}
								height={14}
								backgroundColor={"#EBEBEB"}
							>
								<rect
									width="51"
									height="14"
									rx="2"
									fill="#EBEBEB"
								/>
							</ContentLoader>
						</div>
						<div
							className="h-100 d-flex align-items-center justify-content-center"
							style={{ width: "10%" }}
						>
							<div className="licenseinfotable__row__greyarrow"></div>
						</div>
						<div
							className="h-100 d-flex align-items-center justify-content-center"
							style={{ width: "13%" }}
						>
							<ContentLoader
								width={51}
								height={14}
								backgroundColor={"#EBEBEB"}
							>
								<rect
									width="51"
									height="14"
									rx="2"
									fill="#EBEBEB"
								/>
							</ContentLoader>
						</div>
						<div
							className="h-100 d-flex align-items-center justify-content-center"
							style={{ width: "10%" }}
						>
							<div className="licenseinfotable__row__greyarrow"></div>
						</div>
						<div
							className="h-100 d-flex align-items-center justify-content-center"
							style={{ width: "13%" }}
						>
							<ContentLoader
								width={51}
								height={14}
								backgroundColor={"#EBEBEB"}
							>
								<rect
									width="51"
									height="14"
									rx="2"
									fill="#EBEBEB"
								/>
							</ContentLoader>
						</div>
					</div>
				</div>
			) : (
				<div
					className="d-flex flex-column"
					style={{
						position: "relative",
					}}
				>
					{[
						{ key: "unassigned", color: "#FFB169" },
						{ key: "left_org", color: "#B5D1FD" },
						{ key: "unused", color: "#478CFA" },
						{ key: "under_used", color: "#2A64F3" },
						{ key: "actively_used", color: "#6967E0" },
						{ key: "total" },
					].map(({ key, color }, i) => {
						return (
							<div
								key={i}
								className="licenseinfotable__row w-100 d-flex align-items-center"
								style={{
									height: "59px",
									position: "relative",
								}}
							>
								<div
									style={{
										width: "120px",
										paddingLeft: "18px",
										position: "absolute",
									}}
									className="h-100 d-flex flex-row"
								>
									<div
										style={{
											backgroundColor: color,
											height: "9px",
											width: "9px",
											borderRadius: "50%",
											marginTop: "16px",
										}}
									/>
									<div
										className="d-flex flex-column justify-content-center"
										style={{
											marginLeft: "6px",
										}}
									>
										<div className="text-capitalize font-12">
											{key.replace("_", " ")}
										</div>
										{key !== "total" && (
											<div
												className="mt-1 font-9 cursor-pointer"
												style={{ color: "#2A64F3" }}
												onClick={() =>
													executeScroll(key)
												}
											>
												View Details
											</div>
										)}
									</div>
								</div>
								<div
									style={{ width: "340px" }}
									className="h-100 d-flex flex-column justify-content-center align-items-center font-14 bold-600"
								>
									<LicenseListTooltip
										licenses={
											key === "total"
												? []
												: getLicenseListForOverviewTableTooltip(
														optimizationData,
														key,
														start
												  )
										}
									>
										<div className="bold-600 cursor-default">
											{tableData[key].start}
										</div>
									</LicenseListTooltip>
									{key === "total" && (
										<div className="d-flex flex-row">
											<div>Cost:</div>
											<div className="bold-600">
												{kFormatter(
													tableData?.total?.start_cost
												)}
											</div>
										</div>
									)}
								</div>
								{key !== "actively_used" && (
									<div
										style={{
											width: "245px",
											position: "absolute",
											left: "220px",
										}}
										className="h-100 d-flex justify-content-center align-items-center "
									>
										<SavingsWastageArrow
											amount={
												tableData[key].past_diff?.amount
											}
											type={
												tableData[key].past_diff?.type
											}
										/>
									</div>
								)}
								<div
									style={{ width: "340px" }}
									className="h-100 d-flex flex-column justify-content-center align-items-center font-14 bold-600"
								>
									<LicenseListTooltip
										licenses={
											key === "total"
												? []
												: getLicenseListForOverviewTableTooltip(
														optimizationData,
														key,
														new Date()
												  )
										}
									>
										<div className="bold-600 cursor-default">
											{tableData[key].current}
										</div>
									</LicenseListTooltip>
									{key === "total" && (
										<div className="d-flex flex-row">
											<div>Cost:</div>
											<div className="bold-600">
												{kFormatter(
													tableData?.total
														?.current_cost
												)}
											</div>
										</div>
									)}
								</div>
								{key !== "actively_used" && (
									<div
										style={{
											width: "285px",
											position: "absolute",
											left: "580px",
										}}
										className="h-100 d-flex justify-content-center align-items-center "
									>
										<SavingsWastageArrow
											amount={
												tableData[key].forecast_diff
													?.amount
											}
											type={
												tableData[key].forecast_diff
													?.type
											}
										/>
									</div>
								)}
								<div
									style={{ width: "340px" }}
									className="h-100 d-flex flex-column justify-content-center align-items-center font-14 bold-600"
								>
									<LicenseListTooltip
										licenses={
											key === "total"
												? []
												: getLicenseListForOverviewTableTooltip(
														optimizationData,
														key,
														end
												  )
										}
									>
										<div className="bold-600 cursor-default">
											{tableData[key].end}
										</div>
									</LicenseListTooltip>
									{key === "total" && (
										<div className="d-flex flex-row">
											<div>Cost:</div>
											<div className="bold-600">
												{kFormatter(
													tableData?.total?.end_cost
												)}
											</div>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
			{/* {loading ? (
				<div className="d-flex justify-content-center align-items-center">
					<div
						style={{
							width: "712px",
							height: "52px",
							background: "#F5F5F5",
						}}
						className="d-flex justify-content-evenly align-items-center"
					>
						<ContentLoader
							width={207}
							height={14}
							backgroundColor={"#EBEBEB"}
						>
							<rect
								width="207"
								height="14"
								rx="2"
								fill="#EBEBEB"
							/>
						</ContentLoader>
						<ContentLoader
							width={107}
							height={14}
							backgroundColor={"#EBEBEB"}
						>
							<rect
								width="107"
								height="14"
								rx="2"
								fill="#EBEBEB"
							/>
						</ContentLoader>
						<ContentLoader
							width={114}
							height={32}
							backgroundColor={"#EBEBEB"}
						>
							<rect
								width="114"
								height="32"
								rx="2"
								fill="#EBEBEB"
							/>
						</ContentLoader>
					</div>
				</div>
			) : (
				<div className="d-flex justify-content-center align-items-center">
					<div
						style={{
							width: "100%",
							height: "52px",
							background: "#DFF5E0",
						}}
						className="d-flex justify-content-center align-items-center"
					>
						<div className="bold-600">
							{kFormatter(
								tableData?.total?.future_licenses_savings
							)}
						</div>
						<div className="ml-3">
							Potential Savings on your next contract. Create a
							plan now
						</div>
						<div className="ml-4">
							<Button
								type="submit"
								onClick={() =>
									history.push({
										pathname: `/createplan`,
										state: {
											app: application,
										},
									})
								}
							>
								Create Plan
							</Button>
						</div>
					</div>
				</div>
			)} */}
		</>
	);
}
