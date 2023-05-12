import React, { useContext, useEffect, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Loader } from "common/Loader/Loader";
import { kFormatter } from "constants/currency";
import { CustomTooltip } from "components/Overview/NewGraph";
import downarrow from "assets/downarrow.svg";
import uparrow from "components/Overview/uparrow.svg";
import { MONTH } from "utils/DateUtility";
import { TableNew2 } from "components/Users/Overview/TableNew2";
import emptySpendTrend from "components/Overview/spendEmpty.png";
import noData from "components/Overview/noData.svg";
import { useHistory, useLocation } from "react-router-dom";
import { TableNew3 } from "components/Users/Overview/TableNew3";
import emptyUsage from "assets/emptyUsage.png";
import dayjs from "dayjs";
import {
	getUserSpendGraphData,
	getUserUsageGraphData,
} from "services/api/users";
import { monthIdNameMap } from "components/Overview/util";
import { useSelector } from "react-redux";
import { getEmployeeUsageGraphData } from "services/api/employeeDashboard";

export default function UsageGraph({ user }) {
	const history = useHistory();
	const location = useLocation();

	const [usageloading, setusageloading] = useState(true);
	const [usageData, setUsageData] = useState([]);
	const [usageDataKeys, setUsageDataKeys] = useState([]);
	const [usageTable, setusageTable] = useState([]);
	const userInfo = useSelector((state) => state.userInfo);

	useEffect(() => {
		const id = location.pathname.split("/")[2];
		const start_month = userInfo?.org_fy_start_month || 4;
		const end_month = dayjs().month() + 1;
		const end_year = dayjs().year();
		const start_year = start_month > end_month ? end_year - 1 : end_year;

		getEmployeeUsageGraphData(
			start_month,
			end_month,
			start_year,
			end_year
		).then((res) => {
			setusageloading(false);
			const color = [
				"#2266E2",
				"#FF6767",
				"#5CAF53",
				"#FFB169",
				"#6967E0",
				"#717171",
			];

			const data = res.usage_trend;
			let data2 = res.usage_table_data;
			if (data) {
				let datakeys = [];
				data.forEach((el) => {
					el.month_name = monthIdNameMap[el.month_id];

					el.applications.forEach((item) => {
						datakeys.push(item.application_name);
						el[item.application_name] = item.application_usage;
						el["Total"] = item.monthly_avg;
					});
				});
				const uniq = [...new Set(datakeys)];

				uniq.sort((a, b) => (a > b ? 1 : -1));

				let newuniq = new Array(uniq.length);
				for (var i = 0; i < uniq.length; i++) {
					newuniq[i] = [uniq[i], null];
				}

				for (var i = 0; i < newuniq.length; i++) {
					let obj3 = data2.find(
						(x) =>
							x.application_name.toLowerCase() ===
							newuniq[i][0].toLowerCase()
					);
					newuniq[i][2] = obj3?.total_usage || obj3?.average_usage;
				}
				newuniq.sort(function (a, b) {
					return b[2] - a[2];
				});
				let obj4 = newuniq.find((x) => x[0].toLowerCase() === "total");
				let index4 = newuniq.indexOf(obj4);
				newuniq.splice(index4, 1);
				newuniq.unshift(obj4);
				if (newuniq.length > 6) {
					newuniq.length = 6;
				}

				if (newuniq.length > 0 && newuniq[0] != undefined) {
					color.length = newuniq.length;
					for (var j = 0; j < newuniq.length; j++) {
						newuniq[j] = [
							newuniq[j][0],
							color[Math.abs(color.length - newuniq.length - j)],
							newuniq[j][2],
						];
					}
				}
				data2.sort((a, b) =>
					a.application_name > b.application_name ? 1 : -1
				);

				data2.sort(function (a, b) {
					return b.total_usage - a.total_usage;
				});
				let obj2 = data2.find(
					(x) => x.application_name.toLowerCase() === "total"
				);
				let index2 = data2.indexOf(obj2);
				data2.splice(index2, 1);
				data2.unshift(obj2);
				if (data2.length > 6) {
					data2.length = 6;
				}

				color.length = data2.length;
				var newArray = [];
				if (data2[0].application_name != "TOTAL") {
					for (var j = 0; j < data2.length; j++) {
						if (data2[j].application_name == "TOTAL") {
							newArray.unshift(data2[j]);
						} else {
							newArray.push(data2[j]);
						}
					}
					data2 = newArray;
				}
				for (var j = 0; j < data2.length; j++) {
					data2[j].color =
						color[Math.abs(color.length - data2.length - j)];
				}

				setUsageDataKeys(newuniq);
				data.sort(
					(a, b) => a.year_id - b.year_id || a.month_id - b.month_id
				);
				setUsageData(data);
				setusageTable(data2);
			}
		});
	}, []);
	return (
		<>
			<div
				className={
					user?.user_archive
						? "overview__bottom disabledState ml-0 pr-0"
						: "overview__bottom ml-0 pr-0"
				}
			>
				<div
					className="overview__bottom__down"
					style={{ margin: "40px 0px" }}
				>
					<div className="d-flex justify-content-between">
						<div className="d-flex align-items-center font-18">
							App wise Usage
						</div>
					</div>
					{usageloading ? (
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
					) : usageData.length != 0 ? (
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
										data={usageData}
										margin={{
											top: 22,
											right: 0,
											left: 0,
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
														Number(
															value.toFixed(1)
														) + "%"
													}
												/>
											}
											wrapperStyle={{
												backgroundColor: "white",
											}}
										/>
										{usageDataKeys.map((dataKey, index) =>
											dataKey ? (
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
											) : null
										)}
									</AreaChart>
								</ResponsiveContainer>
							</div>
							<div className="allapps__spendgraph__d2">
								<TableNew3 data={usageTable} />
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
							<div className="d-flex flex-column justify-content-center align-items-center MONTH-auto">
								<img src={noData} className="MONTH-auto" />
								<span className="empty-header">
									No Data Available
								</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
