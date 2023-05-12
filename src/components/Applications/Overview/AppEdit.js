import React, { useState, useEffect } from "react";
import { Modal, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import "./Overview.css";
import "./select-filter.css";
import "./select-tag.css";
import "@yaireo/tagify/dist/tagify.css";
import { searchUsers } from "../../../services/api/search";
import close from "../../../assets/close.svg";
import ShowMoreText from "react-show-more-text";
import { AsyncTypeahead } from "../../../common/Typeahead/AsyncTypeahead";
import Tags from "@yaireo/tagify/dist/react.tagify";
import PropTypes from "prop-types";
import { useDidUpdateEffect } from "../../../utils/componentUpdateHook";
import { ConsoleHelper } from "../../../utils/consoleHelper";
import { applicationState, EditApplicationType } from "../EditApplicationType";
import uploadimage from "../AllApps/uploadimage.svg";
import { uploadImage } from "../../../services/upload/upload";
import { SUPPORTED_IMAGE_FORMATS } from "../../../constants/upload";
import { CustomFieldSectionInForm } from "../../../modules/shared/components/CustomFieldSectionInForm/CustomFieldSectionInForm";
import { CUSTOM_FIELD_ENTITY } from "../../../modules/custom-fields/constants/constant";
import needsreview from "../../../assets/applications/needsreview.svg";
import restricted from "../../../assets/applications/restricted.svg";
import authorised from "../../../assets/applications/authorised.svg";
import { useDispatch, useSelector } from "react-redux";
import unmanaged from "../../../assets/applications/unmanaged.svg";
import teammanaged from "../../../assets/applications/teammanaged.svg";
import individuallymanaged from "../../../assets/applications/individuallymanaged.svg";
import { AppAuthStatusIconAndTooltip } from "../../../common/AppAuthStatus";
import { unescape } from "../../../utils/common";
import { NameBadge } from "../../../common/NameBadge";
import _ from "underscore";
export function AppEdit(props) {
	const defaultAppState = {
		app_owner: "",
		app_status: false,
		app_auto_renewal: false,
		app_tags: [],
		app_type: applicationState.APPLICATION,
		app_name: "",
		app_logo_url: "",
		app_web_url: "",
		app_short_description: "",
		app_description: "",
		app_is_custom: false,
		app_custom_fields: [],
		app_parent_id: "",
		app_owner_id: "",
		app_budget: null,
	};
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const { application } = props;
	const [newappinfo, setnewappinfo] = useState({ ...defaultAppState });
	const [tags, setTags] = useState([]);
	const [uploadInProgress, setUploadInProgress] = useState(false);
	const [validation, setValidation] = useState({});
	const [appOwner, setAppOwner] = useState("");

	useEffect(() => {
		//Segment Implementation
		window.analytics.page(
			"Applications",
			"Application-Overview; Edit-Application",
			{
				orgId: orgId || "",
				orgName: orgName || "",
			}
		);
	}, []);

	useEffect(() => {
		if (props.application) {
			const { application } = props;
			const { app_owner, app_technical_owner, app_financial_owner } =
				application;
			let tempObj = {
				...defaultAppState,
				app_owner_id: app_owner.owner_id || "",
				app_owner: app_owner.owner_name || "",
				app_technical_owner_id: app_technical_owner.owner_id || "",
				app_technical_owner: app_technical_owner.owner_name || "",
				app_financial_owner_id: app_financial_owner.owner_id || "",
				app_financial_owner: app_financial_owner.owner_name || "",
				app_status: application.app_status,
				app_tags: application.app_tags ? application.app_tags : [],
				app_auto_renewal: application.app_autorenew,
				app_type: application.app_type,
				app_name: application.app_name,
				app_logo_url: application.app_logo,
				app_web_url: unescape(application.app_web_url),
				app_short_description: application.app_short_description,
				app_description: application.app_description,
				app_is_custom: application.app_is_custom,
				app_custom_fields: application.app_custom_fields,
				app_budget: application.app_budget || 0,
			};
			if (app_owner.app_owner_id) {
				tempObj = {
					...tempObj,
					app_owner_id: app_owner.app_owner_id || "",
				};
			}
			setnewappinfo(tempObj);
			setAppOwner(app_owner ? app_owner.owner_name : "");
		}
	}, [props.application]);

	useDidUpdateEffect(() => {
		setnewappinfo({
			...newappinfo,
			app_tags: [...tags],
		});
	}, [tags]);

	const handleAppEdit = (key, value) => {
		if (typeof value === "string") {
			value = value?.trimStart();
		}
		validateField(key, value);
		// FIXME: Speacial handling for tags input due to a memoization bug with the library
		if (key === "app_tags") {
			setTags(value);
			return;
		}

		let appObj = { ...newappinfo, [key]: value };
		setnewappinfo(appObj);
	};

	const handleAppEdit2 = (key, value) => {
		validateField(key, value);
		let appObj = { ...newappinfo, [key]: value ? value : null };
		setnewappinfo(appObj);
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

	const isInvalid = (fieldName) => !!validation[fieldName]?.msg;

	const validateApp = (newappinfo) => {
		const requiredFields = application?.app_is_custom ? ["app_name"] : [];
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

	const handleAppLogoChange = (e) => {
		let file = e.target.files[0];
		setUploadInProgress(true);
		uploadImage(file)
			.then((res) => {
				setUploadInProgress(false);
				handleAppEdit("app_logo_url", res.resourceUrl);
			})
			.catch((err) => {
				console.error("Error uploading image:", err);
				setUploadInProgress(false);
			});
	};

	const onValueChangeFromCustomFields = (id, val) => {
		if (typeof val === "string") {
			val = val?.trimStart();
		}
		const customFields = [...newappinfo.app_custom_fields];
		const index = customFields.findIndex((cf) => cf.field_id === id);
		customFields.splice(index, index > -1 ? 1 : 0, {
			...customFields[index],
			field_id: id,
			field_value: val,
		});
		setnewappinfo({
			...newappinfo,
			...{ app_custom_fields: customFields },
		});
	};

	const handleSubmit = () => {
		let escapedAppLogo = newappinfo.app_logo_url;
		let unescapedAppLogo = unescape(escapedAppLogo);
		let finalAppObj = { ...newappinfo, app_logo_url: unescapedAppLogo };
		setnewappinfo(finalAppObj);
		if (finalAppObj) {
			let errors = validateApp(finalAppObj);
			if (Object.keys(errors).length > 0) {
				setValidation(errors);
				return;
			}
		}
		const payload = newappinfo.app_is_custom
			? finalAppObj
			: _.omit(finalAppObj, "app_logo_url");
		props.onSubmit(payload);
	};

	return (
		<>
			<div className="modal-backdrop show"></div>
			<div
				show={props.show}
				onHide={props.onHide}
				className="addContractModal__TOP h-100"
			>
				<div className="d-flex border-bottom py-4">
					<div className="mx-auto">
						<span className="contracts__heading">Edit App</span>
					</div>
					<img
						alt="Close"
						onClick={props.onHide}
						src={close}
						className="cursor-pointer mr-3"
					/>
				</div>
				<div
					style={{ height: "calc(100vh - 160px)", overflowY: "auto" }}
				>
					<Form>
						{!application?.app_is_custom && (
							<div
								className="border-bottom py-4 px-5"
								style={{ backgroundColor: "#EBEBEB4D" }}
							>
								<div className="d-flex flex-row mb-3">
									<div className="d-flex align-items-center">
										{application.app_logo ? (
											<img
												src={application.app_logo}
												width="38"
												className="mr-2"
											/>
										) : (
											<NameBadge
												className="mr-2"
												name={application.app_name}
												width={38}
												borderRadius={"50%"}
											/>
										)}
										<div className="mr-1">
											{application.app_name}
										</div>
										<AppAuthStatusIconAndTooltip
											authStatus={
												application?.app_auth_status
											}
											className="pb-1"
										/>
									</div>
									<div className="d-flex flex-column">
										<span className="appEdit__uppermostinner1righttext1"></span>
										<span
											style={{
												fontSize: 11,
												color: "#717171",
											}}
										>
											{application.app_small_desc}
										</span>
									</div>
								</div>
								<div>
									<ShowMoreText
										lines={3}
										more="View more"
										less="View less"
										className="app-description"
										expanded={false}
									>
										{" "}
										<>{application.app_description}</>
									</ShowMoreText>
								</div>
							</div>
						)}
						{application?.app_is_custom && (
							<div
								className="border-bottom py-4 px-5"
								style={{ backgroundColor: "#EBEBEB4D" }}
							>
								<Form.Control
									className="w-100"
									type="text"
									value={newappinfo.app_name}
									placeholder="Application"
									isInvalid={isInvalid("app_name")}
									onChange={(e) =>
										handleAppEdit(
											"app_name",
											e.target.value
										)
									}
								/>
								<Form.Control.Feedback type="invalid">
									Please enter the name.
								</Form.Control.Feedback>
							</div>
						)}
						<div className="appEditModal__body_upper">
							<div className="w-100 px-5 py-4">
								<EditApplicationType
									name="app_type"
									value={newappinfo.app_type}
									invalid={isInvalid("app_type")}
									change={(key, val) =>
										handleAppEdit(key, val)
									}
								/>

								{application?.app_is_custom && (
									<>
										<Form.Group
											style={{
												fontSize: "12px",
											}}
										>
											<Form.Label>Website</Form.Label>
											<Form.Control
												value={newappinfo.app_web_url}
												style={{ width: "100%" }}
												type="text"
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
													handleAppEdit(
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
															unescape(
																newappinfo.app_logo_url
															) || uploadimage
														}
														width="80"
													/>
												</div>
												<label className="custom-file-addapps cursor-pointer">
													<input
														type="file"
														accept={SUPPORTED_IMAGE_FORMATS.toString()}
														// accept="*"
														disabled={
															uploadInProgress
														}
														onChange={
															handleAppLogoChange
														}
													/>
													Select File
												</label>
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
												placeholder="Short Description"
												value={
													newappinfo.app_short_description
												}
												style={{
													color: "#717171",
													fontSize: "14px",
												}}
												onChange={(e) =>
													handleAppEdit(
														"app_short_description",
														e.target.value
													)
												}
											/>
											<Form.Control.Feedback type="invalid">
												Please enter the short
												description.
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
												placeholder="Description"
												value={
													newappinfo.app_description
												}
												style={{
													color: "#717171",
													fontSize: "14px",
												}}
												onChange={(e) =>
													handleAppEdit(
														"app_description",
														e.target.value
													)
												}
											/>
											<Form.Control.Feedback type="invalid">
												Please enter the description.
											</Form.Control.Feedback>
										</Form.Group>
									</>
								)}

								<AsyncTypeahead
									label="Owner"
									placeholder="Owner"
									fetchFn={searchUsers}
									invalidMessage="Please enter the owner's name."
									defaultValue={newappinfo.app_owner}
									onSelect={(selection) => {
										handleAppEdit2(
											"app_owner_id",
											selection.user_id
										);
										setAppOwner(selection.user_name);
									}}
									keyFields={{
										id: "user_id",
										image: "profile_img",
										value: "user_name",
										email: "user_email",
									}}
									onChange={() =>
										handleAppEdit2("app_owner_id", null)
									}
									allowFewSpecialCharacters={true}
								/>
								<AsyncTypeahead
									label="IT Owner"
									placeholder="IT Owner"
									fetchFn={searchUsers}
									invalidMessage="Please enter the IT owner's name."
									defaultValue={
										newappinfo.app_technical_owner
									}
									onSelect={(selection) => {
										handleAppEdit2(
											"app_technical_owner_id",
											selection.user_id
										);
									}}
									onChange={() =>
										handleAppEdit2(
											"app_technical_owner_id",
											null
										)
									}
									keyFields={{
										id: "user_id",
										image: "profile_img",
										value: "user_name",
										email: "user_email",
									}}
									allowFewSpecialCharacters={true}
								/>
								<AsyncTypeahead
									label="Finance Owner"
									placeholder="Finance Owner"
									fetchFn={searchUsers}
									invalidMessage="Please enter the finance owner's name."
									defaultValue={
										newappinfo.app_financial_owner
									}
									onSelect={(selection) => {
										handleAppEdit2(
											"app_financial_owner_id",
											selection.user_id
										);
									}}
									onChange={() =>
										handleAppEdit2(
											"app_financial_owner_id",
											null
										)
									}
									keyFields={{
										id: "user_id",
										image: "profile_img",
										value: "user_name",
										email: "user_email",
									}}
									allowFewSpecialCharacters={true}
								/>

								<Form.Group
									style={{
										fontSize: "12px",
									}}
								>
									<Form.Label>Budget</Form.Label>
									<Form.Control
										type="number"
										placeholder="Budget"
										value={newappinfo?.app_budget}
										onChange={(e) =>
											e.target.value
												? !isNaN(
														Number(e.target.value)
												  ) &&
												  handleAppEdit(
														"app_budget",
														Number(e.target.value)
												  )
												: handleAppEdit(
														"app_budget",
														null
												  )
										}
									/>
									<Form.Control.Feedback type="invalid">
										Please enter app's budget
									</Form.Control.Feedback>
								</Form.Group>
								<Row style={{ marginBottom: "15px" }}>
									<Col>
										<Form.Label>Status</Form.Label>
										<Form.Control
											className="cursor-pointer"
											as="select"
											defaultValue={
												application.app_status
											}
											isInvalid={isInvalid("app_status")}
											onChange={(e) => {
												let { value } = e.target;
												handleAppEdit(
													"app_status",
													value
												);
											}}
										>
											<option value="active">
												Active
											</option>
											<option value="inactive">
												Inactive
											</option>
										</Form.Control>
										<Form.Control.Feedback type="invalid">
											Invalid Value
										</Form.Control.Feedback>
									</Col>
									<Col>
										<Form.Label>Auto Renewal</Form.Label>
										<Form.Control
											className="cursor-pointer"
											as="select"
											placeholder="Date"
											isInvalid={isInvalid(
												"app_auto_renewal"
											)}
											defaultValue={
												application.app_autorenew
											}
											onChange={(e) => {
												let { value } = e.target;
												handleAppEdit(
													"app_auto_renewal",
													value
												);
											}}
										>
											<option value={true}>On</option>
											<option value={false}>Off</option>
										</Form.Control>
										<Form.Control.Feedback type="invalid">
											Invalid Value
										</Form.Control.Feedback>
									</Col>
								</Row>

								<Form.Group
									style={{
										fontSize: "12px",
									}}
								>
									<Form.Label>Tags</Form.Label>
									<Tags
										defaultValue={newappinfo.app_tags.join(
											","
										)}
										value={newappinfo.app_tags.join(",")}
										className="form-control"
										placeholder="Add Tags"
										settings={{
											originalInputValueFormat: (
												valuesArr
											) =>
												valuesArr.map(
													(item) => item.value
												),
										}}
										onChange={(e) => {
											e.persist();
											ConsoleHelper(e);
											handleAppEdit(
												"app_tags",
												e.target.value
													? e.target.value.split(",")
													: []
											);
										}}
									/>
								</Form.Group>

								<CustomFieldSectionInForm
									customFieldData={
										newappinfo.app_custom_fields
									}
									of={CUSTOM_FIELD_ENTITY.APPLICATIONS}
									onValueChange={(id, val) => {
										onValueChangeFromCustomFields(id, val);
									}}
								/>
							</div>
						</div>
					</Form>
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
						className="mr-3"
						onClick={props.onHide}
					>
						Cancel
					</Button>
					<Button
						size="sm"
						disabled={props.submitting}
						onClick={handleSubmit}
						className="mr-3"
					>
						Save
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
		</>
	);
}

AppEdit.propTypes = {
	application: PropTypes.object.isRequired,
	submitting: PropTypes.bool,
	validationErrors: PropTypes.array,
	onHide: PropTypes.func.isRequired,
	onSubmit: PropTypes.func.isRequired,
};
