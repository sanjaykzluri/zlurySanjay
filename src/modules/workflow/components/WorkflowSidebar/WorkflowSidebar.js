import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Tab, Tabs } from "react-bootstrap";
import { SIDEBAR_TABS } from "../../constants/constant";
import "./WorkflowSidebar.css";
import navMenu from "../../../../assets/workflow/navMenu.svg";
import navMenuWhite from "../../../../assets/workflow/navMenu-white.svg";
import log_white from "../../../../assets/workflow/log_white.png";
import log from "../../../../assets/lastSynced.svg";
import setting from "../../../../assets/workflow/setting.svg";
import setting_white from "../../../../assets/workflow/setting_white.svg";
import recommended from "../../../../assets/workflow/recommended.svg";
import recommendedWhite from "../../../../assets/workflow/recommended-white.svg";
import question_circle from "../../../../assets/workflow/question_circle.svg";
import question_circleWhite from "../../../../assets/workflow/question_circle-white.svg";
import Recommended from "../Recommended/Recommended";
import Overview from "../Overview/Overview";
import Runs from "../Runs/Runs";
import Help from "../Help/Help";
import Settings from "../Settings/Settings";
import { Link, useHistory, useLocation } from "react-router-dom";

export default function WorkflowSidebar(props) {
	const { showBlockedRefreshModal, setShowBlockedRefreshModal } = props;
	const [activeTab, setActiveTab] = useState(SIDEBAR_TABS.RECOMMENDED);
	const selectedTab = useSelector((state) => state.router.location.hash);
	const history = useHistory();
	const location = useLocation();
	const runsPathname = location.pathname.split("/")[3];
	const workflowId = props.isTemplate
		? location.pathname.split("/")[2]
		: location.pathname.split("/")[2];

	const renderImage = (image, width) => {
		return (
			<div className="tab_image_holder">
				<img src={image} width={width} />
			</div>
		);
	};
	useEffect(() => {
		if (runsPathname === "runs") {
			setActiveTab(SIDEBAR_TABS.RUNS);
		}
	}, [selectedTab, runsPathname]);

	function handleTabChange(tab) {
		if (tab === "runs") {
			history.push(`/workflow/${workflowId}/runs`);
		} else if (props.isTemplate) {
			history.push(`/playbook/${workflowId}`);
		} else {
			history.push(`/workflow/${workflowId}`);
		}
	}

	return (
		<div className="sidebar_tabs ">
			<Tabs
				id="sidebar_tabs"
				activeKey={activeTab}
				onSelect={(tab) => {
					handleTabChange(tab);
					setActiveTab(tab);
				}}
				className="mb-3"
			>
				<Tab
					eventKey={SIDEBAR_TABS.OVERVIEW}
					title={renderImage(
						SIDEBAR_TABS.OVERVIEW === activeTab
							? navMenuWhite
							: navMenu,
						16
					)}
				>
					<Overview setActiveTab={setActiveTab} />
				</Tab>

				<Tab
					eventKey={SIDEBAR_TABS.RECOMMENDED}
					title={renderImage(
						SIDEBAR_TABS.RECOMMENDED === activeTab
							? recommendedWhite
							: recommended,
						16
					)}
				>
					<Recommended isTemplate={props.isTemplate} />
				</Tab>

				<Tab
					eventKey={SIDEBAR_TABS.SETTINGS}
					title={renderImage(
						SIDEBAR_TABS.SETTINGS === activeTab
							? setting_white
							: setting,
						20
					)}
				>
					<Settings isTemplate={props.isTemplate} />
				</Tab>
				{!props.isTemplate && (
					<Tab
						eventKey={SIDEBAR_TABS.RUNS}
						title={renderImage(
							SIDEBAR_TABS.RUNS === activeTab ? log_white : log,
							16
						)}
					>
						<Runs
							showBlockedRefreshModal={showBlockedRefreshModal}
							setShowBlockedRefreshModal={
								setShowBlockedRefreshModal
							}
							workflowId={workflowId}
						/>
					</Tab>
				)}
				<Tab
					eventKey={SIDEBAR_TABS.HELP}
					title={renderImage(
						SIDEBAR_TABS.HELP === activeTab
							? question_circleWhite
							: question_circle,
						16
					)}
				>
					<Help />
				</Tab>
			</Tabs>
		</div>
	);
}
