import React from "react";
import { toast } from "react-toastify";
import { TriggerIssue } from "utils/sentry";
import greenTick from "assets/green_tick.svg";
import inactive from "assets/agents/inactive.svg";
import { apiResponseTypes } from "./ApiResponseNotificationConstants";
import DefaultNotificationCard from "common/Notification/PusherNotificationCards/DefaultNotificationCard";

export const ApiResponseNotification = ({
	responseType,
	errorObj,
	title,
	description,
	icon,
	retry,
	children,
}) => {
	toast(
		<DefaultNotificationCard
			notification={{
				title: title || "Records Updated",
				description:
					typeof description === "string"
						? description
						: responseType === apiResponseTypes.ERROR
						? "Server Error! We couldn't complete your request."
						: "The changes might take some time to reflect.",
				icon:
					icon || responseType === apiResponseTypes.ERROR
						? inactive
						: greenTick,
				retry: retry,
			}}
		>
			{children}
		</DefaultNotificationCard>
	);
	if (responseType === apiResponseTypes.ERROR) {
		TriggerIssue(title, errorObj);
	}
};
