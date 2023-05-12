import React, { useState, useRef, useCallback, useEffect } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import "@yaireo/tagify/dist/tagify.css";
import close from "../../../assets/close.svg";
import { searchAppCompliance } from "../../../services/api/search";
import { client } from "../../../utils/client";
import { SuggestionMenu } from "../../../common/SuggestionMenu/SuggestionMenu";
import { debounce } from "../../../utils/common";
import {
	addCompliance,
	updateCompliance,
	addCustomCompliance,
	getApplicationComplianceDetails,
} from "../../../services/api/applications";
import { checkSpecialCharacters } from "../../../services/api/search";
import { DatePicker } from "../../../UIComponents/DatePicker/DatePicker";
import { SelectOld } from "../../../UIComponents/SelectOld/Select";
import add from "../Contracts/add.svg";
import adddocu from "../Contracts/adddocument.svg";
import {
	isValidFile,
	SUPPORTED_FILE_FORMATS,
	SUPPORTED_IMAGE_FORMATS,
} from "../../../constants/upload";
import { FileUpload } from "../Contracts/FileUpload";
import uploadimage from "../AllApps/uploadimage.svg";
import { uploadImage } from "../../../services/upload/upload";
import bluePlus from "../../../assets/icons/plus-blue.svg";
import warning from "../../Onboarding/warning.svg";
import ContentLoader from "react-content-loader";
import _ from "underscore";
import DownloadInSamePage from "modules/shared/components/DownloadInSamePage/DownloadInSamePage";
import deleteIcon from "assets/deleteIcon.svg";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";
import NewDatePicker from "UIComponents/DatePicker/NewDatePicker";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";

const complianceDetailKeyMap = {
	status: "compliance_status",
	name: "compliance_name",
	link: "compliance_link",
	logo: "compliance_image",
	description: "compliance_description",
	effective_from: "compliance_start_date",
	expires_on: "compliance_end_date",
	proofs: "proofs",
	documents: "documents",
};

