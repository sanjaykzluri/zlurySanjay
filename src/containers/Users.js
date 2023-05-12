import { trackPageSegment } from "modules/shared/utils/segment";
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useHistory } from "react-router-dom";
import { getUserTabCount } from "services/api/users";
import { TriggerIssue } from "utils/sentry";
import UnauthorizedToView from "../common/restrictions/UnauthorizedToView";
import { SelectSideModal } from "../common/SelectSideModal";
import HeaderTitleBC from "../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { Usersins } from "../components/Users/Users";
import { UsersOnboardingOffboarding } from "../components/Users/UsersOnboardingOffboarding";
import { UsersTabs } from "../components/Users/UsersTabs";
import { SAVE_USER_INFO_OBJECT } from "../constants/user";
import { userRoles } from "../constants/userRole";
import { updateUserActiveTabs } from "../services/api/applications";
import RoleContext from "../services/roleContext/roleContext";

const onboardingOffboardingTabs = [
	"marked_for_onboarding",
	"marked_for_offboarding",
];

export function Users() {
	const { userRole } = useContext(RoleContext);
	const location = useLocation();
	const history = useHistory();
	const dispatch = useDispatch();
	const { userInfo } = useSelector((state) => state);

	const [activeTab, setActiveTab] = useState(location.hash.slice(1));
	const [showSideModal, setShowSideModal] = useState(false);
	const [userTabCount, setUserTabCount] = useState();

	useEffect(() => {
		const hash = location.hash.slice(1);
		if (!hash)
			history.push(
				"#" + userInfo.user_tabs.find((tab) => tab.isDefault).name
			);
		else setActiveTab(location.hash.slice(1));
		trackPageSegment(
			"Users",
			`${location.hash.substring(1).split("_").join(" ")} `
		);
	}, [location]);

	useEffect(() => {
		if (!userTabCount) fetchUserTabCount();
	}, []);

	const fetchUserTabCount = () => {
		getUserTabCount()
			.then((res) => setUserTabCount(res))
			.catch((err) => {
				TriggerIssue("User Tab Count Error", err);
			});
	};

	const handleTabsUpdate = (options) => {
		updateUserActiveTabs(options).then((res) => {
			if (res?.success) {
				let tempUserInfo = { ...userInfo, user_tabs: options };
				dispatch({
					type: SAVE_USER_INFO_OBJECT,
					payload: tempUserInfo,
				});
			}
			if (
				!options
					.filter((opt) => opt.isActive)
					.find((option) => option.name === activeTab)
			) {
				const defaultTab = options.find(
					(option) => option.isDefault
				)?.name;
				history.push(`#${defaultTab}`);
			}
			setShowSideModal(false);
		});
	};

	const handleSetDeafultTab = (options) => {
		let tempUserInfo = { ...userInfo, user_tabs: options };
		dispatch({
			type: SAVE_USER_INFO_OBJECT,
			payload: tempUserInfo,
		});
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
					<HeaderTitleBC title="Users" />
					<UsersTabs
						options={userInfo?.user_tabs}
						setShowSideModal={setShowSideModal}
						userTabCount={userTabCount}
					></UsersTabs>
					{showSideModal && (
						<SelectSideModal
							label="Tabs"
							onHide={() => setShowSideModal(false)}
							options={userInfo?.user_tabs}
							handleSubmit={handleTabsUpdate}
							handleSetDeafultTab={handleSetDeafultTab}
						/>
					)}
					{onboardingOffboardingTabs.includes(activeTab) ? (
						<UsersOnboardingOffboarding
							screenTagKey={activeTab}
							fetchUserTabCount={fetchUserTabCount}
						/>
					) : (
						<Usersins
							screenTagKey={activeTab}
							key={activeTab}
							fetchUserTabCount={fetchUserTabCount}
						/>
					)}
				</>
			)}
		</>
	);
}
