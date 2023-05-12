import React from "react";
import { TabNavItem } from "./TabNavItem";

export function SecurityTabs() {
    return (
        <ul className="nav nav-tabs">
            <TabNavItem hash="#criticalapps" text="Critical Apps" />
            <TabNavItem hash="#criticalusers" text="Critical Users" />
        </ul>
    );
}
