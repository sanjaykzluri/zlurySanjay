import React, { useState } from "react";
import errorFile from "../../assets/errorFile.svg";
import folder from "../../assets/folder.svg";
import { isCSVFile, isPDFFile } from "./UploadConstantsAndFunctions";
import _ from "underscore";

const MAX_SIZE = 5242880;

function UploadPdfFile(props) {
	const [fileNameErrorMsg, setFileNameErrorMsg] = useState(
		"This file type is not supported. Please upload a PDF"
	);

	function validFileName(fileName) {
		const extension = fileName.match(/\.pdf$/);

		if (Array.isArray(fileName.match(/\.pdf$/)) && _.first(extension)) {
			if (extension && fileName.split(".").length > 2) {
				props.setFileError(true);
				props.setFile();
				setFileNameErrorMsg(
					"Please remove the dots(.) from the file name & reupload the file."
				);
			}
		}
	}

	const handleFileSelect = async (e) => {
		try {
			let file = e.target.files[0];
			if (isPDFFile(file)) {
				if (file.size >= MAX_SIZE) {
					props.setFileError(true);
					setFileNameErrorMsg(
						"File size is greater than 5 MB. Please upload smaller size file"
					);
				} else {
					props.setFile(file);
					props.setFileError(false);
					validFileName(file?.name);
				}
			} else {
				setFileNameErrorMsg(
					"This file type is not supported. Please upload a PDF"
				);
				props.setFileError(true);
			}
		} catch (err) {
			console.log(err);
		}
	};

	const onDragOver = (event) => {
		event.preventDefault();
		event.stopPropagation();
	};

	const onDrop = async (event) => {
		event.preventDefault();
		let file = event.dataTransfer.files[0];
		if (isPDFFile(file)) {
			if (file.size >= MAX_SIZE) {
				props.setFileError(true);
				setFileNameErrorMsg(
					"File size is greater than 5 MB. Please upload smaller size file"
				);
			} else {
				props.setFile(file);
				props.setFileError(false);
				validFileName(file?.name);
			}
		} else {
			setFileNameErrorMsg(
				"This file type is not supported. Please upload a PDF"
			);
			props.setFileError(true);
		}
	};

	return (
		<div
			className="d-flex flex-column m-auto align-items-center"
			onDrop={onDrop}
			onDragOver={onDragOver}
		>
			<img
				src={props.fileError ? errorFile : folder}
				alt="file"
				className="folderImage"
			/>
			<p
				className={
					"text-center font-12 mt-3 " +
					(props.fileError ? "errorMessage mb-3" : "mb-4")
				}
			>
				{props.fileError ? fileNameErrorMsg : "Drag and drop a PDF or"}
			</p>
			<label
				className="mt-0 mb-2 selectFileButton"
				style={{ opacity: 1 }}
			>
				<input type="file" accept=".pdf" onChange={handleFileSelect} />
				Select File
			</label>
		</div>
	);
}

export default UploadPdfFile;
