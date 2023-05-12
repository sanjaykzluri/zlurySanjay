import React, { useRef, useState, useEffect, useCallback } from "react";

import PropTypes from "prop-types";

import axios from "axios";
import { client } from "../../utils/client";
import { addUpload, processUpload } from "../../services/api/transactions";
import { sanitizeFilename } from "../../utils/common";
import { TriggerIssue } from "utils/sentry";

async function getSignedUrl(
	fileName,
	fileType,
	fileFormat,
	fileSize,
	cancelToken = null
) {
	let options = {};
	if (cancelToken) {
		options = {
			cancelToken: cancelToken,
		};
	}

	const response = await client.post(
		`uploads-session`,
		{
			fileName: fileName,
			fileType: fileFormat,
			type: fileType,
			size: fileSize,
		},
		options
	);
	return response.data;
}

async function uploadToBucket(signedUrl, file, options) {
	const response = await axios.put(signedUrl, file, options);

	if (response.status == 200) {
		return { resourceUrl: signedUrl.split(/[?#]/)[0] };
	} else {
		return response.data;
	}
}

export async function upload(file, fileType = "files", reqOptions = {}) {
	const { name, type, size } = file;
	const fileName = sanitizeFilename(name);
	let options = {
		...reqOptions,
		headers: {
			"Content-Type": type,
		},
	};

	const signedUrl = await getSignedUrl(
		fileName,
		fileType,
		type,
		size,
		reqOptions.cancelToken
	).then((res) => {
		if (res.error) {
			TriggerIssue("Error fetching signed URL", res.error);
			throw new Error("Error fetching signed URL");
		}

		if (res.file_upload_session) {
			return uploadToBucket(res.file_upload_session, file, options);
		}
	});
	return { signedUrl, fileName };
}

const Upload = (props) => {
	const fileUploadFunction = async (file) => {
		try {
			const { signedUrl, fileName } = await upload(file, "files");
			const uploadObject = {
				type: "transactions",
				fileName: fileName,
				source_url: signedUrl?.resourceUrl,
			};
			const process_upload_result = await processUpload(uploadObject);

			if (process_upload_result.status !== "success")
				throw new Error(process_upload_result?.error);
			props.fileUploadStatus && props.fileUploadStatus(true);
		} catch (err) {
			console.error("Error uploading transaction CSV:", err);
			props.fileUploadStatus &&
				props.fileUploadStatus(false, {
					userFriendlyMessage:
						"There was an error uploading the file. Please try again!",
					errorResponse: err,
				});
		}
	};

	useEffect(() => {
		if (props.fileChanged) {
			const fileFunction = async () => {
				await fileUploadFunction(props.file);
			};
			fileFunction();
		}
	}, [props.file]);

	const onDragOver = (event) => {
		event.preventDefault();
		event.stopPropagation();
	};

	const onDrop = async (event) => {
		event.preventDefault();
		let file = event.dataTransfer.files[0];
		props.fileDropStateChange(file);
	};

	return (
		<div onDrop={onDrop} onDragOver={onDragOver}>
			{props.children}
		</div>
	);
};

export default Upload;
