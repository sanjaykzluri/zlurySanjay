import React, { Component, useState, useEffect, useContext } from "react";
import "./DocumentsList.css";
import Plus from "../../../../../../../assets/icons/plus.svg";
import { Form, Button } from "react-bootstrap";
import {
	isValidFile,
	SUPPORTED_FILE_FORMATS,
} from "../../../../../../../constants/upload";
import add from "../../../../../Contracts/add.svg";
import { DocumentItem } from "./Document";
import { DocumentListModal } from "../DocumentListModal";
import { FileUpload } from "../../../../../Contracts/FileUpload";
import { addDocumentToVendor } from "../../../../../../../services/api/applications";
function DocumentsListContainer(props) {
	const [showShowDocumentsModal, setShowDocumentsModal] = useState(false);

	const { documents, fetchVendorOverview } = props;

	return (
		<>
			{documents && documents.length === 0 ? (
				<>
					<Form.File id="formcheck-api-regular">
						<Form.File.Label
							className="btn d-flex"
							style={{ padding: "0px" }}
						>
							<div
								className="vendoroverview__documentlist__emptycont border-dashed cursor-pointer"
								style={{ width: "292px" }}
							>
								<img src={Plus} width="25" />
								<div style={{ fontSize: 13 }}>Add Document</div>
							</div>
						</Form.File.Label>
						<Form.File.Input
							onChange={(e) => props.handleFileSelection(e)}
							accept={SUPPORTED_FILE_FORMATS.toString()}
						/>
					</Form.File>
				</>
			) : (
				<>
					{documents?.slice(0, 2).map((document, index) => (
						<DocumentItem
							document={document}
							fetchVendorOverview={fetchVendorOverview}
						/>
					))}
					{documents?.length > 2 && (
						<div
							className="flex-center cursor-pointer border rounded-lg"
							style={{ minWidth: "100px" }}
							onClick={() => setShowDocumentsModal(true)}
						>
							<span style={{ fontSize: 14 }}>
								{documents.length - 2} more
							</span>
						</div>
					)}
				</>
			)}
			{showShowDocumentsModal && (
				<>
					<div className="modal-backdrop show"></div>
					<div style={{ display: "block" }} className="modal"></div>
					<DocumentListModal
						documents={documents}
						onHide={() => setShowDocumentsModal(false)}
						fetchVendorOverview={fetchVendorOverview}
					/>
				</>
			)}
		</>
	);
}
export function DocumentsListVendor(props) {
	const [uploadedFile, setUploadedFile] = useState("");
	const [loadingFile, setLoadingFile] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [invalidFileUploaded, setInvalidFileUploaded] = useState(false);

	function handleFileSelection(e) {
		setLoadingFile(true);
		let fileArray = [];
		const fileObj = e.target.files;
		if (fileObj.length === 0) setLoadingFile(false);
		Object.keys(fileObj).forEach((el) => {
			if (isValidFile(fileObj[el])) {
				fileArray.push(fileObj[el]);
			} else {
				setLoadingFile(false);
				setInvalidFileUploaded(true);
				setTimeout(() => {
					setInvalidFileUploaded(false);
				}, 5000);
			}
		});
		setSelectedFiles([...selectedFiles, ...fileArray]);
		setUploadedFile(e.target.value);
	}

	const handleFileUploadComplete = (name, url) => {
		const vendorId = window.location.pathname.split("/")[3];

		const documentObj = {
			document: {
				name,
				source_url: url,
				date: new Date().toISOString(),
			},
		};
		addDocumentToVendor(vendorId, documentObj).then(() => {
			props.fetchVendorOverview();
			setSelectedFiles([]);
			setLoadingFile(false);
		});
	};

	const handleFileUploadCancel = (file, resourceUrl) => {
		let filterredSelectedFiles = selectedFiles.filter(
			(selectedFile) => selectedFile.name !== file.name
		);
		setSelectedFiles(filterredSelectedFiles);
		setLoadingFile(false);
	};

	return (
		<>
			<div className="vendoroverview__doculist__cont">
				<div className="contractins__bottomdivright__div1 ">
					<div className="mr-auto vendoroverview__documentheader">
						DOCUMENTS
					</div>
					<div hidden={loadingFile}>
						<Form.File id="formcheck-api-regular">
							<Form.File.Label
								className="btn d-flex"
								style={{ padding: "0px" }}
							>
								<img src={add} alt="add"></img>
								<span className="aaaaaa">Add Documents</span>
							</Form.File.Label>
							<Form.File.Input
								value={uploadedFile}
								onChange={(e) => handleFileSelection(e)}
								accept={SUPPORTED_FILE_FORMATS.toString()}
							/>
						</Form.File>
					</div>
					{loadingFile &&
						selectedFiles.map((file) => (
							<FileUpload
								file={file}
								onCancel={handleFileUploadCancel}
								closeOnComplete
								onComplete={(name, url) =>
									handleFileUploadComplete(name, url)
								}
							/>
						))}
				</div>
				<div className="vendoroverview__documentlist">
					<DocumentsListContainer
						documents={props.vendor.documents}
						fetchVendorOverview={props.fetchVendorOverview}
						handleFileSelection={handleFileSelection}
						handleFileUploadCancel={handleFileUploadCancel}
						handleFileUploadComplete={handleFileUploadComplete}
						uploadedFile={uploadedFile}
						selectedFiles={selectedFiles}
					></DocumentsListContainer>
				</div>
				{invalidFileUploaded && (
					<div className="d-flex flex-row justify-content-center red">
						Certain file types are not supported.
					</div>
				)}
			</div>
		</>
	);
}
