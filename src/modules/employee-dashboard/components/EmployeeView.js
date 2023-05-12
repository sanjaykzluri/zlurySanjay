import ProtectedRoute from "common/ProtectedRoute";
import UnauthorizedToView from "common/restrictions/UnauthorizedToView";
import React from "react";
import { useSelector } from "react-redux";
import { Route } from "react-router-dom";


export default function EmployeeView({ children }) {
	const isEmployeeDashboardEnabled  = useSelector(state => state?.userInfo?.employee_dashboard_enabled)

	return (
		<Route
			path="/user"
			render={() =>
				isEmployeeDashboardEnabled ? (
					children
				) : (
					<div className="m-auto">
						<UnauthorizedToView height="100vh" />
					</div>
				)
			}
		/>
	);
}
