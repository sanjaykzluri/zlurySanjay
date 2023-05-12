import React from "react";
import { getApplicationSpendVSEstCostGraph } from "../../../../services/api/applications";
import SpendVSCostGraph from "../../../spendvscost/components/SpendVSCostGraph";

export default function ApplicationSpendVSCost() {
	const id = window.location.pathname.split("/")[2];
	return (
		<>
			<div>Actual Spend vs Est Cost</div>
			<div className="spendvscost__exterior__cont">
				<SpendVSCostGraph
					graphHeight={"226px"}
					calendarContainerClassName="app-vendor-overview-date-range-calendar"
					graphAPI={getApplicationSpendVSEstCostGraph}
					id={id}
				/>
			</div>
		</>
	);
}
