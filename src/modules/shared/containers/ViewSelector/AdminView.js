import React, { useEffect } from "react";
import { Route } from "react-router-dom";
import img from "assets/favicon-32x32.png";
import { useSelector } from "react-redux";
import UnauthorizedToView from "common/restrictions/UnauthorizedToView";

const commonPaths = [
	"/checkAuth",
	"/login",
	"/logout",
	"/",
	"/integrations/connectInvite",
];

export default function AdminView({ children, isRoot }) {
	const isEmployee = useSelector(
		(state) => state?.userInfo?.user_role === "employee"
	);
	useEffect(() => {
		if (window.location.pathname.split("/")[1] !== "user") {
			const favicon = document.getElementById("favicon");
			favicon.href = img;
		}
	}, []);

	const isAllowed = (location) =>
		location.pathname.split("/")[1] !== "user" &&
		(!isEmployee || commonPaths.find((path) => location.pathname === path));

	return (
		<Route
			render={({ location }) =>
				isAllowed(location) ? (
					children
				) : isRoot && location.pathname.split("/")[1] !== "user" ? (
					<div className="m-auto">
						<UnauthorizedToView />
					</div>
				) : null
			}
		/>
	);
}
