import React from "react";
import { GraphPeriods } from "../constants/SpendVSCostConstants";

export function GraphPeriodSelector({ period, setPeriod }) {
	return (
		<div className="d-flex flex-row align-items-center justify-content-center">
			{Object.keys(GraphPeriods).map((PERIOD, index) => (
				<div
					className={`font-14 cursor-pointer ml-1 graph-period-button ${
						GraphPeriods[PERIOD].value === period &&
						"active-graph-period"
					}`}
					onClick={() => setPeriod(GraphPeriods[PERIOD].value)}
					key={index}
				>
					<span
						className={`${
							GraphPeriods[PERIOD].value !== period && "grey-1"
						}`}
					>
						{GraphPeriods[PERIOD].key}
					</span>
				</div>
			))}
		</div>
	);
}
