import React from "react";

import { TabNavItemApps } from "./TabsNavItemApps";

export function TabsAllDepartments() {
	return (
		<ul className="nav nav-tabs">
			<TabNavItemApps hash="#overviewdep" text="Overview" />
			<TabNavItemApps hash="#applications" text="Applications" />
			<TabNavItemApps hash="#users" text="Users" />
		</ul>
	);
}
