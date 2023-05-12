import React, { useState } from "react";
import notification_off from "assets/notification_off.svg";
import reminderBell from "assets/licenses/reminderbell.svg";
import { TriggerIssue } from "utils/sentry";
import { patchApplication } from "services/api/applications";

export default function AppNotificationCell({ data, row, refresh }) {
	const [loading, setLoading] = useState(false);

	const requestAPI = () => {
		setLoading(true);

		const patchObj = {
			patches: [
				{
					op: data ? "replace" : "add",
					field: "notifications",
					value: {
						restricted: data && data?.restricted ? false : true,
					},
				},
			],
		};

		patchApplication(row?._id, patchObj)
			.then((res) => {
				if (res.errors) {
					TriggerIssue(
						"Error updating application notification",
						res.errors
					);
				}
				setLoading(false);
				refresh();
			})
			.catch((err) => {
				TriggerIssue("Error updating application notification", err);
				setLoading(false);
			});
	};

	return (
		<>
			{data && data?.restricted ? (
				<div
					className="notification_column cursor-pointer"
					onClick={requestAPI}
				>
					<img src={reminderBell} /> <span>ON</span>
				</div>
			) : (
				<div
					className="notification_column cursor-pointer"
					onClick={requestAPI}
				>
					<img src={notification_off} /> <span>OFF</span>
				</div>
			)}
		</>
	);
}
