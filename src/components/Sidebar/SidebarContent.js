import React, { useContext, useEffect, useState } from "react";
import "./Sidebar.css";
import { Logo } from "../Logo/Logo";
import { useHistory, useLocation } from "react-router-dom";
import { Button } from "react-bootstrap";
import overview from "../../assets/sidebar/overview.svg";
import applications from "../../assets/sidebar/applications.svg";
import sourcesagents from "../../assets/sidebar/sources-agents.svg";
import sourcesintegrations from "../../assets/sidebar/sources-integrations.svg";
import users from "../../assets/sidebar/users.svg";
import groups from "../../assets/sidebar/groups.svg";
import onboarding from "../../assets/icons/onboarding.svg";
import offboarding from "../../assets/icons/offboarding.svg";
import workflow from "../../assets/icons/workflow.svg";
import departments from "../../assets/sidebar/departments.svg";
import transactions from "../../assets/sidebar/transactions.svg";
import help from "../../assets/sidebar/help.svg";
import settings from "../../assets/sidebar/settings.svg";
import RoleContext from "../../services/roleContext/roleContext";
import security from "../../assets/sidebar/security.svg";
import optimizationsummary from "../../assets/sidebar/optimizationsummary.svg";
import reports from "../../assets/sidebar/reports.svg";
import sources from "../../assets/sidebar/sources.svg";
import downarrow from "../../assets/sidebar/downarrow.svg";
import auditlogs_icon from "assets/sidebar/audit-log-icon.svg";
import licenseMgmt from "../../assets/sidebar/licenseMgmt.svg";
import renewals from "../../assets/sidebar/renewals.svg";
import vendors from "../../assets/sidebar/vendors.svg";
import licenses from "../../assets/sidebar/licenses.svg";
import chatwithus from "../../assets/sidebar/chatwithus.svg";
import { useSelector } from "react-redux";
import { employeeDashoboardFeatureSelector } from "reducers/userinfo.reducer";
import { Beta } from "modules/shared/components/BetaTagAndModal/Beta/beta";
import { PARTNER } from "modules/shared/constants/app.constants";

