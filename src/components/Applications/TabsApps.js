import React from "react";
import { Helmet } from "react-helmet";
import { NavLink, useLocation } from "react-router-dom";
import editcolumns from "../../assets/applications/editcolumns.svg";
import { APPLICATION_TABS } from "../../constants";
import { NavItem } from "react-bootstrap";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import { getValueFromLocalStorage } from "utils/localStorage";

export function TabsApps({ options, setShowSideModal, appTabCount }) {
	const location = useLocation();

	const tabCount = (authStatus) => {
		let count;
		if (authStatus === "managed") {
			count =
				appTabCount &&
				Array.isArray(appTabCount) &&
				appTabCount
					.filter(
						(el) =>
							el &&
							el._id &&
							el._id !== "unmanaged" &&
							el._id.includes(authStatus)
					)
					.reduce(function (sum, current) {
						return sum + current.count;
					}, 0);
		} else {
			count =
				(appTabCount &&
					Array.isArray(appTabCount) &&
					appTabCount.find(
						(el) =>
							el &&
							el._id &&
							el._id === authStatus.replaceAll("_", " ")
					)?.count) ||
				0;
		}

		return count;
	};

	return (
		<div style={{ padding: "0 40px" }}>
			<Helmet>
				<title>{`Applications Overview - ${
					getValueFromLocalStorage("userInfo")?.org_name || ""
				} - ${getValueFromLocalStorage("partner")?.name}`}</title>
			</Helmet>
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
									{APPLICATION_TABS[option.name]}
								</div>
								{appTabCount && Array.isArray(appTabCount) && (
									<NumberPill
										number={tabCount(option.name) || 0}
										fontColor={
											option.name === "needs_review"
												? "#FE6955"
												: location.hash ===
												  `#${option.name}`
												? "#2266E2"
												: "#717171"
										}
										fontSize="10px"
										fontWeight="600"
										pillBackGround={
											option.name === "needs_review"
												? "rgba(254, 105, 85, 0.2)"
												: location.hash ===
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
				/>
			</ul>
		</div>
	);
}
