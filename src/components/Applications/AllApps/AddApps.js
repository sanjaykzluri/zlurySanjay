import React, { useState, useRef, useCallback, useEffect } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import Tags from "@yaireo/tagify/dist/react.tagify";
import "./AllApps.css";
import "@yaireo/tagify/dist/tagify.css";
import close from "../../../assets/close.svg";
import uploadimage from "./uploadimage.svg";
import { useDispatch, useSelector } from "react-redux";
import newbutton from "./newbutton.svg";
import {
	searchAppCategories,
	searchGlobalOnlyApps,
	searchUsers,
} from "../../../services/api/search";
import { client } from "../../../utils/client";
import { SuggestionMenu } from "../../../common/SuggestionMenu/SuggestionMenu";
import { debounce, withHttp } from "../../../utils/common";
import { useDidUpdateEffect } from "../../../utils/componentUpdateHook";
import { SUPPORTED_IMAGE_FORMATS } from "../../../constants/upload";
import { uploadImage } from "../../../services/upload/upload";
import AngleUp from "../../../assets/icons/angle-up.svg";
import AngleDown from "../../../assets/icons/angle-down.svg";
import { getSimilarAndAlternateApps } from "../../../services/api/applications";
import { Link } from "react-router-dom";
import { NameBadge } from "../../../common/NameBadge";
import { applicationState, EditApplicationType } from "../EditApplicationType";
import { CustomFieldSectionInForm } from "../../../modules/shared/components/CustomFieldSectionInForm/CustomFieldSectionInForm";
import { CUSTOM_FIELD_ENTITY } from "../../../modules/custom-fields/constants/constant";
import { checkSpecialCharacters } from "../../../services/api/search";
import { useOutsideClickListener } from "../../../utils/clickListenerHook";
import integrationavailable from "assets/applications/integrationavailable.svg";
import { AsyncTypeahead } from "common/Typeahead/AsyncTypeahead";
import { TriggerIssue } from "utils/sentry";
import { getValueFromLocalStorage } from "utils/localStorage";

