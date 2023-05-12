import React, { useContext, useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import HeaderTitleBC from "components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { userRoles } from "constants/userRole";
import UnauthorizedToView from "common/restrictions/UnauthorizedToView";
import RoleContext from "services/roleContext/roleContext";
import { TabsAppRequisition } from "../components/TabsAppRequisition";
import { AppRequests } from "../components/AppRequests";
import {
	appRequestsPropertiesList,
	appRequestsPropertiesListForAdmin,
	getAppRequisitionApprovalsList,
	getAppRequisitionRequestList,
	getCompletedAppRequestListForAdmin,
	getPendingAppRequestListForAdmin,
	searchApprovalsAppRequisition,
	searchCompletedAppRequestsListForAdmin,
	searchPendingAppRequestsListForAdmin,
	searchRequestsAppRequisition,
} from "services/api/employeeDashboard";
import AutomationRulesTableNew from "../components/AutomationsRulesTableNew";

export function AppRequisition({ isAdmin }) {
	const location = useLocation();
	const history = useHistory();
	const dispatch = useDispatch();
	const [activeTab, setActiveTab] = useState(location.hash.slice(1));
	const { userRole } = useContext(RoleContext);
	const { userInfo } = useSelector((state) => state);
	useEffect(() => {
		const hash = location.hash.slice(1);
		if (!hash) {
			history.push("#pending");
		} else setActiveTab(hash);
	}, [location]);

	return (
		<>
			<>
				<HeaderTitleBC inner_screen={false} title="App Requisition" />
				<TabsAppRequisition isAdmin={isAdmin} />
				{activeTab === "rules" ? (
					<>
						<AutomationRulesTableNew apprequisition />
					</>
				) : (
					<AppRequests
						screenTagKey={activeTab}
						key={activeTab}
						isAdmin={isAdmin}
						api={
							isAdmin
								? activeTab === "pending"
									? getPendingAppRequestListForAdmin
									: getCompletedAppRequestListForAdmin
								: activeTab === "requests"
								? getAppRequisitionRequestList
								: getAppRequisitionApprovalsList
						}
						searchAPI={
							isAdmin
								? activeTab === "pending"
									? searchPendingAppRequestsListForAdmin
									: searchCompletedAppRequestsListForAdmin
								: activeTab === "requests"
								? searchRequestsAppRequisition
								: searchApprovalsAppRequisition
						}
						propertiesListAPI={
							isAdmin
								? appRequestsPropertiesListForAdmin
								: appRequestsPropertiesList
						}
					/>
				)}
			</>
		</>
	);
}
