import React, { useState, Component, useEffect } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";
import { kFormatter } from "constants/currency";
import "./Overview.css";

export default function NewGraph(props) {
	const [showTooltip, setShowTooltip] = useState(false);
	const { data, spend } = props;
	const start = [87, 143, 245];
	const end = [213, 228, 255];
	const getColor = (index, max) => {
		const colors = [];
		for (let i = 0; i < 3; i++) {
			colors.push(start[i] + ((end[i] - start[i]) * index) / max);
		}
		return `rgb(${colors.join(",")})`;
	};
	const [pieData, setPieData] = useState();
	useEffect(() => {
		if (data) {
			let tempPieData = data.map((el) => {
				return {
					label: el.department_name,
					value: el.department_split,
				};
			});

			setPieData(tempPieData);
		}
	}, []);

	return (
		<>
			<div
				className="d-flex flex-row position-relative"
				onMouseEnter={() => setShowTooltip(true)}
				onMouseLeave={() => setShowTooltip(false)}
			>
				<PieChart height={222} width={222}>
					<Pie
						data={pieData}
						dataKey={"value"}
						name={"label"}
						cx="50%"
						cy="50%"
						innerRadius={89}
						outerRadius={109}
						fill={"#8884d8"}
						cornerRadius={2}
						paddingAngle={pieData?.length === 1 ? 0 : 2}
					>
						{pieData?.map((entry, index) => (
							<Cell fill={getColor(index, pieData.length)} />
						))}
					</Pie>

					<text
						x={101}
						y={90}
						textAnchor="middle"
						dominantBaseline="middle"
						className="font-15 grey-1"
					>
						Spend (YTD)
					</text>
					<text
						x={101}
						y={120}
						textAnchor="middle"
						dominantBaseline="middle"
						className="font-20 bold-600 black-1"
					>
						{spend}
					</text>
				</PieChart>

				<div className="department_split_tooltip" hidden={!showTooltip}>
					{Array.isArray(pieData) &&
						pieData.length > 0 &&
						pieData?.map((pie, index) => (
							<div className="d-flex justify-content-between align-items-center">
								<div className="d-flex">
									<div
										className="mt-1 mr-1"
										style={{
											background: getColor(
												index,
												pieData.length
											),
											borderRadius: "50%",
											width: "8px",
											height: "8px",
										}}
									></div>
									<div>{pie.label}</div>
								</div>
								<div className="d-flex">
									<div className="mr-1">
										{`${pie.value.toFixed(2)}%`}
									</div>
								</div>
							</div>
						))}
				</div>
			</div>
		</>
	);
}
