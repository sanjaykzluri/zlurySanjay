import React, { useContext, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { TabsUsers } from "../components/Users/TabsUsers";
import { AppsUsers } from "../components/Users/Applications/Applications";
import { Helmet } from "react-helmet";
import { GlobalError } from "../common/GlobalError";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetails as UserDetails } from "../components/Users/redux";
import RestrictedContent from "../common/restrictions/RestrictedContent";
import { ENTITIES } from "../constants";
import { AccessedByUsers } from "../components/Users/AccessedBy/AccessedBy";
import RoleContext from "../services/roleContext/roleContext";
import UnauthorizedToView from "../common/restrictions/UnauthorizedToView";
import { userRoles } from "../constants/userRole";
import { UserOverview } from "../modules/users/Overview/Container/UserOverview";
import HeaderTitleBC from "../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { trackPageSegment } from "modules/shared/utils/segment";
import { getValueFromLocalStorage } from "utils/localStorage";

export function UsersInfo() {
	const { userRole } = useContext(RoleContext);
	const location = useLocation();
	const history = useHistory();
	const dispatch = useDispatch();
	const user = useSelector((state) => state.user);
	const [userInfo, setUserInfo] = useState();
	const [userId, setUserId] = useState(location.pathname.split("/")[2]);
	const [userAccountType, setUserAccountType] = useState("");

	const { user_tabs } = useSelector((state) => state.userInfo);
	const defaultTab = user_tabs.find((tab) => tab.isDefault);

	useEffect(() => {
		if (location.state) {
			setUserAccountType(location.state.user_account_type);
		}
		const hash = location.hash.slice(1);
		if (!hash) history.push("#overview");
		if (location.hash === "#overview") {
			handleUserChange();
		}
		setUserId(location.pathname.split("/")[2]);
		trackPageSegment("Users", `Single User ${location.hash.substring(1)}`, {
			userId: location.pathname.split("/")[2],
			appName: user?.user_name || "",
		});
	}, [location]);

	const fetchUserDetails = () => {
		const id = location.pathname.split("/")[2];
		dispatch(UserDetails(id));
	};

	useEffect(() => {
		if (user) {
			setUserInfo(user);
		}
	}, [user]);

	useEffect(() => {
		handleUserChange();
	}, [userId]);

	const handleUserChange = () => {
		setUserInfo();
		fetchUserDetails();
	};

	const userAccountTypeChangedFromOverview = (newUserType) => {
		setUserAccountType(newUserType);
	};
	return (
		<>
			{userRole === userRoles.FINANCE_ADMIN ||
			userRole === userRoles.PROCUREMENT_ADMIN ||
			userRole === userRoles.INTEGRATION_ADMIN ||
			userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView />
			) : (
				<>
					<Helmet>
						<title>
							{user?.user_name +
								" - " +
								(location.hash === "#overview"
									? getValueFromLocalStorage("userInfo")
											.org_name
									: "Applications ") +
								" - " +
								getValueFromLocalStorage("partner")?.name}
						</title>
					</Helmet>
					<HeaderTitleBC
						title="Users"
						inner_screen={true}
						go_back_url={`/users#${defaultTab.name}`}
						entity_name={userInfo?.user_name}
						entity_logo={userInfo?.user_profile_img}
					/>
					<div style={{ padding: "0px 40px" }}>
						<TabsUsers
							userAccountType={
								userAccountType || user.user_account_type
							}
						/>
					</div>
					{location.hash === "#overview" || "" ? (
						user ? (
							<UserOverview
								onUserChange={handleUserChange}
								user={user?.user_name}
								userAccountTypeChangedFromOverview={
									userAccountTypeChangedFromOverview
								}
							/>
						) : (
							<GlobalError />
						)
					) : null}
					{location.hash === "#applications" && (
						<RestrictedContent entity={ENTITIES.USER_APPS}>
							<AppsUsers
								user_name={user?.user_name}
								user_image={user?.user_profile_img}
							/>
						</RestrictedContent>
					)}
					{location.hash === "#accessedby" && (
						<AccessedByUsers></AccessedByUsers>
					)}
				</>
			)}
		</>
	);
}
