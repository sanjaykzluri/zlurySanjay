import HeaderTitleBC from "components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
	getAppLauncherData,
	getOverviewStats,
} from "services/api/employeeDashboard";
import { AppLauncher } from "../components/appLauncher";
import { RequestLicenseModal } from "../components/requestLicenseModal";
import { StatsContainer } from "../components/statsContainer";
import UsageGraph from "../components/usageGraph";
import pendingapprovals from "assets/employee/pending_approvals.svg";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import { Button } from "UIComponents/Button/Button";
import { useHistory } from "react-router-dom";
import { employeeDashoboardFeatureSelector } from "reducers/userinfo.reducer";

export function EmployeeOverview() {
	const history = useHistory();
	const [stats, setStats] = useState();
	const [loadingStats, setLoadingStats] = useState(true);
	const [launcherData, setLauncherData] = useState();
	const [loadingLauncherData, setLoadingLauncherData] = useState(true);
	const { userInfo } = useSelector((state) => state);
	const [requestLicenseModalOpen, setRequestLicenseModalOpen] =
		useState(false);
	useEffect(() => {
		if (!stats) {
			getOverviewStats(userInfo.user_id).then((res) => {
				if (res) {
					setLoadingStats(false);
					setStats(res.data);
				}
			});
		}
		if (!launcherData) {
			getAppLauncherData(userInfo.user_id).then((res) => {
				if (res) {
					setLoadingLauncherData(false);
					setLauncherData(res.data);
				}
			});
		}
	}, []);
	var today = new Date();
	var curHr = today.getHours();
	var textToday;
	if (curHr < 12) {
		textToday = "Good Morning";
	} else if (curHr < 16) {
		textToday = "Good Afternoon";
	} else {
		textToday = "Good Evening";
	}

	const getTitle = () => {
		return `${textToday}, ${userInfo?.user_name}`;
	};

	const isEmployeeDashboardEnabled = useSelector(
		employeeDashoboardFeatureSelector
	);
	return (
		<>
			<HeaderTitleBC title={getTitle()} />
			{stats?.pending_approvals_count > 0 && isEmployeeDashboardEnabled && (
				<div className="d-flex align-items-center pending-approvals-box">
					<img
						src={pendingapprovals}
						style={{ marginRight: "30px" }}
					></img>
					<div
						className="font-22 employee-stats-box-text"
						style={{ marginRight: "30px" }}
					>
						{stats?.pending_approvals_count} Pending Approvals
					</div>
					<NumberPill
						number={`Awaiting your Approval`}
						fontColor={"#FFB169"}
						fontSize={12}
						fontWeight={500}
						pillBackGround={"rgba(255, 177, 105, 0.15)"}
						borderRadius={"4px"}
						pillWidth={23}
						style={{
							marginRight: "4px",
							padding: "0px 8px",
						}}
					/>
					<Button
						onClick={() =>
							history.push(`/user/app/requests#approvals`)
						}
						style={{
							border: "1px solid #2266E2",
							marginLeft: "auto",
						}}
						type={"link"}
					>
						View Approvals
					</Button>
				</div>
			)}
			<AppLauncher
				loading={loadingLauncherData}
				data={launcherData}
			></AppLauncher>
			<StatsContainer
				loading={loadingStats}
				data={stats}
				setRequestLicenseModalOpen={setRequestLicenseModalOpen}
			></StatsContainer>
			<div style={{ padding: "0px 40px" }}>
				<UsageGraph></UsageGraph>
			</div>
			{requestLicenseModalOpen && (
				<RequestLicenseModal
					isOpen={requestLicenseModalOpen}
					handleClose={() => setRequestLicenseModalOpen(false)}
					headerTitle={"Request Access"}
				></RequestLicenseModal>
			)}
		</>
	);
}
