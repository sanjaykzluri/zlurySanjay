import React from "react";
import failed2 from "assets/failed-border-less.svg";
import dayjs from "dayjs";
export const ActionErrorCard = ({
	title,
	description,
	logData,
	handleRunAction,
	retryFailedAction,
	showRetryFailedButtonLoading,
	retryFailedObject,
	scheduleTimestamp,
}) => {
	return (
		<>
			{(title || description) && (
				<div
					style={{
						flexDirection: "column",
					}}
					className="flex p-2"
				>
					<div
						style={{
							color: "#FF6767",
						}}
						className="ml-1 font-12 bold-600 "
					>
						<span>
							<img className="border-less-icon" src={failed2} />
						</span>
						{title}
						{scheduleTimestamp
							? dayjs(scheduleTimestamp).format(" D MMM, HH:mm ")
							: ""}
					</div>
					<div
						style={{
							color: "#717171",
						}}
						className="font-11 my-1 ml-3"
					>
						{description}
					</div>
				</div>
			)}
		</>
	);
};
