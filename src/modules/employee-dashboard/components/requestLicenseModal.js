import React, { useEffect, useState } from "react";
import { Form, Modal, Spinner } from "react-bootstrap";
import cross from "assets/reports/cross.svg";
import multiple_users from "assets/employee/multiple_users.svg";
import department from "assets/employee/department.svg";
import "./overview.css";
import { Button } from "UIComponents/Button/Button";
import { AsyncTypeahead } from "common/Typeahead/AsyncTypeahead";
import { searchAllApps } from "services/api/search";
import { SimilarAppsSection } from "./similarAppsSection";
import { useHistory, useLocation } from "react-router-dom";
import { searchApplicationLicenseSuggestions } from "services/api/licenses";
import { TriggerIssue } from "utils/sentry";
import {
	currencyOptions,
	getOrgCurrency,
	kFormatter,
} from "constants/currency";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import { PillsRenderer } from "./appInsights";
import RiskIcon from "components/Applications/SecurityCompliance/RiskIcon";
import Rating from "components/Applications/SecurityCompliance/Rating";
import {
	getAppLicenses,
	getAppOverview,
	getSimilarAppsEmployeeDashboard,
	searchGlobalAppsForEmployees,
} from "services/api/employeeDashboard";
import { Loader } from "common/Loader/Loader";
import { withHttp } from "utils/common";
import ReactShowMoreText from "react-show-more-text";
import { AppFeatures } from "./appFeatures";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { getPeriod } from "./alternateLicenseTypes";
import { useSelector } from "react-redux";

export const getCostSentenceForRequest = (el) => {
	if (el.tier_pricing_value) {
		return `${kFormatter(
			el.tier_pricing_value,
			el.tier_currency
		)} /${getPeriod(el).slice(0, 1)}`;
	}
	return "";
};

