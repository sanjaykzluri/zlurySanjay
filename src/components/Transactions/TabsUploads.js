import React from "react";
import "./Tabs.scss";
import { TabNavItem } from "./TabNavItem";

export function TabsUploads() {
	return (
		<ul className="nav nav-tabs">
			<TabNavItem
				className="recognisedSpellChange"
				hash="#recognised"
				text="Recognised"
			/>
			<TabNavItem
				className="unrecognisedSpellChange"
				hash="#unrecognised"
				text="Unrecognised"
			/>
			<TabNavItem hash="#archived" text="Archived" />
		</ul>
	);
}
