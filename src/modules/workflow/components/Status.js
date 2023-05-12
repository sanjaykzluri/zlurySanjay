import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "../containers/Workflow/Workflow.css";
import { ProgressBarLoader } from "../../../common/Loader/ProgressBarLoader";
import { STATUSES } from "../constants/constant";
import pendingIcon from "../../../assets/pending_icon.svg";
import failedIcon from "../../../assets/cancelled_icon.svg";
import completedIcon from "../../../assets/completed_icon.svg";
import info from "../../../assets/applications/info.svg";

const ICON = {
	pending: pendingIcon,
	failed: failedIcon,
	completed: completedIcon,
	completed_with_errors: info,
};

export default function Status(props) {
	const { text, completed, failed, pending, source } = props;

	const tooltipData = () => {
		return (
			<div
				style={{
					fontSize: "10px",
					lineHeight: "10px",
					color: "#717171",
				}}
				className="d-flex flex-1 flex-direction-row p-2 justify-content-between align-items-center"
			>
				{completed >= 0 && (
					<div style={{ color: "#5FCF64" }} className="">
						<img className="mr-1" alt="" src={completedIcon} />
						{completed} Completed{" "}
					</div>
				)}
				{failed >= 0 && (
					<div style={{ color: "#FF6767" }} className="ml-2">
						<img className="mr-1" alt="" src={failedIcon} />
						{failed} Failed{" "}
					</div>
				)}
				{pending >= 0 && (
					<div style={{ color: "#717171" }} className="ml-2">
						<img className="mr-1" alt="" src={pendingIcon} />
						{pending} Pending{" "}
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="flex flex-row align-items-center workflow-status-component">
			<div className="d-flex flex-column workflow-status-container">
				{completed >= 0 || failed >= 0 || pending >= 0 ? (
					<OverlayTrigger
						placement="bottom"
						overlay={
							<Tooltip
								css={{ minWidth: "300px" }}
								className="workflow-status-tooltip"
							>
								{tooltipData()}
							</Tooltip>
						}
					>
						<div
							className="truncate_10vw workflow-status-user"
							style={{ margin: "auto" }}
						>
							{text == "pending" ? (
								<div style={{ display: "flex", width: "auto" }}>
									<ProgressBarLoader height={20} width={20} />
									<span style={{ marginLeft: "5px" }}>
										{text?.charAt(0).toUpperCase() +
											text?.slice(1)}
									</span>
								</div>
							) : text === STATUSES.COMPLETED_WITH_ERRORS ? (
								<div style={{ display: "flex", width: "auto" }}>
									<img
										className="mr-1"
										alt=""
										src={ICON[text]}
									/>
									<span>Completed</span>
								</div>
							) : (
								<div style={{ display: "flex", width: "auto" }}>
									<img
										className="mr-1"
										alt=""
										src={ICON[text]}
									/>
									<span>
										{text?.charAt(0).toUpperCase() +
											text?.slice(1)}
									</span>
								</div>
							)}
							{text === STATUSES.COMPLETED_WITH_ERRORS && (
								<div
									style={{
										fontSize: "8px",
										lineHeight: "10px",
										color: "#717171",
										marginLeft: "17px",
									}}
									className="tcreated-at-user"
								>
									{"with Errors"}
								</div>
							)}
						</div>
					</OverlayTrigger>
				) : (
					<OverlayTrigger
						placement="top"
						overlay={
							<Tooltip>
								{text?.charAt(0).toUpperCase() + text?.slice(1)}
							</Tooltip>
						}
					>
						<div
							className="truncate_10vw workflow-status-user"
							style={{ margin: "auto" }}
						>
							{text == "pending" ? (
								<div style={{ display: "flex", width: "auto" }}>
									<ProgressBarLoader height={20} width={20} />
									<span style={{ marginLeft: "5px" }}>
										{text?.charAt(0).toUpperCase() +
											text?.slice(1)}
									</span>
								</div>
							) : text === STATUSES.COMPLETED_WITH_ERRORS ? (
								"Completed"
							) : (
								text?.charAt(0).toUpperCase() + text?.slice(1)
							)}
							{source && (
								<div style={{ display: "flex", width: "auto" }}>
									<span className="truncate_10vw created-at-user grey-1 font-8">
										using{" "}
										{source?.charAt(0).toUpperCase() +
											source?.slice(1)}
									</span>
								</div>
							)}
						</div>
					</OverlayTrigger>
				)}
			</div>
		</div>
	);
}
