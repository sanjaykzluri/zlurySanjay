import React, { useRef, useState } from "react";
import { DocumentItem } from "../../../../components/Applications/Vendors/SingleVendor/Overview/Components/DocumentsList/Document";
import search from "../../../../assets/search.svg";
import Add from "../../../../assets/add.svg";
import { SearchInputArea } from "../../../../components/searchInputArea";
import {
	isValidFile,
	SUPPORTED_FILE_FORMATS,
} from "../../../../constants/upload";
import { TriggerIssue } from "../../../../utils/sentry";
import { uploadFile } from "../../../../services/upload/upload";
import { sanitizeFilename } from "../../../../utils/common";
import {
	addDocumentToContract,
	deleteDocumentOfContract,
	editContractV2,
	editDocumentOfContract,
} from "../../../../services/api/licenses";
import { documentTypes, screenEntity } from "../../constants/LicenseConstants";
import { Loader } from "../../../../common/Loader/Loader";
import emptyDocument from "../../../../assets/emptyDocument.png";
import { EmptySearch } from "../../../../common/EmptySearch";
import { Button } from "../../../../UIComponents/Button/Button";
import { SelectOld } from "../../../../UIComponents/SelectOld/Select";
import bluearrowdropdown from "../../../../assets/licenses/bluearrowsdropdown.svg";
import bluedownload from "../../../../assets/licenses/bluedownload.svg";
import pdf from "../../../../assets/licenses/pdf.svg";
import csv from "../../../../components/Onboarding/csv.svg";
import documentIcon from "../../../../assets/documentIcon.svg";
import _ from "underscore";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { dateResetTimeZone } from "../../../../utils/DateUtility";
import { trackActionSegment } from "modules/shared/utils/segment";
import { useDispatch } from "react-redux";
import { clearAllV2DataCache } from "modules/v2InfiniteTable/redux/v2infinite-action";

