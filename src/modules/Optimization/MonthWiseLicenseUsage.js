import React, { useEffect, useState } from "react";
import LicenseUsagePie from "./LicenseUsagePie";
import rightarrow from "components/Transactions/Recognised/rightarrow.svg";
import leftarrow from "components/Transactions/Recognised/leftarrow.svg";
import { UTCDateFormatter } from "utils/DateUtility";
import ContentLoader from "react-content-loader";

export default function MonthWiseLicenseUsage(props) {
	const {
		title = "Past Month",
		dataKey = "current_data",
		licenseUsageData,
		usageDate,
		onDateChange,
		loading,
		width = "340px",
		height = "347px",
		isStep3,
		maxDate,
		minDate,
		disableDatePicker = false,
	} = props;

	const [calendarDate, setCalendarDate] = useState(usageDate || new Date());

	useEffect(() => {
		if (calendarDate) {
			onDateChange && onDateChange(calendarDate);
		}
	}, [calendarDate]);

	return (
		<>
			{loading ? (
				<div style={{ width: width, height: height }}>
					<div
						className="d-flex flex-row justify-content-center align-items-center border-bottom"
						style={{ height: "58px" }}
					>
						<div className="font-14 mr-2">
							<ContentLoader width={87} height={14}>
								<rect
									width="91"
									height="14"
									rx="2"
									fill="#EBEBEB"
								/>
							</ContentLoader>
						</div>
						<div>
							{title === "Current Month" ? (
								<div className="font-14 bold-600"></div>
							) : (
								<div className="d-flex flex-row">
									<img
										src={leftarrow}
										className="ml-1 mr-2 cursor-pointer"
									/>
									<ContentLoader width={52} height={14}>
										<rect
											width="52"
											height="14"
											rx="2"
											fill="#EBEBEB"
										/>
										<circle
											cx="0"
											cy="0"
											r="40"
											stroke="black"
											stroke-width="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
									<img
										src={rightarrow}
										className="ml-2 cursor-pointer"
									/>
								</div>
							)}
						</div>
					</div>
					<div
						className="d-flex flex-row justify-content-center"
						style={{ margin: "32px 0px", position: "relative" }}
					>
						<ContentLoader
							width={202}
							height={202}
							style={{ zIndex: "1" }}
						>
							<circle
								cx="101"
								cy="101"
								r="101"
								stroke="#EBEBEB"
								stroke-width="2"
								fill="none"
							/>
						</ContentLoader>
						<ContentLoader
							backgroundColor="white"
							foregroundColor="white"
							style={{
								zIndex: "14",
								position: "absolute",
							}}
							width={202}
							height={202}
						>
							<circle
								cx="101"
								cy="101"
								r="70"
								stroke="black"
								fill="none"
							></circle>
						</ContentLoader>
					</div>
				</div>
			) : (
				<div
					className="d-flex flex-column justify-content-between"
					style={{ width: width, height: height }}
				>
					<div
						className="d-flex flex-row justify-content-center"
						style={{ margin: "32px 0px" }}
					>
						<LicenseUsagePie
							pieHeight={202}
							pieWidth={202}
							legendsWidth={200}
							total_licenses={
								licenseUsageData?.[dataKey]?.total_license
							}
							license_unassigned={
								licenseUsageData?.[dataKey]?.license_unassigned
							}
							license_actively_used={
								licenseUsageData?.[dataKey]
									?.license_actively_used
							}
							license_under_used={
								licenseUsageData?.[dataKey]?.license_under_used
							}
							license_unused={
								licenseUsageData?.[dataKey]?.license_unused
							}
							users_left_organization={
								licenseUsageData?.[dataKey]
									?.users_left_organization
							}
							total_license_cost={
								licenseUsageData?.[dataKey]?.license_cost
							}
						/>
					</div>
					<div
						className={`d-flex flex-row justify-content-center align-items-center w-100`}
						style={{ height: "58px", background: "#F5F6F9" }}
					>
						{isStep3 ? (
							<div
								className="d-flex align-items-center justify-content-center font-11 bold-600"
								style={{
									height: "35px",
									width: "139px",
									backgroundColor: " #F5F6F9",
								}}
							>
								{UTCDateFormatter(
									usageDate || new Date(),
									"MMM YY"
								)}
							</div>
						) : (
							<>
								<div className="font-14 mr-2">{title}</div>
								<div>
									<div className="font-14 bold-600">
										{UTCDateFormatter(
											calendarDate || new Date(),
											"MMM YY"
										)}
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			)}
		</>
	);
}
