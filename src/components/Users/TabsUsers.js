import React from "react";
import { useLocation } from "react-router-dom";
import { TabNavItem } from "./TabNavItemUsers";

export function TabsUsers(props) {
	const location = useLocation();
	return (
		<ul className="nav nav-tabs">
			<TabNavItem hash="#overview" text="Overview" />
			<TabNavItem hash="#applications" text="Applications" />
			{(props.userAccountType === "group" ||
				location.hash === "#accessedby") && (
				<TabNavItem hash="#accessedby" text="Accessed By" />
			)}
		</ul>
	);
}
