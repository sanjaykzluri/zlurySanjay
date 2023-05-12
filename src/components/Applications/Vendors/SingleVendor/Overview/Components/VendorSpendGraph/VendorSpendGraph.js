import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { kFormatter } from "../../../../../../../constants/currency";
import SpendVSCostGraph from "../../../../../../../modules/spendvscost/components/SpendVSCostGraph";
import { getVendorSpendVSEstCostGraph } from "../../../../../../../services/api/applications";
import { MONTH } from "../../../../../../../utils/DateUtility";

export default function VendorSpendGraph(props) {
	const id = window.location.pathname.split("/")[3];
	return (
		<div>
			<div className="mt-5">Actual Spend vs Est Cost</div>
			<div className="spendvscost__exterior__cont">
				<SpendVSCostGraph
					graphHeight={"226px"}
					calendarContainerClassName="app-vendor-overview-date-range-calendar"
					graphAPI={getVendorSpendVSEstCostGraph}
					id={id}
				/>
			</div>
		</div>
	);
}
