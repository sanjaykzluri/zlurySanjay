import { NavItem } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { getValueFromLocalStorage } from "../../utils/localStorage";

/**
 * Pass props tabs as follows
 * [{ name: "string", url:"string", component:<Component/> }]
 */

export function NavTabs(props) {
	const [activeTab, setActiveTab] = useState(null);
	const navLinks = props.tabs.map((item, index) => {
		return item ? (
			<NavItem key={index}>
				<NavLink
					exact
					isActive={(_, location) => {
						if (location.hash === item.url) {
							setActiveTab(item);
							return true;
						}
					}}
					to={item.url}
					className="nav-link pl-0"
					activeClassName="active"
				>
					{item.name}
				</NavLink>
			</NavItem>
		) : null;
	});
	return (
		<>
			<div>
				{activeTab && props.updateTitle && (
					<Helmet>
						<title>
							{`${activeTab.name} - ${
								getValueFromLocalStorage("userInfo")?.org_name
							} - ${getValueFromLocalStorage("partner")?.name}`}
						</title>
					</Helmet>
				)}
				<div className="z__tabs">
					<ul className="nav nav-tabs">{navLinks}</ul>
					<div className="z__tab_content">{activeTab?.component}</div>
				</div>
			</div>
		</>
	);
}
