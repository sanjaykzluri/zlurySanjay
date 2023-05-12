import React, { useState, useEffect } from "react";
import "./SidebarLogin.css";
import { Logo } from "../Logo/Logo";
import { NavLink } from "react-bootstrap";
import overview from "../../assets/sidebar/overview.svg";
import applications from "../../assets/sidebar/applications.svg";
import users from "../../assets/sidebar/users.svg";
import departments from "../../assets/sidebar/departments.svg";
import transactions from "../../assets/sidebar/transactions.svg";
import help from "../../assets/sidebar/help.svg";
import settings from "../../assets/sidebar/settings.svg";
import integrations from "../../assets/sidebar/integrations.svg";

export function SidebarLoginContent() {
	return (
		<div className="sidebarlogin__outer">
			<div className="sidebarlogin__logo">
				<Logo light />
			</div>
			<div className="sidebarlogin__line" />
			<div className="sidebarlogin__list-upper app-flex-col center">
				<ul>
					<li>
						<div></div>
					</li>
					<li>
						<div></div>
					</li>
				</ul>
			</div>
		</div>
	);
}
