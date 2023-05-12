import axios from "axios";
import { client } from "../../utils/client";
import { sanitizeFilename } from "../../utils/common";

export async function getSignedUrl(
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

export async function uploadToBucket(signedUrl, file, options) {
	const response = await axios.put(signedUrl, file, options);

	if (response.status == 200) {
		return { resourceUrl: signedUrl.split(/[?#]/)[0] };
	} else {
		return response.data;
	}
}

export async function uploadImage(file) {
	const { name, type, size } = file;
	const sanitizedFname = sanitizeFilename(name);
	let options = {
		headers: {
			"Content-Type": type,
		},
	};

	return getSignedUrl(sanitizedFname, "images", type, size).then((res) => {
		if (res.error) throw new Error("Error fetching signed URL");

		if (res.file_upload_session) {
			return uploadToBucket(res.file_upload_session, file, options);
		}
	});
}

export async function uploadFile(file, reqOptions = {}) {
	const { name, type, size } = file;
	const sanitizedFname = sanitizeFilename(name);
	let options = {
		...reqOptions,
		headers: {
			"Content-Type": type,
		},
	};

	return getSignedUrl(
		sanitizedFname,
		"files",
		type,
		size,
		reqOptions.cancelToken
	).then((res) => {
		if (res.error) throw new Error("Error fetching signed URL");

		if (res.file_upload_session) {
			return uploadToBucket(res.file_upload_session, file, options);
		}
	});
}
