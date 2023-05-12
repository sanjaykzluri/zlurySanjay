import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import info from "../../../../assets/applications/info.svg";
import { OverviewFieldLoaderCard } from "../../../../UIComponents/OverviewFieldLoaderCard/OverviewFieldLoaderCard";

export default function AgentUsageInfo({ agent, loading, setShowPromptModal }) {
	const infoTooltip = (key) => {
		let toolTipInfoStatement = "";
		key === "browser_used_by"
			? (toolTipInfoStatement =
					"Number of users who have installed the agent at any point in time")
			: key === "agents_in_use"
			? (toolTipInfoStatement = `Number of users who have the agent installed on their ${agent?.type} at this point`)
			: (toolTipInfoStatement =
					"Number of users who had installed the agent once but have uninstalled it now");

		return (
			<OverlayTrigger
				placement="top"
				overlay={<Tooltip>{toolTipInfoStatement}</Tooltip>}
			>
				<img
					src={info}
					className="cursor-pointer"
					style={{
						marginLeft: "5px",
						marginBottom: "1px",
						opacity: "0.5",
					}}
				/>
			</OverlayTrigger>
		);
	};

	return (
		<>
			{loading ? (
				<OverviewFieldLoaderCard />
			) : (
				<>
					<div className="singleagent__cont__d2__row">
						<div className="singleagent__cont__d2__row__d1">
							BROWSER USED BY
							{infoTooltip("browser_used_by")}
						</div>
						<div className="singleagent__cont__d2__row__d2">
							{agent && agent.browser_used_by} Users
						</div>
					</div>

					<div className="singleagent__cont__d2__row">
						<div className="singleagent__cont__d2__row__d1">
							AGENTS IN USE
							{infoTooltip("agents_in_use")}
						</div>
						<div className="singleagent__cont__d2__row__d2">
							{agent && agent.agents_in_use} Users
						</div>
					</div>
					<div className="singleagent__cont__d2__row">
						<div className="singleagent__cont__d2__row__d1">
							AGENTS NOT IN USE
							{infoTooltip("agents_not_in_use")}
						</div>
						<div className="singleagent__cont__d2__row__d2">
							{agent && agent.agents_not_in_use > 0 && (
								<div className="singleagent__cont__d2__row__d2__red">
									<button
										className="singleagent__cont__d2__row__d2__promptbutton"
										onClick={() => {
											setShowPromptModal(true);
										}}
									>
										Send Prompt
									</button>
								</div>
							)}
							{agent && agent.agents_not_in_use} Users
						</div>
					</div>
				</>
			)}
		</>
	);
}
