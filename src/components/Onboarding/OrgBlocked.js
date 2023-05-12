import React from "react";
import "./Onboarding.css";
import { SidebarLogin } from "../Sidebarlogin/SidebarLogin";
import blocked from "./blocked.svg";

export function OrgBlocked() {
	const description = {
		color: "#B5B5B5",
		fontSize: "18px",
	};

	const heading = {
		color: "#222222",
		fontSize: "26px",
	};

	return (
		<SidebarLogin>
			<div className="d-flex flex-column h-100">
				<div className="m-auto align-items-center d-flex flex-column">
					<img src={blocked}></img>
					<h5 style={heading} className="text-center">
						Your organization has been blocked
					</h5>
					<p style={description} className="text-center">
						Contact our support for help
					</p>
					<a
						href="https://help.zluri.com"
						target="_blank"
						rel="noreferrer"
						style={{ fontSize: "14px" }}
						className="btn btn-primary mt-2 pl-3 pr-3 pt-2 pb-2"
					>
						Contact Support
					</a>
				</div>
			</div>
		</SidebarLogin>
	);
}
