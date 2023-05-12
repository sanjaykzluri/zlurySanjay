import React from "react";

import { TabNavItem } from "../Transactions/TabNavItem";

export function IntegrationsTabs() {
	return (
		<ul className="nav nav-tabs">
			<TabNavItem hash="#appinfo" text="App Info" />
			<TabNavItem hash="#usermapping" text="User Mapping" />
		</ul>
	);
}
