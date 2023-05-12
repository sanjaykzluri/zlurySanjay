import React, { Fragment, useContext, useEffect, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import {
	fetchUsageActivityOverviewDetails,
	markAsActive,
	markAsNotActive,
} from "../../../../services/api/users";
import "./UsageActivity.css";
import UsageActivityLog from "./UsageActivityLog.js";
import UsageActivityOverview from "./UsageActivityOverview.js";
import UsageActivityRisk from "./UsageActivityRisk.js";
import UsageActivityActivity from "./UsageActivityAcitivity";
import close from "../../../../assets/close.svg";
import bluearrowdown from "../../../../assets/bluearrowdown.svg";
import { NameBadge } from "../../../../common/NameBadge";
import Options from "../ManualUsage/TableComponents/Options";
import RoleContext from "../../../../services/roleContext/roleContext";
import { unescape } from "../../../../utils/common";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

function RenderImageAndName({ image, name, marginLeft }) {
	return (
		<>
			{image ? (
				<img
					src={unescape(image)}
					width={26}
					borderRadius={50}
					style={{ objectFit: "contain" }}
					className={`${marginLeft} mr-2 rounded-circle headerImage`}
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
					className={`mr-2 mt-auto mb-auto bold-600 font-18 ${
						name?.length > 15 ? "text-truncate" : null
					}`}
					style={{
						maxWidth: "35%",
						whiteSpace: "nowrap",
					}}
				>
					{name}
				</div>
			</OverlayTrigger>
		</>
	);
}

function UsageActivity(props) {
	const { row, setInterColumnsStateObject, interColumnsStateObject } =
		props.rowDetails;
	const sections = {
		overview: "overview",
		activity: "activity",
		risk: "risk",
		log: "log",
	};
	const [activeSection, setActiveSection] = useState(sections.overview);
	const [actionsClicked, setActionsClicked] = useState(false);
	const { isViewer } = useContext(RoleContext);

	const onClickAddManualUsage = () => {
		setInterColumnsStateObject({
			...interColumnsStateObject,
			open_manual: true,
			orgUserAppId: row?.user_app_id,
		});
	};

	function handleSectionClick(k) {
		setActiveSection(k);
	}

	function toggleShowActions() {
		setActionsClicked((val) => !val);
	}

	useEffect(() => {
		if (props.showActivity) {
			setActiveSection(sections.activity);
		}
	}, []);

	return (
		<Fragment>
			<div className="modal-backdrop show"></div>
			<div className="sourceUsageActivityModal">
				<div className="d-flex border-bottom-0 py-4">
					<div
						className="mx-auto d-flex align-items-center"
						style={{ width: "90%" }}
					>
						{!props.isUser ? (
							<RenderImageAndName
								name={props?.app_name}
								image={props?.app_image}
								marginLeft={"ml-1"}
							/>
						) : (
							<RenderImageAndName
								name={props?.user_name}
								image={props?.user_image}
								marginLeft={"ml-1"}
							/>
						)}
						<div className="font-18 grey-1">for</div>
						{!props.isUser ? (
							<RenderImageAndName
								name={props?.user_name}
								image={props?.user_image}
								marginLeft={"ml-3"}
							/>
						) : (
							<RenderImageAndName
								name={props?.app_name}
								image={props?.app_image}
								marginLeft={"ml-3"}
							/>
						)}
					</div>
					<img
						alt="Close"
						src={close}
						className="cursor-pointer mr-3"
						onClick={() => {
							props.closeUsageAcivity &&
								props.closeUsageAcivity();
						}}
					/>
				</div>
				<div>
					<Tabs
						defaultActiveKey={
							props.showActivity
								? sections.activity
								: sections.overview
						}
						className="mt-0 mb-0 ml-3 mr-3 border-bottom sourceTabs"
						onSelect={(k) => handleSectionClick(k)}
					>
						<Tab eventKey={sections.overview} title="Overview">
							<UsageActivityOverview
								currentSection={activeSection}
								id={row?.user_app_id}
								sections={sections}
								isUser={props.isUser}
								refresh={props.refresh}
								row={row}
								appLogo={props.app_image}
								appName={props.app_name}
								userId={props.user_id}
							/>
						</Tab>
						<Tab eventKey={sections.activity} title="Activity">
							<UsageActivityActivity
								userId={props.user_id}
								currentSection={activeSection}
								sections={sections}
								id={row?.user_app_id}
								isUser={props.isUser}
								updateManualUsage={props.updateManualUsage}
								refresh={props.refresh}
								setInterColumnsStateObject={
									setInterColumnsStateObject
								}
								interColumnsStateObject={
									interColumnsStateObject
								}
							/>
						</Tab>
						<Tab eventKey={sections.risk} title="Risk">
							<UsageActivityRisk
								currentSection={activeSection}
								sections={sections}
								id={row?.user_app_id}
								isUser={props.isUser}
							/>
						</Tab>
						<Tab eventKey={sections.log} title="Log">
							<UsageActivityLog
								currentSection={activeSection}
								sections={sections}
								id={row?.user_app_id}
								isUser={props.isUser}
							/>
						</Tab>
					</Tabs>
					{activeSection === sections.overview && !isViewer && (
						<div
							className="position-absolute d-flex"
							style={{ top: "85px", right: "18px" }}
						>
							<div
								className="font-14 primary-color cursor-pointer mr-1 bold-normal"
								onClick={toggleShowActions}
							>
								Actions
							</div>
							<div className="m-auto position-relative">
								{row?.user_app_status?.toLowerCase() ===
								"active" ? (
									<Options
										popOverClassName="activity-tab-options-popover"
										hideActionHistory={true}
										icon={bluearrowdown}
										clicked={actionsClicked}
										close={() => setActionsClicked(false)}
										isUser={props.isUser}
										userId={row["user_id"]}
										onClickAddManualUsage={
											onClickAddManualUsage
										}
										onClickMarkAsNotActive={markAsNotActive}
										orgUserAppId={row.user_app_id}
										appId={row["app_id"]}
										isOrgUserAppActive={true}
										interColumnsStateObject={
											interColumnsStateObject
										}
										refresh={props.refresh}
										style={{
											left: "-180px",
											transform: "translateX(0px)",
										}}
									/>
								) : (
									<Options
										popOverClassName="activity-tab-options-popover"
										hideActionHistory={true}
										icon={bluearrowdown}
										clicked={actionsClicked}
										close={() => setActionsClicked(false)}
										isUser={props.isUser}
										userId={row["user_id"]}
										onClickAddManualUsage={
											onClickAddManualUsage
										}
										onClickMarkAsActive={markAsActive}
										orgUserAppId={row.user_app_id}
										appId={row["app_id"]}
										isOrgUserAppActive={false}
										interColumnsStateObject={
											interColumnsStateObject
										}
										refresh={props.refresh}
										style={{
											left: "-180px",
											transform: "translateX(0px)",
										}}
									/>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</Fragment>
	);
}

export default UsageActivity;
