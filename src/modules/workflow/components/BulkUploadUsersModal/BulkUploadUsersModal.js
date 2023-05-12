import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import "../TemplateCard/TemplateCard.css";
import download from "../../../../assets/workflow/download.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import { SelectOld } from "../../../../UIComponents/SelectOld/Select";
import close from "../../../../assets/close.svg";
import blueQuestion from "../../../../assets/blueQuestion.svg";
import errorFile from "../../../../assets/errorFile.svg";
import csv_green from "../../../../assets/csv_green.svg";
import arrowdropdown from "../../../../assets/arrowdropdown.svg";
import CheckCircleSVG from "../../../../assets/icons/check-circle.svg";
import downloadCircle from "../../../../assets/downloadCircle.svg";
import blueDropdownIcon from "../../../../assets/blueDropdownIcon.svg";
import { convertObjToBindSelect } from "../../../../utils/convertDataToBindSelect";
import {
	Accordion,
	Card,
	OverlayTrigger,
	Spinner,
	Tooltip,
} from "react-bootstrap";
import Papa, { Parser } from "papaparse";
import _ from "underscore";
import warning from "../../../../assets/workflow/warning.svg";
import InfiniteScroll from "react-infinite-scroll-component";
import {
	reqHeaders,
	downloadInvalidRows,
	isCSVFile,
	validateName,
	validateEmail,
	validateRegex,
} from "./UploadConstantsAndFunctions";
import { upload } from "../../../../UIComponents/Upload/Upload";
import { processUpload, onboardingUsersViaCSV } from "../../service/api";
import caret from "../../../../assets/workflow/caret.svg";
import UploadFile from "../../../../../src/components/Uploads/UploadFile.js";
import UploadInValidRow from "./UploadInValidRow";
// import { transactionConstants } from "../../constants";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import Introduction from "./Introduction";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";

