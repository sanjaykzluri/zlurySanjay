import React from "react";
import { NavItem } from "react-bootstrap";
import { Helmet } from "react-helmet";

import { NavLink, useLocation } from "react-router-dom";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import editcolumns from "../../assets/applications/editcolumns.svg";
import { APPLICATION_TABS } from "../../constants";
import { userTabs } from "../../constants/users";
import { TabNavItemApps } from "../Applications/TabsNavItemApps";

export function UsersTabs({ options, setShowSideModal, userTabCount }) {
	const location = useLocation();

	const tabCount = (type) => {
		let count;
		count =
			(userTabCount &&
				Array.isArray(userTabCount) &&
				userTabCount.find((el) => el && el._id && type.includes(el._id))
					?.count) ||
			0;

		return count;
	};

	return (
		<div style={{ padding: "0 40px" }}>
			<ul className="nav nav-tabs">
				{options
					?.filter((option) => option.isActive)
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
									{userTabs[option.name]}
								</div>
								{userTabCount &&
									Array.isArray(userTabCount) && (
										<NumberPill
											number={tabCount(option.name)}
											fontColor={
												location.hash ===
												`#${option.name}`
													? "#2266E2"
													: "#717171"
											}
											fontSize="10px"
											fontWeight="600"
											pillBackGround={
												location.hash ===
												`#${option.name}`
													? "rgba(90, 186, 255, 0.1)"
													: "#EBEBEB"
											}
											pillHeight="18px"
											borderRadius={20}
											pillWidth="25px"
											style={{ padding: "4px" }}
										/>
									)}
							</NavLink>
						</NavItem>
					))}
				<img
					src={editcolumns}
					className="ml-auto cursor-pointer"
					onClick={() => setShowSideModal(true)}
				></img>
			</ul>
		</div>
	);
}
