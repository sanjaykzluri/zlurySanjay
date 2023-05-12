import React, { useContext, useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { AllApps } from "../components/Applications/AllApps";
import { TabsApps } from "../components/Applications/TabsApps";
import { SelectSideModal } from "../common/SelectSideModal";
import { useDispatch, useSelector } from "react-redux";
import {
	getAppTabCount,
	updateApplicationActiveTabs,
} from "../services/api/applications";
import {
	SAVE_USER_INFO_OBJECT,
	UPDATE_USER_INFO_OBJECT,
} from "../constants/user";
import HeaderTitleBC from "../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { TriggerIssue } from "utils/sentry";
import { userRoles } from "constants/userRole";
import UnauthorizedToView from "common/restrictions/UnauthorizedToView";
import RoleContext from "services/roleContext/roleContext";

export function Applications() {
	const location = useLocation();
	const history = useHistory();
	const dispatch = useDispatch();
	const [activeTab, setActiveTab] = useState(location.hash.slice(1));
	const [showSideModal, setShowSideModal] = useState(false);
	const { userRole } = useContext(RoleContext);

	const { userInfo } = useSelector((state) => state);
	const [appTabCount, setAppTabCount] = useState();

	useEffect(() => {
		const hash = location.hash.slice(1);
		if (!hash)
			history.push(
				"#" +
					userInfo.application_tabs.find((tab) => tab.isDefault).name
			);
		else setActiveTab(location.hash.slice(1));
	}, [location]);

	useEffect(() => {
		if (!appTabCount) fetchAppCount();
	}, []);

	const fetchAppCount = () => {
		getAppTabCount()
			.then((res) => setAppTabCount(res))
			.catch((err) => TriggerIssue("App Tab Count Error", err));
	};

	const handleTabsUpdate = (options) => {
		updateApplicationActiveTabs(options).then((res) => {
			if (res?.success) {
				let tempUserInfo = { ...userInfo, application_tabs: options };
				dispatch({
					type: SAVE_USER_INFO_OBJECT,
					payload: tempUserInfo,
				});
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
			}
			setShowSideModal(false);
		});
	};

	const handleSetDeafultTab = (options) => {
		let tempUserInfo = { ...userInfo, application_tabs: options };
		dispatch({
			type: SAVE_USER_INFO_OBJECT,
			payload: tempUserInfo,
		});
	};

	return (
		<>
			{userRole === userRoles.PROCUREMENT_ADMIN ||
			userRole === userRoles.INTEGRATION_ADMIN ||
			userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView />
			) : (
				<>
					<HeaderTitleBC inner_screen={false} title="Applications" />
					<TabsApps
						options={userInfo?.application_tabs}
						setShowSideModal={setShowSideModal}
						appTabCount={appTabCount}
					/>
					{showSideModal && (
						<SelectSideModal
							label="Tabs"
							onHide={() => setShowSideModal(false)}
							options={userInfo?.application_tabs}
							handleSubmit={handleTabsUpdate}
							handleSetDeafultTab={handleSetDeafultTab}
						/>
					)}
					{activeTab && (
						<AllApps
							screenTagKey={activeTab}
							key={activeTab}
							fetchAppCount={fetchAppCount}
						/>
					)}
				</>
			)}
		</>
	);
}
