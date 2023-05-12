import React from "react";

import { TabNavItemApps } from "../../../TabsNavItemApps"

export function SingleVendorTabs() {
    return (
        <ul className="nav nav-tabs">
            <TabNavItemApps hash="#overview" text="Overview" />
            <TabNavItemApps hash="#contracts" text="Contracts" />
        </ul>
    );
}
