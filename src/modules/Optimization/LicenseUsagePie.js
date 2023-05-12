import React, { useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { kFormatter } from "constants/currency";

export const licenseUsageColors = [
	"#6967E0",
	"#FFB169",
	"#2A64F3",
	"#478CFA",
	"#B5D1FD",
];

export default function LicenseUsagePie(props) {
	const {
		pieHeight,
		pieWidth,
		pieChartTitle,
		titleClassName,
		total_licenses,
		license_unassigned,
		license_actively_used,
		license_under_used,
		license_unused,
		users_left_organization,
		total_license_cost,
	} = props;

	let pieData = [
		{
			licenseUsageType: "Actively Used",
			licenseUsageInNumber: license_actively_used,
		},
		{
			licenseUsageType: "Unassigned",
			licenseUsageInNumber: license_unassigned,
		},
		{
			licenseUsageType: "Under Used",
			licenseUsageInNumber: license_under_used,
		},
		{
			licenseUsageType: "Unused",
			licenseUsageInNumber: license_unused,
		},
		{
			licenseUsageType: "Left Organization",
			licenseUsageInNumber: users_left_organization,
		},
	];

	const licenseUsageInNumberArray = [
		license_actively_used,
		license_unassigned,
		license_under_used,
		license_unused,
		users_left_organization,
	];

	let licenseUsageInPercentArray = licenseUsageInNumberArray.map(
		(licenseCount) => (licenseCount / total_licenses) * 100
	);

	const [showTooltip, setShowTooltip] = useState(false);
	return (
		<div
			className="d-flex flex-row position-relative"
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
		>
			<PieChart height={pieHeight} width={pieWidth}>
				<Pie
					data={pieData}
					dataKey={"licenseUsageInNumber"}
					name={"licenseUsageType"}
					cx="50%"
					cy="50%"
					innerRadius={69}
					outerRadius={101}
					fill={"#8884d8"}
				>
					{pieData.map((entry, index) => (
						<Cell fill={licenseUsageColors[index]} />
					))}
				</Pie>
				<text
					x={101}
					y={61}
					textAnchor="middle"
					dominantBaseline="middle"
					className="bold-600 font-16"
				>
					{total_licenses}
				</text>
				<text
					x={101}
					y={79}
					textAnchor="middle"
					dominantBaseline="middle"
					className="font-10 grey-1 o-7"
				>
					Purchased
				</text>
				<text
					x={101}
					y={90}
					textAnchor="middle"
					dominantBaseline="middle"
					className="font-10 grey-1 o-7"
				>
					Licenses
				</text>
				<text
					x={101}
					y={125}
					textAnchor="middle"
					dominantBaseline="middle"
					className="bold-600 font-16"
				>
					{kFormatter(total_license_cost)}
				</text>
				<text
					x={101}
					y={142}
					textAnchor="middle"
					dominantBaseline="middle"
					className="font-10 grey-1 o-7"
				>
					Cost
				</text>
			</PieChart>
			<div className={titleClassName || "licensePieChartTitle"}>
				{pieChartTitle}
			</div>
			<div
				className="optimization-license-usage-pie-tooltip"
				hidden={!showTooltip}
			>
				{pieData.map((pie, index) => (
					<div className="d-flex justify-content-between align-items-center">
						<div className="d-flex">
							<div
								className="mt-1 mr-1"
								style={{
									background: licenseUsageColors[index],
									borderRadius: "50%",
									width: "8px",
									height: "8px",
								}}
							></div>
							<div>{pie.licenseUsageType}</div>
						</div>
						<div className="d-flex">
							<div className="mr-1">
								{pie.licenseUsageInNumber}
							</div>
							<div>{`(${
								total_licenses
									? licenseUsageInPercentArray[
											index
									  ]?.toFixed(2)
									: 0
							}%)`}</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
