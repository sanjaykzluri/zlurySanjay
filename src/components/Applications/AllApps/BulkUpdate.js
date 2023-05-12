import React, { useEffect, useState } from "react";
import close from "../../../assets/close.svg";
import greenTick from "../../../assets/green_tick.svg";
import { Form, Button, Dropdown } from "react-bootstrap";
import bulkUpdateCircle_1 from "../../../assets/applications/bulkUpdateCircle_1.svg";
import bulkUpdateCircle_2 from "../../../assets/applications/bulkUpdateCircle_2.svg";
import bulkUpdateCircle_3 from "../../../assets/applications/bulkUpdateCircle_3.svg";
import search from "../../../assets/search.svg";
import { Popover } from "../../../../src/UIComponents/Popover/Popover";
import NoResultsFoundSVG from "../../../assets/search__outer2.svg";
import { uploadFile } from "../../../services/upload/upload";
import arrowdropdown from "../../Transactions/Unrecognised/arrowdropdown.svg";
import { capitalizeFirstLetter } from "../../../utils/common";
import { Loader } from "../../../common/Loader/Loader";
import { TriggerIssue } from "../../../utils/sentry";
import { toast } from "react-toastify";
import DefaultNotificationCard from "../../../common/Notification/PusherNotificationCards/DefaultNotificationCard";
import RoleContext from "services/roleContext/roleContext";
import EllipsisSVG from "assets/icons/ellipsis-v.svg";
import { useSelector } from "react-redux";

const ellipsis = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
	>
		<img src={EllipsisSVG} width="20" />
	</a>
));