export function RequestLicenseModal({
	handleClose,
	isOpen,
	app,
	headerTitle = "Request Access",
}) {
	const { userInfo } = useSelector((state) => state);
	const history = useHistory();
	const [defaultLicenses, setDefaultLicenses] = useState({});
	const [loadingAdditionalInfo, setLoadingAdditionalInfo] = useState(true);
	const [reqBody, setReqBody] = useState();
	const [application, setApplication] = useState(app ? { ...app } : null);
	const [dataset, setDataset] = useState();
	const [similarApps, setSimilarApps] = useState([]);
	const [loadingSimilarApps, setLoadingSimilarApps] = useState(false);
	const [similarAppsStep, setSimilarAppsStep] = useState(false);
	const [stepZero, setStepZero] = useState(true);

	useEffect(() => {
		if (app) {
			setReqBody({
				...reqBody,
				currency: getOrgCurrency(),
				app_name: app.app_name,
				app_id: app.app_id || window.location.pathname.split("/")[2],
				app_logo: app?.app_logo,
				app_in_org: app?.app_in_org,
			});
			fetchAdditionalInfo(app);
		}
	}, [app]);

	const handleDataset = (data) => {
		setDataset([
			{
				text: "Users",
				value: data?.user_count,
				src: multiple_users,
			},
			{
				text: "Departments",
				value: <PillsRenderer data={data?.department_names} />,
				src: department,
			},
			{
				text: "Risk Level",
				value: (
					<RiskIcon
						showLable={true}
						riskValue={data?.risk_level && 2}
						className={"text-capitalize"}
						dataUnavailableStyle={{
							marginTop: "3px",
						}}
					/>
				),
				noMargin: true,
				style: {
					top: "-2px",
				},
			},
			{
				text: "Risk Score",
				value: `${Math.ceil(data?.risk_score || 0)} on 100`,
				noMargin: true,
			},
			{
				text: "Threat Level",
				value: (
					<div className="d-flex flex-row">
						<Rating
							rating={data?.threat || 0}
							iconType="scope"
							width={12}
							height={15}
							showValueInsideIcon={true}
							valueTopPosition={"2px"}
							valueLeftPosition={"3.1px"}
						/>
						<div className=" pl-3">
							{`Level ${data?.threat || 0}`}
						</div>
					</div>
				),
				noMargin: true,
			},
		]);
	};

	const handleSimilarAppClick = (app) => {
		console.log(app);
		let tempApp = JSON.parse(JSON.stringify(app));
		tempApp.app_name = app.name;
		tempApp.app_logo = app.image;
		tempApp.app_id = app._id;
		tempApp.app_in_org = true;
		setReqBody({
			app_logo: app.image,
			app_name: app.name,
			app_id: app._id,
			license_cost: null,
			license_name: null,
			app_in_org: true,
		});
		fetchAdditionalInfo(tempApp);
		setSimilarAppsStep(false);
		setStepZero(true);
	};

	const handleSingleLicenseEdit = (value, key, index) => {
		if (typeof value === "string") {
			value = value?.trimStart();
		}
		if (typeof value === "number") {
			if (value < 0) {
				value = 0;
			}
		}
		setReqBody({ ...reqBody, license_name: value, license_id: null });
	};

	const selectSingleLicense = (selection) => {
		let period = getPeriod(selection);

		setReqBody({
			...reqBody,
			license_name: selection.value,
			license_id: selection.id,
			per_license_term: period,
			license_cost: selection.tier_pricing_value || null,
			currency: selection.tier_currency,
		});
	};

	const handleSubmit = () => {
		history.push({
			pathname: `/user/license/request`,
			state: {
				data: reqBody,
			},
		});
	};

	const selectSingleApp = async (selection) => {
		setReqBody({
			...reqBody,
			currency: getOrgCurrency(),
			app_id: selection.app_in_org ? selection.org_app_id : selection._id,
			app_name: selection.name,
			app_logo:
				selection.image ||
				selection.app_logo ||
				selection.app_image_url,
			app_in_org: selection.app_in_org,
			app_in_dept: selection.app_in_dept,
		});
		setApplication({
			...application,
			app_id: selection.app_in_org ? selection.org_app_id : selection._id,
			app_name: selection.name,
			app_logo:
				selection.image ||
				selection.app_logo ||
				selection.app_image_url,
			app_in_org: selection.app_in_org,
			app_in_dept: selection.app_in_dept,
			app_link: selection.link,
		});
		fetchAdditionalInfo(selection);
	};

	const fetchAdditionalInfo = async (app) => {
		setLoadingAdditionalInfo(true);
		try {
			const res = await getAppOverview(
				app.app_id || app.org_app_id || app._id,
				""
			);

			if (res) {
				setLoadingAdditionalInfo(false);
				setDefaultLicenses(
					res.app_licenses.map((el) => {
						return {
							title: el.tier_name,
							value: el.tier_name,
							id: el._id,
							tier_pricing_value: el.tier_pricing_value,
							period: el.period,
							tier_is_per_month: el.tier_is_per_month,
							tier_is_billed_annual: el.tier_is_billed_annual,
							tier_currency: el.tier_currency,
						};
					})
				);
				setApplication({
					...res,
					app_id: app.app_id || app.org_app_id || app._id,
					app_name: app.name || app.app_name,
					app_logo: app.image || app.app_logo,
					app_in_org: app.app_in_org,
					app_in_dept: app.app_in_dept,
					description: res.description,
					short_description: res.short_description,
				});
				handleDataset(res);
			}
		} catch (err) {
			setLoadingAdditionalInfo(false);
			TriggerIssue("error while fetching info about an application", err);
		}
	};

	const fetchSimilarApps = async (app) => {
		setLoadingSimilarApps(true);
		try {
			const res = await getSimilarAppsEmployeeDashboard(
				app.app_id,
				!app.app_in_org
			);
			if (res) {
				setLoadingSimilarApps(false);
				setSimilarApps(res?.similar_apps);
				if (
					Array.isArray(res?.similar_apps) &&
					!res?.similar_apps.length
				) {
					skipToFinalStep();
				}
			}
		} catch (err) {
			setLoadingSimilarApps(false);
			TriggerIssue("error while fetching Similar Apps", err);
		}
	};

	const skipToFinalStep = () => {
		console.log(reqBody);
		// setSimilarAppsStep(false);
		// setStepZero(false);
		history.push({
			pathname: `/user/license/request`,
			state: {
				data: reqBody,
			},
		});
	};

	return (
		<>
			<Modal
				show={isOpen}
				onHide={handleClose}
				centered
				contentClassName="request__license__modal"
			>
				<div
					className="request__license__cont"
					style={{ height: "fit-content" }}
				>
					<div className="request-license-modal-heading">
						<div
							className="d-flex flex-column"
							style={{ paddingTop: "26px" }}
						>
							<div className="bold-600 font-18">
								{headerTitle}
							</div>
							{!similarAppsStep && (
								<>
									<div
										className="font-12 black"
										style={{ padding: "10px 0px 0px" }}
									>
										You can request access to a new
										application or get a license for an
										existing application
									</div>
								</>
							)}
						</div>
						<img
							src={cross}
							height={12}
							width={12}
							onClick={() => {
								handleClose();
							}}
							className="request-license-modal-close-button"
						></img>
					</div>

					{!similarAppsStep && (
						<>
							<div className="d-flex flex-column">
								{!reqBody?.app_id ? (
									<div style={{ padding: "20px" }}>
										<AsyncTypeahead
											label="Select Application"
											placeholder="App Name"
											fetchFn={
												searchGlobalAppsForEmployees
											}
											isInvalid={false}
											invalidMessage="Please select the application."
											onSelect={(selection) => {
												selectSingleApp(selection);
											}}
											requiredValidation={false}
											keyFields={{
												id: "app_id",
												image: "app_image_url",
												value: "name",
												app_in_org: "app_in_org",
											}}
											allowFewSpecialCharacters={true}
											defaultValue={reqBody?.app_name}
											onChange={(val) =>
												setReqBody({
													...reqBody,
													app_id: null,
													app_name: val,
													app_logo: null,
												})
											}
										/>
									</div>
								) : loadingAdditionalInfo ? (
									<>
										<Loader height={60} width={60}></Loader>
									</>
								) : (
									<>
										<div
											style={{
												padding: "20px",
												background: "#F5F6F9",
												marginTop: "20px",
											}}
											className="d-flex flex-column"
										>
											<div className="d-flex align-items-center justfiy-content-between w-100">
												<div className="d-flex align-items-center">
													<GetImageOrNameBadge
														url={
															application?.app_logo
														}
														name={
															application?.app_name
														}
														height={40}
														width={40}
														borderRadius="50%"
													/>
													<div className="d-flex flex-column">
														<div className="bold-600 font-18 ml-2">
															{
																application?.app_name
															}
														</div>
														{Array.isArray(
															application?.app_categories
														) &&
															application
																?.app_categories
																.length > 0 && (
																<>
																	<div className="grey-1 font-11 ml-2">
																		{
																			application
																				?.app_categories[0]
																				.category_name
																		}
																	</div>
																</>
															)}
													</div>
												</div>
												<div className="ml-auto primary-color cursor-pointer mr-2 font-11 d-flex ">
													{application.app_link && (
														<>
															<div
																onClick={(
																	e
																) => {
																	e.stopPropagation();
																	window.open(
																		`${withHttp(
																			application.app_link
																		)}`,
																		"_blank"
																	);
																}}
															>
																VISIT WEBPAGE
															</div>
															<hr
																style={{
																	height: "10px ",
																	margin: "0px 4px",

																	border: "1px solid rgba(113, 113, 113, 0.6)",
																}}
															></hr>
														</>
													)}
													<div
														onClick={() => {
															setReqBody({
																...reqBody,
																app_id: null,
																app_name: null,
																app_logo: null,
																license_cost:
																	null,
																license_name:
																	null,
																license_id:
																	null,
															});
															setStepZero(true);
														}}
													>
														CHANGE
													</div>
												</div>
											</div>
											{application.description && (
												<div
													className="grey-1 font-11 mt-2"
													style={{
														lineHeight: "18px",
													}}
												>
													<ReactShowMoreText
														lines={2}
														more="Read more"
														less="View less"
														expanded={false}
													>
														{
															application.description
														}
													</ReactShowMoreText>
												</div>
											)}

											{application?.app_in_org && (
												<>
													{userInfo?.apps_permissions
														?.application_settings
														?.show_insights && (
														<>
															<div className="request-access-info-grid w-100">
																{dataset?.map(
																	(
																		item,
																		index
																	) => (
																		<div
																			key={
																				index
																			}
																			className={`d-flex flex-column justify-content-between insights-grid-second-row`}
																			style={{
																				height: "55px",
																			}}
																		>
																			<div className="grey-1 o-5 font-11">
																				{
																					item.text
																				}
																			</div>
																			<div className="d-flex align-items-center">
																				<img
																					src={
																						item.src
																					}
																				></img>
																				<div
																					className={`font-16 bold-600 black-1 ${
																						item.noMargin
																							? ""
																							: "ml-2"
																					}`}
																					style={{
																						...item.style,
																					}}
																				>
																					{
																						item.value
																					}
																				</div>
																			</div>
																		</div>
																	)
																)}
															</div>
														</>
													)}

													{Array.isArray(
														application?.app_licenses
													) &&
														application
															?.app_licenses
															.length > 0 && (
															<>
																<div
																	className="grey font-12 mb-2"
																	style={{
																		padding:
																			"10px 0px 0px",
																	}}
																>
																	Licenses
																</div>
																<div
																	className="d-flex align-items-center"
																	style={{
																		overflowX:
																			"auto",
																		padding:
																			"5px 0px 10px",
																	}}
																>
																	{application.app_licenses.map(
																		(
																			el
																		) => (
																			<div
																				className="d-flex flex-column mr-2"
																				style={{
																					padding:
																						"6px 8px",
																					maxWidth:
																						"155px",
																					minWidth:
																						"155px",
																					height: "51px",
																					background:
																						"#FFFFFF",
																					borderRadius:
																						"4px",
																				}}
																			>
																				<OverlayTrigger
																					placement="top"
																					overlay={
																						<Tooltip>
																							{
																								el.tier_name
																							}
																						</Tooltip>
																					}
																				>
																					<div className="grey-1 font-11 truncate_request_license_name">
																						{
																							el.tier_name
																						}
																					</div>
																				</OverlayTrigger>
																				{/* <div className="mt-1 bold-600 font-12">
																					{getCostSentenceForRequest(
																						el
																					)}
																				</div> */}
																			</div>
																		)
																	)}
																</div>
															</>
														)}
													{userInfo?.apps_permissions
														?.application_settings
														?.show_features && (
														<>
															<div
																style={{
																	height: "fit-content",
																	maxHeight:
																		"220px",
																	overflowY:
																		"auto",
																}}
															>
																<AppFeatures
																	data={
																		application?.features
																	}
																	loading={
																		loadingAdditionalInfo
																	}
																/>
															</div>
														</>
													)}
												</>
											)}
										</div>
										{!application?.app_in_org && (
											<>
												<div className="d-flex flex-column align-items-center mt-2">
													<div className="font-12 bold-500 red">
														This app is not used in
														your organization
													</div>
													{stepZero && (
														<>
															<div className="grey-1 font-12 mt-1">
																Do you still
																want to proceed
																?
															</div>
														</>
													)}
												</div>
											</>
										)}
									</>
								)}
								{reqBody?.app_id && !stepZero && (
									<>
										<div
											className="d-flex  mt-2 w-100"
											style={{ padding: "20px" }}
										>
											<div
												className="w-50 d-flex flex-column pr-1"
												style={{ position: "relative" }}
											>
												<span
													className="coming-soon-tag ml-2 "
													style={{
														position: "absolute",
														left: "85px",
														top: "3px",
													}}
												>
													Coming soon
												</span>
												<AsyncTypeahead
													label="Select License"
													key={reqBody?.app_id}
													fetchFn={(
														query,
														cancelToken
													) =>
														getAppLicenses(
															reqBody?.app_id,
															query,
															cancelToken
														)
													}
													defaultList={
														!loadingAdditionalInfo
															? defaultLicenses
															: []
													}
													disabled={
														!reqBody?.app_id ||
														loadingAdditionalInfo ||
														true
													}
													keyFields={{
														value: "value",
														title: "title",
														id: "id",
														tier_currency:
															"tier_currency",
														tier_pricing_value:
															"tier_pricing_value",
														period: "period",
														tier_is_per_month:
															"tier_is_per_month",
														tier_is_billed_annual:
															"tier_is_billed_annual",
														additional_information:
															"tier_pricing_value",
													}}
													hideNoResultsText={true}
													allowFewSpecialCharacters={
														true
													}
													placeholder="Select License"
													onSelect={(selection) => {
														selectSingleLicense(
															selection
														);
													}}
													onChange={(value) => {
														handleSingleLicenseEdit(
															value,
															"name"
														);
													}}
													requestingLicensesWithPrice={
														true
													}
													showAdditionalRightInformation={
														true
													}
													additionalInformationFormatter={(
														value
													) => {
														if (value) {
															return (
																<div className="ml-auto bold-600 font-12">
																	{getCostSentenceForRequest(
																		value
																	)}
																</div>
															);
														}
													}}
												/>
											</div>
											<div className="w-50 d-flex flex-column pr-1 position-relative">
												<Form.Group>
													<Form.Label>
														Estimated Cost/License
													</Form.Label>
													<div
														className="d-flex font-12 license-details-px-1"
														style={{
															border: "1px solid #DDDDDD",
															height: "36px",
															borderRadius: "4px",
														}}
													>
														<select
															className="request-license-currency-select border-0"
															onChange={(e) => {
																setReqBody({
																	...reqBody,
																	currency:
																		e.target
																			.value,
																});
															}}
															// name="contract_currency_select"
															defaultValue={
																reqBody?.currency ||
																getOrgCurrency()
															}
														>
															{currencyOptions}
														</select>
														<Form.Control
															required
															value={
																reqBody?.license_cost
															}
															placeholder="Cost"
															onChange={(e) => {
																setReqBody({
																	...reqBody,
																	license_cost:
																		Number.parseFloat(
																			e
																				.target
																				.value
																		),
																});
															}}
															type="number"
															bsPrefix="request-license-custom-input-area-number"
															className={`p-0 border-0`}
															style={{
																marginRight:
																	"2px",
																height: "34px",
																width: "110px",
															}}
														/>

														<Form.Control
															className="border-0  ml-2"
															bsPrefix="request-license-custom-input-area"
															as="select"
															value={
																reqBody?.per_license_term
															}
															onChange={(e) => {
																setReqBody({
																	...reqBody,
																	per_license_term:
																		e.target
																			.value,
																});
															}}
														>
															<option value="months">
																per month
															</option>
															<option value="years">
																per year
															</option>
														</Form.Control>
													</div>
												</Form.Group>
											</div>
										</div>
									</>
								)}
							</div>
						</>
					)}

					{similarAppsStep && (
						<>
							<div
								className="d-flex flex-column align-items-center"
								style={{
									backgroundColor: "#F6F7FC",
									minHeight: "159px",
									height: "fit-content",
									padding: "20px 0px ",
								}}
							>
								{loadingSimilarApps ? (
									<Loader width={60} height={60}></Loader>
								) : Array.isArray(similarApps) &&
								  similarApps.length > 0 ? (
									<>
										<div className="black-1 font-12">
											There are the similar apps used
											within your organization
										</div>
										<div className="grey-1 font-10">
											Want to get a license for one of
											these apps instead?
										</div>
										<SimilarAppsSection
											needSlicing={true}
											sliceCount={2}
											className={"flex-row"}
											handleOnClick={(app) =>
												handleSimilarAppClick(app)
											}
											app_id={reqBody?.app_id}
											showAlternativeApps={false}
											app_in_org={application.app_in_org}
										></SimilarAppsSection>
									</>
								) : (
									<>No Similar Apps</>
								)}
							</div>
						</>
					)}
				</div>
				<Modal.Footer>
					{!similarAppsStep && (
						<Button type="link" onClick={() => handleClose()}>
							Cancel
						</Button>
					)}
					{!loadingSimilarApps && (
						<>
							<Button
								onClick={() => {
									if (stepZero) {
										setSimilarAppsStep(true);
										setStepZero(false);
										fetchSimilarApps(application || app);
									} else if (similarAppsStep) {
										skipToFinalStep();
									} else {
										handleSubmit();
									}
								}}
								disabled={
									!reqBody?.app_id || loadingSimilarApps
								}
							>
								{similarAppsStep
									? "Ignore and Continue"
									: "Continue"}
							</Button>
						</>
					)}
				</Modal.Footer>
			</Modal>
		</>
	);
}
