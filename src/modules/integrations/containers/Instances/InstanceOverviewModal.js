import React, { Fragment, useContext, useEffect, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import { NameBadge } from "../../../../common/NameBadge";
// import "./RiskModal.css";
import close from "../../../../assets/close.svg";
import successIcon from "../../../../assets/success-int.svg";
import syncIcon from "../../../../assets/sync-icon.svg";

import { unescape } from "../../../../utils/common";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import InstanceOverview from "./InstanceOverview";
import { useSelector } from "react-redux";
import InstanceScopes from "./InstanceScopes";
import InstanceLogs from "./InstanceLogs";
import InstanceSettings from "./InstanceSettings";
import { IntegrationConnectV2 } from "modules/integrations/components/IntegrationConnectV2/IntegrationConnectV2";
import disconnectedIcon from "assets/icons/delete-warning.svg";
import InstanceDataSource from "./InstanceDataSource";

function InstanceOverviewModal({
	closeModal,
	instance,
	integration,
	selectedTab,
	handleDisconnect,
	handleRefresh,
	handleReconnect,
	...props
}) {
	let row = instance;
	const [usingFilter, setUsingFilter] = useState(false);
	const [scope, setScope] = useState("");
	const [scopes, setScopes] = useState([]);
	const [showConnectModal, setShowConnectModal] = useState(false);
	const sections = {
		overview: "overview",
		scopes: "scopes",
		logs: "logs",
		settings: "settings",
		data_source: "Data Source",
	};
	const [activeSection, setActiveSection] = useState(
		selectedTab || sections.overview
	);
	function handleSectionClick(section) {
		if (section === sections.overview) {
			setUsingFilter(false);
			setScope("");
		}
		setActiveSection(section);
	}
	const changeActiveSectionToCriticalUsers = (scope) => {
		setUsingFilter(true);
		setScope(scope);
		handleSectionClick(sections.criticalusers);
	};
	const setScopeData = (scopeArray) => {
		setScopes(scopeArray.scopes_array);
	};

	return (
		<Fragment>
			<div className="modal-backdrop show"></div>
			<div style={{ width: "575px" }} className="securityRiskModal">
				<div className="d-flex border-bottom-0 py-2">
					<div
						className="mx-auto d-flex align-items-center"
						style={{ width: "90%" }}
					>
						<RenderImageAndName
							name={integration?.name}
							image={integration?.logo}
							marginLeft={"ml-1"}
						/>

						<div className="font-18 grey-1">{row?.name}</div>
					</div>
					<img
						alt="Close"
						src={close}
						className="cursor-pointer mr-3"
						onClick={() => {
							closeModal();
						}}
					/>
				</div>
				<div className="d-flex border-bottom-0 py-1 px-4">
					<div
						style={{
							background:
								row?.status === "connected"
									? "rgba(95, 207, 100, 0.1)"
									: "rgba(255, 75, 51, 0.1)",
							height: "24px",
							borderRadius: "4px",
						}}
						className="mr-1"
					>
						<span
							style={{
								color:
									row?.status === "connected"
										? "#5FCF64"
										: "rgba(255, 103, 103, 1)",
							}}
							className="px-1 font-12"
						>
							<img
								width={"15px"}
								className="mr-1"
								src={
									row?.status === "connected"
										? successIcon
										: disconnectedIcon
								}
							/>
							{row?.status === "connected"
								? "Connected"
								: "Disconnected"}
						</span>
					</div>
					{instance?.lastSync && (
						<div
							style={{
								background: "rgba(113, 113, 113, 0.1)",
								width: "45%",
								borderRadius: "4px",
							}}
							className="px-1"
						>
							<img
								width={"15px"}
								className="mr-1"
								src={syncIcon}
							/>{" "}
							<span className="font-12 ">
								last synced {instance?.lastSync} ago
							</span>
						</div>
					)}
				</div>
				<div>
					<Tabs
						defaultActiveKey={sections.overview}
						className="mt-0 mb-0 ml-3 mr-3 border-bottom sourceTabs"
						onSelect={(k) => handleSectionClick(k)}
						activeKey={activeSection}
					>
						<Tab eventKey={sections.overview} title="Overview">
							<InstanceOverview
								currentSection={activeSection}
								sections={sections}
								id={row?.orgIntegrationID}
								changeActiveSectionToCriticalUsers={
									changeActiveSectionToCriticalUsers
								}
								securityOverview={row}
								instance={row}
								integration={integration}
								setScopeData={setScopeData}
								handleReconnect={handleReconnect}
							/>
						</Tab>
						<Tab eventKey={sections.scopes} title="Scopes">
							<InstanceScopes
								currentSection={activeSection}
								sections={sections}
								id={row?.orgIntegrationID}
								changeActiveSectionToCriticalUsers={
									changeActiveSectionToCriticalUsers
								}
								instance={row}
								integration={integration}
								setScopeData={setScopeData}
								setShowConnectModal={setShowConnectModal}
								handleReconnect={handleReconnect}
							/>
						</Tab>
						{/* <Tab eventKey={sections.logs} title="Logs">
							<InstanceLogs
								currentSection={activeSection}
								sections={sections}
								id={row?.orgIntegrationID}
								changeActiveSectionToCriticalUsers={
									changeActiveSectionToCriticalUsers
								}
								securityOverview={row}
								instance={row}
								integration={integration}
								setScopeData={setScopeData}
							/>
						</Tab> */}
						<Tab eventKey={sections.settings} title="Settings">
							<InstanceSettings
								currentSection={activeSection}
								sections={sections}
								id={row?.orgIntegrationID}
								changeActiveSectionToCriticalUsers={
									changeActiveSectionToCriticalUsers
								}
								securityOverview={row}
								instance={row}
								integration={integration}
								setScopeData={setScopeData}
								setShowConnectModal={setShowConnectModal}
								handleDisconnect={handleDisconnect}
								onConnectionSuccessfull={() => {
									handleRefresh();
									closeModal();
								}}
								handleReconnect={handleReconnect}
							/>
						</Tab>
						{integration.show_data_source_tab && (
							<Tab
								eventKey={sections.data_source}
								title="Data Source"
							>
								<InstanceDataSource
									currentSection={activeSection}
									sections={sections}
									instance={row}
									integration={integration}
								/>
							</Tab>
						)}
					</Tabs>
				</div>
			</div>
		</Fragment>
	);
}

function RenderImageAndName({ image, name, marginLeft }) {
	return (
		<>
			{image ? (
				<div
					className={`${marginLeft} mr-2 rounded-circle headerImage`}
					style={{ backgroundImage: `url(${unescape(image)})` }}
				></div>
			) : (
				<NameBadge
					name={name}
					width={26}
					borderRadius={50}
					className={`${marginLeft} mr-2 rounded-circle`}
				/>
			)}
			<OverlayTrigger
				placement="bottom"
				overlay={<Tooltip>{name}</Tooltip>}
			>
				<div className="mr-2 mt-auto mb-auto bold-600 font-18 truncate-name">
					{name}
				</div>
			</OverlayTrigger>
		</>
	);
}

export default InstanceOverviewModal;
