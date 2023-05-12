import React from "react";
import {
	AreaChart,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Area,
	CartesianGrid,
} from "recharts";
import { kFormatter } from "../../constants/currency";

export const CustomTooltip = ({ active, payload, label, formatter }) => {
	if (active) {
		return (
			<div className="my-tooltip2" bsPrefix="my-tooltip2">
				<div className="my-tooltip2-div1 text-truncate">{`${label} : ${
					payload != null &&
					Array.isArray(payload) &&
					payload?.length > 0 &&
					(payload[0]?.payload?.year_id || payload[0]?.payload?.year)
				}`}</div>
				{payload != null &&
					Array.isArray(payload) &&
					payload?.length > 0 &&
					payload.map((item) => (
						<div className="my-tooltip2-div2 custom__tooltip__row">
							<div style={{ display: "flex" }}>
								<div
									className="my-tooltip2-div2-d1"
									style={{ backgroundColor: item.color }}
								></div>
								<div className="my-tooltip2-div2-d2 custom__tooltip__row__title">
									{item.name}
								</div>
							</div>
							<div className="my-tooltip2-div2-d3">
								{formatter(item.value)}
							</div>
						</div>
					))}
			</div>
		);
	}
	return null;
};

export default class UIAreaChart extends React.PureComponent {
	render() {
		return (
			<>
				<div className="ui-chart">
					<ResponsiveContainer width="98.5%" height={300}>
						<AreaChart
							data={this.props.spendData}
							margin={{ top: 22, right: 22, left: 0, bottom: 10 }}
							onMouseMove={this.onChartMouseMove}
							onMouseLeave={this.onChartMouseLeave}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="month_name"
								tick={{ fontSize: 10, color: "#717171" }}
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
								tickCount={5}
								domain={[0, "auto"]}
							/>
							<Tooltip
								content={
									<CustomTooltip
										formatter={(value) => kFormatter(value)}
									/>
								}
								wrapperStyle={{ backgroundColor: "white" }}
								position="top"
							/>

							{this.props.spendDatakeys &&
								this.props.spendDatakeys.map(
									(dataKey, index) => (
										<Area
											key={dataKey[0]}
											type="monotone"
											dataKey={dataKey[0]}
											stackId={
												dataKey[0] === "Total"
													? dataKey[0]
													: ""
											}
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
					{/* <div
            className="recharts-tooltip-wrapper"
            ref={(ref) => (this.tooltip = ref)}
          >
            <div className="recharts-default-tooltip">
                
            </div>
          </div> */}
				</div>
			</>
		);
	}
}
