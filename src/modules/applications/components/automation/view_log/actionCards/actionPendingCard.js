import React from "react";
import pending2 from "assets/pending_no_bg.svg";
import dayjs from "dayjs";
export const ActionPendingCard = ({
	title,
	description,
	handleRunAction,
	logData,
	scheduleTimestamp,
}) => {
	return (
		<div
			style={{
				flexDirection: "column",
			}}
			className="flex p-2"
		>
			{title && (
				<div className="font-12 bold-600 ml-1">
					<span>
						<img className="border-less-icon" src={pending2} />
					</span>
					{title}
					{scheduleTimestamp
						? dayjs(scheduleTimestamp).format(" D MMM, HH:mm ")
						: ""}
				</div>
			)}
			{description && (
				<div
					style={{
						color: "#717171",
					}}
					className="font-11 my-2 ml-3"
				>
					{description}
				</div>
			)}
			{logData?.action_log.length !== 0 &&
				logData?.action_type === "manual" && (
					<div className="ml-3">
						<span
							onClick={() => {
								handleRunAction(logData, "sendReminder");
							}}
							className="mr-4 primary-color font-12 cursor-pointer"
						>
							Send Reminder
						</span>
						<span
							onClick={() =>
								handleRunAction(logData, "reassignTask")
							}
							className="mr-4 primary-color font-12 cursor-pointer"
						>
							Reassign
						</span>
					</div>
				)}
		</div>
	);
};
