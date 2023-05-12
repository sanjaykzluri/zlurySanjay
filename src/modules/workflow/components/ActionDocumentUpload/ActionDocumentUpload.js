import React, { useEffect, useRef, useState } from "react";
import "./ActionDocumentUpload.css";
import UploadPdfFile from "components/Uploads/UploadPdfFile";
import { uploadFile } from "services/upload/upload";
import { client } from "../../../../utils/client";
import { OverlayTrigger, Tooltip, ProgressBar } from "react-bootstrap";
import TimesSVG from "../../../../assets/icons/times.svg";
import PdfSVG from "../../../../assets/icons/pdf.svg";
import CheckCircleSVG from "../../../../assets/icons/check-circle.svg";

const ActionDocumentUpload = (props) => {
	const cancelTokenSource = useRef();

	const [fileError, setFileError] = useState(false);
	const [file, setFile] = useState();
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [uploadedFiles, setUploadedFiles] = useState([]);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploadComplete, setIsUploadComplete] = useState(false);

	useEffect(() => {
		if (props.value) {
			setUploadedFiles(props.value);
		}
	}, [props.value]);

	const progressHandler = (progressEvent) => {
		setUploadProgress(
			Math.round((progressEvent.loaded * 100) / progressEvent.total)
		);
	};

	const tempFile = (file) => {
		const localSelectedFiles = [...selectedFiles];
		localSelectedFiles.push(file);
		setSelectedFiles(localSelectedFiles);
	};

	useEffect(() => {
		if (file) {
			tempFile(file);
			let source = client.CancelToken.source();
			let options = {
				cancelToken: source.token,
				onUploadProgress: progressHandler,
			};

			cancelTokenSource.current = source;
			setIsUploadComplete(false);
			uploadFile(file, options)
				.then((res) => {
					setIsUploadComplete(true);
					handleComplete(file?.name, res.resourceUrl, file);
				})
				.catch((err) => {
					console.log("Error uploading files:", err);
				});
		}
	}, [file]);

	const handleComplete = (name, source_url, file) => {
		const tempArray = [...uploadedFiles];
		const { size, type } = file;
		const document = {
			name,
			source_url,
			size,
			type,
		};
		tempArray.push(document);
		setUploadedFiles(tempArray);
		props.onChange && props.onChange(tempArray);
		setSelectedFiles([]);
	};

	const handleCancelClick = (file, index) => {
		let tempArray = [...uploadedFiles];
		if (index > -1) {
			tempArray.splice(index, 1);
		} else {
			tempArray = tempArray.filter(
				(selectedFile) => selectedFile.source_url !== file.source_url
			);
		}
		setUploadedFiles(tempArray);
		props.onChange && props.onChange(tempArray);
	};

	const uploadedFilesUI = (renderedFile, index) => (
		<>
			<div
				className="flex-center mb-2 border rounded w-100"
				style={{ padding: "12px 18px" }}
			>
				<img alt="" src={PdfSVG} width="32" className="mr-3" />
				<div className="w-75 ml-0 mr-auto d-inline-flex">
					<div className="d-flex align-items-center w-100">
						{isUploadComplete && (
							<img
								alt=""
								src={CheckCircleSVG}
								width="16"
								className="mr-1"
							/>
						)}
						<OverlayTrigger
							placement="top"
							overlay={<Tooltip>{renderedFile.name}</Tooltip>}
						>
							<span className="bold-600 text-truncate">
								{renderedFile.name}
							</span>
						</OverlayTrigger>
					</div>
					<ProgressBar
						className="mt-1"
						now={uploadProgress}
						style={{ height: 6 }}
					/>
				</div>
				<a
					onClick={() => handleCancelClick(renderedFile, index)}
					className="cursor-pointer ml-4"
				>
					<img alt="" src={TimesSVG} width="12" />
				</a>
			</div>
		</>
	);

	const uploadedFilesPendingUI = (renderedFile, index) => (
		<>
			<div
				className="flex-center mb-2 border rounded w-100"
				style={{ padding: "12px 18px" }}
			>
				<img alt="" src={PdfSVG} width="32" className="mr-3" />
				<div className="w-75 ml-0 mr-auto d-inline-flex">
					<div className="d-flex align-items-center w-100">
						<OverlayTrigger
							placement="top"
							overlay={<Tooltip>{renderedFile.name}</Tooltip>}
						>
							<span className="bold-600 text-truncate">
								{renderedFile.name}
							</span>
						</OverlayTrigger>
						<span className="ml-2">{uploadProgress}%</span>
					</div>
					<ProgressBar
						className="mt-1"
						now={uploadProgress}
						style={{ height: 6 }}
					/>
				</div>
				{/* <a
					onClick={() => handleCancelClick(renderedFile, index)}
					className="cursor-pointer ml-4"
				>
					<img alt="" src={TimesSVG} width="12" />
				</a> */}
			</div>
		</>
	);

	return (
		<>
			<div className="uploadTransactionContainer flex-1 actionDocumentUpload">
				<UploadPdfFile
					setFile={setFile}
					setFileError={setFileError}
					fileError={fileError}
				/>
			</div>
			{uploadedFiles?.length > 0 && (
				<div className="mb-0 w-100 mt-2">
					{uploadedFiles.map((file, index) =>
						uploadedFilesUI(file, index)
					)}
				</div>
			)}
			{selectedFiles?.length > 0 && (
				<div className="mb-0 w-100 mt-2">
					{selectedFiles.map((file, index) =>
						uploadedFilesPendingUI(file, index)
					)}
				</div>
			)}
		</>
	);
};

export default ActionDocumentUpload;
