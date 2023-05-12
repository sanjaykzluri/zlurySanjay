import React from "react";
import { Helmet } from "react-helmet";
import { NavLink, useLocation } from "react-router-dom";
import editcolumns from "assets/applications/editcolumns.svg";
import { NavItem } from "react-bootstrap";
import { getValueFromLocalStorage } from "utils/localStorage";

export const APPLICATION_REQUISITION_TABS = {
	requests: "Your Requests",
	approvals: "Approvals",
};

export const ADMIN_APPLICATION_REQUISITION_TABS = {
	completed: "Completed",
	pending: "Pending Requests",
	rules: "Automation Rules",
};
const options = [
	{
		name: "pending",
		isAdmin: true,
	},
	{
		name: "completed",
		isAdmin: true,
	},
	{
		name: "requests",
		isAdmin: false,
	},
	{
		name: "approvals",
		isAdmin: false,
	},
	{
		name: "rules",
		isAdmin: true,
	},
];

export function TabsAppRequisition({ setShowSideModal, appTabCount, isAdmin }) {
	const location = useLocation();

	return (
		<div style={{ padding: "0 40px" }}>
			<Helmet>
				<title>{`Applications Overview - ${
					getValueFromLocalStorage("userInfo")?.org_name || ""
				} - ${getValueFromLocalStorage("partner")?.name}`}</title>
			</Helmet>
			<ul className="nav nav-tabs">
				{options
					?.filter((option) =>
						isAdmin ? option.isAdmin : !option.isAdmin
					)
					.map((option) => (
						<NavItem>
							<NavLink
								exact
								isActive={(_, location) =>
									location.hash === `#${option.name}`
								}
								to={`#${option.name}`}
								className="d-flex nav-link"
								activeClassName="active"
							>
								<div style={{ marginRight: "4px" }}>
									{isAdmin
										? ADMIN_APPLICATION_REQUISITION_TABS[
												option.name
										  ]
										: APPLICATION_REQUISITION_TABS[
												option.name
										  ]}
								</div>
							</NavLink>
						</NavItem>
					))}
			</ul>
		</div>
	);
}
