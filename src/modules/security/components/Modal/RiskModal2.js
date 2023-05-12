import React, { Fragment, useContext, useEffect, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import { NameBadge } from "../../../../common/NameBadge";
import "./RiskModal.css";
import close from "../../../../assets/close.svg";
import RiskOverview from "../CriticalUsers/RiskOverview";
import RiskCriticalApps from "../CriticalUsers/RiskCriticalApps";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
function RenderImageAndName({ image, name, marginLeft }) {
	return (
		<>
			{image ? (
				<img
					src={image}
					className="mr-2 rounded-circle headerImage"
					alt="user-icon"
				/>
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
				overlay={<Tooltip>{name ? name : ""}</Tooltip>}
			>
				<div
					className={`mr-2 mt-auto mb-auto bold-600 font-18 truncate-name`}
					style={{
						maxWidth: "35%",
						whiteSpace: "nowrap",
					}}
				>
					{name ? name : ""}
				</div>
			</OverlayTrigger>
		</>
	);
}
function RiskModal2(props) {
	const { row, setInterColumnsStateObject, interColumnsStateObject } =
		props.rowDetails;
	const [usingFilter, setUsingFilter] = useState(false);
	const [scope, setScope] = useState("");
	const [scopes, setScopes] = useState([]);
	const sections = {
		overview: "overview",
		criticalapps: "criticalapps",
	};
	const [activeSection, setActiveSection] = useState(sections.overview);
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
		handleSectionClick(sections.criticalapps);
	};
	const setScopeData = (scopeArray) => {
		scopeArray && scopeArray.scope_data && setScopes(scopeArray.scope_data);
	};
	return (
		<Fragment>
			<div className="modal-backdrop show"></div>
			<div className="securityRiskModal">
				<div className="d-flex border-bottom-0 py-4">
					<div
						className="mx-auto d-flex align-items-center"
						style={{ width: "90%" }}
					>
						<RenderImageAndName
							name={row?.user_name}
							image={row?.user_profile}
							marginLeft={"ml-1"}
						/>

						<div className="font-18 grey-1">Security Breakdown</div>
					</div>
					<img
						alt="Close"
						src={close}
						className="cursor-pointer mr-3"
						onClick={() => {
							props.closeModal && props.closeModal();
						}}
					/>
				</div>
				<div>
					<Tabs
						defaultActiveKey={sections.overview}
						className="mt-0 mb-0 ml-3 mr-3 border-bottom sourceTabs"
						onSelect={(k) => handleSectionClick(k)}
						activeKey={activeSection}
					>
						<Tab eventKey={sections.overview} title="Overview">
							<RiskOverview
								currentSection={activeSection}
								sections={sections}
								id={row?.user_id}
								status={row?.user_status}
								changeActiveSectionToCriticalUsers={
									changeActiveSectionToCriticalUsers
								}
								setScopeData={setScopeData}
								securityOverview={row}
							/>
						</Tab>
						<Tab
							eventKey={sections.criticalapps}
							title="Critical Apps"
						>
							<RiskCriticalApps
								currentSection={activeSection}
								sections={sections}
								id={row?.user_id}
								usingFilter={usingFilter}
								scope={scope}
								scopes={scopes || []}
								setUsingFilter={setUsingFilter}
								setScope={setScope}
							/>
						</Tab>
					</Tabs>
				</div>
			</div>
		</Fragment>
	);
}

export default RiskModal2;
