import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { uploadFile } from "../../../services/upload/upload";
import { OverlayTrigger, ProgressBar, Tooltip } from "react-bootstrap";

import TimesSVG from "../../../assets/icons/times.svg";
import PdfSVG from "../../../assets/icons/pdf.svg";
import CheckCircleSVG from "../../../assets/icons/check-circle.svg";
import { client } from "../../../utils/client";

export function FileUpload(props) {
	const [isUploadComplete, setIsUploadComplete] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [resourceUrl, setResourceUrl] = useState("");

	const cancelTokenSource = useRef();

	useEffect(() => {
		let source = client.CancelToken.source();
		let options = {
			cancelToken: source.token,
			onUploadProgress: progressHandler,
		}

		cancelTokenSource.current = source;

		uploadFile(props.file, options).then(res => {
			setIsUploadComplete(true);
			setResourceUrl(res.resourceUrl);
			props.onComplete(props.file?.name, res.resourceUrl);
		})
			.catch(err => {
				console.log("Error uploading files:", err);
			})
	}, [])

	const progressHandler = (progressEvent) => {
		setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
		if (progressEvent.loaded === progressEvent.total && props.closeOnComplete) {
			props.onCancel(props.file, resourceUrl);
		}
	}

	const handleCancelClick = () => {
		cancelTokenSource.current.cancel();
		props.onCancel(props.file, resourceUrl);
	}

	return (
		<>
			<div className="flex-center mb-2 border rounded w-100" style={{ padding: "12px 18px" }}>
				<img src={PdfSVG} width="32" className="mr-3" />
				<div className="w-75 ml-0 mr-auto d-inline-flex">
					<div className="d-flex align-items-center w-100">
						{isUploadComplete && (
							<img src={CheckCircleSVG} width="16" className="mr-1" />
						)}
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip>
									{props.file.name}
								</Tooltip>
							}
						>
							<span className="bold-600 text-truncate">
								{props.file.name}
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
				<a onClick={handleCancelClick} className="cursor-pointer ml-4">
					<img src={TimesSVG} width="12" />
				</a>
			</div>
		</>
	)
}

FileUpload.propTypes = {
	file: PropTypes.object.isRequired,
	onCancel: PropTypes.func.isRequired,
	onComplete: PropTypes.func.isRequired,
}