import React, { useContext } from "react";
import UnauthorizedToView from "../common/restrictions/UnauthorizedToView";
import { Departmentsins } from "../components/Departments/Departments";
import HeaderTitleBC from "../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { userRoles } from "../constants/userRole";
import RoleContext from "../services/roleContext/roleContext";

export function Departments() {
	const { userRole } = useContext(RoleContext);
	return (
		<>
			{userRole === userRoles.PROCUREMENT_ADMIN ||
			userRole === userRoles.INTEGRATION_ADMIN ||
			userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView />
			) : (
				<>
					<HeaderTitleBC title="Departments" />
					<Departmentsins />
				</>
			)}
		</>
	);
}
