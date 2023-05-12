import React, { useState } from "react";
import "./ForecastBarGraph.css";
import { kFormatter } from "constants/currency";
import { MONTH } from "utils/DateUtility";
import CSV from "components/Uploads/CSV.svg";
import forecastbackground from "assets/optimization/forecastbackground.svg";
import ForecastTable from "./ForecastTable";
import ContentLoader from "react-content-loader";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import OptimizationTableDataCSVDownload from "./OptimizationTableDataCSVDownload";
import OptimizationFilterDropdown from "./OptimizationFilterDropdown";
import BulkRunAPlaybook from "modules/workflow/components/BulkRunAPlaybook/BulkRunAPlaybook";
import { optimizationLicenseClassifications } from "./constants/OptimizationConstants";
import { useSelector } from "react-redux";
import SavingsWastageBlock from "./SavingsWastageBlock";

const YAxisLabel = ({ maxvalue, num }) => {
	const labelvalue = (num * maxvalue) / 2;
	return (
		<>
			<div className="forecastbargraph__yaxis__label">{labelvalue}</div>
		</>
	);
};

const RenderYAxis = ({ data, maxValue, loading }) => {
	return (
		<>
			<div className="forecastbargraph__yaxis">
				{!loading &&
					Array(3)
						.fill(null)
						?.map((el, i) => (
							<>
								<YAxisLabel maxvalue={maxValue} num={i} />
							</>
						))}
			</div>
		</>
	);
};

const Line = ({ key, num, wp }) => {
	let widthToBeUsed = Math.max(100, wp);
	return (
		<div
			style={{
				backgroundColor: "#F1F1F5",
				height: "1px",
				width: `${widthToBeUsed}px`,
			}}
		></div>
	);
};

const Bars = (props) => {
	const {
		month_data,
		maxValue,
		left,
		isForecast,
		barColour,
		loading,
		title,
		keyField,
	} = props;
	let barHeight = (month_data[keyField] / maxValue) * 100;
	return (
		<>
			{loading ? (
				<div
					className={`forecastbargraph__barchart__bar ${
						isForecast ? "o-6" : ""
					}`}
					style={{
						left: `${left}px `,
					}}
				>
					<ContentLoader
						width={16}
						height={78}
						backgroundColor={"#EBEBEB"}
					>
						<rect width="16" height="78" rx="2" fill="#EBEBEB" />
					</ContentLoader>
				</div>
			) : (
				<OverlayTrigger
					placement="auto"
					overlay={
						<Tooltip bsPrefix="spendcost__tooltip">
							<div
								className="spendcost__tooltip__content"
								style={{ height: "fit-content" }}
							>
								<div className="font-10 o-6">
									{MONTH[month_data.month_id - 1] +
										" " +
										month_data.year_id}
								</div>
								<div className="d-flex flex-row mt-2 font-12 align-items-center">
									<div
										className="mr-1"
										style={{
											background: `${barColour}`,
											borderRadius: "50%",
											width: "8px",
											height: "8px",
										}}
									/>
									<div className="d-flex flex-row justify-content-between w-100">
										<div>{`No of ${title} Licenses`}</div>
										<div>
											{Number(
												(
													month_data?.[keyField] || 0
												)?.toFixed(2)
											)}
										</div>
									</div>
								</div>
							</div>
						</Tooltip>
					}
				>
					<div
						className={`forecastbargraph__barchart__bar ${
							isForecast ? "o-6" : ""
						}`}
						style={{
							left: `${left}px `,
							height: `${barHeight}%`,
							background: `${barColour}`,
						}}
					></div>
				</OverlayTrigger>
			)}
		</>
	);
};

const Labels = (props) => {
	const { month_data, maxValue, left } = props;

	return (
		<>
			<div
				className="forecastbargraph__barchart__xlabel"
				style={{
					left: `${left}px `,
				}}
			>
				{MONTH[month_data.month_id - 1]}
			</div>
		</>
	);
};