export default function ContractDocumentPage(props) {
	const dispatch = useDispatch();
	const hiddenFileInput = useRef();
	const { loading, documents, data, entity, requestData } = props;
	const [searchQuery, setSearchQuery] = useState("");
	const [currentFile, setCurrentFile] = useState();
	const [currentFileExt, setCurrentFileExt] = useState();
	const [fileUploading, setFileUploading] = useState(false);
	const [fileUploaded, setFileUploaded] = useState(false);
	const [fileNotSupported, setFileNotSupported] = useState(false);
	const [fileUploadFailed, setFileUploadFailed] = useState(false);
	const [selectDocType, setSelectDocType] = useState(false);
	const [currentFileDocType, setCurrentFileDocType] = useState();
	const contractId = window.location.pathname.split("/")[3];

	const handleUploadButtonClick = () => {
		hiddenFileInput.current.click();
	};

	const handleFileUpload = (e) => {
		setFileUploading(true);
		let file = e.target.files[0];
		if (!isValidFile(file)) {
			setFileNotSupported(true);
			setFileUploading(false);
			setTimeout(() => {
				setFileNotSupported(false);
			}, 5000);
			return;
		}
		setCurrentFile(file);
		const { name, type, size } = file;
		uploadFile(file)
			.then((res) => {
				setFileUploading(false);
				setSelectDocType(true);
				setCurrentFile({
					source_url: res.resourceUrl,
					date: dateResetTimeZone(new Date()),
					name: sanitizeFilename(name),
					type: type,
					size: size,
				});
				let extension = _.last(sanitizeFilename(name)?.split("."));
				setCurrentFileExt(extension);
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
		setFileUploaded(false);
		setSelectDocType(false);
		handlePatchDocumentToContract(file);
		setCurrentFile();
		setCurrentFileExt();
	};

	const handlePatchDocumentToContract = async (fileObj) => {
		setFileUploading(true);
		const res = await addDocumentToContract(contractId, fileObj);
		if (res.result && res.result.status === "success") {
			trackActionSegment(
				`Added Document to ${entity}`,
				{
					[`${entity}_id`]: contractId,
					fileObj: fileObj,
				},
				true
			);
			requestData(contractId);
			setFileUploaded(true);
			setFileUploading(false);
			setFileUploadFailed(false);
			dispatch(clearAllV2DataCache(`${entity}s`));
		} else {
			setFileUploading(false);
			setFileUploadFailed(true);
		}
	};

	const handleDeleteDocument = async (document) => {
		const res = await deleteDocumentOfContract(contractId, document._id);
		if (res.result && res.result.status === "success") {
			requestData(contractId);
			setFileUploaded(true);
			setFileUploading(false);
			setFileUploadFailed(false);
			dispatch(clearAllV2DataCache(`${entity}s`));
		} else {
			setFileUploading(false);
			setFileUploadFailed(true);
		}
	};

	const requestDocEdit = async (document, key, value) => {
		document[key] = value;
		const res = await editDocumentOfContract(
			contractId,
			document._id,
			document
		);
		if (res.result && res.result.status === "success") {
			requestData(contractId);
			setFileUploadFailed(false);
		} else {
			setFileUploadFailed(true);
		}
	};

	let documentsList =
		documents &&
		Array.isArray(documents) &&
		documents?.map(
			(document) =>
				document.name
					?.toLowerCase()
					.includes(searchQuery?.toLowerCase()) && (
					<div className="contract-document-item-container">
						<DocumentItem
							document={{
								...document,
							}}
							className="contract-document-page"
							isContractDocumentPage
							deleteDocument={() =>
								handleDeleteDocument(document)
							}
							positionClassName="vendor__overview__documentlist__position"
							isEditable={true}
							onDocNameChange={(docName) =>
								requestDocEdit(document, "name", docName)
							}
						/>
					</div>
				)
		);

	const emptySearchCheck = () => {
		return new Set(documentsList).size === 1;
	};

	return (
		<>
			<div className="contract-documents-filters">
				{(fileUploadFailed || fileNotSupported) && (
					<div className="warningMessage w-auto mr-auto p-2">
						{fileNotSupported
							? "Certain file types are not supported"
							: "Server Error! Request could not be completed. Please try again!"}
					</div>
				)}
				<div className="inputWithIconApps mr-3 ml-0 mt-auto mb-auto">
					<SearchInputArea
						placeholder="Search Documents"
						setSearchQuery={setSearchQuery}
					/>
					<img src={search} aria-hidden="true" />
				</div>
				<div>
					<button
						className="appsad mr-3"
						onClick={handleUploadButtonClick}
					>
						<img src={Add} alt="" />
						<span id="te">Add</span>
					</button>
				</div>
				<input
					type="file"
					accept={SUPPORTED_FILE_FORMATS}
					style={{ display: "none" }}
					ref={hiddenFileInput}
					onChange={handleFileUpload}
				/>
			</div>
			{loading || fileUploading ? (
				<div className="contract-documents-loader">
					<Loader width={200} height={200} />
				</div>
			) : (
				<>
					{selectDocType ? (
						<div className="contract-documents-loader">
							<div className="d-flex flex-column h-100 align-items-center justify-content-center">
								<div className="d-flex mb-2 align-items-center">
									<img
										src={
											currentFileExt === "csv"
												? csv
												: currentFileExt === "pdf"
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
											{currentFile?.name}
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
									value={currentFileDocType}
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
									Select a file type to start uploading
								</div>
							</div>
						</div>
					) : (
						<>
							{searchQuery === "" ? (
								documentsList?.length ? (
									<div className="contract-documents-container">
										{documentsList}
									</div>
								) : (
									<div className="contract-documents-loader">
										<img src={emptyDocument} />
										<div className="font-14">
											No documents are added in this{" "}
											{entity}.
										</div>
										<Button
											type="link"
											onClick={handleUploadButtonClick}
										>
											+ Add Documents
										</Button>
									</div>
								)
							) : emptySearchCheck() ? (
								<div className="contract-documents-loader">
									<EmptySearch searchQuery={searchQuery} />
								</div>
							) : (
								<div className="contract-documents-container">
									{documentsList}
								</div>
							)}
						</>
					)}
				</>
			)}
		</>
	);
}
