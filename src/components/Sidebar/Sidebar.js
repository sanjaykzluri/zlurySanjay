import React, { useContext, useEffect, useState } from "react";
import ReactSidebar from "react-sidebar";
import PropTypes from "prop-types";
import { SidebarContent } from "./SidebarContent";
import { useSelector } from "react-redux";
import MobileScreen from "../../common/mobileScreen";
import { useMediaQuery } from "react-responsive";
import AdminView from "modules/shared/containers/ViewSelector/AdminView";
import EmployeeView from "modules/employee-dashboard/components/EmployeeView";
import { EmployeeSidebarContent } from "modules/employee-dashboard/containers/EmployeeSidebarContent";
import RoleContext from "services/roleContext/roleContext";
import { PARTNER } from "modules/shared/constants/app.constants";

export function Sidebar(props) {
	const [transitions, setTransitions] = useState(false);
	const [docked, setDocked] = useState(true);
	const { scroll } = useSelector((state) => state.ui);
	const isMobileScreen = useMediaQuery({ query: `(max-width: 900px)` });
	const { partner } = useContext(RoleContext);

	useEffect(() => {
		setTransitions(true);
	}, []);

	useEffect(() => {
		if (
			window.location.pathname === "/checkAuth" ||
			window.location.pathname === "/login" ||
			window.location.pathname === "/logout"
		)
			setDocked(false);
		else {
			setDocked(true);
		}
	}, [window.location.pathname]);

	return (
		<>
			{isMobileScreen && partner?.name === PARTNER.ZLURI.name ? (
				<MobileScreen />
			) : (
				<ReactSidebar
					sidebar={
						<>
							<AdminView>
								<SidebarContent />
							</AdminView>
							<EmployeeView>
								<EmployeeSidebarContent />
							</EmployeeView>
						</>
					}
					sidebarClassName="sidebar"
					docked={docked}
					open={docked}
					transitions={transitions}
					shadow={false}
					styles={{
						sidebar: { background: "#2266e2" },
						content: {
							overflowY: scroll ? "auto" : "hidden",
							overflowX: "hidden",
						},
					}}
				>
					{props.children}
				</ReactSidebar>
			)}
		</>
	);
}

Sidebar.propTypes = {
	children: PropTypes.element,
};