export function SidebarContent() {
	const history = useHistory();
	const location = useLocation();
	const { isViewer, enableBetaFeatures, partner } = useContext(RoleContext);
	const [clickedOnSourcesDropdown, setClickedOnSourcesDropdown] =
		useState(false);
	const [clickedOnWorkflowDropdown, setClickedOnWorkflowDropdown] =
		useState(false);
	const [clickedOnLicensesDropdown, setClickedOnLicensesDropdown] =
		useState(false);
	const [defaultAppTab, setDefaultAppTab] = useState();
	const [defaultUserTab, setDefaultUserTab] = useState();
	const { userInfo } = useSelector((state) => state);
	const isEmployeeDashboardEnabled = useSelector(
		employeeDashoboardFeatureSelector
	);

	const handleWorkflowsDropdown = () => {
		if (
			!location.pathname
				.toLowerCase()
				.includes("/workflows/onboarding") ||
			!location.pathname
				.toLowerCase()
				.includes("/workflows/offboarding") ||
			!location.pathname
				.toLowerCase()
				.includes("/workflows/apprequisition")
		) {
			history.push("/workflows/onboarding#overview");
		}
		setClickedOnWorkflowDropdown(!clickedOnWorkflowDropdown);
	};

	useEffect(() => {
		if (
			location.pathname.toLowerCase().includes("/workflows/onboarding") ||
			location.pathname
				.toLowerCase()
				.includes("/workflows/offboarding") ||
			location.pathname
				.toLowerCase()
				.includes("/workflows/apprequisition")
		) {
			setClickedOnWorkflowDropdown(true);
		} else {
			setClickedOnWorkflowDropdown(false);
		}
		if (location.pathname.toLowerCase().includes("/licenses")) {
			setClickedOnLicensesDropdown(true);
		} else {
			setClickedOnLicensesDropdown(false);
		}
		if (
			location.pathname.toLowerCase().includes("/agents") ||
			location.pathname.toLowerCase().includes("/integrations")
		) {
			setClickedOnSourcesDropdown(true);
		} else {
			setClickedOnSourcesDropdown(false);
		}
	}, [location.pathname]);

	const handleLicensesDropdown = () => {
		if (
			!location.pathname.toLowerCase().includes("/licenses") ||
			!location.pathname.toLowerCase().includes("/licenses/renewals") ||
			!location.pathname.toLowerCase().includes("/licenses/vendors")
		) {
			history.push("/licenses#allLicenses");
		}
		setClickedOnLicensesDropdown(!clickedOnLicensesDropdown);
	};

	useEffect(() => {
		let tempObj1 = userInfo?.application_tabs?.find(
			(el) => el.isDefault === true
		);
		setDefaultAppTab(tempObj1?.name);
		let tempObj2 = userInfo?.user_tabs?.find((el) => el.isDefault === true);
		setDefaultUserTab(tempObj2?.name);
	}, [location, userInfo]);

	useEffect(() => {
		if (window.Intercom && partner?.name === PARTNER.ZLURI.name) {
			window.Intercom("update", {
				alignment: "left",
				hide_default_launcher: true,
			});
		}
	}, [window.Intercom]);
	return (
		<div className="sidebar__outer">
			<div className="sidebar__logo">
				<Logo light />
			</div>
			<div className="sidebar__line" />
			<div className="sidebar__list-upper app-flex-col center">
				<ul>
					<li>
						<Button
							onClick={() => {
								history.push("/overview");
							}}
							className={
								location.pathname
									.toLowerCase()
									.includes("/overview") ||
									location.pathname
										.toLowerCase()
										.includes("/newuseroverview") ||
									location.pathname.toLowerCase() === "/"
									? "sidebar__active"
									: "sidebar__item"
							}
						>
							<img src={overview} alt="Overview" />
							Overview
						</Button>
					</li>
					<li>
						<Button
							onClick={() => {
								history.push(`/applications#${defaultAppTab}`);
							}}
							className={
								location.pathname
									.toLowerCase()
									.includes("/applications")
									? "sidebar__active"
									: "sidebar__item"
							}
						>
							<img src={applications} alt="Applications" />
							Applications
						</Button>
					</li>
					<li>
						<Button
							onClick={() => {
								history.push(`/users#${defaultUserTab}`);
							}}
							className={
								location.pathname
									.toLowerCase()
									.includes("/users")
									? "sidebar__active"
									: "sidebar__item"
							}
						>
							<img src={users} alt="Users" />
							Users
						</Button>
					</li>
					{enableBetaFeatures?.includes("org_groups") && (
						<li>
							<Button
								onClick={() => {
									history.push(`/groups`);
								}}
								className={
									location.pathname
										.toLowerCase()
										.includes("/groups")
										? "sidebar__active"
										: "sidebar__item"
								}
							>
								<img src={groups} alt="groups" />
								Groups
							</Button>
						</li>
					)}
					<li>
						<Button
							onClick={() => {
								history.push("/departments");
							}}
							className={
								location.pathname
									.toLowerCase()
									.includes("/departments")
									? "sidebar__active"
									: "sidebar__item"
							}
						>
							<img src={departments} alt="Departments" />
							Departments
						</Button>
					</li>
					<li>
						<Button
							onClick={() => {
								history.push("/transactions#recognised");
							}}
							className={
								location.pathname
									.toLowerCase()
									.includes("/transactions")
									? "sidebar__active"
									: "sidebar__item"
							}
						>
							<img src={transactions} alt="Transactions" />
							Transactions
						</Button>
					</li>

					<li>
						<Button
							onClick={() => {
								history.push("/chargebacks");
							}}
							className={
								location.pathname
									.toLowerCase()
									.includes("/chargebacks")
									? "sidebar__active"
									: "sidebar__item"
							}
						>
							<img src={transactions} alt="chargebacks" />
							Chargebacks
						</Button>
					</li>


					<li>
						<Button
							onClick={handleLicensesDropdown}
							className="sidebar__item"
							style={{ whiteSpace: "nowrap" }}
						>
							<img
								src={licenseMgmt}
								className="sidebar-license-mgmt-icon"
								alt=""
							/>
							<span className="sidebar-license-mgmt-text">
								Licenses
							</span>
							<img
								src={downarrow}
								style={{ marginLeft: "10px" }}
								alt=""
							></img>
						</Button>
					</li>
					{clickedOnLicensesDropdown && (
						<>
							<li>
								<Button
									onClick={() => {
										history.push("/licenses#allLicenses");
									}}
									className={
										location.pathname
											.toLowerCase()
											.includes("licenses") &&
											(location.hash
												.toLowerCase()
												.includes("#alllicenses") ||
												location.hash
													.toLowerCase()
													.includes(
														"#allsubscriptions"
													) ||
												location.hash
													.toLowerCase()
													.includes("#allcontracts") ||
												location.hash
													.toLowerCase()
													.includes(
														"#allperpetualcontracts"
													))
											? "sidebar__list-upper__interiorbutton sidebar__active"
											: "sidebar__list-upper__interiorbutton sidebar__item"
									}
								>
									<img
										src={licenses}
										alt="Onboarding"
										className="sidebar-licenses-icon"
									/>
									<span className="sidebar-licenses-text">
										Licenses
									</span>
								</Button>
							</li>
							<li>
								<Button
									onClick={() => {
										history.push("/licenses/renewals");
									}}
									className={
										location.pathname
											.toLowerCase()
											.includes("licenses/renewals")
											? "sidebar__list-upper__interiorbutton sidebar__active"
											: "sidebar__list-upper__interiorbutton sidebar__item"
									}
								>
									<img
										src={renewals}
										alt="Offboarding"
										className="sidebar-renewals-icon"
									/>
									<span className="sidebar-renewals-text">
										Renewals
									</span>
								</Button>
							</li>
							<li>
								<Button
									onClick={() => {
										history.push("/licenses/vendors");
									}}
									className={
										location.pathname
											.toLowerCase()
											.includes("licenses/vendors")
											? "sidebar__list-upper__interiorbutton sidebar__active"
											: "sidebar__list-upper__interiorbutton sidebar__item"
									}
								>
									<img
										src={vendors}
										alt="Offboarding"
										className="sidebar-vendors-icon"
									/>
									<span className="sidebar-vendors-text">
										Vendors
									</span>
								</Button>
							</li>
						</>
					)}
					{enableBetaFeatures?.includes("optimization_summary") && (
						<li>
							<Button
								onClick={() => {
									history.push("/optimization/summary");
								}}
								className={
									location.pathname
										.toLowerCase()
										.includes("/optimization/summary")
										? "sidebar__active"
										: "sidebar__item"
								}
							>
								<img
									src={optimizationsummary}
									alt="Optimization"
								/>
								Optimization
							</Button>
						</li>
					)}
					<li>
						<Button
							onClick={() => {
								history.push("/security#criticalapps");
							}}
							className={
								location.pathname
									.toLowerCase()
									.includes("/security")
									? "sidebar__active"
									: "sidebar__item"
							}
						>
							<img src={security} alt="Security" />
							Security
						</Button>
					</li>
					<li>
						<Button
							onClick={() => {
								history.push("/reports");
							}}
							className={
								location.pathname
									.toLowerCase()
									.includes("/reports")
									? "sidebar__active"
									: "sidebar__item"
							}
						>
							<img src={reports} alt="Reports" />
							Reports
						</Button>
					</li>
					<li>
						<Button
							onClick={() => {
								if (
									location.pathname
										.toLowerCase()
										.includes("/agents") ||
									location.pathname
										.toLowerCase()
										.includes("/integrations")
								) {
									setClickedOnSourcesDropdown(
										!clickedOnSourcesDropdown
									);
								} else {
									history.push("/integrations");

									setClickedOnSourcesDropdown(true);
								}
							}}
							className="sidebar__item"
						>
							<img src={sources} alt="Sources" />
							Sources
							<img
								src={downarrow}
								style={{ marginLeft: "10px" }}
								alt=""
							></img>
						</Button>
					</li>
					{clickedOnSourcesDropdown && (
						<>
							{!isViewer && (
								<li>
									<Button
										onClick={() => {
											history.push("/integrations");
										}}
										className={
											location.pathname
												.toLowerCase()
												.includes("/integrations")
												? "sidebar__list-upper__interiorbutton sidebar__active"
												: "sidebar__list-upper__interiorbutton sidebar__item"
										}
									>
										<img
											src={sourcesintegrations}
											alt="Integrations"
											className="sidebar__list-upper__interiorbutton__img__integrations"
										/>
										Integrations
									</Button>
								</li>
							)}
							<li>
								<Button
									onClick={() => {
										history.push("/agents#overview");
									}}
									className={
										location.pathname
											.toLowerCase()
											.includes("/agents")
											? "sidebar__list-upper__interiorbutton sidebar__active"
											: "sidebar__list-upper__interiorbutton sidebar__item"
									}
								>
									<img
										src={sourcesagents}
										alt="Agents"
										className="sidebar__list-upper__interiorbutton__img"
									/>
									Agents
								</Button>
							</li>
						</>
					)}
					{!isViewer && (
						<li>
							<Button
								onClick={() => {
									handleWorkflowsDropdown();
								}}
								className="sidebar__item"
							>
								<img
									width={16}
									src={workflow}
									alt="Workflows"
								/>
								Workflows{" "}
								<img
									src={downarrow}
									style={{ marginLeft: "10px" }}
									alt=""
								></img>
							</Button>
						</li>
					)}
					{clickedOnWorkflowDropdown && (
						<>
							{!isViewer && (
								<li>
									<Button
										onClick={() => {
											history.push(
												"/workflows/onboarding#overview"
											);
										}}
										className={
											location.pathname
												.toLowerCase()
												.includes(
													"workflows/onboarding"
												)
												? "sidebar__list-upper__interiorbutton sidebar__active"
												: "sidebar__list-upper__interiorbutton sidebar__item"
										}
									>
										<img
											src={onboarding}
											alt="Onboarding"
											className="sidebar__list-upper__interiorbutton__img__integrations"
										/>
										Onboarding
									</Button>
								</li>
							)}
							<li>
								<Button
									onClick={() => {
										history.push(
											"/workflows/offboarding#overview"
										);
									}}
									className={
										location.pathname
											.toLowerCase()
											.includes("workflows/offboarding")
											? "sidebar__list-upper__interiorbutton sidebar__active"
											: "sidebar__list-upper__interiorbutton sidebar__item"
									}
								>
									<img
										src={offboarding}
										alt="Offboarding"
										className="sidebar__list-upper__interiorbutton__img__integrations"
									/>
									Offboarding
								</Button>
							</li>
							{isEmployeeDashboardEnabled && (
								<li>
									<Button
										onClick={() => {
											history.push(
												"/workflows/apprequisition#pending"
											);
										}}
										className={
											location.pathname
												.toLowerCase()
												.includes(
													"workflows/apprequisition"
												)
												? "sidebar__list-upper__interiorbutton sidebar__active"
												: "sidebar__list-upper__interiorbutton sidebar__item"
										}
									>
										<img
											src={offboarding}
											alt="App Requisition"
											className="sidebar__list-upper__interiorbutton__img__integrations"
										/>
										App Requisition
									</Button>
								</li>
							)}
						</>
					)}
				</ul>
			</div>
			<div className="sidebar__line" />
			<div className="sidebar__list-lower app-flex-col center">
				<ul style={{ marginTop: "11px" }} key={isViewer}>
					<li>
						<Button
							onClick={() => {
								history.push("/settings/account");
							}}
							className={
								location.pathname
									.toLowerCase()
									.includes("/settings/account")
									? "sidebar__active"
									: "sidebar__item"
							}
						>
							<img src={settings} alt="Settings" />
							Settings
						</Button>
					</li>
					<li>
						<Button
							onClick={() => {
								history.push("/auditlogs");
							}}
							className={
								location.pathname
									.toLowerCase()
									.includes("/auditlogs")
									? "sidebar__active"
									: "sidebar__item"
							}
						>
							<img src={auditlogs_icon} alt="AuditLogs" />
							AuditLogs
						</Button>
					</li>
					<li>
						<Button
							onClick={() => {
								window.Intercom("showMessages");
							}}
							className={"sidebar__item"}
						>
							<img
								src={chatwithus}
								alt="Settings"
								style={{ width: "24px" }}
								className="siderbar__chat__with__us__button"
							/>
							Chat with us
						</Button>
					</li>

					<li>
						<a
							target="blank"
							href="https://zluri-hq.myfreshworks.com/login/auth/prodauth?client_id=41441690836303948&redirect_uri=https%3A%2F%2Fsupport.zluri.com%2Ffreshid%2Fcustomer_authorize_callback"
						>
							<img src={help} alt="Help" />
							Help
						</a>
					</li>
				</ul>
			</div>
		</div>
	);
}
