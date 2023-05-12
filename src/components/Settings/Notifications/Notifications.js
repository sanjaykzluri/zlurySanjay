import React from "react";
import { getValueFromLocalStorage } from "utils/localStorage";
import "./Notifications.css";
import { NotificationsTable } from "./NotificationsTable";

const partner = getValueFromLocalStorage("partner");
const data = [
	{
		id: "1",
		type: `${partner?.name} Summary Updates`,
	},
	{
		id: "2",
		type: "Product Usage Guides",
	},
	{
		id: "3",
		type: "Security Updates",
	},
	{
		id: "4",
		type: "Product Update Notifications",
	},
	{
		id: "5",
		type: "Usual Trend Alerts",
	},
	{
		id: "6",
		type: "Optimization Recommendations",
	},
];
export function Notifications() {
	return (
		<>
			<div className="acc__cont">
				<div className="acc__cont__d1">User Notifications</div>
				<div className="ca__cont__d1">
					Please select the types of notifications you wish to receive
					alerts for.
				</div>
				<div className="notif__table">
					<NotificationsTable />
				</div>
			</div>
		</>
	);
}
