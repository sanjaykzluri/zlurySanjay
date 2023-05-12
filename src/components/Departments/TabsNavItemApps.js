import { NavItem } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import React from "react";

export function TabNavItemApps(props) {
	return (
		<NavItem>
			<NavLink
				exact
				isActive={(_, location) => location.hash === props.hash}
				to={props.hash}
				className="nav-link"
				activeClassName="active"
			>
				{props.text}
			</NavLink>
		</NavItem>
	);
}
