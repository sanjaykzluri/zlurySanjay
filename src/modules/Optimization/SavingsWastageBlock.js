import React from "react";
import { kFormatter } from "constants/currency";
import { optimizationAmountType } from "./constants/OptimizationConstants";

export default function SavingsWastageBlock({
	type = optimizationAmountType.SAVINGS,
	amount = 0,
	start,
	end,
}) {
	const blockStyle =
		type === optimizationAmountType.SAVINGS
			? {
					width: "fit-content",
					height: "45px",
					backgroundColor: "#DFF5E0",
					borderRadius: "4px",
					marginRight: "20px",
					padding: "5px 8px",
			  }
			: {
					width: "fit-content",
					height: "45px",
					backgroundColor: "#FFEFE1",
					borderRadius: "4px",
					marginRight: "20px",
					padding: "5px 8px",
			  };

	return (
		<div className="d-flex flex-row" style={blockStyle}>
			<div className="d-flex flex-column">
				<div
					className="font-18 bold-600"
					style={{
						color:
							type === optimizationAmountType.SAVINGS
								? "#5FCF64"
								: "#FF974A",
					}}
				>
					{kFormatter(amount)}
				</div>
				<div className="font-10" style={{ color: "#717171" }}>
					{type}
				</div>
			</div>
			<div className="font-11 o-5 ml-2 mt-1">
				{start} to {end}
			</div>
		</div>
	);
}