export function BulkUpdate({
	id,
	name,
	title,
	screen,
	checked,
	metaData,
	exportData,
	propertyList,
	bulkUpdateData,
	customFieldEntity,
	screen_custom_fields,
}) {
	const editableFieldNames = {
		Application: [
			"app_type",
			"app_status",
			"app_state",
			"app_owner_email",
			"app_technical_owner_email",
			"app_financial_owner_email",
		],
		User: ["user_designation", "user_status"],
	};

	const labelToBeReplaced = {
		app_owner_email: "App Owner",
		app_technical_owner_email: "IT Owner",
		app_financial_owner_email: "Financial Owner",
	};

	const defaultExportObj = {
		filter_by: [],
		file_type: "csv",
		columns_required: [],
		is_sample: false,
	};

	const hiddenFileInput = React.useRef(null);
	const { isViewer } = React.useContext(RoleContext);
	const customFieldsObj = useSelector((state) => state.customFields);

	const [show, setShow] = useState(false);
	const [customFields, setCustomFields] = useState([]);
	const [searchPropertyList, setSearchPropertyList] = useState("");
	const [showFieldsDropdown, setShowFieldsDropdown] = useState(false);
	const [showImportInProgress, setShowImportInProgress] = useState(false);
	const [exportSuccess, setExportSuccess] = useState(false);
	const [showExportError, setShowExportError] = useState(false);
	const [loading, setLoading] = useState(false);
	const [exportRequestObj, setExportRequestObj] = useState({
		...defaultExportObj,
	});

	useEffect(() => {
		if (customFieldsObj[customFieldEntity]) {
			let tempCustomFields = customFieldsObj[customFieldEntity].filter(
				(field) => field.type !== "reference"
			);
			setCustomFields(tempCustomFields);
		}
	}, [customFieldsObj[customFieldEntity]]);

	const customFieldsNames = customFields.map((field) => field?.name);

	const openBulkUpdateModal = () => {
		setShow(true);
		let temp = { ...exportRequestObj, ["is_sample"]: true };
		setExportRequestObj(temp);
		exportRequestObj.columns_required.unshift(name);
		exportRequestObj.columns_required.unshift(id);
	};

	const onHide = () => {
		setShow(false);
	};

	const handleUploadButtonClick = () => {
		hiddenFileInput.current.click();
	};

	const handleFileUpload = (e) => {
		setLoading(true);
		let file = e.target.files[0];
		uploadFile(file)
			.then((res) => {
				let x = res.resourceUrl.split("/");
				const key =
					x[x.length - 3] +
					"/" +
					x[x.length - 2] +
					"/" +
					x[x.length - 1];
				handleBulkUpdateApi(key);
			})
			.catch((err) => {
				TriggerIssue(
					"There was an error while uploading the csv:",
					err
				);
			});
	};

	const handleBulkUpdateApi = (key) => {
		bulkUpdateData(key)
			.then((res) => {
				if (res.data?.message === "success") {
					setLoading(false);
					setShowImportInProgress(true);
					toast(
						<DefaultNotificationCard
							notification={{
								title: `${screen}s Bulk Edited`,
								description:
									"All records have been updated successfully. The changes will reflect in some time.",
							}}
						/>
					);
				}
			})
			.catch((err) => {
				TriggerIssue(
					"There was an error while bulk update the data via uploading CSV",
					err
				);
			});
	};

	const handleExportCheck = (value) => {
		if (value === screen_custom_fields) {
			let temp1 = [];
			customFieldsNames.forEach((cfName) => {
				if (!exportRequestObj.columns_required.includes(cfName)) {
					temp1.push(cfName);
				}
			});
			if (temp1.length > 0) {
				let col = [...exportRequestObj.columns_required, ...temp1];
				let tempExportRequestObj = {
					...exportRequestObj,
					["columns_required"]: col,
				};
				setExportRequestObj(tempExportRequestObj);
			} else {
				let col = exportRequestObj.columns_required.filter(
					(el) => !customFieldsNames.includes(el)
				);
				let tempExportRequestObj = {
					...exportRequestObj,
					["columns_required"]: col,
				};
				setExportRequestObj(tempExportRequestObj);
			}
		} else {
			if (!exportRequestObj.columns_required.includes(value)) {
				let temp = [...exportRequestObj.columns_required];
				temp.push(value);
				let tempExportRequestObj = {
					...exportRequestObj,
					["columns_required"]: temp,
				};
				setExportRequestObj(tempExportRequestObj);
			} else {
				let temp = [...exportRequestObj.columns_required];
				temp = temp.filter((col) => col !== value);
				let tempExportRequestObj = {
					...exportRequestObj,
					["columns_required"]: temp,
				};
				setExportRequestObj(tempExportRequestObj);
			}
		}
	};

	let editableDataFields = propertyList?.map(
		(field) =>
			editableFieldNames[screen].includes(field.field_id) &&
			field.field_name
				.toLowerCase()
				.includes(searchPropertyList.toLowerCase()) && (
				<Form.Check
					className="pt-3"
					type="checkbox"
					label={`${capitalizeFirstLetter(
						Object.keys(labelToBeReplaced).includes(field.field_id)
							? labelToBeReplaced[field.field_id]
							: field.field_name
					)}`}
					value={field.field_id}
					checked={exportRequestObj.columns_required.includes(
						field.field_id
					)}
					onClick={(e) => handleExportCheck(e.target.value)}
				/>
			)
	);

	let exportCustomFields = customFields.map(
		(field) =>
			field.name
				.toLowerCase()
				.includes(searchPropertyList.toLowerCase()) && (
				<Form.Check
					className="pt-3 ml-3"
					type="checkbox"
					label={`${capitalizeFirstLetter(field.name)}`}
					value={field.name}
					checked={exportRequestObj.columns_required.includes(
						field.name
					)}
					onClick={(e) => handleExportCheck(e.target.value)}
				/>
			)
	);

	const handleSelectAll = () => {
		if (
			exportRequestObj.columns_required.length ===
			editableFieldNames[screen].length + exportCustomFields.length + 2
		) {
			let tempExportRequestObj = {
				...exportRequestObj,
				["columns_required"]: [id, name],
			};
			setExportRequestObj(tempExportRequestObj);
		} else {
			let temp = customFields.map((field) => field.name);
			let tempExportRequestObj = {
				...exportRequestObj,
				["columns_required"]: [...editableFieldNames[screen], ...temp],
			};
			tempExportRequestObj.columns_required.unshift(name);
			tempExportRequestObj.columns_required.unshift(id);
			setExportRequestObj(tempExportRequestObj);
		}
	};

	let customProperties = "Custom Properties";

	const includeCheckedRows = () => {
		if (exportRequestObj.filter_by.length > 0) {
			setExportRequestObj({
				...exportRequestObj,
				...{
					filter_by: [],
				},
			});
		} else {
			var tempExportRequestObj = exportRequestObj;
			tempExportRequestObj.filter_by.push({
				field_values: checked,
				field_id: id,
				filter_type: "objectId",
				negative: false,
				is_custom: false,
			});
			setExportRequestObj(tempExportRequestObj);
		}
	};

	const includeFilteredRows = () => {
		let tempExportRequestObj = {
			...exportRequestObj,
			["filter_by"]: [...metaData?.filter_by],
		};
		setExportRequestObj(tempExportRequestObj);
	};

	const handleClose = () => {
		onHide();
		setExportSuccess(false);
		setShowImportInProgress(false);
		setLoading(false);
	};

	const exportCSVFile = () => {
		setLoading(true);
		exportData(exportRequestObj)
			.then((res) => {
				if (res && res.status === "success") {
					setLoading(false);
					setExportSuccess(true);
				} else if (res.error) {
					TriggerIssue("Export CSV failed in Bulk Update", res.error);
					setLoading(false);
					setShowExportError(true);
				}
			})
			.catch((error) => {
				TriggerIssue("Export CSV failed in Bulk Update", error);
				setLoading(false);
				setShowExportError(true);
			});
	};

	const allCustomFieldsChecked = () => {
		let flag = true;
		customFieldsNames.forEach((cfName) => {
			if (!exportRequestObj.columns_required.includes(cfName)) {
				flag = false;
			}
		});
		return flag;
	};

	const emptySearchCheck = () => {
		let flag = true;
		editableDataFields.forEach((el) => {
			if (el !== false) {
				flag = false;
			}
		});
		exportCustomFields.forEach((el) => {
			if (el !== false) {
				flag = false;
			}
		});
		return flag;
	};

	return (
		<>
			{!isViewer && (
				<Dropdown className="pt-1">
					<Dropdown.Toggle className="mb-1" as={ellipsis} />
					<Dropdown.Menu
						className="dropdown__menu"
						style={{ marginTop: "10px" }}
					>
						<div
							style={{
								height: "36px",
								margin: "0px 4px 0px 4px",
							}}
						>
							<Dropdown.Item
								className="dropdown__menu__item"
								onClick={() => openBulkUpdateModal()}
							>
								Bulk Update Data
							</Dropdown.Item>
						</div>
					</Dropdown.Menu>
				</Dropdown>
			)}
			{show && (
				<>
					<div className="modal-backdrop show"></div>
					<div
						centered
						show={show}
						onHide={handleClose}
						className="sideModal__TOP h-100"
					>
						<div className="d-flex flex-row align-items-center py-4">
							<div className="m-auto">
								<span className="contracts__heading">
									{title}
								</span>
							</div>
							<img
								className="pr-4 cursor-pointer"
								alt="Close"
								onClick={handleClose}
								src={close}
							/>
						</div>
						<hr className="m-0" />
						{loading ? (
							<div className="sideModal__progress">
								<Loader height={150} width={100} />
							</div>
						) : !showImportInProgress && !exportSuccess ? (
							<>
								<div className="sideModal__body_upper mt-2 ml-3 mr-3">
									<div className="mt-3">
										<div className="bulk__update__heading">
											<img
												src={bulkUpdateCircle_1}
												alt="1"
												className="pr-1"
											/>
											Select the fields you want to modify
										</div>
										<div className="bulk__update__content">
											You can modify data only for
											existing apps and select fields.
											Select the fields you'd like to
											modify.
											<br></br>
											<button
												className="bulk__update__btn mr-3 mt-1"
												onClick={() =>
													setShowFieldsDropdown(true)
												}
											>
												Select Fields
												<img
													src={arrowdropdown}
													alt=""
													style={{
														marginLeft: "140px",
													}}
												/>
											</button>
											<Popover
												className="h-50 bulk__update__fields__popover"
												show={showFieldsDropdown}
												onClose={() =>
													setShowFieldsDropdown(false)
												}
											>
												<div className="bulkUpdateInput">
													<input
														className="w-100"
														type="text"
														placeholder="Search"
														value={
															searchPropertyList
														}
														onChange={(e) =>
															setSearchPropertyList(
																e.target.value?.trimStart()
															)
														}
													/>
													<img
														src={search}
														aria-hidden="true"
													/>
												</div>
												<div
													hidden={
														searchPropertyList !==
														""
													}
												>
													<Form.Check
														className="pt-1"
														type="checkbox"
														label={`Select All`}
														checked={
															exportRequestObj
																.columns_required
																.length ===
															editableFieldNames[
																screen
															].length +
																exportCustomFields.length +
																2
														}
														onClick={
															handleSelectAll
														}
													/>
													<Form.Check
														className="pt-3"
														type="checkbox"
														label={`${screen} ID`}
														checked
														disabled
													/>
													<Form.Check
														className="pt-3"
														type="checkbox"
														label={`${screen} Name`}
														checked
														disabled
													/>
												</div>
												{searchPropertyList !== "" &&
												emptySearchCheck() ? (
													<div className="sideModal__emptysearch">
														<img
															src={
																NoResultsFoundSVG
															}
															className="pl-3"
															height="125px"
															width="125px"
														/>
														<div className="empty-header">
															No results found
														</div>
														<div className="empty-lower">{`We couldn't find anything for '${searchPropertyList}'`}</div>
													</div>
												) : (
													<div>
														{editableDataFields}
														{exportCustomFields.length >
															0 &&
															customProperties
																.toLowerCase()
																.includes(
																	searchPropertyList.toLowerCase()
																) && (
																<Form.Check
																	className="pt-3"
																	type="checkbox"
																	label="Custom Properties"
																	value={
																		screen_custom_fields
																	}
																	checked={allCustomFieldsChecked()}
																	onClick={(
																		e
																	) =>
																		handleExportCheck(
																			e
																				.target
																				.value
																		)
																	}
																/>
															)}
														{exportCustomFields}
													</div>
												)}
											</Popover>
										</div>
									</div>
									<div
										className={`${
											exportRequestObj.columns_required
												.length <= 2
												? "download__csv__section mt-5"
												: "mt-5"
										}`}
									>
										<div className="bulk__update__heading">
											<img
												src={bulkUpdateCircle_2}
												alt="2"
												className="pr-1"
											/>
											Download Editable CSV
										</div>
										<div className="bulk__update__content">
											Bulk updating application requires a
											standard file format that maps back
											to your applications. Please
											download it here.
											<br></br>
											<Button
												disabled={
													exportRequestObj
														.columns_required
														.length <= 2
												}
												variant="outline-primary"
												className="download__csv__btn"
												onClick={exportCSVFile}
											>
												<div className="download__csv__btn__text">
													Download Editable CSV
												</div>
											</Button>
											<div>
												<Form.Check
													disabled={
														exportRequestObj
															.columns_required
															.length <= 2 ||
														!checked.length
													}
													className=""
													onClick={includeCheckedRows}
													type="checkbox"
													label={`Include Selected ${screen} Only`}
												/>
											</div>
											<div>
												<Form.Check
													disabled={
														exportRequestObj
															.columns_required
															.length <= 2
													}
													className=""
													onClick={
														includeFilteredRows
													}
													type="checkbox"
													label={`Include Filtered ${screen} Only`}
												/>
											</div>
											{showExportError && (
												<div className="red">
													Server Error! We couldn't
													complete your request.
												</div>
											)}
										</div>
									</div>
									<div
										className="mt-5"
										style={{ marginLeft: "-89px" }}
									>
										<div className="bulk__update__heading">
											<img
												src={bulkUpdateCircle_3}
												alt="3"
												className="pr-1"
											/>
											Upload the modified CSV
										</div>
										<div className="bulk__update__content">
											Upload your updated data here
											<br></br>
											<Button
												className="mt-1 upload__csv__btn"
												onClick={
													handleUploadButtonClick
												}
											>
												<div className="upload__csv__btn__text">
													Upload CSV
												</div>
											</Button>
											<input
												type="file"
												accept=".csv"
												style={{ display: "none" }}
												ref={hiddenFileInput}
												onChange={handleFileUpload}
											/>
										</div>
									</div>
								</div>
							</>
						) : exportSuccess ? (
							<>
								<div className="sideModal__progress">
									<img
										src={greenTick}
										height="54px"
										width="54px"
										style={{ marginBottom: "10px" }}
									/>
									<h5>Your export is in progress</h5>
									<p>
										We'll mail you as soon as the export is
										complete
									</p>
									<Button
										onClick={() => {
											setExportSuccess(false);
											setExportRequestObj({
												...exportRequestObj,
												["filter_by"]: [],
											});
										}}
									>
										Close
									</Button>
								</div>
							</>
						) : (
							<>
								<div className="sideModal__progress">
									<img
										src={greenTick}
										height="54px"
										width="54px"
										style={{ marginBottom: "10px" }}
									/>
									<div className="bulk__update__in__progress__header">
										Your import is in progress
									</div>
									<div className="bulk__update__in__progress">
										We'll notify you by mail you as soon as
										this is done
									</div>
									<Button
										variant="outline-primary"
										onClick={handleClose}
									>
										Close
									</Button>
								</div>
							</>
						)}
					</div>
				</>
			)}
		</>
	);
}
