import React, { useCallback, useEffect, useState } from "react";
import { OverviewTop } from "./components/OverviewTop/OverviewTop";
import { getAgents } from "../../../../services/api/agents";
import "./AgentsOverview.css";
import { OverviewBottom } from "./components/OverviewBottom/OverviewBottom";
import { trackPageSegment } from "modules/shared/utils/segment";

export function AgentsOverview(props) {
	const [agents, setAgents] = useState([]);
	const [loading, setloading] = useState(true);
	const [error, setError] = useState();
	useEffect(() => {
		trackPageSegment("Agent", "Overview");
		if (loading) {
			try {
				getAgents().then((res) => {
					if (res?.error) {
						setError(res?.error);
					} else {
						setAgents(res);
						setloading(false);
					}
				});
			} catch (error) {
				setloading(false);
				setError(error);
			}
		}
	}, []);
	return (
		<>
			<div className="agentsoverview__cont">
				<div className="agentsoverview__cont__d1">
					<OverviewTop
						data={agents?.data?.overview}
						loading={loading}
					></OverviewTop>
				</div>
				<div className=" d-flex flex-column">
					<OverviewBottom
						data={agents?.data?.agents}
						loading={loading}
					></OverviewBottom>
				</div>
			</div>
		</>
	);
}
