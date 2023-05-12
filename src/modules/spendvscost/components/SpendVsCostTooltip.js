import React from "react";
import { kFormatter } from "../../../constants/currency";
import { MONTH } from "../../../utils/DateUtility";
import { GraphPeriods } from "../constants/SpendVSCostConstants";

export const SpendVsCostTooltip = ({
	month_data,
	spendKey,
	costKey,
	savingsKey,
	period,
}) => {
	return (
		<div className="spendcost__tooltip__content">
			<div className="font-10 o-6">
				{period === GraphPeriods.MONTH.value
					? MONTH[month_data.month_id - 1] + " " + month_data.year_id
					: month_data.year_id}
			</div>
			<div className="d-flex flex-row mt-2 font-12 align-items-center">
				<div
					className="mr-1"
					style={{
						background: "#6967E0",
						borderRadius: "50%",
						width: "8px",
						height: "8px",
					}}
				/>
				<div className="d-flex flex-row justify-content-between w-100">
					<div>Actual Spend</div>
					<div>{kFormatter(month_data[spendKey])}</div>
				</div>
			</div>
			<div className="d-flex flex-row mt-2 mb-2 font-12 align-items-center">
				<div
					className="mr-1"
					style={{
						background: "#FF974A",
						borderRadius: "50%",
						width: "8px",
						height: "8px",
					}}
				/>
				<div className="d-flex flex-row justify-content-between w-100">
					<div>Est Cost</div>
					<div>{kFormatter(month_data[costKey])}</div>
				</div>
			</div>
		</div>
	);
};
