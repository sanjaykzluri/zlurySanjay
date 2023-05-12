import React, { useState, useEffect, useRef } from "react";
import { Tooltip } from "react-bootstrap";
import { kFormatter } from "../../../constants/currency";
import OverlayTooltip from "../../../UIComponents/OverlayToolTip";
import { capitalizeFirstLetter } from "../../../utils/common";
import {
	AreaChart,
	ResponsiveContainer,
	YAxis,
	XAxis,
	Area,
	CartesianGrid,
} from "recharts";
import linkArrow from "../../../assets/linkArrow.svg";
import { Loader } from "../../../common/Loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import { checkAndFetchSpendCostTrend } from "../redux/spendvscost_action";
import { useContext } from "react";
import RoleContext from "services/roleContext/roleContext";

export function HeaderFormatter(props) {
	return (
		<>
			{props.text}
			<div
				className="ml-1 o-5 grey cursor-pointer"
				style={{ position: "relative", top: "-5px" }}
				onClick={() =>
					window.open(
						props.type === "cost"
							? "https://help.zluri.com/en/articles/5679369-how-does-zluri-calculate-cost"
							: "https://help.zluri.com/en/articles/5679374-why-is-there-a-difference-between-cost-and-spend"
					)
				}
			>
				i
			</div>
		</>
	);
}
export const spendCostTrendType = {
	SPEND: "spend",
	COST: "cost",
};

export default function SpendCostTrend({ trendAPI, type, id, value, outerId }) {
	const dispatch = useDispatch();
	const { graphData, average, loaded, loading, err } = useSelector(
		(state) =>
			state.spendvscost?.[
				`${type}_${id}${outerId ? `_${outerId}` : ""}`
			] || {}
	);
	const ref = useRef();
	const [callTrendAPI, setCallTrendAPI] = useState(false);

	useEffect(() => {
		if (callTrendAPI && !loaded && !loading) {
			dispatch(checkAndFetchSpendCostTrend(trendAPI, type, id, outerId));
		}
	}, [callTrendAPI, loaded, loading]);

	return (
		<div className="d-flex justify-content-start">
			<OverlayTooltip
				placement="bottom"
				isStickyTooltip
				overlay={
					<Tooltip bsPrefix="spend-cost-trend-tooltip">
						<SpendCostTrendTooltipContent
							type={type}
							average={average}
							graphData={graphData}
						/>
					</Tooltip>
				}
			>
				<div
					className="cursor-default d-flex justify-content-center"
					onMouseEnter={() => setCallTrendAPI(true)}
					ref={ref}
				>
					{kFormatter(value)}
				</div>
			</OverlayTooltip>
		</div>
	);
}

function SpendCostTrendTooltipContent({ type, average, graphData }) {
	const partner = useContext(RoleContext);
	return (
		<div className="spend-cost-trend-tooltip-content">
			{!Number.isNaN(average) && !graphData ? (
				<Loader height={80} width={80} />
			) : (
				<>
					<div className="d-flex flex-row justify-content-between mb-3">
						<div className="d-flex flex-column font-13">
							<div>{capitalizeFirstLetter(type)} Trend</div>
							<div className="font-10 grey-1 o-6 d-flex">
								<div className="bold-600 font-10 cursor-default">
									{kFormatter(average)}
								</div>
								<div className="ml-1">{`Avg Monthly ${capitalizeFirstLetter(
									type
								)}`}</div>
							</div>
						</div>
						<div style={{ width: "115px", height: "30px" }}>
							<ResponsiveContainer>
								<AreaChart
									width={70}
									height={30}
									data={graphData}
									margin={{
										top: 0,
										right: 0,
										left: 0,
										bottom: 0,
									}}
								>
									<defs>
										<linearGradient
											id="colorPv"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop
												offset="5%"
												stopColor="#2266E2"
												stopOpacity={0.2}
											/>
											<stop
												offset="60%"
												stopColor="#2266E2"
												stopOpacity={0}
											/>
										</linearGradient>
									</defs>
									<CartesianGrid
										horizontal={false}
										vertical={false}
									/>
									<XAxis
										tick={false}
										axisLine={false}
										hide={true}
										dataKey="month_id"
									/>
									<YAxis
										width={0}
										tickCount={4}
										tick={false}
										domain={[
											0,
											(dataMax) => dataMax * 1.15,
										]}
									/>
									<Area
										isAnimationActive={true}
										dot={false}
										type="monotone"
										dataKey={
											type !== spendCostTrendType.COST
												? "monthly_spend"
												: "monthly_cost"
										}
										stroke="#2266E2"
										fill="url(#colorPv)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</div>
					<hr className="w-100 m-0"></hr>
					<div className="d-flex flex-column mt-2">
						<div className="d-flex flex-row">
							<div
								className="font-9 bold-600 pt-1 cursor-pointer"
								style={{ color: "#5ABAFF" }}
								onClick={() =>
									window.open(
										type === spendCostTrendType.COST
											? "https://help.zluri.com/en/articles/5679369-how-does-zluri-calculate-cost"
											: "https://help.zluri.com/en/articles/5679374-why-is-there-a-difference-between-cost-and-spend"
									)
								}
							>
								{type === spendCostTrendType.COST
									? `How does ${partner?.partner?.name} calculate cost?`
									: "Why is there a difference between cost and spend?"}
								<img src={linkArrow} className="ml-1" />
							</div>
						</div>
						<div className="font-8 grey-1 o-6">
							{type === spendCostTrendType.COST
								? "Cost is the estimated spend for an app based on the number of licenses and its assigned value."
								: "Spend is calculated based on the transactions for each contract/app."}
						</div>
					</div>
				</>
			)}
		</div>
	);
}
