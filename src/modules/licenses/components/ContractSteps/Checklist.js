import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ToggleSwitch from "react-switch";
import addDocument from "../../../../components/Applications/Contracts/adddocument.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import { SelectOld } from "../../../../UIComponents/SelectOld/Select";
import bluearrowdropdown from "../../../../assets/licenses/bluearrowsdropdown.svg";
import bluedownload from "../../../../assets/licenses/bluedownload.svg";
import pdf from "../../../../assets/licenses/pdf.svg";
import {
	getFileIcon,
	isValidFile,
	SUPPORTED_FILE_FORMATS,
} from "../../../../constants/upload";
import { updateStepperData } from "../../../../common/Stepper/redux";
import { uploadFile } from "../../../../services/upload/upload";
import { TriggerIssue } from "../../../../utils/sentry";
import {
	capitalizeFirstLetter,
	sanitizeFilename,
} from "../../../../utils/common";
import { Loader } from "../../../../common/Loader/Loader";
import deleteIcon from "../../../../assets/deleteIcon.svg";
import {
	defaultBooleanFieldKeysArray,
	documentTypes,
} from "../../constants/LicenseConstants";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import csv from "../../../../components/Onboarding/csv.svg";
import documentIcon from "../../../../assets/documentIcon.svg";
import _ from "underscore";
import { dateResetTimeZone } from "../../../../utils/DateUtility";
import search from "assets/search.svg";
import { Popover } from "UIComponents/Popover/Popover";
import { useOutsideClickListener } from "utils/clickListenerHook";

