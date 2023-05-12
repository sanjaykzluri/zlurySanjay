import React from "react";
import moment from "moment";
import { OverviewFieldLoaderCard } from "../../../../UIComponents/OverviewFieldLoaderCard/OverviewFieldLoaderCard";

export default function AgentVersionInfo({ agent, loading }) {
	return (
		<>
			{loading ? (
				<OverviewFieldLoaderCard />
			) : (
				<>
					<div className="singleagent__cont__d2__row">
						<div className="singleagent__cont__d2__row__d1">
							LATEST VERSION
						</div>
						<div className="singleagent__cont__d2__row__d2">
							{agent && agent?.latest_version}
						</div>
					</div>
					<div className="singleagent__cont__d2__row">
						<div className="singleagent__cont__d2__row__d1">
							LAST UPDATED
						</div>
						<div className="singleagent__cont__d2__row__d2">
							{agent && agent.published_date
								? moment(agent.published_date).format(
										"DD MMM HH:mm"
								  )
								: "Date Unavailable"}
						</div>
					</div>
				</>
			)}
		</>
	);
}
