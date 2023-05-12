import React, { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import arrowdropdown from "assets/arrowdropdown.svg";
import rightarrow from "assets/users/rightarrow.svg";
import backArrow from "assets/licenses/backarrow.svg";
import _ from "underscore";

const MultiSources = ({ sources, onSelect, isOnly }) => {
	const [activeScreen, setActiveScreen] = useState("SOURCE_TYPES");

	const [agentsList, setAgentsList] = useState([]);
	const [integrationsList, setIntegrationsList] = useState([]);
	const [instancesList, setInstancesList] = useState([]);
	const [selectedIntegration, setSelectedIntegration] = useState();
	const [selectedInstancesList, setSelectedInstancesList] = useState();

	useEffect(() => {
		if (!sources) return;
		let agents = [];
		let instances = [];

		if (sources) {
			sources.forEach((source) => {
				if (source.hasOwnProperty("global_agent_id")) {
					agents.push(source);
				} else if (
					source.hasOwnProperty("integration_id") &&
					source.hasOwnProperty("org_integration_id")
				) {
					instances.push(source);
				}
			});
		}
		const key = "integration_id";
		let integrations = [
			...new Map(instances.map((item) => [item[key], item])).values(),
		];
		setInstancesList(instances);
		setIntegrationsList(integrations);
		setAgentsList(agents);
	}, []);

	function handleInstances(integration) {
		setActiveScreen("INSTANCES");
		setSelectedIntegration(integration.name);
		let instancesInt = instancesList.filter(
			(item) => item.integration_id === integration.integration_id
		);
		setSelectedInstancesList(instancesInt);
	}

	const SCREENS = {
		SOURCE_TYPES: (
			<div
				className="flex font-13 cursor-pointer"
				style={{ flexDirection: "column" }}
			>
				<div
					style={{ justifyContent: "space-between" }}
					className="flex px-3 py-2"
					onClick={() => {
						setActiveScreen("AGENTS");
					}}
				>
					<span className="grey">Agents</span>
					<img src={rightarrow} style={{ marginLeft: "8px" }} />
				</div>
				<div
					style={{ justifyContent: "space-between" }}
					className="flex px-3 py-2"
					onClick={() => {
						setActiveScreen("INTEGRATIONS");
					}}
				>
					<span className="grey">Integrations</span>
					<img src={rightarrow} style={{ marginLeft: "8px" }} />
				</div>
				<div
					className="px-3 py-2"
					onClick={() => {
						onSelect({ manual: "manual" }, "manual", "manual");
					}}
				>
					<span className="grey">Manual</span>
				</div>
			</div>
		),
		INTEGRATIONS: (
			<>
				<div
					style={{ backgroundColor: "rgba(0, 0, 0, 0.075)" }}
					className="flex p-2 px-3 align-items-center"
				>
					<div
						onClick={() => {
							setActiveScreen("SOURCE_TYPES");
						}}
						className="cursor-pointer mr-2"
					>
						<img width={10} src={backArrow} />
					</div>
					<div className="font-12">INTEGRATIONS</div>
				</div>
				<div
					className="flex font-13"
					style={{ flexDirection: "column" }}
				>
					{!isOnly && (
						<div
							style={{ justifyContent: "space-between" }}
							className="flex px-3 py-2 cursor-pointer on-hover-effect "
							onClick={() => {
								onSelect(
									integrationsList,
									"integration",
									"integration_id",
									true
								);
							}}
						>
							<span className="grey">All</span>
						</div>
					)}
					{integrationsList.map(
						(integration, index) =>
							integration?.name && (
								<div
									style={{ justifyContent: "space-between" }}
									className="flex px-3 py-2 cursor-pointer on-hover-effect "
									onClick={() => {
										integration?.org_integration_id
											? handleInstances(integration)
											: onSelect(
													integration,
													"integration",
													"integration_id"
											  );
									}}
								>
									<span className="grey font-13">
										{integration?.name}
									</span>
									{integration?.org_integration_id && (
										<img
											src={rightarrow}
											style={{ marginLeft: "8px" }}
										/>
									)}
								</div>
							)
					)}
				</div>
			</>
		),
		INSTANCES: (
			<>
				<div
					style={{ backgroundColor: "rgba(0, 0, 0, 0.075)" }}
					className="flex p-2 px-3 align-items-center"
				>
					<div
						onClick={() => {
							setActiveScreen("INTEGRATIONS");
						}}
						className="cursor-pointer mr-2"
					>
						<img width={10} src={backArrow} />
					</div>
					<div className="font-12">{`INTEGRATIONS / ${selectedIntegration}`}</div>
				</div>
				<div
					className="flex font-13"
					style={{ flexDirection: "column" }}
				>
					{!isOnly && (
						<div
							style={{ justifyContent: "space-between" }}
							className="flex px-3 py-2 cursor-pointer on-hover-effect "
							onClick={() => {
								onSelect(
									selectedInstancesList,
									"instance",
									"org_integration_id",
									true,
									selectedIntegration
								);
							}}
						>
							<span className="grey">All</span>
						</div>
					)}
					{selectedInstancesList?.map((item, index) => (
						<div
							style={{ justifyContent: "space-between" }}
							className="flex px-3 py-2 cursor-pointer on-hover-effect "
							onClick={() => {
								// setActiveScreen("AGENTS");
								onSelect(
									item,
									"instance",
									"org_integration_id"
								);
							}}
						>
							<span className="grey font-13">
								{item?.org_integration_name ||
									item?.source_name}
							</span>
						</div>
					))}
				</div>
			</>
		),
		AGENTS: (
			<>
				<div
					style={{ backgroundColor: "rgba(0, 0, 0, 0.075)" }}
					className="flex p-2 px-3 align-items-center"
				>
					<div
						onClick={() => {
							setActiveScreen("SOURCE_TYPES");
						}}
						className="cursor-pointer mr-2"
					>
						<img width={10} src={backArrow} />
					</div>
					<div className="font-12">AGENTS</div>
				</div>
				<div
					className="flex font-13"
					style={{ flexDirection: "column" }}
				>
					{!isOnly && (
						<div
							style={{ justifyContent: "space-between" }}
							className="flex px-3 py-2 cursor-pointer on-hover-effect "
							onClick={() => {
								onSelect(
									{ allAgents: "agent" },
									"allAgents",
									"global_agent_id",
									true
								);
							}}
						>
							<span className="grey">All</span>
						</div>
					)}
					{agentsList.map((agent, index) => (
						<div
							style={{ justifyContent: "space-between" }}
							className="flex px-3 py-2 cursor-pointer on-hover-effect "
							onClick={() => {
								onSelect(
									agent,
									"selectedAgents",
									"global_agent_id"
								);
							}}
						>
							<span className="grey font-13">{agent?.name}</span>
						</div>
					))}
				</div>
			</>
		),
	};

	return (
		<div className="s-menu-container shadow-sm position-static">
			{SCREENS[activeScreen]}
		</div>
	);
};

export default MultiSources;
