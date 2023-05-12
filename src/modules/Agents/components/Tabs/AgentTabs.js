import React from "react";
import { TabNavItem } from "./TabNavItem";

export function AgentsTabs() {
    return (
        <ul className="nav nav-tabs">
            <TabNavItem hash="#overview" text="Overview" />
            <TabNavItem hash="#users" text="Users" />
        </ul>
    );
}
