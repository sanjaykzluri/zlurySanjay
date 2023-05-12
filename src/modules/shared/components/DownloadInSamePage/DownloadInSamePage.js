import _ from "underscore";
import { Loader } from "common/Loader/Loader";
import { SUPPORTED_FILE_FORMATS } from "constants/upload";
import React, { useEffect, useRef, useState } from "react";
import { ApiResponseNotification } from "../ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "../ApiResponseNotification/ApiResponseNotificationConstants";

export default function DownloadInSamePage({
	loader = <Loader width={24} height={24} />,
	api,
	children,
	tokenLink,
	s3LinkFromProps,
	doc,
}) {
	const hiddenAnchor = useRef();
	const hiddenDownloadButton = useRef();
	const [s3Link, setS3Link] = useState();
	const [loading, setLoading] = useState(false);
	const imgExtensions = ["png", "jpg", "jpeg"];

	const getS3Link = () => {
		setLoading(true);
		const token = tokenLink.split("=")[1];
		api(token)
			.then((res) => {
				if (res.link) {
					setS3Link(res.link);
				} else {
					setLoading(false);
				}
			})
			.catch((err) => {
				setLoading(false);
				ApiResponseNotification({
					errorObj: err,
					title: "Error in downloading the file",
					responseType: apiResponseTypes.ERROR,
					retry: getS3Link,
				});
			});
	};

	useEffect(() => {
		if (s3Link) {
			hiddenAnchor.current.click();
			setLoading(false);
			setS3Link();
		}
	}, [s3Link]);

	function s3LinkFromPropsIsImage() {
		const extension = SUPPORTED_FILE_FORMATS.includes(
			"." + _.last(doc?.type?.split("/"))
		)
			? _.last(doc?.type?.split("/"))
			: _.last(doc?.name?.split("."));
		return imgExtensions.includes(extension);
	}

	useEffect(() => {
		if (s3LinkFromPropsIsImage()) {
			const btn = document.getElementById("hiddenDownloadButton");
			btn.addEventListener("click", (event) => {
				event.preventDefault();
				downloadImage(s3LinkFromProps);
			});
		}
	}, []);

	function downloadImage(url) {
		fetch(url, {
			mode: "no-cors",
		})
			.then((response) => response.blob())
			.then((blob) => {
				let blobUrl = window.URL.createObjectURL(blob);
				let a = document.createElement("a");
				a.download = url.replace(/^.*[\\\/]/, "");
				a.href = blobUrl;
				document.body.appendChild(a);
				a.click();
				a.remove();
			});
	}

	return (
		<>
			<a
				href={s3LinkFromProps || s3Link}
				hidden={true}
				download
				ref={hiddenAnchor}
			/>
			<button
				hidden={true}
				id="hiddenDownloadButton"
				ref={hiddenDownloadButton}
			/>
			<div
				className="cursor-pointer"
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					s3LinkFromProps
						? s3LinkFromPropsIsImage()
							? hiddenDownloadButton.current.click()
							: hiddenAnchor.current.click()
						: getS3Link();
				}}
			>
				{loading ? loader : children}
			</div>
		</>
	);
}