function BulkUploadUsersModal(props) {
	const dispatch = useDispatch();
	const partner = useContext(RoleContext);
	const [fileError, setFileError] = useState(false);
	const [file, setFile] = useState();
	const [showBody, setShowBody] = useState(true);
	const [dateFormat, setDateFormat] = useState(null);
	const [hasReqColumnHeader, setHasReqColumnHeaders] = useState(false);
	const [isLoading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const initialHeader = "Validating...";
	const [headerDesc, setHeaderDesc] = useState(initialHeader);
	const [isRowsValidated, setRowsValidated] = useState(false);
	const initialDataStruct = {
		valid: [],
		inValid: [],
	};
	const [data, setData] = useState(initialDataStruct);
	const [showErrorTable, setShowErrorTable] = useState(false);
	const [no_of_rows, setNoOfRows] = useState(0);
	const [rows, setRows] = useState([]);
	const initialFileUploadStatus = {
		isUploaded: false,
		userFriendlyMessage: "",
		errorResponse: "",
		loading: false,
	};
	const [fileUploadStatus, setFileUploadStatus] = useState(
		initialFileUploadStatus
	);
	const [expanded, setExpanded] = useState(false);
	const increamentNoOfRows = 10;

	const reinitializeState = () => {
		setFile();
		setFileError(false);
		setShowBody(true);
		setDateFormat();
		setHasReqColumnHeaders(false);
		setLoading(false);
		setErrorMessage("");
		setHeaderDesc(initialHeader);
		setRowsValidated(false);
		setData(initialDataStruct);
		setShowErrorTable(false);
		setNoOfRows(0);
		setRows([]);
		setFileUploadStatus(initialFileUploadStatus);
		setExpanded(false);
	};

	useEffect(() => {
		let currentRows = [...rows].length;
		let tempRows = [...rows];
		data.inValid.slice(currentRows, no_of_rows).map((row, index) => {
			tempRows.push(
				<UploadInValidRow
					name={row.name}
					department={row.department}
					designation={row.designation}
					personalEmail={row["personal email"]}
					primaryEmail={row["primary email"]}
					index={currentRows + index}
					isValidName={!!row.name && validateRegex(row.name)}
					isValidDepartment={
						!!row.department && validateRegex(row.department)
					}
					isValidDesignation={
						!!row.designation && validateRegex(row.designation)
					}
					isValidPersonalEmail={validateEmail(row["personal email"])}
					isValidPrimaryEmail={validateEmail(row["primary email"])}
				/>
			);
		});
		setRows(tempRows);
	}, [no_of_rows]);

	const validateRows = () => {
		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			comments: "#",
			complete: (results) => {
				let validRows = [];
				let inValidRows = [];
				let invalidRowIndexes = _.pluck(results.errors, "row");
				if (
					results?.data &&
					Array.isArray(results?.data) &&
					results?.meta?.fields &&
					Array.isArray(results?.meta?.fields)
				) {
					var headers = {};
					results.meta.fields.map((h) => {
						if (
							h &&
							typeof h === "string" &&
							Object.values(reqHeaders).includes(
								h.trim().toLowerCase()
							)
						) {
							headers[h.trim().toUpperCase()] = h;
						}
					});
					results.data.map((row, index) => {
						if (!invalidRowIndexes.includes(index)) {
							if (
								validateRegex(row[headers.NAME]) &&
								validateRegex(row[headers.DEPARTMENT]) &&
								validateRegex(row[headers.DESIGNATION]) &&
								validateEmail(row[headers["PERSONAL EMAIL"]]) &&
								validateEmail(row[headers["PRIMARY EMAIL"]])
							) {
								validRows.push({
									name: row[headers.NAME],
									department: row[headers.DEPARTMENT],
									designation: row[headers.DESIGNATION],
									"personal email":
										row[headers["PERSONAL EMAIL"]],
									"primary email":
										row[headers["PRIMARY EMAIL"]],
								});
							} else {
								inValidRows.push({
									name: row[headers.NAME],
									department: row[headers.DEPARTMENT],
									designation: row[headers.DESIGNATION],
									"personal email":
										row[headers["PERSONAL EMAIL"]],
									"primary email":
										row[headers["PRIMARY EMAIL"]],
								});
							}
						}
					});
				}
				if (results?.errors && Array.isArray(results?.errors)) {
					results.errors.map((err) => {
						inValidRows.push(results.data[err.row]);
					});
				}
				const tempData = data;
				tempData.valid = validRows;
				tempData.inValid = inValidRows;
				setData(tempData);
				setHeaderDesc(`${inValidRows.length} errors found`);
				setRowsValidated(true);
				setLoading(false);
				setShowBody(tempData.valid.length > 0);
			},
			error: function (error, file) {
				setHeaderDesc("Error when reading file");
				setErrorMessage("Failed to read file");
				setLoading(false);
				console.log(error, file);
			},
		});
	};

	const checkColumnHeaders = () => {
		setLoading(true);
		setTimeout(() => {
			Papa.parse(file, {
				header: true,
				skipEmptyLines: true,
				comments: "#",
				complete: (results) => {
					if (
						results?.meta &&
						results?.meta?.fields &&
						Array.isArray(results?.meta?.fields)
					) {
						var headers = results.meta.fields.map((h) => {
							return h.trim().toLowerCase();
						});
						var hasAllReqHeaders = true;
						_.each(Object.values(reqHeaders), function (header) {
							if (!_.contains(headers, header)) {
								hasAllReqHeaders = false;
							}
						});
						if (!hasAllReqHeaders) {
							setLoading(false);
							setHeaderDesc("Error when reading file");
							setErrorMessage(
								"Columns are missing in the uploaded file. Please take a look."
							);
						} else {
							setHasReqColumnHeaders(true);
							validateRows();
						}
					}
				},
				error: function (error, file) {
					setHeaderDesc("Error when reading file");
					setErrorMessage("Failed to read file");
					setLoading(false);
					console.log(error, file);
				},
			});
		}, [500]);
	};

	const fileUploadFunction = async () => {
		setFileUploadStatus({
			...fileUploadStatus,
			loading: true,
		});
		setHeaderDesc(`Adding ${data.valid.length} users to ${partner?.name}`);
		var csv = Papa.unparse(data.valid);
		var csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		var fileObj = new File([csvData], file?.name);
		try {
			const { signedUrl } = await upload(fileObj, "files");
			const uploadObject = {
				source_url: signedUrl?.resourceUrl,
				workflow_template_id: props.data.workflow_id,
			};
			const process_upload_result = await onboardingUsersViaCSV(
				uploadObject
			);
			console.log("process_upload_result", process_upload_result);
			if (process_upload_result.success !== true)
				throw new Error(process_upload_result?.error);
			setFileUploadStatus({
				...fileUploadStatus,
				isUploaded: true,
				loading: false,
			});
			setHeaderDesc(
				`Added ${data.valid.length} users to ${partner?.name}`
			);
		} catch (err) {
			console.error("Error uploading transaction CSV:", err);
			setErrorMessage(
				"This upload failed due to connection failure. Please try again"
			);
			setFileUploadStatus({
				isUploaded: false,
				userFriendlyMessage:
					"There was an error uploading the file. Please try again!",
				errorResponse: err,
				loading: false,
			});
		}
	};

	return (
		<>
			<div className="modal-backdrop show pb-10"></div>
			<div className="uploadTransactionsContainer">
				<div className="d-flex border-bottom py-4">
					<div className="mx-auto">
						<span className="header text-capitalize">
							{`Upload Users for ${props.workflowType || ""}`}
						</span>
					</div>
					<img
						alt="Close"
						src={close}
						className="cursor-pointer mr-3"
						onClick={() => props.onCloseModal()}
					/>
				</div>
				<div
					className="pb-6"
					style={{
						// height: "calc(100vh - 125px)",
						height: `calc(100vh - ${
							!fileUploadStatus.isUploaded ? 75 : 125
						}px)`,
						overflowY: "auto",
					}}
				>
					{!file && (
						<Introduction workflowType={props.workflowType} />
					)}
					<div
						className={
							"row mb-3 ml-4 mr-4 mt-2 " +
							(fileError && "downloadSampleActive ")
						}
					>
						<div className="col-md-8 pt-3">
							<div className="d-flex">
								<img src={blueQuestion} alt="question" />
								<p className="bold-600 font-12 ml-2 mt-0 mb-0 mr-0">
									Download Sample CSV
								</p>
							</div>
							<p className="grey-1 font-12 mt-2">
								Not sure what goes into our standard users CSV?
								Add the user details to the downloaded sample
								CSV and upload it.
							</p>
						</div>
						<div className="col-md-4 d-flex">
							<img
								alt=""
								className="downloadImage"
								src={download}
							/>
							<a
								className="downloadText"
								href="https://zluri-dev-uploads.s3.ap-southeast-1.amazonaws.com/zluri_sample_user_upload_format.csv"
							>
								Sample CSV
							</a>
						</div>
					</div>
					{!file ? (
						<div className="uploadTransactionContainer">
							<UploadFile
								setFile={setFile}
								setFileError={setFileError}
								fileError={fileError}
							/>
						</div>
					) : (
						<div className="d-flex flex-column uploadTransValidationContainer m-auto">
							<div
								className="row m-auto d-flex flex-row w-100 position-relative"
								style={{ height: "72px", zIndex: 0 }}
							>
								<div
									className={`progressBackground ${
										isRowsValidated && hasReqColumnHeader
											? !fileUploadStatus.isUploaded
												? "validated70"
												: "validated"
											: dateFormat &&
											  (isLoading ||
													hasReqColumnHeader ||
													errorMessage)
											? "validating20"
											: null
									}`}
								></div>
								<div className="col-md-2 d-flex">
									<img
										src={csv_green}
										alt="csv file"
										className="m-auto"
									/>
								</div>
								<div
									className="col-md-8 d-flex flex-column pl-0"
									style={{ marginLeft: "-12px", zIndex: 1 }}
								>
									<OverlayTrigger
										placement="top"
										overlay={
											<Tooltip>{file?.name}</Tooltip>
										}
									>
										<div className="fileName text-truncate">
											{file?.name}
										</div>
									</OverlayTrigger>
									<p className="grey-1 uploadHeaderStatus">
										{headerDesc}
									</p>
								</div>
								{!fileUploadStatus.isUploaded && (
									<div className="col d-flex">
										<img
											src={close}
											alt="close"
											className="uploadTransValidationCloseTag cursor-pointer"
											onClick={() => reinitializeState()}
										/>
									</div>
								)}
							</div>
							{showBody && (
								<div className="d-flex flex-column">
									<hr className="m-0"></hr>
									{hasReqColumnHeader && isRowsValidated ? (
										!fileUploadStatus.isUploaded &&
										fileUploadStatus.errorResponse ? (
											<div
												className="d-flex flex-column m-auto align-items-center justify-content-center"
												style={{ height: "250px" }}
											>
												<img
													src={errorFile}
													alt="file"
													className="folderImage mt-auto mb-3"
												/>
												<p
													className={
														"text-center font-12 " +
														(fileUploadStatus
															.errorResponse
															?.message?.length >
														0
															? "mb-2"
															: "mb-auto")
													}
												>
													{errorMessage}
												</p>
												{fileUploadStatus.errorResponse
													?.message?.length > 0 &&
													typeof fileUploadStatus
														.errorResponse
														?.message ==
														"string" && (
														<Accordion className="w-100 border-0 mb-auto">
															<Card
																className="p-0 w-100 ml-auto mr-auto border-0 ml-2 mr-2"
																style={{
																	backgroundColor:
																		"#f3f3f357",
																}}
															>
																<Accordion.Toggle
																	as={
																		Card.Header
																	}
																	onClick={() =>
																		setExpanded(
																			!expanded
																		)
																	}
																	className="p-1 d-flex border-0 bg-none"
																	variant="link"
																	eventKey="0"
																>
																	<div className="grey1 text-uppercase mr-auto mt-auto mb-auto ml-1 font-11">
																		More
																		info
																	</div>
																	<div className="mr-1">
																		<img
																			alt=""
																			className="m-1"
																			style={
																				expanded
																					? {
																							transform:
																								"rotate(270deg)",
																					  }
																					: null
																			}
																			src={
																				caret
																			}
																		></img>
																	</div>
																</Accordion.Toggle>
																<Accordion.Collapse
																	eventKey="0"
																	className="border-top"
																>
																	<Card.Body
																		className="p-2 font-11 m-0 pl-0 pr-0 pb-3"
																		style={{
																			backgroundColor:
																				"#f3f3f357",
																		}}
																	>
																		{
																			fileUploadStatus
																				?.errorResponse
																				?.message
																		}
																	</Card.Body>
																</Accordion.Collapse>
															</Card>
														</Accordion>
													)}
											</div>
										) : (
											<div className="row m-auto d-flex flex-row w-100 pt-3 pb-3">
												<div
													className={
														"col-md-2 d-flex"
													}
												>
													<img
														src={CheckCircleSVG}
														alt="csv file"
														className="ml-auto mr-auto mb-auto mt-0"
														style={{
															width: "32px",
														}}
													/>
												</div>
												<div
													className="col d-flex flex-column pl-0"
													style={{
														marginLeft: "-12px",
													}}
												>
													<p className="validRowHeader">{`${
														data.valid.length
													} ${
														fileUploadStatus.isUploaded
															? "Users added"
															: "rows are ready to be processed"
													}`}</p>
													<p className="grey-1 validRowDesc">
														{fileUploadStatus.isUploaded
															? `${
																	data.valid
																		.length
															  } users are added to ${
																	partner?.name
															  } and ready to be ${
																	props.workflowType ===
																	"onboarding"
																		? "onboarded"
																		: "offboarded"
															  }`
															: `Users will be added to the ${props.workflowType} workflow`}
													</p>
													{!fileUploadStatus.isUploaded && (
														<Button
															style={{
																minwidth:
																	"120px",
																maxWidth:
																	"180px",
															}}
															disabled={
																fileUploadStatus.loading
															}
															className="d-flex justify-content-center"
															onClick={() =>
																fileUploadFunction()
															}
														>
															{fileUploadStatus.loading && (
																<Spinner
																	animation="border"
																	size="sm"
																	variant="light"
																	className="mr-2 mt-auto ml-0 mb-auto"
																/>
															)}
															Add users to{" "}
															{partner?.name}
														</Button>
													)}
												</div>
											</div>
										)
									) : isLoading ? (
										<div
											className="d-flex flex-column align-items-center m-auto"
											style={{ height: "250px" }}
										>
											<div className="d-flex flex-column align-items-center m-auto">
												<Spinner
													animation="border"
													variant="primary"
												/>
												<p className="loadingHeader mb-2 mt-2">
													Checking for errors
												</p>
												<p className="loadingDesc mb-3">
													This may take a while
												</p>
											</div>
										</div>
									) : !hasReqColumnHeader &&
									  !isLoading &&
									  !errorMessage ? (
										checkColumnHeaders()
									) : errorMessage ? (
										<div
											className="d-flex flex-column m-auto align-items-center justify-content-center"
											style={{ height: "250px" }}
										>
											<img
												src={errorFile}
												alt="file"
												className="folderImage"
											/>
											<p
												className={
													"text-center font-12 mt-3 " +
													(errorMessage
														? "errorMessage mb-3"
														: "mb-4")
												}
											>
												{errorMessage}
											</p>
										</div>
									) : null}
								</div>
							)}
						</div>
					)}
					{data.inValid.length > 0 && (
						<>
							<div className="d-flex flex-row m-auto justify-content-center">
								<div className="mt-3 ml-4 mr-4 d-flex flex-row pl-4 pr-4">
									<img
										src={warning}
										alt="invalid rows"
										className="ml-2 mb-auto mr-2"
										style={{
											width: "28px",
											marginTop: "2px",
										}}
									/>
									<div className="d-flex flex-column ml-1">
										<p className="loadingHeader mb-1">{`${data.inValid.length} rows have an error`}</p>
										<p
											className="loadingDesc mb-2 text-left"
											style={{ width: "80%" }}
										>
											Download them to fix the error and
											reupload
										</p>
									</div>
									<div
										onClick={() => {
											downloadInvalidRows(data.inValid);
										}}
										className="d-flex flex-row cursor-pointer"
										download
									>
										<img
											src={downloadCircle}
											style={{ width: "30px" }}
											alt="download icon"
										/>
										<p className="downloadInvalidFile">
											Download as CSV
										</p>
									</div>
								</div>
							</div>
							<hr
								style={{
									backgroundColor: "#2266E2",
									opacity: "0.3",
									width: "88%",
								}}
								className="m-auto"
							></hr>
							{!showErrorTable && (
								<>
									<div
										className="d-flex flex-row cursor-pointer ml-auto mr-auto mt-2 justify-content-center"
										onClick={() => {
											setShowErrorTable(true);
											setNoOfRows(
												no_of_rows + increamentNoOfRows
											);
										}}
									>
										<p className="downloadInvalidFile">
											View Errors
										</p>
										<img
											src={blueDropdownIcon}
											alt="view errors"
										/>
									</div>
								</>
							)}
						</>
					)}
					{showErrorTable && !fileUploadStatus.isUploaded && (
						<InfiniteScroll
							dataLength={rows.length}
							scrollableTarget="scrollableDiv"
							scrollThreshold="50px"
							className="mt-4 mb-4 justify-content-center infiniteScrollInvalidTrans"
							style={{
								height: "320px",
								overflow: "scroll",
							}}
						>
							<div className="d-flex flex-row Tableheader">
								<div className="width1 index"></div>
								<div className="width20">Name</div>
								<div className="width20">department</div>
								<div className="width20">designation</div>
								<div className="width20">personal email</div>
								<div className="width20">primary email</div>
							</div>
							{rows}
							{rows.length < data.inValid.length && (
								<div
									className="d-flex ml-auto mr-auto mt-2 downloadInvalidFile cursor-pointer justify-content-center"
									onClick={() =>
										setNoOfRows(
											no_of_rows + increamentNoOfRows
										)
									}
								>
									Load more
								</div>
							)}
						</InfiniteScroll>
					)}
				</div>
				{fileUploadStatus.isUploaded && (
					<div className="d-flex border-top pb-4">
						<div className="mx-auto mt-2">
							<Button
								className="d-flex"
								onClick={() => props.onRunPlaybook()}
							>
								<OverlayTrigger
									placement="top"
									overlay={
										<Tooltip>
											{`Run ${props?.data?.workflow_name}` ||
												""}
										</Tooltip>
									}
								>
									<span className="font-12 text-capitalize truncate_10vw">
										{`Run ${props?.data?.workflow_name}`}
									</span>
								</OverlayTrigger>
							</Button>
						</div>
					</div>
				)}
			</div>
		</>
	);
}

export default BulkUploadUsersModal;
