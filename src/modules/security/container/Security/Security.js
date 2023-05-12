import React, { useCallback, useContext, useEffect, useState } from "react";
import { PageHeader } from "../../../shared/components/PageHeader/PageHeader";
import { SecurityTabs } from "../../components/Tabs/SecurityTabs";
import { CriticalApps } from "../../components/CriticalApps/CriticalApps";
import { CriticalUsers } from "../../components/CriticalUsers/CriticalUsers";
import "./Security.css";
import { useLocation, useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";
import RoleContext from "../../../../services/roleContext/roleContext";
import UnauthorizedToView from "../../../../common/restrictions/UnauthorizedToView";
import { userRoles } from "../../../../constants/userRole";
import HeaderTitleBC from "../../../../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { getValueFromLocalStorage } from "utils/localStorage";

export function Security(props) {
	const { userRole } = useContext(RoleContext);
	const location = useLocation();
	const history = useHistory();

	useEffect(() => {
		if (!location.hash.slice(1)) history.push("#criticalapps");
	}, [location, history]);

	return (
		<>
			{userRole === userRoles.FINANCE_ADMIN ||
				userRole === userRoles.PROCUREMENT_ADMIN ||
				userRole === userRoles.INTEGRATION_ADMIN ? (
				<UnauthorizedToView />
			) : (
				<>
					<HeaderTitleBC title="Security" />
					<div style={{ padding: "0px 40px" }}>
						<SecurityTabs></SecurityTabs>
					</div>
					{location.hash === "#criticalapps" && (
						<>
							<Helmet>
								<title>{`Critical Apps - ${getValueFromLocalStorage("userInfo")
									.org_name || "Security"
									} - ${getValueFromLocalStorage("partner")?.name
									}`}</title>
							</Helmet>
							<CriticalApps />
						</>
					)}
					{location.hash === "#criticalusers" && (
						<>
							<Helmet>
								<title>{`Critical Users - ${getValueFromLocalStorage("userInfo")
									.org_name || "Security"
									} - ${getValueFromLocalStorage("partner")?.name
									}`}</title>
							</Helmet>
							<CriticalUsers />
						</>
					)}
				</>
			)}
		</>
	);
}
