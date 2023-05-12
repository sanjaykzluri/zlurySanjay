import { SUPPORTED_IMAGE_FORMATS } from "constants/upload";
import React, { useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { uploadFile } from "services/upload/upload";
import addDocument from "components/Applications/Contracts/adddocument.svg";
import { ApiResponseNotification } from "../ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "../ApiResponseNotification/ApiResponseNotificationConstants";
import { Loader } from "common/Loader/Loader";

export default function DocumentUpload({
	acceptedFileArray = SUPPORTED_IMAGE_FORMATS,
	id = "file_upload",
	onFileUpload,
	children = (
		<div
			className="border-1 border-radius-4 d-flex align-items-center justify-content-center bg-white"
			style={{ height: "44px", width: "200px" }}
		>
			<div
				className="contract-document-upload-div"
				style={{ height: "36px", width: "192px" }}
			>
				<img src={addDocument} height={20} width={20} />
				<div className="primary-color font-10 bold-500 ml-1">
					+ Add Document
				</div>
			</div>
		</div>
	),
	loader = (
		<div
			className="border-1 border-radius-4 d-flex align-items-center justify-content-center bg-white"
			style={{ height: "44px", width: "200px" }}
		>
			<Loader height={40} width={40} />
		</div>
	),
	readUploadedFile,
	getSourceUrl = true,
}) {
	const hiddenFileInputBtn = useRef();
	const [uploading, setUploading] = useState(false);

	const handleClickOnUpload = () => {
		!uploading && hiddenFileInputBtn.current.click();
	};

	const handleProfileImageChange = (e) => {
		setUploading(true);
		let file = e.target.files[0];
		readUploadedFile && readUploadedFile(file);
		const { name, type, size } = file;
		if (getSourceUrl) {
			uploadFile(file)
				.then((res) => {
					setUploading(false);
					onFileUpload &&
						onFileUpload({
							name: name,
							type: type,
							size: size,
							date: new Date(),
							source_url: res.resourceUrl,
						});
				})
				.catch((error) => {
					ApiResponseNotification({
						responseType: apiResponseTypes.ERROR,
						title: "Server Error! The file could not be uploaded. Try Again!",
						errorObj: error,
					});
					setUploading(false);
				});
		} else {
			setUploading(false);
		}
	};

	return (
		<>
			<div className="cursor-pointer" onClick={handleClickOnUpload}>
				{uploading ? loader : children}
			</div>
			<Form.File
				id={id}
				accept={acceptedFileArray?.toString()}
				style={{ display: "none" }}
			>
				<Form.File.Input
					ref={hiddenFileInputBtn}
					disabled={uploading}
					onChange={handleProfileImageChange}
				/>
			</Form.File>
		</>
	);
}
