import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Suspense } from "react";
import { Loader } from "common/Loader/Loader";
import AdminView from "modules/shared/containers/ViewSelector/AdminView";
import EmployeeView from "../../../employee-dashboard/components/EmployeeView";
import "App.css";
import { useEffect } from "react";

const App = React.lazy(() => import("App"));
const EmployeeDashboard = React.lazy(() =>
	import("modules/employee-dashboard/containers/EmployeeDashboard")
);

export default function ViewSelector() {
	const { isLoading, getAccessTokenSilently } = useAuth0();
	window.getAccessTokenSilently = getAccessTokenSilently;

	return (
		<>
			<Suspense
				fallback={
					<div
						className="d-flex align-items-center"
						style={{ height: "100vh" }}
					>
						<Loader width={100} height={100} />
					</div>
				}
			>
				<AdminView isRoot>
					<App isLoading={isLoading} />
				</AdminView>
				<EmployeeView>
					<EmployeeDashboard isLoading={isLoading} />
				</EmployeeView>
			</Suspense>
		</>
	);
}
