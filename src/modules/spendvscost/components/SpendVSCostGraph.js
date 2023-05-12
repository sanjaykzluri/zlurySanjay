import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDateByDateMonthYear, MONTH } from "../../../utils/DateUtility";
import spendvscostheading from "../../../assets/applications/spendvscostheading.svg";
import linkArrow from "../../../assets/linkArrow.svg";
import moment from "moment";
import { Loader } from "../../../common/Loader/Loader";
import { GraphPeriods } from "../constants/SpendVSCostConstants";
import DateRangePicker from "../../../UIComponents/DateRangePicker/DateRangePicker";
import "./SpendVSCostGraph.css";
import { GraphPeriodSelector } from "./GraphPeriodSelector";
import { RenderYAxis } from "./RenderYAxis";
import { Line } from "./Line";
import { StackedBars } from "./StackedBars";
import { checkAndFetchSpendCostTrendGraph } from "../redux/spendvscost_action";

export default function SpendVSCostGraph({
	title,
	graphHeight,
	calendarContainerClassName,
	linkText,
	linkURL,
	graphAPI,
	id,
}) {
	const start_month = useSelector(
		(state) => state.userInfo?.org_fy_start_month
	);

	let startMonth = start_month;

	let startYear =
		startMonth <= moment().month() ? moment().year() : moment().year() - 1;
	let endMonth =
		startMonth + 11 > 12 ? startMonth + 11 - 12 : startMonth + 11;
	let endYear = startMonth > 1 ? moment().year() + 1 : moment().year();

	const [start, setStart] = useState(
		getDateByDateMonthYear(startMonth, startYear)
	);
	const [end, setEnd] = useState(getDateByDateMonthYear(endMonth, endYear));
	const [period, setPeriod] = useState(GraphPeriods.MONTH.value);

	const SpendVSCostDateRangeDropdownOptions = [
		{
			text: "Last Month",
			start: new Date(moment().subtract(1, "month")),
			end: new Date(moment().subtract(1, "month")),
		},
		{
			text: "This Month",
			start: new Date(),
			end: new Date(),
		},
		{
			text: "This Year",
			start: getDateByDateMonthYear(startMonth, startYear),
			end: new Date(),
		},
	];

	const dispatch = useDispatch();

	var keyGraph = `${id}_${period}_${moment(start).month() + 1}_${moment(
		start
	).year()}_${moment(end).month() + 1}_${moment(end).year()}`;

	const { data, loading, loaded, spendKey, costKey, savingsKey } =
		useSelector((state) => state.spendvscostgraph?.[`${keyGraph}`] || {});

	useEffect(() => {
		dispatch(
			checkAndFetchSpendCostTrendGraph(
				id,
				period,
				moment(start).month() + 1,
				moment(start).year(),
				moment(end).month() + 1,
				moment(end).year(),
				graphAPI
			)
		);
	}, [start, end, period]);

	let maxValue = Math.max.apply(
		Math,
		data?.map(function (row) {
			let greaterValue;
			let totalspendsavings = row[spendKey] || 0;
			if (totalspendsavings > (row[costKey] || 0)) {
				greaterValue = totalspendsavings;
			} else {
				greaterValue = row[costKey] || 0;
			}
			return greaterValue;
		})
	);

	var tier = Math.log10(maxValue) | 0;
	var baseValue = Math.pow(10, Math.floor(tier));
	var modValue = maxValue % baseValue;
	maxValue = Math.max(baseValue, maxValue + (baseValue - modValue));

	const renderLines = () => {
		return data?.map((month_data, i) => (
			<>
				<Line
					left={77 * i}
					key={i}
					num={i}
					month_name={
						period === GraphPeriods.MONTH.value
							? MONTH[month_data.month_id - 1]
							: month_data.year_id
					}
					color={
						month_data.year_id > moment().year() ||
						(month_data.year_id === moment().year() &&
							month_data.month_id > moment().month() + 1)
							? "#717171"
							: month_data[costKey] < month_data[spendKey]
							? "#FF6767"
							: "#5FCF64"
					}
				/>
				<StackedBars
					left={77 * i}
					key={i}
					num={i}
					month_data={month_data}
					maxValue={maxValue}
					spendKey={spendKey}
					costKey={costKey}
					savingsKey={savingsKey}
					period={period}
				/>
			</>
		));
	};

	return (
		<>
			<div className="d-flex flex-row justify-content-between align-items-center mt-4 mr-4 ml-4">
				{title && (
					<div className="d-flex flex-row">
						<img
							src={spendvscostheading}
							height={20}
							width={20}
							className="mr-2"
						></img>
						<span className="">{title}</span>
					</div>
				)}
				<div
					className={`d-flex flex-row ${
						!title && "w-100 justify-content-between"
					}`}
				>
					<div className="mr-2">
						<DateRangePicker
							calendarContainerClassName={
								calendarContainerClassName
							}
							start={start}
							end={end}
							onStartChange={(date) => setStart(date)}
							onEndChange={(date) => setEnd(date)}
							defaultCalendarView={
								period === "month" ? "year" : "decade"
							}
							showDropdownToggle={true}
							dropdownOptions={
								SpendVSCostDateRangeDropdownOptions
							}
							dateFormat={
								period === "month" ? "MMM YYYY" : "YYYY"
							}
						/>
					</div>
					<div className="d-flex flex-row align-items-center justify-content-center">
						<GraphPeriodSelector
							period={period}
							setPeriod={setPeriod}
						/>
					</div>
				</div>
			</div>
			<div
				style={{
					height: `${graphHeight}`,
					marginTop: "20px",
					width: "100%",
				}}
				className="d-flex"
			>
				{loading ? (
					<div className="m-auto">
						<Loader width={100} height={100} />
					</div>
				) : (
					<>
						<RenderYAxis data={data} maxValue={maxValue} />
						<div className="spendvscost__stackedbar__cont">
							{renderLines()}
						</div>
					</>
				)}
			</div>
			{linkText && linkURL && (
				<div className="mx-3 mt-2">
					<hr className="w-100 m-0" />
					<div className="d-flex flex-row glow_blue font-12 mt-2 cursor-pointer">
						<a
							href={linkURL}
							target="_blank"
							rel="noreferrer"
							style={{
								textDecoration: "none",
							}}
						>
							{linkText}
							<img src={linkArrow} className="ml-1" />
						</a>
					</div>
				</div>
			)}
		</>
	);
}