export default function Checklist({ updateStep }) {
	const hiddenFileInput = React.useRef(null);
	const checklistSuggestions = React.useRef(null);
	const dispatch = useDispatch();
	const { data } = useSelector((state) => state.stepper);

	const updateData = (data) => {
		dispatch(updateStepperData(data));
	};

	const [uploadedFiles, setUploadedFiles] = useState(data?.documents || []);
	const [currentFile, setCurrentFile] = useState();
	const [currentFileExt, setCurrentFileExt] = useState();
	const [fileUploading, setFileUploading] = useState(false);
	const [fileUploaded, setFileUploaded] = useState(false);
	const [fileType, setFileType] = useState();
	const [fileNotSupported, setFileNotSupported] = useState(false);
	const [fileUploadFailed, setFileUploadFailed] = useState(false);
	const [showAddMoreField, setShowAddMoreField] = useState(false);
	const [checklistKey, setChecklistKey] = useState("");
	const [showChecklistSuggestions, setShowChecklistSuggestions] =
		useState(false);
	const [defaultChecklistSuggestions, setDefaultChecklistSuggestions] =
		useState([]);

	useEffect(() => {
		let dataChecklistKeyArray = data?.checklist?.map((field) =>
			field.key.replaceAll("_", " ")?.toLowerCase()
		);
		let tempCheckList = defaultBooleanFieldKeysArray.filter(
			(key) => !dataChecklistKeyArray?.includes(key)
		);
		setDefaultChecklistSuggestions([...tempCheckList]);
	}, [data]);

	useOutsideClickListener(checklistSuggestions, () => {
		setShowChecklistSuggestions(false);
	});

	const handleUploadButtonClick = () => {
		hiddenFileInput.current.click();
	};

	const handleFileUpload = (e) => {
		setFileUploading(true);
		let file = e.target.files[0];
		if (!isValidFile(file)) {
			setFileNotSupported(true);
			setTimeout(() => {
				setFileNotSupported(false);
				setFileUploading(false);
			}, 2000);
			return;
		}
		setCurrentFile(file);
		const { name, type, size } = file;
		uploadFile(file)
			.then((res) => {
				setCurrentFile({
					source_url: res.resourceUrl,
					date: dateResetTimeZone(new Date()),
					name: sanitizeFilename(name),
					type: type,
					size: size,
				});
				let extension = _.last(sanitizeFilename(name)?.split("."));
				setCurrentFileExt(extension);
				setFileUploaded(true);
				setFileUploading(false);
			})
			.catch((err) => {
				setFileUploadFailed(true);
				setFileUploading(false);
				setTimeout(() => {
					setFileUploadFailed(false);
				}, 5000);
				TriggerIssue(
					"There was an error while uploading the file",
					err
				);
			});
	};

	const handleFileTypeSelect = (option) => {
		let file = currentFile;
		file.doc_type = option.value;
		let fileArray = [...uploadedFiles];
		fileArray.push(file);
		setUploadedFiles(fileArray);
		updateData({ documents: fileArray });
		setCurrentFile();
		setCurrentFileExt();
		setFileUploaded(false);
	};

	const handleRemoveUploadedDocument = (index) => {
		const fileArray = data?.documents;
		if (index > -1) {
			fileArray.splice(index, 1);
		}
		updateData({ documents: fileArray });
	};

	const removeFieldFromCheckList = (key) => {
		let tempCheckList = data?.checklist?.filter(
			(field) => field.key !== key
		);
		updateData({ checklist: tempCheckList });
	};

	const handleChecklistKeyChange = (value) => {
		value = value?.trimStart();
		setChecklistKey(value);
	};

	const addFieldToChecklist = (key) => {
		let tempCheckList = [
			...data?.checklist,
			{ key: key, value: false, is_custom: false },
		];
		updateData({ checklist: tempCheckList });
		setChecklistKey("");
		setShowChecklistSuggestions(false);
		setShowAddMoreField(false);
	};

	return (
		<>
			<div className="d-flex justify-content-evenly mb-1">
				<div className="checklist-left d-flex flex-column">
					{Array.isArray(data?.documents) &&
						data?.documents.length > 0 &&
						data?.documents.map((file, index) => {
							return (
								<div
									className="mb-2 d-flex align-items-center"
									style={{
										border: "1px solid #EBEBEB",
										height: "44px",
										minHeight: "44px",
										width: "380px",
										padding: "0px 5px",
									}}
								>
									<div className="d-flex align-items-center">
										<img
											src={getFileIcon(file)}
											height={20}
											width={20}
										/>
										<OverlayTrigger
											placement="top"
											overlay={
												<Tooltip>{file.name}</Tooltip>
											}
										>
											<div className="checklist-left-doc-name-truncate ml-1 bold-600 font-12">
												{file.name}
											</div>
										</OverlayTrigger>
									</div>
									<div className="d-flex w-100 justify-content-end">
										<div className="filter-capsule d-flex align-items-center pl-2 pr-2">
											<span className="filter-capsule-text grey-1 text-capitalize font-10">
												{`${file.doc_type} document`}
											</span>
										</div>
									</div>
									<img
										className="cursor-pointer ml-2"
										src={deleteIcon}
										height={16}
										width={16}
										onClick={() =>
											handleRemoveUploadedDocument(index)
										}
									/>
								</div>
							);
						})}
					<div className="upload-div-container">
						<div
							className="contract-document-upload-div"
							style={{ minHeight: "140px" }}
						>
							{fileUploaded && currentFile ? (
								<>
									<div className="d-flex flex-column">
										<div className="d-flex mb-2 align-items-center">
											<img
												src={
													currentFileExt === "csv"
														? csv
														: currentFileExt ===
														  "pdf"
														? pdf
														: documentIcon
												}
												width={40}
												height={40}
											/>
											<OverlayTrigger
												overlay={
													<Tooltip>
														{currentFile?.name}
													</Tooltip>
												}
											>
												<div className="truncate_10vw ml-1 bold-600 font-14 ">
													{currentFile.name}
												</div>
											</OverlayTrigger>
										</div>
										<SelectOld
											style={{
												border: "1px solid #2266E2",
												marginBottom: "0px",
												height: "fit-content",
												fontSize: "17px",
												color: "#2266E2",
												height: "34px",
											}}
											className="m-0 mr-2"
											arrowdropdown={bluearrowdropdown}
											inputTextStyle={{
												padding: "0px 10px",
											}}
											options={documentTypes}
											optionListClass={"menu"}
											value={fileType}
											onSelect={(option) => {
												handleFileTypeSelect(option);
											}}
											inputTextSpanStyle={{
												opacity: 1,
												color: "#2266E2",
											}}
											optionClassName={
												"forecastbargraph__filtersmenu__option"
											}
											inputPlaceholderClassName={
												"document_select_placeholder primary-color font-13"
											}
											placeholder="Select File Type"
											placeholderImg={bluedownload}
											showIcons={true}
										/>
										<div className="grey-1 o-7 font-11 mt-2">
											Select a file type to start
											uploading
										</div>
									</div>
								</>
							) : (
								<>
									{fileUploading ? (
										<Loader width={100} height={100} />
									) : (
										<>
											<img src={addDocument} />
											<div className="d-flex flex-column align-items-between ml-1">
												<div className="font-12 o-8">
													Add Supporting Documents
												</div>
												<div
													className="font-13 bold-600 primary-color cursor-pointer d-flex justify-content-center"
													onClick={
														handleUploadButtonClick
													}
												>
													+ Add Documents
												</div>
												<input
													type="file"
													accept={
														SUPPORTED_FILE_FORMATS
													}
													style={{ display: "none" }}
													ref={hiddenFileInput}
													onChange={handleFileUpload}
												/>
											</div>
										</>
									)}
								</>
							)}
						</div>
						{fileNotSupported && (
							<div className="warningMessage w-100 p-1 m-1">
								Certain file types are not supported.
							</div>
						)}
						{fileUploadFailed && (
							<div className="warningMessage w-100 p-1 m-1">
								Server Error! File upload failed. Please try
								again.
							</div>
						)}
					</div>
				</div>
				<div className="checklist-right">
					{data?.checklist?.map((field, index) => (
						<div className="d-flex flex-row justify-content-between align-items-center p-2">
							<div className="font-14 d-flex align-items-center">
								<div>
									{field.key === "approved_by_it" ||
									field.key === "approved by it"
										? "Approved by IT"
										: capitalizeFirstLetter(
												field.key.replaceAll("_", " ")
										  )}
								</div>
								<img
									src={deleteIcon}
									className="cursor-pointer ml-1"
									onClick={() =>
										removeFieldFromCheckList(field.key)
									}
								/>
							</div>
							<ToggleSwitch
								height={18}
								width={31}
								checked={field.value}
								onChange={() => {
									let tempCheckList = data?.checklist.map(
										_.clone
									);
									tempCheckList[index].value = !field.value;
									updateData({
										checklist: [...tempCheckList],
									});
								}}
								checkedIcon={false}
								uncheckedIcon={false}
								onColor={"#2266E2"}
							/>
						</div>
					))}
					{!showAddMoreField ? (
						<div
							className="primary-color d-flex align-items-center justify-content-center font-13 bold-600 cursor-pointer dashedBorder py-2 mt-1"
							onClick={() => setShowAddMoreField(true)}
						>
							+ Add More
						</div>
					) : (
						<div
							onClick={() => setShowChecklistSuggestions(true)}
							ref={checklistSuggestions}
							className="position-relative"
						>
							<div className="checklistSearchInput mt-1">
								<input
									style={{ paddingLeft: "4px" }}
									type="text"
									placeholder="Add a field"
									value={checklistKey}
									onChange={(e) =>
										handleChecklistKeyChange(e.target.value)
									}
								/>
								<img src={search} aria-hidden="true" />
							</div>
							{showChecklistSuggestions &&
								(checklistKey ||
									defaultChecklistSuggestions.length > 0) && (
									<Popover
										className="checklistSuggestionPopover"
										show={showChecklistSuggestions}
										onClose={() =>
											setShowChecklistSuggestions(false)
										}
									>
										<div className="d-flex flex-column">
											{defaultChecklistSuggestions.map(
												(key, index) => (
													<div
														className="checklistSuggestionOptions"
														onClick={() =>
															addFieldToChecklist(
																key
															)
														}
														key={index}
													>
														{capitalizeFirstLetter(
															key
														)}
													</div>
												)
											)}
											{checklistKey && (
												<div
													className="primary-color cursor-pointer checklistSuggestionOptions"
													onClick={() =>
														addFieldToChecklist(
															checklistKey
														)
													}
												>{`+ Add '${checklistKey}'`}</div>
											)}
										</div>
									</Popover>
								)}
						</div>
					)}
				</div>
			</div>
			<Button
				onClick={() => updateStep()}
				style={{ width: "132px", height: "38px" }}
			>
				Next
			</Button>
		</>
	);
}
