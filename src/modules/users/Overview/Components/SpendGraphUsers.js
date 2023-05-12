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
import { Loader } from "../../../../common/Loader/Loader";
import { kFormatter } from "../../../../constants/currency";
import { CustomTooltip } from "../../../../components/Overview/NewGraph";
import downarrow from "../../../../assets/downarrow.svg";
import uparrow from "../../../../components/Overview/uparrow.svg";
import { MONTH } from "../../../../utils/DateUtility";
import { TableNew2 } from "../../../../components/Users/Overview/TableNew2";
import emptySpendTrend from "../../../../components/Overview/spendEmpty.png";
import noData from "../../../../components/Overview/noData.svg";
import { useHistory, useLocation } from "react-router-dom";
import { TableNew3 } from "../../../../components/Users/Overview/TableNew3";
import emptyUsage from "../../../../assets/emptyUsage.png";
import dayjs from "dayjs";
import {
	getUserSpendGraphData,
	getUserUsageGraphData,
} from "../../../../services/api/users";
import { monthIdNameMap } from "../../../../components/Overview/util";
import { useSelector } from "react-redux";

export default function SpendGraphUsers({ user }) {
	const history = useHistory();
	const location = useLocation();

	const [spendloading, setspendloading] = useState(true);
	const [usageloading, setusageloading] = useState(true);
	const [spendData, setSpendData] = useState([]);
	const [spendDataKeys, setSpendDataKeys] = useState([]);
	const [spendTable, setspendTable] = useState([]);
	const [usageData, setUsageData] = useState([]);
	const [usageDataKeys, setUsageDataKeys] = useState([]);
	const [usageTable, setusageTable] = useState([]);
	const color = [
		"#2266E2",
		"#FF6767",
		"#5CAF53",
		"#FFB169",
		"#6967E0",
		"#717171",
	];
	const userInfo = useSelector((state) => state.userInfo);

	useEffect(() => {
		const id = location.pathname.split("/")[2];
		const start_month = userInfo?.org_fy_start_month || 4;
		const end_month = dayjs().month() + 1;
		const end_year = dayjs().year();
		const start_year = start_month > end_month ? end_year - 1 : end_year;

		getUserSpendGraphData(
			id,
			start_month,
			end_month,
			start_year,
			end_year
		).then((res) => {
			setspendloading(false);

			const data = res.spend_trend;
			let data2 = res.spend_table_data;

			if (data) {
				let datakeys = [];
				data.forEach((el) => {
					el.month_name = monthIdNameMap[el.month_id];
					el.applications.forEach((item) => {
						datakeys.push(item.application_name);
						el[item.application_name] = item.application_spend;
						el["Total"] = item.monthly_total;
					});
				});
				const uniq = [...new Set(datakeys)];

				uniq.sort((a, b) => (a > b ? 1 : -1));

				let obj = uniq.find((x) => x === "Total");
				let index = uniq.indexOf(obj);
				uniq.splice(index, 1);
				uniq.push(obj);
				let newuniq = new Array(uniq.length);
				for (var i = 0; i < uniq.length; i++) {
					newuniq[i] = [uniq[i], null];
				}
				for (var i = 0; i < newuniq.length; i++) {
					let obj3 = data2.find(
						(x) =>
							x.application_name?.toLowerCase() ===
							newuniq[i][0]?.toLowerCase()
					);
					newuniq[i][2] = obj3?.total_spend;
				}
				newuniq.sort(function (a, b) {
					return b[2] - a[2];
				});
				let obj4 = newuniq.find((x) => x[0]?.toLowerCase() === "total");
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
				data2.sort(function (a, b) {
					return b.total_spend - a.total_spend;
				});
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
				setSpendDataKeys(newuniq);
				data.sort(
					(a, b) => a.year_id - b.year_id || a.month_id - b.month_id
				);
				setSpendData(data);
				setspendTable(data2);
			}
		});

		getUserUsageGraphData(
			id,
			start_month,
			end_month,
			start_year,
			end_year
		).then((res) => {
			setusageloading(false);
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
					className="overview__bottom__up"
					style={{ margin: "12px 0px" }}
				>
					<div className="d-flex justify-content-between">
						<div className="d-flex align-items-center">
							App wise Spend
						</div>
						<div>
							<div className="ov__d5__d2__d1__d1__d1">
								<div className="ov__d5__d2__d1__d1__d1__d1">
									{user?.user_monthly_spend
										? kFormatter(
												user?.user_monthly_spend
													.monthly_spend
										  )
										: 0}
								</div>
								<img
									className="overviewins__top__next__insimage"
									src={
										user?.user_monthly_spend &&
										user?.user_monthly_spend.change >= 0
											? uparrow
											: downarrow
									}
								/>
								<div className="ov__d5__d2__d1__d1__d1__d2">
									{user?.user_monthly_spend
										? kFormatter(
												Math.abs(
													user.user_monthly_spend
														.change
												)
										  )
										: 0}
								</div>
								<div className="ov__d5__d2__d1__d1__d1__d3">
									in{" "}
									{
										MONTH[
											user?.user_average_usage?.month_id -
												1
										]
									}
								</div>
							</div>
							<div className="ov__d5__d2__d1__d1__d2">
								Avg. Monthly Spend
							</div>
						</div>
					</div>
					{spendloading ? (
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
					) : spendData.length != 0 ? (
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
										data={spendData}
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
												kFormatter(tick)
											}
											tickLine={false}
											axisLine={false}
											interval={0}
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
										{spendDataKeys.map((dataKey, index) => (
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
										))}
									</AreaChart>
								</ResponsiveContainer>
							</div>
							<div className="allapps__spendgraph__d2">
								<TableNew2 data={spendTable}></TableNew2>
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
							<div className="d-flex flex-column justify-content-center align-items-center MONTH-auto">
								<img src={noData} className="MONTH-auto" />
								<span className="empty-header">
									No Data Available
								</span>
								<span className="empty-lower">
									Add spend data for this app
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
									<img style={{ paddingRight: "5px" }} />
									Add transactions
								</button>
							</div>
						</div>
					)}
				</div>
				<div
					className="overview__bottom__down"
					style={{ margin: "12px 0px" }}
				>
					<div className="d-flex justify-content-between">
						<div className="d-flex align-items-center">
							App wise Usage
						</div>
						<div>
							<div className="ov__d5__d2__d1__d1__d1">
								<div className="ov__d5__d2__d1__d1__d1__d1">
									{user?.user_average_usage &&
									user?.user_average_usage.avg_usage
										? user?.user_average_usage.avg_usage.toFixed(
												0
										  )
										: 0}
									%
								</div>
								<img
									className="overviewins__top__next__insimage"
									src={
										user?.user_average_usage &&
										user?.user_average_usage.change >= 0
											? uparrow
											: downarrow
									}
								/>
								<div className="ov__d5__d2__d1__d1__d1__d2">
									{user?.user_average_usage
										? Math.abs(
												user?.user_average_usage.change
										  ).toFixed(0)
										: 0}
									% in{" "}
									{
										MONTH[
											user?.user_average_usage?.month_id -
												1
										]
									}
								</div>
								<div className="ov__d5__d2__d1__d1__d1__d3"></div>
							</div>
							<div className="ov__d5__d2__d1__d1__d2">
								Avg. Usage
							</div>
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
									<img style={{ paddingRight: "5px" }} />
									Add transactions
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
