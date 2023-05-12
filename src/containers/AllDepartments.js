import React, { useContext, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { TabsAllDepartments } from "../components/Departments/TabsAllDepartments";
import { OverviewDepartment } from "../components/Departments/Overview/OverviewDepartment";
import { ApplicationDepartment } from "../components/Departments/Applications/ApplicationDep";
import { UsersDep } from "../components/Departments/Users/UsersDep";
import { getDepartmentInfo } from "../services/api/departments";
import { Helmet } from "react-helmet";
import { GlobalError } from "../common/GlobalError";
import RestrictedContent from "../common/restrictions/RestrictedContent";
import { ENTITIES } from "../constants";
import UnauthorizedToView from "../common/restrictions/UnauthorizedToView";
import RoleContext from "../services/roleContext/roleContext";
import { userRoles } from "../constants/userRole";
import HeaderTitleBC from "../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { getValueFromLocalStorage } from "utils/localStorage";

export function AllDepartments() {
	const { userRole } = useContext(RoleContext);
	const location = useLocation();
	const history = useHistory();
	const [department, setDepartment] = useState();
	const [isFetching, setIsFetching] = useState(true);

	useEffect(() => {
		if (!department?.department_id || location.hash === "#overviewdep")
			fetchDepartmentInfo();
		const hash = location.hash.slice(1);
		if (!hash) history.push("#overviewdep");
	}, [location]);

	const fetchDepartmentInfo = () => {
		const id = location.pathname.split("/")[2];
		setIsFetching(true);
		getDepartmentInfo(id)
			.then((res) => {
				setIsFetching(false);
				if (!res.error) setDepartment(res);
				else throw new Error(res.error);
			})
			.catch((err) => {
				setIsFetching(false);
				console.error("Error fetching department info:", err);
			});
	};

	const handleDepartmentChange = () => {
		setDepartment();
		fetchDepartmentInfo();
	};

	return (
		<>
			{userRole === userRoles.PROCUREMENT_ADMIN ||
			userRole === userRoles.INTEGRATION_ADMIN ||
			userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView />
			) : (
				<>
					<Helmet>
						<title>
							{location.hash === "#overviewdep"
								? department?.department_name +
								  " - Overview - " +
								  getValueFromLocalStorage("userInfo")
										.org_name +
								  " -  "
								: location.hash === "#applications"
								? department?.department_name +
								  " - Applications - " +
								  getValueFromLocalStorage("partner")?.name
								: location.hash === "#users"
								? department?.department_name +
								  " - Users - " +
								  getValueFromLocalStorage("partner")?.name
								: "Departments Overview - " +
								  getValueFromLocalStorage("userInfo")
										.org_name +
								  " - " +
								  getValueFromLocalStorage("partner")?.name}
						</title>
					</Helmet>
					<HeaderTitleBC
						title="Departments"
						inner_screen={true}
						go_back_url="/departments"
						entity_name={department?.department_name}
					/>
					<div style={{ padding: "0px 40px" }}>
						<TabsAllDepartments />
					</div>
					{location.hash === "#overviewdep" || "" ? (
						department || isFetching ? (
							<OverviewDepartment
								department={department}
								onDepartmentChange={handleDepartmentChange}
							/>
						) : (
							<GlobalError />
						)
					) : null}
					{location.hash === "#applications" ? (
						<RestrictedContent
							entity={ENTITIES.DEPARTMENT_APPLICATIONS}
						>
							<ApplicationDepartment
								department={department?.department_name}
								department_id={department?.department_id}
							/>
						</RestrictedContent>
					) : null}
					{location.hash === "#users" ? (
						<RestrictedContent entity={ENTITIES.DEPARTMENT_USERS}>
							<UsersDep
								department={department?.department_name}
							/>
						</RestrictedContent>
					) : null}
				</>
			)}
		</>
	);
}
