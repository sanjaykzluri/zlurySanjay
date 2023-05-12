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
import emptyUsage from "../../../../assets/emptyUsage.png";
import noData from "../../../../components/Overview/noData.svg";
import { Loader } from "../../../../common/Loader/Loader";
import { CustomTooltip } from "../../../../components/Overview/NewGraph";
import { FULL_MONTH } from "../../../../utils/DateUtility";
import { useHistory } from "react-router-dom";
import { fetchUsageGraphData } from "../../../../actions/applications-action";
import { useDispatch, useSelector } from "react-redux";
import { TableNew3 } from "../../../../components/Applications/Overview/TableNew3";

export default function ApplicationDepartmentWiseUsage({ app }) {
	const history = useHistory();
	const dispatch = useDispatch();
	const userInfo = useSelector((state) => state.userInfo);

	const pathname = window.location.pathname;
	const id = pathname.split("/")[2];

	const usage_computed_data = useSelector(
		(state) =>
			state.applications.allApplications[id]?.usagegraph
				?.usage_computed_data
	);

	const start_month = userInfo?.org_fy_start_month || 4;
	const end_month = dayjs().month() + 1;
	const end_year = dayjs().year();
	const start_year = start_month > end_month ? end_year - 1 : end_year;

	useEffect(() => {
		if (!usage_computed_data) {
			dispatch(
				fetchUsageGraphData(
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
		<div className="overview__bottom__down my-4">
			<div className="d-flex justify-content-between">
				<div className="d-flex align-items-center">
					Department wise Usage
				</div>
				<div className="">
					<div className="ov__d5__d2__d1__d1__d1">
						<div className="ov__d5__d2__d1__d1__d1__d1">
							{app?.app_average_usage?.avg_usage
								? Number(
										isNaN(
											parseInt(
												app?.app_average_usage
													?.avg_usage
											)
										)
											? 0
											: app?.app_average_usage?.avg_usage.toFixed(
													1
											  )
								  )
								: 0}
							%
						</div>
						{app?.app_average_usage?.change >= 0 ? (
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
							{Number(
								app?.app_average_usage
									? Math.abs(
											isNaN(
												parseInt(
													app?.app_average_usage
														?.change
												)
											)
												? 0
												: app?.app_average_usage?.change.toFixed(
														1
												  )
									  )
									: 0
							)}
							%
						</div>
						<div className="ov__d5__d2__d1__d1__d1__d3">
							{" "}
							in {FULL_MONTH[app?.app_active_users?.month_id - 1]}
						</div>
					</div>
					<div className="ov__d5__d2__d1__d1__d2">Avg. Usage</div>
				</div>
			</div>
			{usage_computed_data?.usageLoading ? (
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
						<Loader height={100} width={100}></Loader>
					</div>
				</div>
			) : usage_computed_data?.showUsageEmptyState ? (
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
								data={usage_computed_data?.usageData}
								margin={{
									top: 22,
									right: 0,
									left: 9,
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
									tickFormatter={(tick) =>
										Number(tick.toFixed(1)) + "%"
									}
									tickLine={false}
									axisLine={false}
									interval={0}
									width={50}
									domain={[0, (dataMax) => 100]}
								/>
								<Tooltip
									content={
										<CustomTooltip
											formatter={(value) =>
												Number(value.toFixed(1)) + "%"
											}
										/>
									}
									wrapperStyle={{
										backgroundColor: "white",
									}}
								/>
								{usage_computed_data?.usageDataKeys.map(
									(dataKey, index) => (
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
									)
								)}
							</AreaChart>
						</ResponsiveContainer>
					</div>
					<div className="allapps__spendgraph__d2">
						<TableNew3 data={usage_computed_data?.usageTable} />
					</div>
				</div>
			) : (
				<div
					style={{
						backgroundImage: `url(${emptyUsage})`,
						height: "306px",
						marginTop: "16px",
					}}
					className="d-flex flex-column justify-content-center align-items-center allapps__spendgraph"
				>
					<div className="d-flex flex-column justify-content-center align-items-center m-auto">
						<img src={noData} className="m-auto" />
						<span className="empty-header">No Data Available</span>
						<span className="empty-lower">
							Add usage data for this app
						</span>
						<button
							type="button"
							className="btn btn-outline-primary emptyDocButton"
							style={{
								width: "max-content",
								marginTop: "5px",
							}}
							onClick={() =>
								history.push("/transactions#recognised")
							}
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
