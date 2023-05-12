import React, { useCallback, useContext, useEffect, useState } from "react";
import { PageHeader } from "../../shared/components/PageHeader/PageHeader";
import { AgentsTabs } from "../components/Tabs/AgentTabs";
import { AgentsOverview } from "../components/AgentsOverview/AgentsOverview";
import { AgentsUsers } from "../components/AgentsUsers/AgentsUsers";

import { useLocation, useHistory } from "react-router-dom";
import RoleContext from "../../../services/roleContext/roleContext";
import UnauthorizedToView from "../../../common/restrictions/UnauthorizedToView";
import { userRoles } from "../../../constants/userRole";
import HeaderTitleBC from "../../../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { AgentsUsersV2 } from "../components/AgentsUsers/AgentUsersV2";

export function NewAgents(props) {
	const { userRole } = useContext(RoleContext);
	const location = useLocation();
	const history = useHistory();

	useEffect(() => {
		if (!location.hash.slice(1)) history.push("#overview");
	}, [location, history]);

	return (
		<>
			{userRole === userRoles.FINANCE_ADMIN ||
			userRole === userRoles.PROCUREMENT_ADMIN ||
			userRole === userRoles.INTEGRATION_ADMIN ||
			userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView />
			) : (
				<>
					<HeaderTitleBC title="Agents" />
					<div style={{ padding: "0px 40px" }}>
						<AgentsTabs></AgentsTabs>
					</div>
					{location.hash === "#overview" ? (
						<>
							<AgentsOverview />
						</>
					) : null}
					{location.hash === "#users" ? (
						<>
							<AgentsUsersV2 />
						</>
					) : null}
				</>
			)}
		</>
	);
}
