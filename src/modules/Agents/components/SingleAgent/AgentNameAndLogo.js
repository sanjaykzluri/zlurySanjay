import React from "react";
import chrome from "../../../../assets/agents/chrome.svg";
import firefox from "../../../../assets/agents/firefox.svg";
import edge from "../../../../assets/agents/edge.svg";
import windows from "../../../../assets/agents/windows.svg";
import macos from "../../../../assets/agents/macos.svg";
import linux from "../../../../assets/agents/linux.svg";
import ContentLoader from "react-content-loader";
import { agentImg } from "constants/agents";


export default function AgentNameAndLogo({ loading, agent }) {
	return (
		<>
			{loading ? (
				<AgentNameAndLogoLoader />
			) : (
				<div className="singleagent__cont__d1">
					<div className="singleagent__cont__d1__d1">
						{agent && (
							<img src={agentImg(agent?.name)} width={30} />
						)}
					</div>
					<div className="singleagent__cont__d1__d2">
						<div className="singleagent__cont__d1__d2__d1">
							{agent && agent.name}
						</div>
						<div className="singleagent__cont__d1__d2__d2">
							{agent && agent.type} Agent
						</div>
					</div>
				</div>
			)}
		</>
	);
}

function AgentNameAndLogoLoader() {
	return (
		<div className="singleagent__cont__d1">
			<div className="singleagent__cont__d1__d1">
				<ContentLoader
					style={{ marginRight: 8 }}
					width={48}
					height={48}
					viewBox="0 0 48 48"
				>
					<circle cx="24" cy="24" r="24" fill="#EBEBEB" />
				</ContentLoader>
			</div>
			<div className="singleagent__cont__d1__d2">
				<div className="singleagent__cont__d1__d2__d1">
					<ContentLoader width={108} height={12}>
						<rect width={108} height={12} fill="#EBEBEB" />
					</ContentLoader>
				</div>
				<div className="singleagent__cont__d1__d2__d2">
					<ContentLoader width={76} height={9}>
						<rect width={76} height={9} fill="#EBEBEB" />
					</ContentLoader>
				</div>
			</div>
		</div>
	);
}
