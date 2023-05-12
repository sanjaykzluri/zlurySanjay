import { kFormatter } from "constants/currency";
import React from "react";
import { optimizationAmountType } from "./constants/OptimizationConstants";
import savingsArrow from "assets/optimization/savingsArrow.svg";
import wastageArrow from "assets/optimization/wastageArrow.svg";

export default function SavingsWastageArrow({
	type = optimizationAmountType.SAVINGS,
	amount = 0,
}) {
	return (
		<div className="savings_wastage_arrow">
			<div
				className="d-flex flex-column"
				style={{
					color:
						type === optimizationAmountType.SAVINGS
							? "#5FCF64"
							: "#FF974A",
				}}
			>
				<div className="text-capitalize font-8 bold-500">{type}</div>
				<div className="font-14 bold-600">{kFormatter(amount)}</div>
			</div>
			<img
				src={
					type === optimizationAmountType.SAVINGS
						? savingsArrow
						: wastageArrow
				}
				height={37}
				width={41}
				className="position-absolute"
				style={{ left: "25px" }}
			/>
		</div>
	);
}