export function IntegrationAvailableSection(props) {
	return (
		<div
			style={{
				backgroundColor: "rgba(90, 186, 255, 0.1)",
			}}
			className="ml-auto md-chip d-flex align-items-center"
		>
			<img src={integrationavailable}></img>
			<div className="font-8 grey ml-1">Integration available</div>
		</div>
	);
}
export function AddApps(props) {
	const defaultAppState = {
		app_name: props && props.custom ? props.custom : "",
		app_parent_id: "",
		app_owner: "",
		app_owner_id: "",
		app_tags: [],
		isCustom: props && props.custom,
		app_short_description: "",
		app_description: "",
		app_web_url: "",
		app_logo_url: "",
		app_type: applicationState.APPLICATION,
		app_custom_fields: [],
		app_auto_renewal: false,
		app_status: "active",
		app_category_name: "",
		app_budget: null,
	};
	const [appSuggestions, setAppSuggestions] = useState([]);
	const [showAppSuggestions, setShowAppSuggestions] = useState(false);
	const [isCustomApp, setIsCustomApp] = useState(
		(props && props.custom) || false
	);
	const [selectedApp, setSelectedApp] = useState(null);
	const [newappinfo, setnewappinfo] = useState({ ...defaultAppState });
	const [appSuggestionsLoading, setAppSuggestionsLoading] = useState(true);
	const [userSuggestionsLoading, setUserSuggestionsLoading] = useState(true);
	const [userSuggestions, setUserSuggestions] = useState([]);
	const [showUserSuggestions, setShowUserSuggestions] = useState(false);
	const [appCategorySuggestionsLoading, setAppCategorySuggestionsLoading] =
		useState(true);
	const [allAppCategories, setAllAppCategories] = useState([]);
	const [appCategories, setAppCategories] = useState([]);
	const [showAppCategorySuggestions, setShowAppCategorySuggestions] =
		useState(false);
	const [tags, setTags] = useState([]);
	const [uploadInProgress, setUploadInProgress] = useState(false);
	const [validation, setValidation] = useState({});
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [similarApps, setSimilarApps] = useState([]);
	const [showSimilarApps, setShowSimilarApps] = useState(false);
	const [appLogo, setAppLogo] = useState("");

	const cancelToken = useRef();
	const appCategoryRef = useRef();
	const appOwnerRef = useRef();

	useEffect(() => {
		//Segment Implementation
		window.analytics.page("Applications", "All-Apps; Add-New-Application", {
			orgId: orgId,
			orgName: orgName,
		});
		getAllCategories();
	}, []);

	const handleChange = (key, value) => {
		validateField(key, value);

		// FIXME: Speacial handling for tags input due to a bug with the library
		if (typeof value === "string") {
			value = value?.trimStart();
		}
		validateField(key, value);
		if (key === "app_tags") {
			setTags(value);
			return;
		}

		setnewappinfo({
			...newappinfo,
			[key]: value,
		});
	};

	useDidUpdateEffect(() => {
		setnewappinfo({
			...newappinfo,
			app_tags: [...tags],
		});
	}, [tags]);

	const switchToCustomAppCreationView = () => {
		setIsCustomApp(true);
		setShowAppSuggestions(false);
		props.clearValidationErrors();
		setnewappinfo({
			...newappinfo,
			isCustom: true,
		});
	};

	const handleAppNameChange = (query) => {
		query = query?.trimStart();
		setnewappinfo({
			...newappinfo,
			app_name: query,
		});

		if (cancelToken.current)
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);

		if (query.length == 0) {
			setShowAppSuggestions(false);
			setAppSuggestionsLoading(false);
			setSelectedApp("");
			delete newappinfo.app_name;
			delete newappinfo.app_parent_id;
			setnewappinfo({
				...newappinfo,
			});
			return;
		}
		if (checkSpecialCharacters(query)) {
			setShowAppSuggestions(true);
			setAppSuggestionsLoading(false);
			return;
		}
		setAppSuggestionsLoading(true);
		setShowAppSuggestions(true);
		cancelToken.current = client.CancelToken.source();
		generateAppSuggestions(query, cancelToken.current);
	};

	const generateAppSuggestions = useCallback(
		debounce((query, reqCancelToken) => {
			if (query && query.length >= 1) {
				searchGlobalOnlyApps(query, reqCancelToken)
					.then((res) => {
						if (res.results) {
							setAppSuggestions(res.results);
						}
						setAppSuggestionsLoading(false);
					})
					.catch((err) =>
						console.error(
							"Error while searching through global apps",
							err
						)
					);
			}
		}, 300)
	);

	const handleAppOwnerChange = (query) => {
		query = query?.trimStart();
		validateField("app_owner_id", query);
		setnewappinfo({
			...newappinfo,
			app_owner: query,
		});

		if (cancelToken.current)
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);

		if (query.length == 0) {
			setShowUserSuggestions(false);
			setUserSuggestionsLoading(false);
			return;
		}

		if (checkSpecialCharacters(query, true)) {
			setShowUserSuggestions(true);
			setUserSuggestionsLoading(false);
			return;
		}

		setUserSuggestionsLoading(true);
		setShowUserSuggestions(true);
		cancelToken.current = client.CancelToken.source();
		generateUserSuggestions(query, cancelToken.current);
	};

	const generateUserSuggestions = useCallback(
		debounce((query, reqCancelToken) => {
			if (query && query.length >= 1) {
				searchUsers(query, reqCancelToken, true)
					.then((res) => {
						if (res.results) {
							setUserSuggestions(res.results);
						}

						setUserSuggestionsLoading(false);
					})
					.catch((err) =>
						console.error(
							"Error while searching through org users",
							err
						)
					);
			}
		}, 300)
	);

	const handleCategoryChange = (query) => {
		query = query?.trimStart();
		validateField("app_category_id", query);
		setnewappinfo({
			...newappinfo,
			app_category_name: query,
		});

		if (cancelToken.current)
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);

		if (query.length == 0) {
			setAppCategories([...allAppCategories]);
			return;
		}

		if (checkSpecialCharacters(query)) {
			setShowAppCategorySuggestions(true);
			setAppCategorySuggestionsLoading(false);
			return;
		}

		setAppCategorySuggestionsLoading(true);
		setShowAppCategorySuggestions(true);
		cancelToken.current = client.CancelToken.source();
		generateCategorySuggestions(query, cancelToken.current);
	};

	const generateCategorySuggestions = useCallback(
		debounce((query, reqCancelToken) => {
			if (query && query.length >= 1) {
				searchAppCategories(query, reqCancelToken)
					.then((res) => {
						if (res.results) {
							setAppCategories(res.results);
						}

						setAppCategorySuggestionsLoading(false);
					})
					.catch((err) =>
						console.error(
							"Error while searching through app categories",
							err
						)
					);
			}
		}, 300)
	);

	const handleAppSelect = (app) => {
		const { app_id, org_application_id, app_name } = app;
		let appId = app_id || org_application_id;
		setnewappinfo({
			...defaultAppState,
			app_name: app_name,
			app_parent_id: appId,
		});
		setShowAppSuggestions(false);
		setSelectedApp(app);
		props.clearValidationErrors();

		getSimilarAndAlternateApps(appId)
			.then((res) => {
				if (res.error) return;

				if (res.apps && res.apps.similar_apps) {
					setSimilarApps(res.apps.similar_apps);
				}
			})
			.catch((err) => {
				console.error(
					`Error fetching similar apps for ${app_name}`,
					err
				);
			});
	};

	const handleAppOwnerSelect = (user) => {
		const { user_id, user_name } = user;
		setnewappinfo({
			...newappinfo,
			app_owner: user_name,
			app_owner_id: user_id,
		});
		setShowUserSuggestions(false);
	};

	const handleCategorySelect = (category) => {
		const { _id, name } = category;
		validateField("app_category_id", _id);
		setnewappinfo({
			...newappinfo,
			app_category_name: name,
			app_category_id: [_id],
		});
		setShowAppCategorySuggestions(false);
	};

	const handleAppLogoChange = (e) => {
		let file = e.target.files[0];

		setUploadInProgress(true);

		uploadImage(file)
			.then((res) => {
				setUploadInProgress(false);
				setAppLogo(res.resourceUrl);
			})
			.catch((err) => {
				console.error("Error uploading image:", err);
				setUploadInProgress(false);
			});
	};

	const isInvalid = (fieldName) => {
		if (fieldName === "app_logo_url") {
			return !appLogo && !!validation[fieldName]?.msg;
		} else {
			return !!validation[fieldName]?.msg;
		}
	};

	const validateField = (fieldName, value) => {
		if (!value) {
			setValidation({
				...validation,
				...{ [fieldName]: { msg: `Please enter ${fieldName}` } },
			});
		} else if (validation[fieldName]) {
			delete validation[fieldName];
			setValidation({ ...validation });
		}
	};

	const validateApp = (newappinfo) => {
		const requiredFields =
			!isCustomApp && !selectedApp
				? ["app_parent_id"]
				: !isCustomApp && !!selectedApp
				? ["app_name", "app_owner_id"]
				: ["app_name", "app_owner_id", "app_category_id"];
		const errors = {};
		requiredFields.forEach((fieldName) => {
			if (!newappinfo[fieldName]) {
				errors[fieldName] = {
					msg: `Please enter ${fieldName}`,
				};
			}
		});
		return errors;
	};

	useDidUpdateEffect(() => {
		if (appLogo) {
			setnewappinfo({
				...newappinfo,
				["app_logo_url"]: appLogo,
			});
		}
	}, [appLogo]);

	const handleSubmit = () => {
		if (newappinfo) {
			let errors = validateApp(newappinfo);
			if (Object.keys(errors).length > 0) {
				setValidation(errors);
				return;
			}
		}
		props.handleSubmit(newappinfo);

		//Segment Implementation
		window.analytics.track("Added a new Application", {
			newAppName: newappinfo.app_name,
			newAppId: newappinfo.app_parent_id,
			newAppOwner: newappinfo.app_owner,
			newAppOwnerId: newappinfo.app_owner_id,
			newAppStatus: newappinfo.app_status,
			currentCategory: "Applications",
			currentPageName: "All-Apps",
			newAppIsCustom: newappinfo.isCustom,
			orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
			orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
		});
	};

	function handleReselect() {
		setSelectedApp("");
		setnewappinfo({
			...newappinfo,
			app_parent_id: "",
		});
		setValidation({});
	}

	const renderAppOwnerSelectField = () => {
		return (
			<>
				<Form.Group
					style={{
						fontSize: "12px",
					}}
					ref={appOwnerRef}
					onClick={() =>
						newappinfo.app_owner.length > 0 &&
						setShowUserSuggestions(true)
					}
				>
					<Form.Label>Owner</Form.Label>
					<Form.Control
						style={{ width: "100%" }}
						type="text"
						placeholder="Add Owner"
						value={newappinfo.app_owner}
						isInvalid={isInvalid("app_owner_id")}
						onChange={(e) => handleAppOwnerChange(e.target.value)}
					/>
					<Form.Control.Feedback type="invalid">
						Please select a valid owner.{" "}
					</Form.Control.Feedback>
				</Form.Group>
				<div className="position-relative w-100" ref={appOwnerRef}>
					<SuggestionMenu
						show={showUserSuggestions}
						loading={userSuggestionsLoading}
						options={userSuggestions}
						onSelect={handleAppOwnerSelect}
						dataKeys={{
							image: "profile_img",
							text: "user_name",
							email: "user_email",
						}}
						className="add-app-suggestion-menu"
					/>
				</div>
			</>
		);
	};

	const renderTagsField = () => {
		return (
			<Form.Group
				style={{
					fontSize: "12px",
				}}
			>
				<Form.Label>Tags</Form.Label>
				<Tags
					value={newappinfo.app_tags.join(",")}
					className="form-control"
					placeholder="Add Tags"
					settings={{
						originalInputValueFormat: (valuesArr) =>
							valuesArr.map((item) => item.value),
					}}
					onChange={(e) =>
						handleChange(
							"app_tags",
							e.target.value ? e.target.value.split(",") : []
						)
					}
				/>
			</Form.Group>
		);
	};

	const onValueChangeFromCustomFields = (id, val) => {
		if (typeof val === "string") {
			val = val?.trimStart();
		}
		const customFields = [...newappinfo.app_custom_fields];
		const index = customFields.findIndex((cf) => cf.field_id === id);
		customFields.splice(index, index > -1 ? 1 : 0, {
			field_id: id,
			field_value: val,
		});
		let appInfoNew = { ...newappinfo };
		appInfoNew.app_custom_fields = customFields;
		setnewappinfo(appInfoNew);
	};

	useOutsideClickListener(appCategoryRef, () => {
		setShowAppCategorySuggestions(false);
	});

	useOutsideClickListener(appOwnerRef, () => {
		setShowUserSuggestions(false);
	});

	const getAllCategories = () => {
		searchAppCategories()
			.then((res) => {
				setAppCategories(res.results);
				setAllAppCategories(res.results);
				setAppCategorySuggestionsLoading(false);
			})
			.catch((err) => {
				TriggerIssue("Error in fetching categories", err);
				return [];
			});
	};

	return (
		<>
			<div show={props.show} className="addContractModal__TOP h-100">
				<div className="d-flex flex-row align-items-center py-4">
					<div className="m-auto">
						<span className="contracts__heading">
							Add New Application
						</span>
					</div>
					<img
						alt="Close"
						onClick={props.onHide}
						src={close}
						className="cursor-pointer mr-4"
					/>
				</div>
				<div
					style={{ height: "calc(100vh - 160px)", overflowY: "auto" }}
				>
					<div className="allapps__uppermost border-top border-bottom">
						<Form className="w-100">
							<Form.Group
								style={{ fontSize: 14 }}
								className="my-2"
							>
								<Form.Label>Select Application</Form.Label>
								{isCustomApp && (
									<>
										<Form.Control
											className="w-100"
											type="text"
											value={newappinfo.app_name}
											placeholder="Application"
											isInvalid={isInvalid("app_name")}
											onChange={(e) =>
												handleChange(
													"app_name",
													e.target.value
												)
											}
										/>
										<Form.Control.Feedback type="invalid">
											Please enter the name.
										</Form.Control.Feedback>
									</>
								)}
								{!isCustomApp && !selectedApp && (
									<>
										<Form.Control
											disabled={!!selectedApp}
											className="w-100"
											type="text"
											value={newappinfo.app_name}
											placeholder="Application"
											isInvalid={isInvalid(
												"app_parent_id"
											)}
											onChange={(e) =>
												handleAppNameChange(
													e.target.value
												)
											}
										/>
										<Form.Control.Feedback type="invalid">
											Please select an application.
										</Form.Control.Feedback>
										<div className="position-relative w-100">
											<SuggestionMenu
												show={showAppSuggestions}
												loading={appSuggestionsLoading}
												options={appSuggestions}
												onSelect={handleAppSelect}
												dataKeys={{
													image: "app_image_url",
													text: "app_name",
													additional_information:
														"app_integration_id",
													category:
														"app_sub_categories",
													app_url: "app_url",
												}}
												showAdditionalRightInformation={
													true
												}
												additionalInformationFormatter={(
													value
												) => {
													if (value) {
														return IntegrationAvailableSection();
													}
												}}
											>
												<div className="text-center border-top">
													<button
														className="SuggestionBar__button"
														onClick={
															switchToCustomAppCreationView
														}
													>
														Add New Application
													</button>
												</div>
											</SuggestionMenu>
										</div>
									</>
								)}
								{!isCustomApp && !!selectedApp && (
									<>
										<div
											onClick={handleReselect}
											className="d-flex align-items-center rounded-lg border bg-white py-2 px-3 mb-3"
										>
											{selectedApp.app_image_url ? (
												<img
													className="mr-3"
													width="26"
													src={
														selectedApp.app_image_url
													}
													alt={selectedApp.app_name}
												/>
											) : (
												<NameBadge
													className="mr-3"
													width={26}
													height={26}
													name={selectedApp.app_name}
												/>
											)}
											<span style={{ fontSize: 18 }}>
												{selectedApp.app_name}
											</span>
										</div>
										{selectedApp.app_sub_categories && (
											<div className="font-11 grey-1 mr-2 mb-2">
												{
													selectedApp
														.app_sub_categories?.[0]
														?.sub_category_name
												}
											</div>
										)}
										{selectedApp.app_short_description && (
											<div
												className="mb-2"
												style={{
													fontSize: 12,
													color: "#717171",
												}}
											>
												{
													selectedApp.app_short_description
												}
											</div>
										)}
										{selectedApp.app_description && (
											<div
												className="mb-3"
												style={{ fontSize: 14 }}
											>
												{selectedApp.app_description}
											</div>
										)}
										{selectedApp.app_url && (
											<div
												className="glow_blue font-13 truncate_user_name cursor-pointer"
												onClick={(e) => {
													e.stopPropagation();
													window.open(
														`${withHttp(
															selectedApp.app_url
														)}`,
														"_blank"
													);
												}}
											>
												{selectedApp.app_url}
											</div>
										)}
										{similarApps.length > 0 && (
											<div>
												<div
													className="cursor-pointer"
													style={{ fontWeight: 500 }}
													onClick={() =>
														setShowSimilarApps(
															!showSimilarApps
														)
													}
												>
													Similar to{" "}
													<span>
														{similarApps.length}
													</span>{" "}
													apps you use
													<img
														src={
															showSimilarApps
																? AngleUp
																: AngleDown
														}
														width="10"
														className="ml-2"
													/>
												</div>
												{showSimilarApps && (
													<>
														<hr className="my-2" />
														{similarApps.map(
															(app) => (
																<div className="d-flex align-items-center py-2">
																	<div className="mr-2">
																		{app.image ? (
																			<img
																				src={
																					app.image
																				}
																				width="40"
																			/>
																		) : (
																			<NameBadge
																				name={
																					app.name
																				}
																				width={
																					40
																				}
																			/>
																		)}
																	</div>
																	<div
																		style={{
																			flexGrow: 1,
																		}}
																	>
																		<span
																			style={{
																				fontSize: 16,
																			}}
																		>
																			{
																				app.name
																			}
																		</span>
																	</div>
																	<Link
																		to={`/applications/${encodeURI(
																			app._id
																		)}#overview`}
																		style={{
																			color: "#2266E2",
																		}}
																	>
																		View
																	</Link>
																</div>
															)
														)}
													</>
												)}
											</div>
										)}
									</>
								)}
							</Form.Group>
						</Form>
					</div>
					<div className="addappsmodal__middle">
						{isCustomApp && (
							<div className="addappsmodal__newapps">
								<Form>
									<EditApplicationType
										name="app_type"
										value={newappinfo.app_type}
										invalid={isInvalid("app_type")}
										change={(key, val) =>
											handleChange(key, val)
										}
									/>
									<Form.Group
										style={{
											fontSize: "12px",
										}}
									>
										<Form.Label>Website</Form.Label>
										<Form.Control
											style={{ width: "100%" }}
											type="text"
											value={newappinfo.app_web_url}
											placeholder="Website"
											isInvalid={
												isInvalid("app_web_url") ||
												props.validationErrors?.errors?.some(
													(err) =>
														err.param ===
														"app_web_url"
												)
											}
											onChange={(e) =>
												handleChange(
													"app_web_url",
													e.target.value
												)
											}
										/>
										<Form.Control.Feedback type="invalid">
											Please enter valid URL.
										</Form.Control.Feedback>
									</Form.Group>
									<Form.Group>
										<div className="addappsmodal__newapps__d1">
											App Logo
										</div>
										<div className="addappsmodal__newapps__d2">
											<div
												className={
													"logo-preview mr-4 " +
													(uploadInProgress
														? "loading"
														: "")
												}
											>
												{uploadInProgress && (
													<div className="preview-loader">
														<Spinner animation="border" />
													</div>
												)}
												<img
													src={
														appLogo ||
														newappinfo.app_logo_url ||
														uploadimage
													}
													width="80"
												/>
											</div>
											<Form.Group>
												<Form.File
													id="app_logo_url"
													accept={SUPPORTED_IMAGE_FORMATS.toString()}
													// accept="*"
													disabled={uploadInProgress}
													label="Select File"
												>
													<Form.File.Input
														onChange={
															handleAppLogoChange
														}
														isInvalid={isInvalid(
															"app_logo_url"
														)}
													/>
													<Form.File.Label className="btn btn-secondary">
														Select File
													</Form.File.Label>
													<Form.Control.Feedback
														className="font-9"
														type="invalid"
													>
														Please upload
														application logo.
													</Form.Control.Feedback>
												</Form.File>
											</Form.Group>
										</div>
									</Form.Group>
									<Form.Group
										controlId="exampleForm.ControlTextarea1"
										style={{
											fontSize: "12px",
										}}
									>
										<Form.Label>
											Short Description
										</Form.Label>
										<Form.Control
											as="textarea"
											rows="2"
											value={
												newappinfo.app_short_description
											}
											placeholder="Short Description"
											isInvalid={isInvalid(
												"app_short_description"
											)}
											style={{
												color: "#717171",
												fontSize: "14px",
											}}
											onChange={(e) =>
												handleChange(
													"app_short_description",
													e.target.value
												)
											}
										/>
										<Form.Control.Feedback type="invalid">
											Please enter the short description.
										</Form.Control.Feedback>
									</Form.Group>
									<Form.Group
										controlId="exampleForm.ControlTextarea1"
										style={{
											fontSize: "12px",
										}}
									>
										<Form.Label>Description</Form.Label>
										<Form.Control
											as="textarea"
											rows="4"
											value={newappinfo.app_description}
											placeholder="Description"
											isInvalid={isInvalid(
												"app_description"
											)}
											style={{
												color: "#717171",
												fontSize: "14px",
											}}
											onChange={(e) =>
												handleChange(
													"app_description",
													e.target.value
												)
											}
										/>
										<Form.Control.Feedback type="invalid">
											Please enter the description.
										</Form.Control.Feedback>
									</Form.Group>
									<Form.Group
										style={{
											fontSize: "12px",
										}}
										onClick={() =>
											setShowAppCategorySuggestions(
												!showAppCategorySuggestions
											)
										}
										ref={appCategoryRef}
									>
										<Form.Label>Category</Form.Label>
										<Form.Control
											style={{ width: "100%" }}
											type="text"
											placeholder="Add Category"
											value={newappinfo.app_category_name}
											isInvalid={isInvalid(
												"app_category_id"
											)}
											onChange={(e) =>
												handleCategoryChange(
													e.target.value
												)
											}
										/>
										<Form.Control.Feedback type="invalid">
											Please select the category.
										</Form.Control.Feedback>
									</Form.Group>
									<div
										className="position-relative w-100"
										ref={appCategoryRef}
									>
										<SuggestionMenu
											show={showAppCategorySuggestions}
											loading={
												appCategorySuggestionsLoading
											}
											options={appCategories}
											onSelect={handleCategorySelect}
											dataKeys={{
												image: "profile_img",
												text: "category_name",
												email: "name",
											}}
											className="add-app-suggestion-menu"
										/>
									</div>
									{renderAppOwnerSelectField()}
									<Form.Group
										style={{
											fontSize: "12px",
										}}
									>
										<Form.Label>Budget</Form.Label>
										<Form.Control
											type="number"
											placeholder="Budget"
											value={newappinfo.app_budget}
											onChange={(e) =>
												e.target.value
													? !isNaN(
															Number(
																e.target.value
															)
													  ) &&
													  handleChange(
															"app_budget",
															Number(
																e.target.value
															)
													  )
													: handleChange(
															"app_budget",
															null
													  )
											}
										/>
										<Form.Control.Feedback type="invalid">
											Please enter app's budget
										</Form.Control.Feedback>
									</Form.Group>
									{renderTagsField()}
									<CustomFieldSectionInForm
										customFieldData={
											newappinfo.app_custom_fields
										}
										of={CUSTOM_FIELD_ENTITY.APPLICATIONS}
										onValueChange={(id, val) =>
											onValueChangeFromCustomFields(
												id,
												val
											)
										}
									/>
								</Form>
							</div>
						)}
						{!isCustomApp && !!selectedApp && (
							<div className="px-5 py-4">
								<Form>
									<EditApplicationType
										name="app_type"
										value={newappinfo.app_type}
										invalid={isInvalid("app_type")}
										change={(key, val) =>
											handleChange(key, val)
										}
									/>
									{renderAppOwnerSelectField()}
									<Form.Group
										style={{
											fontSize: "12px",
										}}
									>
										<Form.Label>Budget</Form.Label>
										<Form.Control
											type="number"
											placeholder="Budget"
											value={newappinfo.app_budget}
											onChange={(e) =>
												e.target.value
													? !isNaN(
															Number(
																e.target.value
															)
													  ) &&
													  handleChange(
															"app_budget",
															Number(
																e.target.value
															)
													  )
													: handleChange(
															"app_budget",
															null
													  )
											}
										/>
										<Form.Control.Feedback type="invalid">
											Please enter app's budget
										</Form.Control.Feedback>
									</Form.Group>
									{renderTagsField()}
									<CustomFieldSectionInForm
										customFieldData={
											newappinfo.app_custom_fields
										}
										of={CUSTOM_FIELD_ENTITY.APPLICATIONS}
										onValueChange={(id, val) =>
											onValueChangeFromCustomFields(
												id,
												val
											)
										}
									/>
								</Form>
							</div>
						)}
					</div>
					<div
						className="fixed-bottom text-right border-top bg-white py-4"
						style={{
							left: "calc(100% - 528px)",
							zIndex: 200,
						}}
					>
						<Button
							variant="link"
							size="sm"
							className="mr-2"
							onClick={props.onHide}
						>
							Cancel
						</Button>
						<Button
							size="sm"
							disabled={props.submitting || uploadInProgress}
							onClick={handleSubmit}
							style={{ marginRight: "40px" }}
						>
							Add Application
							{props.submitting && (
								<Spinner
									animation="border"
									role="status"
									variant="light"
									size="sm"
									className="ml-2"
									style={{ borderWidth: 2 }}
								>
									<span className="sr-only">Loading...</span>
								</Spinner>
							)}
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
