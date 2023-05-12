import dayjs from "dayjs";
import React, { useEffect } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	XAxis,
	YAxis,
	Tooltip,
} from "recharts";
import uparrow from "../../../../components/Overview/uparrow.svg";
import downarrow from "../../../../assets/downarrow.svg";
import emptySpendTrend from "../../../../components/Overview/spendEmpty.png";
import noData from "../../../../components/Overview/noData.svg";
import { Loader } from "../../../../common/Loader/Loader";
import { TableNew2 } from "../../../../components/Applications/Overview/TableNew2";
import { CustomTooltip } from "../../../../components/Overview/NewGraph";
import { kFormatter } from "../../../../constants/currency";
import { MONTH } from "../../../../utils/DateUtility";
import { useHistory } from "react-router-dom";
import { fetchSpendGraphData } from "../../../../actions/applications-action";
import { useDispatch, useSelector } from "react-redux";

export default function ApplicationDepartmentWiseSpend({ app }) {
	const history = useHistory();
	const dispatch = useDispatch();
	const userInfo = useSelector((state) => state.userInfo);

	const pathname = window.location.pathname;
	const id = pathname.split("/")[2];

	const computed_data = useSelector(
		(state) =>
			state.applications.allApplications[id]?.spendgraph?.computed_data
	);

	const start_month = userInfo?.org_fy_start_month || 4;
	const end_month = dayjs().month() + 1;
	const end_year = dayjs().year();
	const start_year = start_month > end_month ? end_year - 1 : end_year;

	useEffect(() => {
		if (!computed_data) {
			dispatch(
				fetchSpendGraphData(
					id,
					start_month,
					end_month,
					start_year,
					end_year
				)
			);
		}
	}, []);

	return (
		<div className="overview__bottom__up mt-4">
			<div className="d-flex justify-content-between">
				<div className="d-flex align-items-center">
					Department wise Spend
				</div>
				<div className="">
					<div className="ov__d5__d2__d1__d1__d1">
						<div className="ov__d5__d2__d1__d1__d1__d1">
							{kFormatter(
								app?.app_monthly_spend
									? app?.app_monthly_spend.monthly_spend
									: 0
							)}
						</div>
						{app?.app_monthly_spend?.change >= 0 ? (
							<img
								className="overviewins__top__next__insimage"
								src={uparrow}
							></img>
						) : (
							<img
								className="overviewins__top__next__insimage"
								src={downarrow}
							></img>
						)}
						<div className="ov__d5__d2__d1__d1__d1__d2">
							{kFormatter(
								app?.app_monthly_spend
									? Math.abs(app?.app_monthly_spend.change)
									: 0
							)}
						</div>
						<div className="ov__d5__d2__d1__d1__d1__d3">
							in {MONTH[app?.app_active_users?.month_id - 1]}
						</div>
					</div>
					<div className="ov__d5__d2__d1__d1__d2">
						Avg. Monthly Spend
					</div>
				</div>
			</div>
			{computed_data?.spendLoading ? (
				<div className="allapps__spendgraph">
					<div
						style={{
							height: "100%",
							width: "100%",
							display: "flex",
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Loader height={100} width={100} />
					</div>
				</div>
			) : computed_data?.showSpendEmptyState ? (
				<div
					style={{
						marginTop: "16px",
						padding: "20px 0px",
					}}
					className="allapps__spendgraph"
				>
					<div className="allapps__spendgraph__d1">
						<ResponsiveContainer width="95%">
							<AreaChart
								data={computed_data?.spendData}
								margin={{
									top: 22,
									right: 0,
									left: 15,
									bottom: 0,
								}}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis
									dataKey="month_name"
									tick={{
										fontSize: 10,
										color: "#717171",
									}}
									tickLine={false}
									axisLine={false}
								/>
								<YAxis
									tick={{
										fontSize: 10,
										color: "#717171",
										marginLeft: 1,
									}}
									tickFormatter={(tick) => kFormatter(tick)}
									tickLine={false}
									axisLine={false}
									interval={0}
									width={45}
									domain={[0, "auto"]}
								/>
								<Tooltip
									content={
										<CustomTooltip
											formatter={(value) =>
												kFormatter(value)
											}
										/>
									}
									wrapperStyle={{
										backgroundColor: "white",
									}}
								/>
								{Array.isArray(computed_data?.spendDataKeys) &&
									computed_data?.spendDataKeys.length > 0 &&
									computed_data?.spendDataKeys.map(
										(dataKey, index) => {
											if (
												Array.isArray(dataKey) &&
												dataKey.length > 2
											) {
												return (
													<Area
														key={dataKey[0]}
														type="monotone"
														dataKey={dataKey[0]}
														stackId={dataKey[0]}
														stroke={dataKey[1]}
														connectNulls={false}
														strokeWidth={2}
														fill={`${dataKey[1]}4D`}
														dot={{
															stroke: dataKey[1],
															fill: "white",
															r: 4,
														}}
														activeDot={{
															fill: dataKey[1],
															stroke: dataKey[1],
															r: 6,
														}}
													/>
												);
											}
										}
									)}
							</AreaChart>
						</ResponsiveContainer>
					</div>
					<div className="allapps__spendgraph__d2">
						<TableNew2 data={computed_data?.spendTable} />
					</div>
				</div>
			) : (
				<div
					style={{
						backgroundImage: `url(${emptySpendTrend})`,
						height: "306px",
						marginTop: "16px",
					}}
					className="d-flex flex-column justify-content-center align-items-center allapps__spendgraph"
				>
					<div className="d-flex flex-column justify-content-center align-items-center m-auto">
						<img src={noData} className="m-auto" />
						<span className="empty-header">No Data Available</span>
						<span className="empty-lower">
							Add spend data for this app
						</span>
						<button
							onClick={() =>
								history.push("/transactions#recognised")
							}
							type="button"
							className="btn btn-outline-primary emptyDocButton"
							style={{
								width: "max-content",
								marginTop: "5px",
							}}
						>
							<img
								style={{
									paddingRight: "5px",
								}}
							/>
							Add transactions
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
