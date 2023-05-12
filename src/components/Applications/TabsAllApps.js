import { Beta } from "modules/shared/components/BetaTagAndModal/Beta/beta";
import React from "react";

import { TabNavItemApps } from "./TabsNavItemApps";

export function TabsAllApps({ org_beta_features }) {
	return (
		<ul className="nav nav-tabs">
			<TabNavItemApps hash="#overview" text="Overview" />
			<TabNavItemApps hash="#users" text="Users" />
			<TabNavItemApps hash="#licenses" text="Licenses" />
			<TabNavItemApps hash="#transactions" text="Spends" />
			{org_beta_features?.includes("optimization") && (
				<TabNavItemApps hash="#optimization" text="Optimization" />
			)}
			<TabNavItemApps hash="#appInsights" text="App Insights" />
			{org_beta_features?.includes("automation") && (
				<TabNavItemApps
					hash="#automation"
					text={<Beta text="Automation" />}
				/>
			)}
			<TabNavItemApps hash="#security" text="Security & Compliance" />
		</ul>
	);
}
