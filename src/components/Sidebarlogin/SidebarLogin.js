import React from "react";
import ReactSidebar from "react-sidebar";
import { SidebarLoginContent } from "./SidebarLoginContent";

export function SidebarLogin(props) {
	return (
		<ReactSidebar
			sidebar={<SidebarLoginContent />}
			docked
			shadow={false}
			transitions={true}
			open
			styles={{ sidebar: { background: "white" } }}
		>
			{props.children}
		</ReactSidebar>
	);
}
