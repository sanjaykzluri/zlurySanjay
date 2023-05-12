import React from "react";
import ForecastBarGraph from "./ForecastBarGraph";
import LicenseDataTable from "./LicenseDataTable";
import MonthWiseLicenseUsage from "./MonthWiseLicenseUsage";
import "./ApplicationOptimization.css";
import "./LicenseDataTable.css";
import SavingsWastageArrow from "./SavingsWastageArrow";
import {
	optimizationAmountType,
	optimizationForecastBarGraphHeight,
	optimizationFunnelLevels,
} from "./constants/OptimizationConstants";
import { getLicenseListFromOptimizationData } from "./utils/OptimizationUtils";

export default function ApplicationOptimization({
	application,
	optimizationLicenseUsageData,
	licenseUsageDataLoading,
	start,
	end,
	licenseUsageRefObj,
}) {
	const executeScroll = (key) =>
		licenseUsageRefObj[key]?.current?.scrollIntoView();

	return (
		<div className="d-flex flex-column" style={{ padding: "24px 40px" }}>
			<div className="d-flex align-items-center justify-content-center mb-4">
				<div
					id="optimization_overview"
					ref={licenseUsageRefObj.overview}
					className="optimization_license_usage_pie_table_div"
				>
					{licenseUsageDataLoading ? (
						<>
							<div className="d-flex flex-row justify-content-center align-items-center mb-4">
								<MonthWiseLicenseUsage
									title="Past Month"
									dataKey="past_data"
									usageDate={start}
									licenseUsageData={
										optimizationLicenseUsageData?.overview
											?.license_chart_data
									}
									loading={licenseUsageDataLoading}
								/>
								<div className="licensePie__row__greyarrow">
									<div
										className="d-flex flex-column licenseinfotable__row__arrow__text"
										style={{ color: "#FF974A" }}
									></div>
								</div>
								<MonthWiseLicenseUsage
									title="Current Month"
									dataKey="current_data"
									usageDate={new Date()}
									licenseUsageData={
										optimizationLicenseUsageData?.overview
											?.license_chart_data
									}
									loading={licenseUsageDataLoading}
								/>
								<div className="licensePie__row__greyarrow">
									<div
										className="d-flex flex-column licensePie__row__arrow__text"
										style={{ color: "#5FCF64" }}
									></div>
								</div>
								<MonthWiseLicenseUsage
									title="Forecast"
									dataKey="forecast_data"
									usageDate={end}
									licenseUsageData={
										optimizationLicenseUsageData?.overview
											?.license_chart_data
									}
									loading={licenseUsageDataLoading}
								/>
							</div>
							<LicenseDataTable
								data={
									optimizationLicenseUsageData?.overview
										?.overview_table
								}
								start={start}
								end={end}
								executeScroll={executeScroll}
								loading={licenseUsageDataLoading}
								application={application}
								optimizationData={optimizationLicenseUsageData}
							/>
						</>
					) : (
						<>
							<div className="d-flex flex-row justify-content-center align-items-center position-relative">
								<MonthWiseLicenseUsage
									title="Past Month"
									dataKey="past_data"
									usageDate={start}
									licenseUsageData={
										optimizationLicenseUsageData?.overview
											?.license_chart_data
									}
									maxDate={new Date()}
								/>
								<div
									className="position-absolute"
									style={{ top: "115px", left: "315px" }}
								>
									<SavingsWastageArrow
										amount={
											optimizationLicenseUsageData
												?.overview?.overview_table
												?.total?.past_diff?.amount
										}
										type={
											optimizationLicenseUsageData
												?.overview?.overview_table
												?.total?.past_diff?.type
										}
									/>
								</div>
								<MonthWiseLicenseUsage
									title="Current Month"
									dataKey="current_data"
									usageDate={new Date()}
									licenseUsageData={
										optimizationLicenseUsageData?.overview
											?.license_chart_data
									}
								/>
								<div
									className="position-absolute"
									style={{ top: "115px", left: "665px" }}
								>
									<SavingsWastageArrow
										amount={
											optimizationLicenseUsageData
												?.overview?.overview_table
												?.total?.forecast_diff?.amount
										}
										type={
											optimizationLicenseUsageData
												?.overview?.overview_table
												?.total?.forecast_diff?.type
										}
									/>
								</div>
								<MonthWiseLicenseUsage
									title="Forecast"
									dataKey="forecast_data"
									usageDate={end}
									licenseUsageData={
										optimizationLicenseUsageData?.overview
											?.license_chart_data
									}
									minDate={new Date()}
								/>
							</div>
							<LicenseDataTable
								data={
									optimizationLicenseUsageData?.overview
										?.overview_table
								}
								start={start}
								end={end}
								executeScroll={executeScroll}
								application={application}
								optimizationData={optimizationLicenseUsageData}
							/>
						</>
					)}
				</div>
			</div>
			{optimizationFunnelLevels.map((level) => (
				<div
					key={level.keyField}
					style={{ marginBottom: "30px" }}
					ref={licenseUsageRefObj[level.keyField]}
					id={`optimization_${level.keyField}`}
				>
					<ForecastBarGraph
						loading={licenseUsageDataLoading}
						keyField={level.keyField}
						title={level.title}
						description={level.description}
						graphHeight={optimizationForecastBarGraphHeight}
						barColour={level.barColor}
						filterType={level.filterType}
						data={optimizationLicenseUsageData[level.keyField]}
						application={application}
						licenseList={getLicenseListFromOptimizationData(
							optimizationLicenseUsageData[level.keyField]
						)}
						filterIndex={level.filterIndex}
					/>
				</div>
			))}
		</div>
	);
}
