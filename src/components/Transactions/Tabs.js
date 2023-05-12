import React from "react";
import "./Tabs.scss";
import { TabNavItem } from "./TabNavItem";

export function Tabs() {
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
			<TabNavItem hash="#payment-methods" text="Payment Methods" />
			<TabNavItem hash="#uploads" text="Uploads" />
		</ul>
	);
}