export default function ForecastBarGraph({
	data,
	loading,
	barColour,
	application,
	filterType,
	filterIndex,
	keyField,
	title,
	description,
	graphHeight,
	licenseList,
}) {
	const { generating_pdf } = useSelector((state) => state.optimization);
	const [editMode, setEditMode] = useState(false);
	let maxValue;
	let actualLineNumber;
	let forecastLineNumber;
	if (loading) {
		maxValue = 117;
		actualLineNumber = 6;
		forecastLineNumber = 6;
	} else {
		maxValue = Math.max.apply(
			Math,
			data?.graph_data?.map(function (row) {
				return row[keyField];
			})
		);
		actualLineNumber = data?.meta?.live_months?.length;
		forecastLineNumber = data?.meta?.forecast_months?.length;
	}
	var tier = Math.log10(maxValue) | 0;
	var baseValue = Math.pow(10, Math.floor(tier));
	var modValue = maxValue % baseValue;
	maxValue = Math.max(baseValue, maxValue + (baseValue - modValue));
	const leftPercentage = (actualLineNumber - 1) * 62 + 62 / 2;
	const forecastPercentage = (forecastLineNumber - 1) * 62 + 62 / 2;

	const renderLines = () => {
		let widthPercentage;
		if (loading) {
			widthPercentage = 11 * 62;
		} else {
			widthPercentage = (data?.graph_data?.length - 1) * 62;
		}

		return Array(3)
			.fill(null)
			.map((el, i) => (
				<>
					<Line key={i} num={i} wp={widthPercentage} />
				</>
			));
	};

	const renderBars = () => {
		let barData;
		if (loading) {
			barData = {};
		} else {
			barData = data;
		}
		return barData?.graph_data?.map((month_data, i) => (
			<>
				<Bars
					left={i * 62}
					key={i}
					num={i}
					month_data={month_data}
					maxValue={maxValue}
					isForecast={month_data?.forecast}
					barColour={barColour}
					loading={loading}
					title={title}
					keyField={keyField}
				></Bars>
			</>
		));
	};

	const renderLabels = () => {
		return data?.graph_data?.map((month_data, i) => (
			<>
				{!loading && (
					<Labels
						left={i * 62}
						key={i}
						num={i}
						month_data={month_data}
						maxValue={maxValue}
					></Labels>
				)}
			</>
		));
	};

	const renderForecastLine = () => {
		return (
			<>
				{!loading && (
					<div
						className="h-100 forecastbargraph__forecastline"
						style={{
							left: `calc(${leftPercentage}px + 8px) `,
						}}
					></div>
				)}
			</>
		);
	};

	const renderForecastBackground = () => {
		return (
			<div
				style={{
					position: "absolute",
					left: `calc(${leftPercentage}px + 8px) `,
					backgroundImage: `url('${forecastbackground}')`,
					width: `calc(${forecastPercentage}px + 60px) `,
				}}
				className="h-100"
			></div>
		);
	};

	const renderBottomXAxis = () => {
		return (
			<>
				{!loading && (
					<div
						className="d-flex w-100"
						style={{ position: "absolute", top: "134px" }}
					>
						<div
							style={{
								width: `calc((${leftPercentage}px + 8px)/2 - 19px) `,
								borderTop: "0.5px dashed #2266E2",
								marginTop: "4px",
							}}
						></div>
						<div
							style={{ width: "38px", color: "#2266E2" }}
							className="d-flex justify-content-center font-8 bold-600"
						>
							Live
						</div>
						<div
							style={{
								width: `calc((${leftPercentage}px + 8px)/2 - 19px) `,
								borderTop: "0.5px dashed #2266E2",
								marginTop: "4px",
							}}
						></div>
						<div
							style={{
								width: `calc((${forecastPercentage}px + 8px)/2 - 19px) `,
								borderTop: "0.5px dashed #B6B6B7",
								marginTop: "4px",
							}}
						></div>
						<div
							style={{ width: "48px", color: "#B6B6B7" }}
							className="d-flex justify-content-center font-8 bold-600"
						>
							Forecast
						</div>
						<div
							style={{
								width: `calc((${forecastPercentage}px + 8px)/2 - 19px) `,
								borderTop: "0.5px dashed #B6B6B7",
								marginTop: "4px",
							}}
						></div>
					</div>
				)}
			</>
		);
	};

	const handleTableValuesChange = () => {
		setEditMode(false);
	};

	return (
		<>
			{loading ? (
				<>
					<div
						className="d-flex flex-column forecastbargraph__container"
						style={{
							boxShadow:
								editMode && " 0px 4px 23px rgba(0, 0, 0, 0.15)",
							border: editMode && "1px solid #5ABAFF",
						}}
					>
						<div className="d-flex flex-row">
							<div
								className="d-flex flex-column"
								style={{
									flexBasis: "45%",
									padding: "24px 30px",
								}}
							>
								<div className=" d-flex align-items-center">
									<div className="bold-600 font-18">
										<ContentLoader
											width={156}
											height={20}
											backgroundColor={"#F9F9F9"}
										>
											<rect
												width="156"
												height="20"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
								<div
									className="font-11 o-6"
									style={{ color: "#717171" }}
								>
									<ContentLoader
										width={340}
										height={10}
										backgroundColor={"#F9F9F9"}
									>
										<rect
											width="161"
											height="10"
											rx="2"
											fill="#EBEBEB"
										/>
										<rect
											x="165"
											width="161"
											height="10"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
							</div>

							<div
								className="d-flex flex-row justify-content-end align-items-center"
								style={{
									flexBasis: "55%",
									marginTop: "24px",
									height: "45px",
									paddingRight: "15px",
								}}
							>
								<div
									className="d-flex flex-row"
									style={{
										width: "fit-content",
										height: "45px",
										backgroundColor: "#F9F9F9",
										borderRadius: "4px",
										marginRight: "20px",
									}}
								>
									<ContentLoader
										width={136}
										height={45}
										backgroundColor={"#F9F9F9"}
									>
										<rect
											width="136"
											height="45"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
								<div
									className="d-flex flex-row"
									style={{
										width: "fit-content",
										height: "45px",
										backgroundColor: "#F9F9F9",
										borderRadius: "4px",
										marginRight: "20px",
									}}
								>
									<ContentLoader
										width={136}
										height={45}
										backgroundColor={"#F9F9F9"}
									>
										<rect
											width="136"
											height="45"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>

								<div hidden={editMode} className="">
									<img src={CSV} alt="" />
								</div>
								<div style={{ marginLeft: "25px" }}>
									<ContentLoader
										width={136}
										height={45}
										backgroundColor={"#F9F9F9"}
									>
										<rect
											width="136"
											height="45"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
							</div>
						</div>
						<hr className="w-100" style={{ margin: "0px" }}></hr>
						<div
							style={{ height: `${graphHeight}` }}
							className="forecastbargraph__barchart d-flex"
						>
							<RenderYAxis
								loading={loading}
								data={data}
								maxValue={maxValue}
							/>
							<div className="forecastbargraph__barchart__bars-lines">
								<div className="forecastbargraph__barchart__lines d-flex flex-column justify-content-between">
									{renderLines()}
								</div>
								<div className="forecastbargraph__barchart__bars w-100">
									{renderBars()}
								</div>
								<div className="forecastbargraph__barchart__xlabels w-100">
									{renderLabels()}
								</div>
								{renderForecastLine()}
								{renderForecastBackground()}
								{renderBottomXAxis()}
							</div>
						</div>
						<ForecastTable loading={loading} />
					</div>
				</>
			) : (
				<div
					className="d-flex flex-column forecastbargraph__container"
					style={{
						boxShadow:
							editMode && " 0px 4px 23px rgba(0, 0, 0, 0.15)",
						border: editMode && "1px solid #5ABAFF",
					}}
				>
					<div className="d-flex flex-row">
						<div
							className="d-flex flex-column"
							style={{ flexBasis: "45%", padding: "24px 30px" }}
						>
							<div className="d-flex align-items-center">
								<div className="bold-600 font-18 mr-2">
									{title}
								</div>
								{filterType && (
									<OptimizationFilterDropdown
										filterType={filterType}
										filterIndex={filterIndex}
										generatingPdf={generating_pdf}
									/>
								)}
							</div>
							<div className="font-14">{description}</div>
						</div>
						<>
							<div
								className="d-flex flex-row justify-content-end align-items-center"
								style={{
									flexBasis: "55%",
									marginTop: "12px",
									height: "45px",
									paddingRight: "15px",
								}}
							>
								{keyField !==
									optimizationLicenseClassifications.ACTIVELY_USED &&
									!editMode && (
										<SavingsWastageBlock
											amount={data?.past_diff?.amount}
											type={data?.past_diff?.type}
											start={
												MONTH[
													data?.meta?.live_months[0] -
														1
												]
											}
											end={
												MONTH[
													data?.meta?.live_months[
														data?.meta?.live_months
															.length - 1
													] - 1
												]
											}
										/>
									)}
								{keyField !==
									optimizationLicenseClassifications.ACTIVELY_USED &&
									!editMode && (
										<SavingsWastageBlock
											amount={data?.forecast_diff?.amount}
											type={data?.forecast_diff?.type}
											start={
												MONTH[
													data?.meta
														?.forecast_months[0] - 1
												]
											}
											end={
												MONTH[
													data?.meta?.forecast_months[
														data?.meta
															?.forecast_months
															.length - 1
													] - 1
												]
											}
										/>
									)}
								{!generating_pdf && (
									<OptimizationTableDataCSVDownload
										editMode={editMode}
										data={data?.table_data}
										keyField={keyField}
										title={title}
									/>
								)}
								{/* <div
									className={
										(!Array.isArray(
											data?.users_for_playbook
										) ||
											data?.users_for_playbook?.length ===
												0) &&
										"disable_BulkRunPlaybookBtn"
									}
								> */}
								{keyField !==
									optimizationLicenseClassifications.UNASSIGNED &&
									!generating_pdf && (
										<BulkRunAPlaybook
											userIds={data?.users_for_playbook}
											className="ml-2"
											playbookOptionsMenuRight={200}
											playbookTypeMenuRight={0}
											pageLocation={
												"Application-Optimization"
											}
										/>
									)}
								{/* </div> */}
							</div>
						</>
					</div>
					<hr className="w-100" style={{ margin: "0px" }}></hr>
					<div
						style={{ height: `${graphHeight}` }}
						className="forecastbargraph__barchart d-flex"
					>
						<RenderYAxis
							data={data}
							maxValue={maxValue}
						></RenderYAxis>
						<div className="forecastbargraph__barchart__bars-lines">
							<div className="forecastbargraph__barchart__lines d-flex flex-column justify-content-between">
								{renderLines()}
							</div>
							<div className="forecastbargraph__barchart__bars w-100">
								{renderBars()}
							</div>
							<div className="forecastbargraph__barchart__xlabels w-100">
								{renderLabels()}
							</div>
							{renderForecastLine()}
							{renderForecastBackground()}
							{renderBottomXAxis()}
						</div>
					</div>
					<ForecastTable
						data={data?.table_data}
						editMode={editMode}
						title={title}
						application={application}
						keyField={keyField}
						licenseList={licenseList}
						generatingPdf={generating_pdf}
					/>
				</div>
			)}
		</>
	);
}
