import React from "react";
import { Card, OverlayTrigger, Tooltip } from "react-bootstrap";
//import SyncLoader from "react-spinners/SyncLoader";
import dayjs from "dayjs";
import { NameBadge } from "../../../../common/NameBadge";
import completedIcon from "../../../../assets/completed_icon.svg";
import failedIcon from "../../../../assets/cancelled_icon.svg";
import refresh_icon from "../../../../assets/new-refresh-icon.svg";
import info from "../../../../assets/applications/info.svg";

import { ProgressBarLoader } from "../../../../common/Loader/ProgressBarLoader";
const RunLogHeader = ({ runLogData, handleRefresh, showRawLogs }) => {
	return (
		<Card
			style={{
				border: "1px solid #EBEBEB",
				lineHeight: "18px",
				fontSize: "14px",
				marginBottom: "20px",
			}}
		>
			<div
				style={{ justifyContent: "space-between" }}
				className="flex p-4"
			>
				<div>
					<span className="font-16 bold-600">Run on </span>{" "}
					<span>
						{dayjs(runLogData?.run_timestamp).format(
							"D MMM, HH:mm:ss "
						)}
					</span>
				</div>
				<div className="d-flex">
					<div>
						{runLogData?.workflow_status === "pending" ? (
							<ProgressBarLoader height={25} width={25} />
						) : runLogData?.workflow_status === "completed" ? (
							<img src={completedIcon} />
						) : runLogData?.workflow_status === "failed" ? (
							<img src={failedIcon} />
						) : runLogData?.workflow_status ===
						  "completed_with_errors" ? (
							<img src={info} />
						) : null}
					</div>
					<div className="ml-1 text-capitalize">
						{runLogData?.workflow_status === "pending"
							? "In Progress"
							: runLogData?.workflow_status ===
							  "completed_with_errors"
							? "Completed with Errors"
							: runLogData?.workflow_status}
					</div>
					<div>
						<button
							className="mr-1"
							onClick={(e) => handleRefresh(true, true)}
							style={{
								width: "auto",
								backgroundColor: "transparent",
								border: "none",
							}}
						>
							<OverlayTrigger
								placement="left"
								isStickyTooltip
								overlay={
									<Tooltip>Refresh status of actions</Tooltip>
								}
							>
								<img
									className=" m-auto"
									style={{ width: "15px" }}
									src={refresh_icon}
								/>
							</OverlayTrigger>
						</button>
					</div>
				</div>
			</div>
			<hr
				style={{
					marginTop: "0px",
					marginBottom: "0px",
				}}
			/>
			<div
				style={{ justifyContent: "initial" }}
				className="overview__top__next"
			>
				<div className="overview__top__next__ins mr-5">
					<div
						style={{ color: "#484848" }}
						className="overview__top__next__ins1"
					>
						Total Actions
					</div>
					<div className="overview__top__next__ins2">
						{runLogData?.total_actions_count || 0}
					</div>
				</div>
				<div className="overview__top__next__ins mr-5">
					<div
						style={{ color: "#484848" }}
						className="overview__top__next__ins1"
					>
						Run by
					</div>
					<div className="overview__top__next__ins2 text-capitalize">
						{runLogData?.run_by_user_logo ? (
							<img
								className="status_user_logo"
								src={runLogData?.run_by_user_logo}
							/>
						) : (
							<NameBadge
								name={runLogData?.run_by_user_name}
								className="status_user_logo"
							/>
						)}
						{runLogData?.run_by_user_name}
					</div>
				</div>
				<div className="overview__top__next__ins mr-5">
					<div
						style={{ color: "#484848" }}
						className="overview__top__next__ins1"
					>
						Selected users
					</div>
					<div
						style={{
							backgroundColor: "#F4F6FA",
							borderRadius: "34px",
							padding: "8px",
						}}
						className="overview__top__next__ins2 font-16 bold-500 text-capitalize"
					>
						<span className="mr-1">
							{runLogData?.run_for_user_logo ? (
								<img
									className="status_user_logo"
									src={runLogData?.run_for_user_logo}
								/>
							) : (
								<NameBadge
									name={runLogData?.run_for_user_name}
									className="status_user_logo"
								/>
							)}
						</span>
						{runLogData?.run_for_user_name}
					</div>
				</div>
			</div>
		</Card>
	);
};

export default RunLogHeader;
