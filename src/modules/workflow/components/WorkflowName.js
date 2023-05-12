import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import right_angle_icon from "../../../assets/workflows/right-angle.svg";
import { NameBadge } from "../../../common/NameBadge";
import { unescape } from "../../../utils/common";
import { InlineEditField } from "../../shared/containers/InlineEditField/InlineEditField";
import { editWorkflowTemplate } from "../service/api";

export default function WorkflowsNameInTable(props) {
	const {
		title,
		total_apps,
		total_actions,
		allApps, //array of all apps selected in workflow
		totalActionsCount, //total number of actions in workflow
		customTooltip,
		tooltipClassName,
		inlineEdit,
		iconSize = "26px",
	} = props;

	let startApp = null;
	let midApp = null;
	let endApp = null;
	let midActionsCount = 0; //number of actions displayed between app icons
	if (allApps && allApps.length) {
		startApp = allApps[0];
		midApp = allApps[Math.round(allApps.length / 2) - 1];
		if (allApps.length > 1) {
			endApp = allApps[allApps.length - 1];
		} else {
			endApp = startApp;
		}
	}
	if (totalActionsCount && totalActionsCount > 1) {
		midActionsCount = totalActionsCount - 2;
	} else if (totalActionsCount) {
		midActionsCount = 0;
	} else {
		midActionsCount = 0;
	}

	function GreyTriangle() {
		return (
			<div className="d-flex flex-row">
				<img
					src={right_angle_icon}
					style={{
						paddingLeft: "7px",
						paddingRight: "7px",
					}}
				/>
			</div>
		);
	}

	function AppIcon(props) {
		let app = props.app;
		return (
			<div className="d-flex flex-row">
				{app && app.app_logo ? (
					<img
						style={{
							height: iconSize,
							width: iconSize,
							objectFit: "contain",
							borderRadius: "15%",
						}}
						src={unescape(app.app_logo)}
						alt={""}
					/>
				) : (
					<NameBadge
						name={app?.app_name || "N A"}
						fontSize={10}
						width={iconSize}
						height={iconSize}
						borderRadius={"15%"}
					/>
				)}
			</div>
		);
	}

	const displayTitle = (
		<div className="d-flex flex-column">
			{inlineEdit ? (
				<InlineEditField
					type="text"
					updateService={editWorkflowTemplate}
					patch={{
						value: title,
						op: "replace",
						field: "name",
					}}
					id={props.id}
					segmentCategory={"Worklfow Playbook Name Edit"}
					inlineValueClassName="truncate_10vw"
					onUpdateValue={(res) => {}}
				/>
			) : (
				<OverlayTrigger
					placement="top"
					overlay={
						<Tooltip className={customTooltip && tooltipClassName}>
							{customTooltip ? customTooltip : title}
						</Tooltip>
					}
				>
					<div className="truncate_10vw">
						{title?.charAt(0).toUpperCase() + title?.slice(1)}
					</div>
				</OverlayTrigger>
			)}

			<span className="action-apps-counts" style={{ marginLeft: "8px" }}>
				{total_apps} {total_apps == 1 ? "app" : "apps"}, {total_actions}{" "}
				{total_actions == 1 ? "action" : "actions"}
			</span>
		</div>
	);

	// decide which layout to use based on number of actions
	function componentNameLayout2(no_of_actions) {
		switch (no_of_actions) {
			case 0:
				return (
					<div className="flex flex-row align-items-center workflows-name">
						<div className="flex flex-row align-items-center workflows-name-actions">
							<AppIcon app={startApp} />
						</div>
						{!props.hideTitle && displayTitle}
					</div>
				);

			case 1:
				return (
					<div className="flex flex-row align-items-center workflows-name">
						<div className="flex flex-row align-items-center workflows-name-actions">
							<AppIcon app={startApp} />
						</div>
						{!props.hideTitle && displayTitle}
					</div>
				);

			case 2:
				return (
					<div className="flex flex-row align-items-center workflows-name">
						<div className="flex flex-row align-items-center workflows-name-actions">
							<AppIcon app={startApp} />
							<GreyTriangle />
							<AppIcon app={endApp} />
						</div>
						{!props.hideTitle && displayTitle}
					</div>
				);
			case 3:
				return (
					<div className="flex flex-row align-items-center workflows-name">
						<div className="flex flex-row align-items-center workflows-name-actions">
							<AppIcon app={startApp} />
							<GreyTriangle />
							{/* use midApp when there are 3 apps and 3 actions */}
							{total_apps == 3 ? (
								<AppIcon app={midApp} />
							) : (
								<div className="d-flex flex-row">
									{startApp?.actions?.length >
									endApp?.actions?.length ? (
										<AppIcon app={startApp} />
									) : (
										<AppIcon app={endApp} />
									)}
								</div>
							)}
							<GreyTriangle />
							<AppIcon app={endApp} />
						</div>
						{!props.hideTitle && displayTitle}
					</div>
				);

			default:
				return (
					<div className="flex flex-row align-items-center workflows-name">
						<div className="flex flex-row align-items-center workflows-name-actions">
							<AppIcon app={startApp} />
							<GreyTriangle />
							<div className="flex flex-row center">
								<div className="custom-badge">
									+{midActionsCount}
								</div>
							</div>
							<GreyTriangle />
							<AppIcon app={endApp} />
						</div>
						{!props.hideTitle && displayTitle}
					</div>
				);
		}
	}

	return <div>{componentNameLayout2(total_actions)}</div>;
}