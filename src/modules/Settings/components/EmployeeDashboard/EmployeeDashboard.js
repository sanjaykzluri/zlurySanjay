import {
	employeeConstants,
	themeHeadings,
} from "modules/employee-dashboard/constants/employee";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Spinner } from "react-bootstrap";
import { Button } from "UIComponents/Button/Button";
import addDocument from "components/Applications/Contracts/adddocument.svg";
import { SUPPORTED_IMAGE_FORMATS } from "constants/upload";
import { TriggerIssue } from "utils/sentry";
import { uploadImage } from "services/upload/upload";
import { Loader } from "common/Loader/Loader";
import {
	setIconLoading,
	setIcons,
	setTheme,
	uploadIcon,
} from "reducers/employee.reducer";
import ToggleSwitch from "react-switch";
import { SAVE_USER_INFO_OBJECT } from "constants/user";
import { updateEmployeeDashboardSettings } from "services/api/employeeDashboard";
import { toast } from "react-toastify";
import DefaultNotificationCard from "common/Notification/PusherNotificationCards/DefaultNotificationCard";
import { withHttp } from "utils/common";
import { Empty } from "components/Uploads/Empty";
import authorized from "assets/applications/authorised.svg";
import RoleContext from "services/roleContext/roleContext";

const desc = {
	organizationLogo:
		"Bring a sense of association with customisable Org logo.",
	favIcon:
		"Choose the favicon to be visible on your browser to your employees",
};
export function EmployeeDashboardSettings() {
	const dispatch = useDispatch();
	const { partner } = useContext(RoleContext);
	const { theme, icons } = useSelector((state) => state.employee || {});
	const orgLogoRef = useRef();
	const favIconRef = useRef();
	const [themeData, setThemeData] = useState();
	const [imgUploading, setImgUploading] = useState(false);
	const { userInfo } = useSelector((state) => state);
	const [visibleAppsType, setVisibleAppsType] = useState("org");
	const [savingSettings, setSavingSettings] = useState(false);
	const [savingTheme, setSavingTheme] = useState(false);
	const [savingIcons, setSavingIcons] = useState(false);
	const [authState, setAuthState] = useState({
		unmanaged: false,
		restricted: false,
		categorised: false,
	});
	useEffect(() => {
		if (userInfo.icons) {
			dispatch(setIcons(userInfo.icons));
		}

		if (userInfo?.theme?.length === 5) {
			dispatch(setTheme(userInfo?.theme));
		}
	}, [userInfo]);
	const mapperData = [
		{
			value: "org",
			title: "All Organization Apps",
			desc: "Employees can view all applications in the organization including apps used in employees department and used by them.",
		},
		{
			value: "dept",
			title: "Employee Department Apps",
			desc: "Employees can view applications used in their department and used by them.",
		},
		{
			value: "employee",
			title: "Only Employee Apps",
			desc: "Employees can only view applications that they use. ",
		},
	];
	const authMapper = [
		{ key: "unmanaged", text: "Show Unmanaged apps" },
		{ key: "restricted", text: "Show Restricted apps" },
		{ key: "categorised", text: "Show Uncategorised apps" },
	];
	const appSettingsMapper = [
		{ text: "Show App Insights", key: "show_insights" },
		{ text: "Show Features ", key: "show_features" },
		{ text: "Show Security Information", key: "show_security_information" },
		{ text: "Show Compliances", key: "show_compliances" },
		{ text: "Show Similar apps", key: "show_similar_apps" },
		{ text: "Show Alternative apps", key: "show_alternative_apps" },
	];
	const [appSettings, setAppSettings] = useState({
		show_insights: false,
		show_features: false,
		show_security_information: false,
		show_compliances: false,
		show_similar_apps: false,
		show_alternative_apps: false,
	});
	useEffect(() => {
		if (userInfo.apps_permissions) {
			setAuthState({
				unmanaged:
					userInfo.apps_permissions.application_auth_level
						.show_unmanaged_apps,
				restricted:
					userInfo.apps_permissions.application_auth_level
						.show_restricted_apps,
				categorised:
					userInfo.apps_permissions.application_auth_level
						.show_uncategorised_apps,
			});
			setVisibleAppsType(
				userInfo.apps_permissions.show_org_apps
					? "org"
					: userInfo.apps_permissions.show_dept_apps
					? "dept"
					: "employee"
			);
			setAppSettings({
				show_insights:
					userInfo.apps_permissions.application_settings
						.show_insights,
				show_features:
					userInfo.apps_permissions.application_settings
						.show_features,
				show_security_information:
					userInfo.apps_permissions.application_settings
						.show_security_information,
				show_compliances:
					userInfo.apps_permissions.application_settings
						.show_compliances,
				show_similar_apps:
					userInfo.apps_permissions.application_settings
						.show_similar_apps,
				show_alternative_apps:
					userInfo.apps_permissions.application_settings
						.show_alternative_apps,
			});
		} else {
			dispatch({
				type: SAVE_USER_INFO_OBJECT,
				payload: {
					...userInfo,
					apps_permissions: {
						application_auth_level: {
							show_unmanaged_apps: false,
							show_restricted_apps: false,
							show_uncategorised_apps: false,
						},
						show_org_apps: true,
						show_dept_apps: true,
						show_emp_apps: true,
						application_settings: {
							show_insights: false,
							show_features: false,
							show_security_information: false,
							show_compliances: false,
							show_similar_apps: false,
							show_alternative_apps: false,
						},
					},
				},
			});
		}
		setAuthState({
			unmanaged:
				userInfo.apps_permissions?.application_auth_level
					?.show_unmanaged_apps,
			restricted:
				userInfo?.apps_permissions?.application_auth_level
					?.show_restricted_apps,
			categorised:
				userInfo?.apps_permissions?.application_auth_level
					?.show_uncategorised_apps,
		});
		setVisibleAppsType(
			userInfo?.apps_permissions?.show_org_apps
				? "org"
				: userInfo?.apps_permissions?.show_dept_apps
				? "dept"
				: "employee"
		);
		setAppSettings({
			show_insights:
				userInfo?.apps_permissions?.application_settings?.show_insights,
			show_features:
				userInfo?.apps_permissions?.application_settings?.show_features,
			show_security_information:
				userInfo?.apps_permissions?.application_settings
					?.show_security_information,
			show_compliances:
				userInfo?.apps_permissions?.application_settings
					?.show_compliances,
			show_similar_apps:
				userInfo?.apps_permissions?.application_settings
					?.show_similar_apps,
			show_alternative_apps:
				userInfo?.apps_permissions?.application_settings
					?.show_alternative_apps,
		});
	}, [userInfo.apps_permissions]);
	useEffect(() => {
		if (Array.isArray(theme) && theme.length > 0) {
			setThemeData(theme);
		}
	}, [theme]);

	const handleUploadButtonClick = (el) => {
		if (el === "favIcon") {
			favIconRef.current.click();
		} else {
			orgLogoRef.current.click();
		}
	};

	const handleImgUpload = (loading, el) => {
		if (!loading) {
			if (el === "favIcon") {
				favIconRef.current.click();
			} else {
				orgLogoRef.current.click();
			}
		}
	};

	const handleProfileImageChange = (e, entity) => {
		let file = e.target.files[0];
		if (file?.name) {
			dispatch(uploadIcon(entity, file));
		}
	};

	const saveToggleEmpMode = (bool) => {
		let reqBody = {
			employee_dashboard_enabled: bool,
		};

		updateEmployeeDashboardSettings(reqBody)
			.then((res) => {
				if (res) {
					dispatch({
						type: SAVE_USER_INFO_OBJECT,
						payload: {
							...{
								...userInfo,
								employee_dashboard_enabled:
									reqBody.employee_dashboard_enabled,
							},
						},
					});
					toast(
						<DefaultNotificationCard
							notification={{
								title: "Settings Changes",
								description: "Your Settings have been saved",
							}}
						/>
					);
				}
			})
			.catch((err) => {
				TriggerIssue(
					"Error while switching employee_dashboard_enabled",
					err
				);
			});
	};

	const saveSettings = () => {
		let reqBody = {
			apps_permissions: {
				show_org_apps:
					visibleAppsType === "org"
						? true
						: visibleAppsType === "dept"
						? false
						: false,
				show_dept_apps:
					visibleAppsType === "org"
						? true
						: visibleAppsType === "dept"
						? true
						: false,
				show_emp_apps: true,
				application_settings: {
					...appSettings,
				},
				application_auth_level: {
					show_unmanaged_apps: authState.unmanaged,
					show_restricted_apps: authState.restricted,
					show_uncategorised_apps: authState.categorised,
				},
			},
		};

		setSavingSettings(true);
		updateEmployeeDashboardSettings(reqBody)
			.then((res) => {
				if (res) {
					dispatch({
						type: SAVE_USER_INFO_OBJECT,
						payload: {
							...{
								...userInfo,
								apps_permissions: reqBody.apps_permissions,
							},
						},
					});
					setSavingSettings(false);
					toast(
						<DefaultNotificationCard
							notification={{
								title: "Settings Changes",
								description: "Your Settings have been saved",
							}}
						/>
					);
				}
			})
			.catch((err) => {
				setSavingSettings(false);
			});
	};

	const saveTheme = () => {
		let reqBody = {
			theme: [...themeData],
		};
		setSavingTheme(true);
		updateEmployeeDashboardSettings(reqBody)
			.then((res) => {
				if (res) {
					dispatch(setTheme(themeData));
					setSavingTheme(false);
					dispatch({
						type: SAVE_USER_INFO_OBJECT,
						payload: {
							...{
								...userInfo,
								theme: themeData,
							},
						},
					});
				}
				toast(
					<DefaultNotificationCard
						notification={{
							title: "Settings Changes",
							description: "Your Theme Settings have been saved",
						}}
					/>
				);
			})
			.catch((err) => {
				setSavingTheme(false);
			});
	};

	const saveIcons = () => {
		let reqBody = {
			icons: icons,
		};
		setSavingIcons(true);
		updateEmployeeDashboardSettings(reqBody)
			.then((res) => {
				if (res) {
					setSavingIcons(false);
					dispatch(setIcons(icons));
					dispatch({
						type: SAVE_USER_INFO_OBJECT,
						payload: {
							...{
								...userInfo,
								icons: icons,
							},
						},
					});
				}
				toast(
					<DefaultNotificationCard
						notification={{
							title: "Settings Changes",
							description: "Your Icon Settings have been saved",
						}}
					/>
				);
			})
			.catch((err) => {
				setSavingIcons(false);
			});
	};

	return (
		<>
			<div
				style={{ padding: "24px 40px" }}
				className="d-flex flex-column"
			>
				<div className="d-flex align-items-center justify-content-between">
					<div className="d-flex align-items-center black-1 font-18">
						<div>Employee App Store</div>
						<span
							style={{
								background: "#FFB169",
								padding: "2px 4px",
								color: "#FFFFFF",
							}}
							className=" border-radius-2 d-inline-block float-right font-8 bold-600 ml-2"
						>
							BETA
						</span>
					</div>
					<div className="d-flex align-items-center">
						<div
							className={`mr-2 font-13 ${
								userInfo.employee_dashboard_enabled
									? "authorized_green"
									: "grey o-6"
							}`}
						>
							{userInfo.employee_dashboard_enabled
								? "Enabled"
								: "Disabled"}
						</div>
						<ToggleSwitch
							height={28}
							width={48}
							checked={userInfo.employee_dashboard_enabled}
							onChange={() =>
								saveToggleEmpMode(
									!userInfo?.employee_dashboard_enabled
								)
							}
							checkedIcon={false}
							uncheckedIcon={false}
							onColor={"#5FCF64"}
						/>
					</div>
				</div>
				<div className="font-11 grey mt-2 ">
					{partner?.name}'s employee dashboard is a single place for
					your employees to discover and request license for all SaaS
					applications being used in your organization along with
					requesting application from {partner?.name}'s market largest
					library of applications.
				</div>
				<div
					className="d-flex align-items-center mt-2"
					style={{
						backgroundColor: " #F5F6F9 ",
						border: "1px solid #EBEBEB",
						height: "37px",
						padding: "10px 20px",
					}}
				>
					Employees in your organization can access this feature on
					<a
						className="primary-color font-13 truncate_name ml-2"
						onClick={(e) => {
							e.stopPropagation();
						}}
						href={`${withHttp(`app.${partner?.name}.com`)}`}
						target="_blank"
						rel="noreferrer"
					>
						{`app.${partner?.name}.com`}
					</a>
				</div>
				<hr style={{ margin: "32px 0px 25px" }}></hr>
				{userInfo.employee_dashboard_enabled ? (
					<>
						<div className="d-flex flex-column">
							<div className="d-flex align-items-center justify-content-between">
								<div className="font-14 black-1 bold-600">
									App Catalog
								</div>
								<Button
									className="ml-auto"
									onClick={() => {
										saveSettings();
									}}
								>
									{savingSettings ? (
										<Spinner
											animation="border"
											role="status"
											variant="light"
											size="sm"
											className="ml-2"
											style={{ borderWidth: 2 }}
										>
											<span className="sr-only">
												Loading...
											</span>
										</Spinner>
									) : (
										"Save"
									)}
								</Button>
							</div>
							<div className="font-11 grey mt-2 mb-4">
								App Catalogue lets your employees discover
								applications being used in the organization,
								department and personally by them with each
								application populated with their relevant
								security and activity data.
							</div>
							<div className="font-12 black-1 bold-600">
								What applications should be visible to
								employees?{" "}
							</div>
							<div className="d-flex align-items-center  pt-3">
								{mapperData.map((el, index) => (
									<div
										onClick={() => {
											setVisibleAppsType(el.value);
										}}
										className="d-flex flex-column cursor-pointer mr-2"
										style={{
											background: "#F8F9FB",
											width: "265px",
											height: "90px",
											border:
												visibleAppsType === el.value
													? "1px solid #2266E2"
													: "1px solid #EBEBEB",
											boxShadow: "0px 2px 6px #E9F0FC",
											borderRadius: "4px",
											padding: "15px",
											opacity:
												visibleAppsType === el.value
													? 1
													: 0.6,
										}}
									>
										<div>
											<Form.Check
												className={`${
													visibleAppsType === el.value
														? "employee-dashboard-custom-check-box"
														: ""
												}`}
												type="radio"
												label={el.title}
												name={"formHorizontalRadios"}
												value={el.value}
												checked={
													visibleAppsType === el.value
												}
											/>
										</div>
										<div className="font-9 grey mt-1">
											{el.desc}
										</div>
									</div>
								))}
							</div>
						</div>
						<div
							className="d-flex flex-column mt-3 w-100"
							style={{
								border: "1px solid #EBEBEB",
								borderRadius: "4px",
								padding: "20px 30px",
							}}
						>
							<div className="font-12 black-1 bold-600">
								Application Authorisation Level
							</div>
							<div className="font-11 grey mt-2 mb-3">
								Control if the employees can view Unmanaged,
								Restricted or Uncategorised (Needs Review)
								applications in the employee dashboard.
							</div>
							<div className="d-flex align-items-center black font-11 mb-2">
								<img src={authorized} className="mr-2"></img>
								<div>
									By default, Managed applications are visible
									to employees
								</div>
							</div>
							<div className="employee-dashboard-app-settings-grid">
								{authMapper.map((el, index) => (
									<>
										<div className="d-flex flex-row align-items-center">
											<Form.Check
												className=""
												checked={authState[el.key]}
												onChange={() => {
													setAuthState({
														...authState,
														[el.key]:
															!authState[el.key],
													});
												}}
											/>
											<div className="font-14 mr-2">
												{el.text}
											</div>
										</div>
									</>
								))}
							</div>
							<hr style={{ margin: "21px 0px " }}></hr>
							<div className="font-12 black-1 bold-600">
								Applications Settings
							</div>
							<div className="font-11 grey mt-2 mb-3">
								Overview of each application contains detailed
								section for security, alternatives and other
								important information useful for application
								discovery and requisition. Choose what your
								employees can view.
							</div>
							<div className="employee-dashboard-app-settings-grid">
								{appSettingsMapper.map((el, index) => (
									<>
										<div className="d-flex flex-row align-items-center">
											<Form.Check
												className=""
												checked={appSettings[el.key]}
												onChange={() => {
													setAppSettings({
														...appSettings,
														[el.key]:
															!appSettings[
																el.key
															],
													});
												}}
											/>
											<div className="font-14 mr-2">
												{el.text}
											</div>
										</div>
									</>
								))}
							</div>
						</div>

						<hr style={{ margin: "30px 0px 25px" }}></hr>
						<div className="d-flex justify-content-between">
							<div className="d-flex flex-column">
								<div className="black-1 font-14 bold-600">
									Branding
								</div>
								<div className="font-11 grey mt-2 mb-3">
									Customise employee dashboard’s look and feel
									as you want it to be.
								</div>
							</div>

							<Button
								style={{ height: "36px" }}
								className="ml-auto"
								onClick={() => {
									saveIcons();
								}}
							>
								{savingIcons ? (
									<Spinner
										animation="border"
										role="status"
										variant="light"
										size="sm"
										className="ml-2"
										style={{ borderWidth: 2 }}
									>
										<span className="sr-only">
											Loading...
										</span>
									</Spinner>
								) : (
									"Save"
								)}
							</Button>
						</div>
						<div className="d-flex ">
							{icons &&
								Object.keys(icons) &&
								Object.keys(icons).map((el, index) => (
									<>
										<div
											className="d-flex flex-column"
											style={{
												marginLeft:
													index === 1
														? "30px"
														: "0px",
											}}
										>
											<div className="d-flex justify-content-between align-items-center mt-2">
												<div className="font-12 black-1 bold-600 ">
													{icons[el].text}
												</div>
												{icons?.[el]?.url && (
													<div
														className="primary-color font-10 cursor-pointer"
														onClick={() => {
															dispatch({
																type: employeeConstants.SET_ICON,
																payload: {
																	entity: el,
																	url: "",
																},
															});
														}}
													>
														Reset
													</div>
												)}
											</div>

											<div className="font-11 grey mt-2 mb-3">
												{desc[el]}
											</div>
											<div
												className="upload-div-container mt-3"
												style={{
													minHeight: "130px",
													width: "fit-content",
													padding: "0px",
												}}
											>
												{icons[el].loading ? (
													<Loader
														height={61}
														width={61}
													/>
												) : icons?.[el]?.url ? (
													<img
														src={icons?.[el]?.url}
														height={128}
														width={128}
														onClick={() =>
															handleImgUpload(
																icons[el]
																	.loading,
																el
															)
														}
														className="cursor-pointer"
													/>
												) : (
													<div
														className="contract-document-upload-div"
														style={{
															height: "132px",
															width: "258px",
														}}
													>
														<img
															src={addDocument}
														/>
														<div className="d-flex flex-column align-items-between ml-1">
															<div
																className="font-13 bold-600 primary-color cursor-pointer d-flex justify-content-center"
																onClick={() =>
																	handleUploadButtonClick(
																		el
																	)
																}
															>
																Upload Logo
															</div>
														</div>
													</div>
												)}
												<Form.File
													accept={SUPPORTED_IMAGE_FORMATS.toString()}
													style={{ display: "none" }}
												>
													<Form.File.Input
														ref={
															el === "favIcon"
																? favIconRef
																: orgLogoRef
														}
														disabled={
															icons[el].loading
														}
														onChange={(e) => {
															handleProfileImageChange(
																e,
																el
															);
														}}
														onClick={(event) => {
															event.target.value =
																null;
														}}
													/>
												</Form.File>
											</div>
										</div>
									</>
								))}
						</div>
						<hr style={{ margin: "42px 0px 25px" }}></hr>
						<div className="d-flex align-items-center w-100 mt-4">
							<div className="d-flex flex-column">
								<div className="black-1 font-14 bold-600">
									Theme
								</div>
								<div className="font-11 grey mt-2 mb-3">
									Customise colours and bring the branding
									close to your organization for your
									employees.
								</div>
							</div>
							<Button
								className="ml-auto"
								onClick={() => {
									saveTheme();
								}}
							>
								{savingTheme ? (
									<Spinner
										animation="border"
										role="status"
										variant="light"
										size="sm"
										className="ml-2"
										style={{ borderWidth: 2 }}
									>
										<span className="sr-only">
											Loading...
										</span>
									</Spinner>
								) : (
									"Save"
								)}
							</Button>
						</div>
						<div className="d-flex flex-wrap">
							{Array.isArray(themeData) &&
								themeData.length > 0 &&
								themeData.map((el, index) => (
									<>
										<div
											className="d-flex flex-column mb-3"
											style={{
												width: "178px",
												marginRight: "77px",
											}}
										>
											<div className="font-12 bold-600 o-8">
												{themeHeadings[el.item]}
											</div>
											<div
												className="d-flex align-items-center mt-2"
												style={{
													border: "1px solid #DDDDDD",
													padding: "5px",
												}}
											>
												<input
													className="custom-color-box"
													type="color"
													value={el.color}
													onChange={(e) => {
														let tempTheme =
															JSON.parse(
																JSON.stringify(
																	themeData
																)
															);
														tempTheme[index].color =
															e.target.value;
														setThemeData([
															...tempTheme,
														]);
													}}
												></input>
												<div className="font-14 black-1">
													{el.color}
												</div>
											</div>
										</div>
									</>
								))}
						</div>
					</>
				) : (
					<>
						<div
							className="d-flex align-items-center "
							style={{ minHeight: "500px" }}
						>
							<Empty title="Employee App Store is currently disabled!"></Empty>
						</div>
					</>
				)}
			</div>
		</>
	);
}
