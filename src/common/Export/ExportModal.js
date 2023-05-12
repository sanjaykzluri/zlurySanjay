import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import close from "../../assets/close.svg";
import greenTick from "../../assets/green_tick.svg";
import { Col, Form, Row, Button } from "react-bootstrap";
import search from "../../assets/search.svg";
import { capitalizeFirstLetter } from "../../utils/common";
import NoResultsFoundSVG from "../../assets/search__outer2.svg";
import { getAllCustomField } from "../../modules/custom-fields/redux/custom-field";
import { Loader } from "../Loader/Loader";
import { TriggerIssue } from "../../utils/sentry";
import inactive from "../../assets/agents/inactive.svg";
import schedulereports from "../../assets/reports/schedulereports.svg";
import ScheduleReportExport from "../ScheduleReportExport";
import moment from "moment";
import { InlineEditField } from "../../modules/shared/containers/InlineEditField/InlineEditField";
import { patchScheduleName } from "../../services/api/scheduleReportExport";
import CSV from "../../components/Uploads/CSV.svg";
import {
	trackActionSegment,
	trackPageSegment,
} from "modules/shared/utils/segment";
import { propertyMapperReversal } from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";
import { generateExportReportCSV } from "./Export.service";

export default function ExportModal({
	show,
	onHide,
	title,
	propertyList,
	mandatoryFieldId,
	mandatoryFieldName,
	hiddenPropertiesArray,
	customFieldPropertyId,
	customFieldEntity,
	exportEntity,
	selectedDataFieldId,
	selectedData,
	metaData,
	id,
	exportCSV,
	exportScheduleName,
	scheduleEntity,
	disableIncludeRadio = false,
	allFieldsAreMandatory = false,
	checkAll,
}) {
	const defaultExportObj = {
		filter_by: metaData?.filter_by?.length
			? [...propertyMapperReversal(metaData?.filter_by)]
			: [],
		file_type: "csv",
		columns_required: mandatoryFieldId ? [mandatoryFieldId] : [],
		is_sample: false,
	};

	const dispatch = useDispatch();
	const [showExportModal, setShowExportModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [searchPropertyList, setSearchPropertyList] = useState("");
	const [showInProgressModal, setShowInProgressModal] = useState(false);
	const customFieldsObj = useSelector((state) => state.customFields);
	const [customFields, setCustomFields] = useState([]);
	const [showError, setShowError] = useState(false);
	const [exportRequestObj, setExportRequestObj] = useState({
		...defaultExportObj,
	});
	const [showScheduleExport, setShowScheduleExport] = useState(false);
	const [scheduleExportSuccess, setScheduleExportSuccess] = useState(false);
	const [scheduleExportError, setScheduleExportError] = useState(false);
	const [scheduleIsRecurring, setScheduleIsRecurring] = useState(false);
	const [scheduleDate, setScheduleDate] = useState("");
	const [completedExportScheduleId, setCompleteExportScheduleId] =
		useState("");

	let customFieldCheckBoxLabel =
		capitalizeFirstLetter(title && title.substring(6, title.length - 4)) +
		"Custom Fields";
	useEffect(() => {
		if (showExportModal) {
			trackPageSegment(
				exportEntity.charAt(0).toUpperCase() +
					exportEntity.slice(1).toLowerCase(),
				exportScheduleName
			);
			if (allFieldsAreMandatory) {
				handleAllPropertiesChecked();
			}
		}
	}, [showExportModal]);
	useEffect(() => {
		if (customFieldsObj[customFieldEntity]) {
			setCustomFields(customFieldsObj[customFieldEntity]);
		}
	}, [customFieldsObj[customFieldEntity]]);

	useEffect(() => {
		if (!Object.keys(customFieldsObj).length) {
			dispatch(getAllCustomField());
		}
		setLoading(false);
	}, []);

	const allCustomFieldsChecked = () => {
		let flag = true;
		customFields.forEach((field) => {
			if (!exportRequestObj.columns_required.includes(field.name)) {
				flag = false;
			}
		});
		return flag;
	};

	const handleExportCheck = (value) => {
		if (value === customFieldPropertyId) {
			let temp1 = [];
			customFields.forEach((field) => {
				if (!exportRequestObj.columns_required.includes(field.name)) {
					temp1.push(field.name);
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
					(el) =>
						!customFields.map((field) => field.name).includes(el)
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

	let exportDataFields = propertyList.map(
		(field, index) =>
			!hiddenPropertiesArray.includes(field.field_id) &&
			field.original_field_id !== "custom_fields" &&
			field.field_name
				.toLowerCase()
				.includes(searchPropertyList.toLowerCase()) && (
				<div
					hidden={
						field.field_id === customFieldPropertyId &&
						customFields.length === 0
					}
					key={`${index}_${field.field_id}`}
				>
					<Form.Check
						className="pt-3"
						type="checkbox"
						label={`${capitalizeFirstLetter(field.field_name)}`}
						value={field.field_id}
						checked={
							allFieldsAreMandatory ||
							(field.field_id === customFieldPropertyId
								? allCustomFieldsChecked()
								: exportRequestObj.columns_required.includes(
										field.field_id
								  ))
						}
						disabled={allFieldsAreMandatory}
						onClick={(e) => handleExportCheck(e.target.value)}
					/>
				</div>
			)
	);

	if (
		exportEntity !== "Transactions" &&
		!propertyList
			.map((field) => field.field_id)
			.includes(customFieldPropertyId)
	) {
		exportDataFields.push(
			customFieldCheckBoxLabel
				.toLowerCase()
				.includes(searchPropertyList) && (
				<div
					hidden={customFields.length === 0}
					key={`${JSON.stringify(
						exportRequestObj
					)}_custom_field_check_all`}
				>
					<Form.Check
						className="pt-3"
						type="checkbox"
						label={customFieldCheckBoxLabel}
						value={customFieldPropertyId}
						checked={allCustomFieldsChecked()}
						onClick={(e) => handleExportCheck(e.target.value)}
					/>
				</div>
			)
		);
	}

	let exportCustomFields = customFields.map(
		(field, index) =>
			field.name
				.toLowerCase()
				.includes(searchPropertyList.toLowerCase()) && (
				<Form.Check
					key={`${index}_${field.name}`}
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

	const emptySearchCheck = () => {
		return (
			new Set(exportDataFields).size === 1 &&
			(!exportCustomFields.length > 0 ||
				new Set(exportCustomFields).size === 1)
		);
	};

	const handleAllPropertiesChecked = () => {
		let col = [];
		propertyList.forEach((field) => {
			if (field.original_field_id !== "custom_fields")
				col.push(field.field_id);
		});
		let temp1 = col.filter(
			(el) =>
				!hiddenPropertiesArray.includes(el) &&
				el !== customFieldPropertyId
		);
		mandatoryFieldId && temp1.unshift(mandatoryFieldId);
		let temp2 = customFields.map((field) => field.name);
		if (
			exportRequestObj.columns_required.length ===
			temp1.length + temp2.length
		) {
			let tempExportRequestObj = {
				...exportRequestObj,
				["columns_required"]: mandatoryFieldId
					? [mandatoryFieldId]
					: [],
			};
			setExportRequestObj(tempExportRequestObj);
		} else {
			let tempExportRequestObj = {
				...exportRequestObj,
				["columns_required"]: [...temp1, ...temp2],
			};
			setExportRequestObj(tempExportRequestObj);
		}
	};

	const exportAllData = () => {
		let tempExportRequestObj = { ...exportRequestObj, ["filter_by"]: [] };
		setExportRequestObj(tempExportRequestObj);
	};

	const exportFilteredData = () => {
		let tempExportRequestObj = {
			...exportRequestObj,
			["filter_by"]: [...propertyMapperReversal(metaData?.filter_by)],
		};
		setExportRequestObj(tempExportRequestObj);
	};

	const exportSelectedData = () => {
		let tempExportRequestObj = { ...exportRequestObj, ["filter_by"]: [] };
		tempExportRequestObj.filter_by.push({
			field_values: selectedData,
			field_id: selectedDataFieldId,
			filter_type: "objectId",
			negative: false,
			is_custom: false,
		});
		setExportRequestObj(tempExportRequestObj);
	};

	const handleOpenExport = () => {
		setShowExportModal(true);
		setExportRequestObj({ ...defaultExportObj });
	};

	const handleClose = () => {
		setExportRequestObj({ ...defaultExportObj });
		setShowInProgressModal(false);
		setSearchPropertyList("");
		setShowExportModal(false);
		setScheduleExportSuccess(false);
		setScheduleExportError(false);
		setShowScheduleExport(false);
	};

	const handleSubmit = () => {
		setLoading(true);
		trackActionSegment(
			"Clicked on Start Export Button",
			{
				currenyCategory: exportEntity || "",
			},
			true
		);
		generateExportReportCSV(exportRequestObj, scheduleEntity, id)
			.then((res) => {
				if (res.status === "success") {
					setShowInProgressModal(true);
					setLoading(false);
				} else if (res.errors) {
					TriggerIssue(
						`Export ${exportEntity} API failed`,
						res.errors
					);
					setShowInProgressModal(true);
					setShowError(true);
					setLoading(false);
				}
			})
			.catch((error) => {
				TriggerIssue(`Export ${exportEntity} API failed`, error);
				setShowInProgressModal(true);
				setShowError(true);
				setLoading(false);
			});
	};

	return (
		<>
			<button
				className="export mt-auto mb-auto mr-3"
				onClick={handleOpenExport}
			>
				<img src={CSV} alt="" />
				<span id="te">Export</span>
			</button>
			{showExportModal && (
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
								<span className="contracts__heading d-flex flex-row">
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
						{loading ||
						!Object.keys(customFieldsObj).length ||
						!propertyList.length ? (
							<div className="sideModal__progress">
								<Loader height={150} width={100} />
							</div>
						) : showInProgressModal || scheduleExportSuccess ? (
							<div className="sideModal__progress">
								<img
									src={
										showError || scheduleExportError
											? inactive
											: greenTick
									}
									height="54px"
									width="54px"
									style={{ marginBottom: "10px" }}
								/>
								{showError || scheduleExportError ? (
									<>
										<h5>Server Error!</h5>
										<p>
											We couldn't complete your request.
										</p>
									</>
								) : (
									<>
										{showInProgressModal && (
											<>
												<h5>
													Your export is in progress
												</h5>
												<p>
													We'll mail you as soon as
													the export is complete.
												</p>
											</>
										)}
										{scheduleExportSuccess && (
											<>
												<h5>
													{scheduleIsRecurring
														? "Recurring"
														: "One time"}{" "}
													Export Scheduled
												</h5>
												{!scheduleIsRecurring && (
													<p>
														for{" "}
														{moment(
															scheduleDate
														).format("DD MMM YYYY")}
													</p>
												)}
												<div
													className="schedule-name-edit"
													style={{ width: "255px" }}
												>
													<div className="font-11 mb-1">
														Schedule Name
													</div>
													<InlineEditField
														updateService={
															patchScheduleName
														}
														patch={{
															op: "replace",
															field: "export_name",
															value: exportScheduleName,
														}}
														id={
															completedExportScheduleId
														}
														inlineValueClassName="schedule-name-inline-edit"
														type="text"
														isMandatory={true}
													/>
												</div>
											</>
										)}
									</>
								)}
								<Button
									onClick={() => {
										handleClose();
									}}
								>
									Close
								</Button>
							</div>
						) : (
							<div className="sideModal__body_upper mt-2 ml-1">
								<div className="sideModalInput pb-2">
									<input
										type="text"
										placeholder="Search"
										value={searchPropertyList}
										onChange={(e) =>
											setSearchPropertyList(
												e.target.value?.trimStart()
											)
										}
									/>
									<img src={search} aria-hidden="true" />
								</div>
								<div className="sideModal__body_upper_inner ml-1">
									<div hidden={searchPropertyList !== ""}>
										<Form.Check
											key={`${JSON.stringify(
												exportRequestObj
											)}_export_check_all`}
											className="pt-1"
											type="checkbox"
											disabled={allFieldsAreMandatory}
											label={`Showing ${
												propertyList
													.map(
														(field) =>
															field.field_id
													)
													.includes(
														customFieldPropertyId
													)
													? propertyList.filter(
															(field) =>
																field.original_field_id !==
																"custom_fields"
													  ).length +
													  customFields.length -
													  hiddenPropertiesArray.length
													: propertyList.filter(
															(field) =>
																field.original_field_id !==
																"custom_fields"
													  ).length +
													  customFields.length -
													  hiddenPropertiesArray.length +
													  1
											} fields`}
											onClick={handleAllPropertiesChecked}
											checked={
												allFieldsAreMandatory ||
												(propertyList
													.map(
														(field) =>
															field.field_id
													)
													.includes(
														customFieldPropertyId
													)
													? exportRequestObj
															.columns_required
															.length ===
													  propertyList.filter(
															(field) =>
																field.original_field_id !==
																"custom_fields"
													  ).length +
															customFields.length -
															hiddenPropertiesArray.length
													: exportRequestObj
															.columns_required
															.length ===
													  propertyList.filter(
															(field) =>
																field.original_field_id !==
																"custom_fields"
													  ).length +
															customFields.length -
															hiddenPropertiesArray.length +
															1)
											}
										/>
										<div hidden={!mandatoryFieldName}>
											<Form.Check
												className="pt-3"
												type="checkbox"
												label={mandatoryFieldName}
												checked
												disabled
											/>
										</div>
									</div>
									{searchPropertyList !== "" &&
									emptySearchCheck() ? (
										<div className="sideModal__emptysearch">
											<img
												src={NoResultsFoundSVG}
												className="pl-3"
												height="175px"
												width="175px"
											/>
											<div className="empty-header">
												No results found
											</div>
											<div className="empty-lower">{`We couldn't find anything for '${searchPropertyList}'`}</div>
										</div>
									) : (
										<div>
											{exportDataFields}
											{exportCustomFields}
										</div>
									)}
								</div>
								<hr className="m-0 w-100" />
								<div className="w-100 ml-4 mt-2">
									<Form.Group as={Row}>
										<Form.Label as="legend" column sm={2}>
											INCLUDE:
										</Form.Label>
										<Col sm={10}>
											<Form.Check
												className="pl-1"
												inline
												type="radio"
												label={`All ${exportEntity}`}
												name="includeApps"
												id="AllApps"
												defaultChecked={
													!metaData?.filter_by?.length
												}
												disabled={disableIncludeRadio}
												onClick={exportAllData}
											/>
											<Form.Check
												className="pl-1"
												inline
												type="radio"
												label={`Selected ${exportEntity}`}
												name="includeApps"
												id="SelectedApps"
												onClick={exportSelectedData}
												disabled={
													disableIncludeRadio ||
													(!checkAll &&
														!selectedData?.length)
												}
											/>
											<div
												hidden={
													exportEntity ===
													"Transactions"
												}
											>
												<Form.Check
													className="pl-1"
													inline
													type="radio"
													label={`Filtered ${exportEntity}`}
													name="includeApps"
													id="FilteredApps"
													defaultChecked={
														metaData?.filter_by
															?.length
													}
													disabled={
														disableIncludeRadio
													}
													onClick={exportFilteredData}
												/>
											</div>
										</Col>
									</Form.Group>
								</div>
								<div className="w-100 ml-4 mt-2">
									<Form.Group as={Row}>
										<Form.Label as="legend" column sm={3}>
											FILE TYPE:
										</Form.Label>
										<div style={{ width: "230px" }}>
											<Form.Control
												as="select"
												className="w-50 select-file-type"
											>
												<option>CSV</option>
											</Form.Control>
										</div>
									</Form.Group>
								</div>
								<hr className="m-0 w-100" />
								<div className="sideModal__footer">
									<Button
										variant="link"
										size="sm"
										className="mr-3"
										onClick={handleClose}
									>
										Cancel
									</Button>
									<Button
										className="z-btn-primary mr-4"
										type="submit"
										onClick={handleSubmit}
										disabled={
											exportRequestObj.columns_required
												.length === 0
										}
									>
										Start Export
									</Button>
									<img
										src={schedulereports}
										className={`mr-2 ${
											exportRequestObj.columns_required
												.length === 0
												? "o-6"
												: "cursor-pointer"
										}`}
										height={35}
										onClick={() =>
											exportRequestObj.columns_required
												.length !== 0 &&
											setShowScheduleExport(true)
										}
									></img>
									{showScheduleExport && (
										<ScheduleReportExport
											exportRequestObj={exportRequestObj}
											onHide={() =>
												setShowScheduleExport(false)
											}
											isReport={false}
											setScheduleExportSuccess={
												setScheduleExportSuccess
											}
											setScheduleExportError={
												setScheduleExportError
											}
											setScheduleDate={setScheduleDate}
											setScheduleIsRecurring={
												setScheduleIsRecurring
											}
											scheduleType="export"
											exportEntity={scheduleEntity}
											scheduleName={exportScheduleName}
											setCompleteExportScheduleId={
												setCompleteExportScheduleId
											}
											id={id}
										/>
									)}
								</div>
							</div>
						)}
					</div>
				</>
			)}
		</>
	);
}
