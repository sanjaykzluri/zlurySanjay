import React, { useEffect, useState } from "react";
import { STATUSES } from "../../constants/constant";
import completeicon from "../../../../assets/icons/completeicon.svg";
import hourglass from "../../../../assets/workflow/hourglass.svg";
import crossIcon from "../../../../assets/cross-solid.svg";
import info from "../../../../assets/applications/info.svg";
import { NameBadge } from "../../../../common/NameBadge";
import ActionStatusBar from "../ActionStatusBar/ActionStatusBar";
import ContentLoader from "react-content-loader";
import _ from "underscore";
import dayjs from "dayjs";
import refresh_icon from "../../../../assets/icons/refresh.svg";
import { Button } from "../../../../UIComponents/Button/Button";

function UserWorkflowStatusCard(props) {
	const { handleRefresh, logDetails } = props;
	let hideFewBars = props.hideFewBars || false;

	const statusBar = (status) => {
		if (!status) return "";
		let tempStatus = {};

		switch (status) {
			case STATUSES.COMPLETED:
				tempStatus.icon = completeicon;
				tempStatus.name = STATUSES.COMPLETED;
				break;
			case STATUSES.FAILED:
				tempStatus.icon = crossIcon;
				tempStatus.name = STATUSES.FAILED;
				break;
			case STATUSES.PENDING:
				tempStatus.icon = hourglass;
				tempStatus.name = STATUSES.PENDING;
				break;
			case STATUSES.COMPLETED_WITH_ERRORS:
				tempStatus.icon = info;
				tempStatus.name = "Completed with Errors";
				break;
			default:
				tempStatus.name = STATUSES.RUNNING;
				break;
		}

		return (
			<>
				{tempStatus.icon && <img src={tempStatus.icon} width={10} />}
				<div className="status_name text-capitalize">
					{tempStatus.name}
				</div>
			</>
		);
	};

	return (
		<>
			{props.loading
				? _.times(props.number_of_loaders || 4, (index) => (
						<div
							className="workflowStatusCard border mt-2 ml-2 pl-4"
							key={index}
							style={{ backgroundColor: "white" }}
						>
							<div className="d-flex flex-row">
								<ContentLoader height="21">
									{!hideFewBars && (
										<rect
											width="21"
											height="21"
											rx="50%"
											fill="#EBEBEB"
										/>
									)}
									<rect
										width="150"
										height="18"
										rx="1"
										x="30"
										y="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
								<ContentLoader
									className="ml-auto"
									height="21"
									width="125"
								>
									{!hideFewBars && (
										<rect
											width="18"
											height="18"
											rx="50%"
											y="2"
											fill="#EBEBEB"
										/>
									)}
									<rect
										width="80"
										height="18"
										rx="2"
										x="25"
										y="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<ContentLoader className="mt-2" height={"100%"}>
								<rect
									width="360"
									height="14"
									rx="2"
									fill="#EBEBEB"
								/>
							</ContentLoader>
							<ContentLoader className="mt-2" height={"100%"}>
								<rect
									width="100"
									height="14"
									rx="2"
									fill="#EBEBEB"
								/>
								<rect
									width="100"
									height="14"
									x="110"
									rx="2"
									fill="#EBEBEB"
								/>
								<rect
									width="100"
									height="14"
									x="220"
									rx="2"
									fill="#EBEBEB"
								/>
							</ContentLoader>
						</div>
				  ))
				: props.logDetails && (
						<div
							key={props.index}
							className={`${
								props.isSelected ? "light-blue" : ""
							} workflowStatusCard`}
							onClick={() =>
								props.onSelectLog &&
								props.onSelectLog(props.logDetails)
							}
						>
							<div className="d-flex flex-row">
								{props.logDetails?.user_logo ? (
									<img
										className="status_user_logo"
										src={
											props.logDetails?.run_for_user_logo
										}
									/>
								) : (
									<NameBadge
										name={
											props.logDetails?.run_for_user_name
										}
										className="status_user_logo"
									/>
								)}
								<div className="font-16 bold-600 align-self-center">
									{props.logDetails?.run_for_user_name}
								</div>
								<div className="workflow_status">
									{/* <button
										className="mr-1"
										onClick={(e) => handleRefresh(e)}
										style={{
											width: "auto",
											backgroundColor: "transparent",
											border: "none",
										}}
									>
										<img
											className=" m-auto"
											style={{ width: "15px" }}
											src={refresh_icon}
										/>
									</button> */}
									{statusBar(logDetails?.workflow_status)}
								</div>
							</div>
							<div className="font-11 grey mt-2">
								{props.logDetails?.total_actions_count} actions
								run on{" "}
								{dayjs(props.logDetails?.run_timestamp).format(
									"D MMM YYYY, HH:mm"
								)}
							</div>
							<ActionStatusBar
								runLog={props.logDetails}
								showDetailedLogButton={false}
								status={props.status}
							/>
						</div>
				  )}
		</>
	);
}

export default UserWorkflowStatusCard;
