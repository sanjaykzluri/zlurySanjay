import { NavItem } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import React from "react";

export function TabNavItemApps(props) {
	return (
		<NavItem>
			<NavLink
				exact
				isActive={(_, location) => location.hash === props.hash}
				to={props.to || props.hash}
				className="nav-link"
				activeClassName="active"
				onClick={(e) =>
					window.location.hash === props.hash && e.preventDefault()
				}
			>
				{props.text}
			</NavLink>
		</NavItem>
	);
}
