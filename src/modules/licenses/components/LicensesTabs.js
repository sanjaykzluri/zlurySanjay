import React from "react";
import { NavItem } from "react-bootstrap";
import { NavLink, useLocation } from "react-router-dom";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import { capitalizeFirstLetter } from "utils/common";

export function LicensesTabs({ licenseTabCount }) {
	const location = useLocation();

	const tabCount = (entity) => {
		let count = 0;
		count =
			(licenseTabCount &&
				Array.isArray(licenseTabCount) &&
				licenseTabCount.find(
					(el) => el && el._id && el._id === entity?.slice(0, -1)
				)?.count) ||
			0;

		return count;
	};

	const tabTextAndHash = [
		{ hash: "#allLicenses", text: "licenses" },
		{ hash: "#allSubscriptions", text: "subscriptions" },
		{ hash: "#allContracts", text: "contracts" },
		{ hash: "#allPerpetualContracts", text: "perpetuals" },
	];

	return (
		<ul className="nav nav-tabs">
			{tabTextAndHash.map((tab) => (
				<NavItem>
					<NavLink
						exact
						isActive={(_, location) =>
							location.hash === `${tab.hash}`
						}
						to={`${tab.hash}`}
						className="d-flex nav-link"
						activeClassName="active"
					>
						<div style={{ marginRight: "4px" }}>
							{capitalizeFirstLetter(tab.text)}
						</div>
						{licenseTabCount && Array.isArray(licenseTabCount) && (
							<NumberPill
								number={tabCount(tab.text)}
								fontColor={
									location.hash === `${tab.hash}`
										? "#2266E2"
										: "#717171"
								}
								fontSize="10px"
								fontWeight="600"
								pillBackGround={
									location.hash === `${tab.hash}`
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
		</ul>
	);
}