export function AddCompliance(props) {
	const defaultComplianceState = {
		org_app_id: props?.application?.app_id,
		status: "",
		proofs: [],
		documents: [],
		name: "",
		link: "",
		logo: "",
		description: "",
		complianceId: "",
		effective_from: "",
		expires_on: "",
		is_global_asset: false,
	};

	const [complianceSuggestions, setComplianceSuggestions] = useState([]);
	const [isCustom, setIsCustom] = useState(false);
	const [submitting, setIsSubmitting] = useState(false);
	const [showcomplianceSuggestions, setShowComplianceSuggestions] =
		useState(false);
	const [loading, setLoading] = useState(props.editMode);
	const [error, setError] = useState(false);
	const [suggestionsDisabled, setSuggestionsDisabled] = useState(false);

	const [selectedCompliance, setSelectedCompliance] = useState(null);
	const [newcomplianceinfo, setnewcomplianceinfo] = useState({
		...defaultComplianceState,
	});
	const [complianceSuggestionsLoading, setComplianceSuggestionsLoading] =
		useState(true);
	const [link, setLink] = useState("");
	const [uploadInProgress, setUploadInProgress] = useState(false);
	const [validation, setValidation] = useState({});
	const [invalidFileUploaded, setInavlidFileUploaded] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [uploadedFile, setUploadedFile] = useState("");

	const cancelToken = useRef();

	const handleChange = (key, value) => {
		validateField(key, value);

		setnewcomplianceinfo({
			...newcomplianceinfo,
			[key]: value,
		});
	};

	useEffect(() => {
		if (props.application && !props.editMode) {
			setnewcomplianceinfo({
				...newcomplianceinfo,
				...{ org_app_id: props.application?.app_id },
			});
		}
	}, [props.application]);

	const fetchComplianceData = () => {
		setLoading(true);
		getApplicationComplianceDetails(
			props.application.app_id,
			props.compliance?.compliance_id
		)
			.then((compliance) => {
				const updatedCompliance = {};
				Object.entries(complianceDetailKeyMap).map(
					([stateKey, respKey]) => {
						updatedCompliance[stateKey] = compliance[respKey];
					}
				);

				updatedCompliance.complianceId = props.compliance.compliance_id;
				updatedCompliance.org_app_id = props.application.app_id;
				if (!compliance?.is_custom) {
					setSelectedCompliance(updatedCompliance);
				}
				setnewcomplianceinfo(updatedCompliance);
				setIsCustom(compliance?.is_custom);
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
				setError(true);
			});
	};

	useEffect(() => {
		if (props.compliance?.compliance_id && props.editMode) {
			setSuggestionsDisabled(true);

			fetchComplianceData();
		}
	}, [props.compliance?.compliance_id]);

	const switchToCustomComplianceCreationView = () => {
		setIsCustom(true);
		setValidation({});
		setSuggestionsDisabled(true);
		let name = newcomplianceinfo.name;
		setnewcomplianceinfo({ ...defaultComplianceState, ...{ name: name } });
		setShowComplianceSuggestions(false);
		setComplianceSuggestionsLoading(false);
		setSelectedCompliance("");
	};

	const handleComplianceNameChange = (query) => {
		query = query?.trimStart();
		setnewcomplianceinfo({
			...newcomplianceinfo,
			name: query,
		});

		if (suggestionsDisabled) return;
		if (cancelToken.current)
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);

		if (query.length == 0) {
			setShowComplianceSuggestions(false);
			setComplianceSuggestionsLoading(false);
			setSelectedCompliance("");
			delete newcomplianceinfo.name;
			delete newcomplianceinfo.complianceId;
			setnewcomplianceinfo({
				...newcomplianceinfo,
			});
			return;
		}
		if (checkSpecialCharacters(query)) {
			setShowComplianceSuggestions(true);
			setComplianceSuggestionsLoading(false);
			return;
		}
		setComplianceSuggestionsLoading(true);
		setShowComplianceSuggestions(true);
		cancelToken.current = client.CancelToken.source();
		generateComplianceSuggestions(query, cancelToken.current);
	};

	const generateComplianceSuggestions = useCallback(
		debounce((query, reqCancelToken) => {
			if (query && query.length >= 1) {
				searchAppCompliance(
					props.application?.app_id,
					query,
					reqCancelToken
				)
					.then((res) => {
						if (res) {
							res = res.filter(
								(compliance) =>
									!props.complianceIdArray.includes(
										compliance._id
									)
							);
							setComplianceSuggestions(res);
						}

						setComplianceSuggestionsLoading(false);
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

	const handleComplianceSelect = (compliance) => {
		const { name, logo, _id, description } = compliance;
		setnewcomplianceinfo({
			...defaultComplianceState,
			name,
			complianceId: _id,
			logo: logo,
			description,
		});
		setShowComplianceSuggestions(false);
		setSelectedCompliance(compliance);
		setIsCustom(false);
	};

	const handleComplianceLogoChange = (e) => {
		let file = e.target.files[0];

		setUploadInProgress(true);

		uploadImage(file)
			.then((res) => {
				setUploadInProgress(false);
				setnewcomplianceinfo({
					...newcomplianceinfo,
					...{ logo: res?.resourceUrl },
				});
			})
			.catch((err) => {
				console.error("Error uploading image:", err);
				setUploadInProgress(false);
			});
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

	const handleFileSelection = (e) => {
		let fileArray = [];
		const fileObj = e.target.files;
		Object.keys(fileObj).forEach((fileObjKey) => {
			if (isValidFile(fileObj[fileObjKey])) {
				fileArray.push(fileObj[fileObjKey]);
			} else {
				setInavlidFileUploaded(true);
				setTimeout(() => {
					setInavlidFileUploaded(false);
				}, 5000);
			}
		});
		setSelectedFiles([...selectedFiles, ...fileArray]);
	};

	const handleFileUploadCancel = (file, resourceUrl) => {
		let filterredSelectedFiles = selectedFiles.filter(
			(selectedFile) => selectedFile.name !== file.name
		);
		const tempNewCompliance = { ...newcomplianceinfo };
		tempNewCompliance.documents = filterredSelectedFiles;
		setnewcomplianceinfo(tempNewCompliance);
		setSelectedFiles(filterredSelectedFiles);
		setUploadedFile("");
	};

	const handleComplete = (name, source_url, file) => {
		const { size, type } = file;
		const document = {
			name,
			source_url,
			size,
			type,
		};
		const { documents } = newcomplianceinfo;
		documents.push(document);
		setnewcomplianceinfo({ ...newcomplianceinfo, ...{ documents } });
	};
	const isInvalid = (fieldName) => {
		return !!validation[fieldName]?.msg;
	};

	const validateCompliance = () => {
		const requiredFields = ["name", "status"];
		const errors = {};
		requiredFields.forEach((fieldName) => {
			if (!newcomplianceinfo[fieldName]) {
				errors[fieldName] = {
					msg: `Please enter ${fieldName}`,
				};
			}
		});
		return errors;
	};

	const handleSubmit = () => {
		const errors = validateCompliance();
		if (!_.isEmpty(errors)) {
			setValidation(errors);
			return;
		}
		setIsSubmitting(true);
		const appId = props.application?.app_id;

		if (!newcomplianceinfo.expires_on) {
			delete newcomplianceinfo.expires_on;
		}

		Object.keys(newcomplianceinfo).forEach((key) => {
			if (
				typeof newcomplianceinfo[key] === "string"
					? newcomplianceinfo[key] === ""
					: typeof newcomplianceinfo[key] !== "boolean" &&
					  !newcomplianceinfo[key]
			) {
				delete newcomplianceinfo[key];
			}
		});

		if (props.editMode) {
			if (!isCustom) {
				delete newcomplianceinfo.logo;
			}
			updateCompliance(
				appId,
				newcomplianceinfo,
				newcomplianceinfo.complianceId
			)
				.then(() => {
					setIsSubmitting(false);
					props.onSubmit();
				})
				.catch((err) => {
					setIsSubmitting(false);
					ApiResponseNotification({
						title: "Error in editing the compliance",
						responseType: apiResponseTypes.ERROR,
						errorObj: err,
					});
				});

			return;
		}

		if (isCustom) {
			addCustomCompliance(appId, newcomplianceinfo)
				.then(() => {
					setIsSubmitting(false);
					props.onSubmit();
				})
				.catch((err) => {
					setIsSubmitting(false);
					ApiResponseNotification({
						title: "Error in adding the compliance",
						responseType: apiResponseTypes.ERROR,
						description: err?.response?.data?.errors?.[0]?.msg
							?.toLowerCase()
							?.includes("already exists")
							? "This compliance is already added to the application."
							: "",
						errorObj: err,
					});
				});
		} else {
			addCompliance(appId, newcomplianceinfo)
				.then(() => {
					setIsSubmitting(false);
					props.onSubmit();
				})
				.catch((err) => {
					setIsSubmitting(false);
					ApiResponseNotification({
						title: "Error in adding the compliance",
						responseType: apiResponseTypes.ERROR,
						description: err?.response?.data?.errors?.[0]?.msg
							?.toLowerCase()
							?.includes("already exists")
							? "This compliance is already added to the application."
							: "",
						errorObj: err,
					});
				});
		}
	};

	function handleReselect() {
		setSelectedCompliance("");
		setnewcomplianceinfo({
			...newcomplianceinfo,
			app_parent_id: "",
		});
		setValidation({});
	}

	const handleRemoveUploadedDocument = (index) => {
		const fileArray = newcomplianceinfo?.documents;
		if (index > -1) {
			fileArray.splice(index, 1);
		}
		setnewcomplianceinfo({
			...newcomplianceinfo,
			documents: fileArray,
		});
	};

	return (
		<>
			<div className="modal-backdrop show"></div>
			<div show={props.show} className="addContractModal__TOP h-100">
				<div className="d-flex flex-row align-items-center py-4">
					<div className="m-auto">
						<span className="contracts__heading">
							{props.editMode
								? "Edit Compliance"
								: "Add New Compliance"}
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
					{loading ? (
						_.times(5, (number) => (
							<div
								className="eventCard mb-3 ml-3 mr-3"
								key={number}
							>
								<ContentLoader height="105" width="100%">
									<rect
										width="160"
										height="10"
										rx="2"
										fill="#EBEBEB"
										y="15"
										x="20"
									/>
									<rect
										width="50%"
										height="17"
										rx="2"
										x={100}
										fill="#EBEBEB"
										y="35"
										x="20"
									/>
									<rect
										width="80%"
										height="12"
										rx="2"
										x={100}
										fill="#EBEBEB"
										y="63"
										x="20"
									/>
									<rect
										width="40%"
										height="12"
										rx="2"
										x={100}
										fill="#EBEBEB"
										y="85"
										x="20"
									/>
								</ContentLoader>
							</div>
						))
					) : error ? (
						<div
							className="d-flex flex-column p-3"
							style={{ height: "50vh" }}
						>
							<img
								src={warning}
								className="ml-auto mr-auto mt-auto"
								style={{ width: "45.42px" }}
							/>
							<div className="grey-1 font-18 text-center mt-2">
								An error occured. Please try again
							</div>
							<Button
								className="btn btn-outline-primary ml-auto mr-auto mt-2 mb-auto"
								onClick={() => window.reload()}
							>
								<div className="font-13">Retry</div>
							</Button>
						</div>
					) : (
						<>
							<div className="allapps__uppermost border-top border-bottom">
								<Form className="w-100">
									<Form.Group
										style={{ fontSize: 14 }}
										className="my-2"
									>
										<Form.Label>
											Select Compliance
										</Form.Label>

										{!selectedCompliance && (
											<>
												<Form.Control
													disabled={
														!!selectedCompliance
													}
													className="w-100"
													type="text"
													value={
														newcomplianceinfo.name
													}
													placeholder="Compliance"
													isInvalid={isInvalid(
														"name"
													)}
													onChange={(e) =>
														handleComplianceNameChange(
															e.target.value
														)
													}
												/>
												<Form.Control.Feedback type="invalid">
													Please select a compliance.
												</Form.Control.Feedback>
												<div className="position-relative w-100">
													<SuggestionMenu
														show={
															showcomplianceSuggestions
														}
														loading={
															complianceSuggestionsLoading
														}
														options={
															complianceSuggestions
														}
														onSelect={
															handleComplianceSelect
														}
														dataKeys={{
															image: "logo",
															text: "name",
														}}
													>
														<div className="text-center border-top">
															<button
																className="SuggestionBar__button d-flex align-items-center ml-auto mr-auto"
																onClick={
																	switchToCustomComplianceCreationView
																}
															>
																<img
																	src={
																		bluePlus
																	}
																	className="mr-2"
																/>
																Add New
																Compliance
															</button>
														</div>
													</SuggestionMenu>
												</div>
											</>
										)}
										{!!selectedCompliance && (
											<>
												<div
													onClick={handleReselect}
													className="d-flex align-items-center rounded-lg border bg-white py-2 px-3 mb-3"
												>
													<img
														className="mr-3"
														width="26"
														src={
															selectedCompliance.logo
														}
														alt={
															selectedCompliance.name
														}
													/>
													<span
														style={{ fontSize: 18 }}
													>
														{
															selectedCompliance.name
														}
													</span>
												</div>
												{selectedCompliance.description && (
													<div
														className="mb-2"
														style={{
															fontSize: 12,
															color: "#717171",
														}}
													>
														{
															selectedCompliance.description
														}
													</div>
												)}
											</>
										)}
									</Form.Group>
								</Form>
							</div>
							<div className="addappsmodal__middle">
								{(!!selectedCompliance ||
									suggestionsDisabled) && (
									<div className="px-5 py-4">
										<Form>
											{isCustom && (
												<>
													<Form.Group
														style={{
															fontSize: "12px",
														}}
													>
														<Form.Label>
															Description
														</Form.Label>
														<Form.Control
															style={{
																width: "100%",
															}}
															type="text"
															value={
																newcomplianceinfo.description
															}
															placeholder="Description"
															onChange={(e) =>
																handleChange(
																	"description",
																	e.target
																		.value
																)
															}
														/>
														<Form.Control.Feedback type="invalid">
															Please enter valid
															description.
														</Form.Control.Feedback>
													</Form.Group>
													<Form.Group>
														<div className="addappsmodal__newapps__d1">
															Compliance Logo
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
																		newcomplianceinfo.logo ||
																		uploadimage
																	}
																	width="80"
																/>
															</div>
															<Form.Group>
																<Form.File
																	id="compliance_logo_url"
																	accept={SUPPORTED_IMAGE_FORMATS.toString()}
																	// accept="*"
																	disabled={
																		uploadInProgress
																	}
																	label="Select File"
																>
																	<Form.File.Input
																		onChange={
																			handleComplianceLogoChange
																		}
																		isInvalid={isInvalid(
																			"logo"
																		)}
																	/>
																	<Form.File.Label className="btn btn-secondary">
																		Select
																		File
																	</Form.File.Label>
																	<Form.Control.Feedback
																		className="font-9"
																		type="invalid"
																	>
																		Please
																		upload
																		compliance
																		logo.
																	</Form.Control.Feedback>
																</Form.File>
															</Form.Group>
														</div>
													</Form.Group>
												</>
											)}
											<div className="d-flex justify-content-between">
												<div className="d-flex flex-column w-50 pr-3">
													<Form.Label>
														Effective Date
													</Form.Label>
													<NewDatePicker
														key={`${newcomplianceinfo?.effective_from}`}
														placeholder="Effective Date"
														onChange={(date) =>
															setnewcomplianceinfo(
																{
																	...newcomplianceinfo,
																	...{
																		effective_from:
																			date,
																	},
																}
															)
														}
														calendarClassName="rangefilter-calendar"
														calendarContainerClassName="schedule-date-calendar"
														value={
															newcomplianceinfo?.effective_from
														}
													/>
												</div>
												<div className="d-flex flex-column w-50 pl-3">
													<Form.Label>
														Expiry Date
													</Form.Label>
													<NewDatePicker
														key={`${newcomplianceinfo?.expires_on}`}
														placeholder="Expiry Date"
														onChange={(date) =>
															setnewcomplianceinfo(
																{
																	...newcomplianceinfo,
																	...{
																		expires_on:
																			date,
																	},
																}
															)
														}
														calendarClassName="rangefilter-calendar"
														calendarContainerClassName="expiry_date_calendar_container"
														value={
															newcomplianceinfo?.expires_on
														}
														minDate={
															newcomplianceinfo?.effective_from
														}
													/>
												</div>
											</div>
											<div>
												<Form.Label className="mt-4 mb-0">
													Status
												</Form.Label>

												<SelectOld
													style={
														validation.status
															? {
																	borderColor:
																		"#dc3545",
																	marginBottom:
																		"2px",
															  }
															: {}
													}
													value={
														newcomplianceinfo?.status
													}
													className="mt-2"
													options={[
														{
															label: "Available",
															value: "available",
														},
														{
															label: "Approved",
															value: "approved",
														},
														{
															label: "Rejected",
															value: "rejected",
														},
													]}
													placeholder="Select status"
													onSelect={(v) => {
														validateField(
															"status",
															v?.value
														);
														setnewcomplianceinfo({
															...newcomplianceinfo,
															...{
																status: v?.value,
															},
														});
													}}
												/>

												<Form.Control.Feedback
													type="invalid"
													className={`${
														validation.status &&
														"d-block font-10 m-0"
													}`}
												>
													Please select the compliance
													status.
												</Form.Control.Feedback>
											</div>
											{!props.editMode && (
												<div>
													<Form.Check
														type="checkbox"
														label={`Add as a global compliance asset`}
														value={
															newcomplianceinfo?.is_global_asset
														}
														checked={
															newcomplianceinfo?.is_global_asset
														}
														onClick={() =>
															setnewcomplianceinfo(
																{
																	...newcomplianceinfo,
																	...{
																		is_global_asset:
																			!newcomplianceinfo.is_global_asset,
																	},
																}
															)
														}
													/>
												</div>
											)}
											<div>
												<Form.Label className="mb-1 mt-3">
													EXTERNAL LINKS
												</Form.Label>
												<hr className="mt-1 mb-2" />
												<Form.Group>
													<Form.Control
														style={{
															width: "100%",
														}}
														type="text"
														value={link}
														placeholder="Add link"
														onChange={(e) =>
															setLink(
																e.target.value
															)
														}
													/>

													{Array.isArray(
														newcomplianceinfo?.proofs
													) &&
														newcomplianceinfo?.proofs.map(
															(url) => (
																<div>
																	<a
																		href={`https://${url}`}
																		target="_blank"
																		rel="noreferrer"
																	>
																		{url}
																	</a>
																</div>
															)
														)}
													<Form.Label
														className="btn d-flex"
														onClick={() => {
															console.log(
																"proofs",
																newcomplianceinfo
															);
															const proofs =
																newcomplianceinfo?.proofs ||
																[];
															if (link) {
																proofs.push(
																	link
																);
																setnewcomplianceinfo(
																	{
																		...newcomplianceinfo,
																		...{
																			proofs,
																		},
																	}
																);
															}
															setLink("");
														}}
													>
														<img
															src={add}
															alt=""
														></img>
														<span className="aaaaaa">
															Add a link
														</span>
													</Form.Label>
												</Form.Group>
												<div>
													<div className="contractins__bottomdivright__div1 border-bottom mt-4">
														<div className="mr-auto">
															DOCUMENTS
														</div>
														<Form.File id="formcheck-api-regular">
															<Form.File.Label className="btn d-flex">
																<img
																	src={add}
																	alt=""
																></img>
																<span className="aaaaaa">
																	Add
																	Documents
																</span>
															</Form.File.Label>
															<Form.File.Input
																multiple
																value={
																	uploadedFile
																}
																onChange={(e) =>
																	handleFileSelection(
																		e
																	)
																}
																accept={SUPPORTED_FILE_FORMATS.toString()}
															/>
														</Form.File>
													</div>
													{invalidFileUploaded && (
														<div className="d-flex flex-row justify-content-center red">
															Certain file types
															are not supported.
														</div>
													)}
													{selectedFiles?.length >
														0 && (
														<div className="mb-0 w-100 mt-2">
															{selectedFiles.map(
																(file) => (
																	<FileUpload
																		file={
																			file
																		}
																		onCancel={
																			handleFileUploadCancel
																		}
																		onComplete={(
																			name,
																			url
																		) =>
																			handleComplete(
																				name,
																				url,
																				file
																			)
																		}
																	/>
																)
															)}
														</div>
													)}
													{!!newcomplianceinfo
														?.documents?.length && (
														<div className="w-100 pb-5">
															<table className="appsdata">
																<thead>
																	<tr>
																		<th
																			style={{
																				width: "270px",
																			}}
																		>
																			Document
																			Name
																		</th>
																		<th></th>
																		<th></th>
																	</tr>
																</thead>
																<tbody>
																	{newcomplianceinfo
																		?.documents
																		?.length >
																		0 &&
																		newcomplianceinfo?.documents?.map(
																			(
																				item,
																				index
																			) => {
																				return (
																					<tr
																						key={
																							index
																						}
																					>
																						<td>
																							<LongTextTooltip
																								text={
																									item.name
																								}
																								maxWidth={
																									250
																								}
																								style={{
																									width: "fit-content",
																								}}
																							/>
																						</td>
																						<td>
																							<DownloadInSamePage
																								s3LinkFromProps={
																									item.source_url
																								}
																								doc={
																									item
																								}
																							>
																								<div className="z-text-primary cursor-pointer">
																									Download
																								</div>
																							</DownloadInSamePage>
																						</td>
																						<td>
																							<div
																								className="z-text-primary cursor-pointer"
																								onClick={() =>
																									handleRemoveUploadedDocument(
																										index
																									)
																								}
																							>
																								<img
																									src={
																										deleteIcon
																									}
																									alt="Delete"
																									width={
																										16
																									}
																									height={
																										16
																									}
																								/>
																							</div>
																						</td>
																					</tr>
																				);
																			}
																		)}
																</tbody>
															</table>
														</div>
													)}
													{selectedFiles?.length ===
														0 && (
														<div className="Contract__adddoc">
															<div className="Contract__adddoc1">
																<div className="d-flex flex-row">
																	<div>
																		<img
																			src={
																				adddocu
																			}
																		></img>
																	</div>
																	<div className="d-flex flex-column ml-4">
																		<div>
																			Add
																			relevant
																			documents
																		</div>
																		<div className="mt-2">
																			<Form.File id="formcheck-api-regular">
																				<Form.File.Label className="btn z-btn-outline-primary">
																					+
																					Add
																					Documents
																				</Form.File.Label>
																				<Form.File.Input
																					multiple
																					value={
																						uploadedFile
																					}
																					onChange={
																						handleFileSelection
																					}
																					accept={SUPPORTED_FILE_FORMATS.toString()}
																				/>
																			</Form.File>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													)}
												</div>
											</div>
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
									disabled={submitting || uploadInProgress}
									onClick={handleSubmit}
									style={{ marginRight: "40px" }}
								>
									{props.editMode ? "Save" : "Add Compliance"}
									{submitting && (
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
									)}
								</Button>
							</div>
						</>
					)}
				</div>
			</div>
		</>
	);
}
