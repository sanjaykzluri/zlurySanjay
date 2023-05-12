import React from "react";
import "./PreviewDocument.css";
import documentIcon from "../../assets/documentIcon.svg";
import close from "../../assets/close.svg";
import downloadDocument from "./DownloadDocument.svg";
import moment from "moment";
import { unescape } from "../../utils/common";
import { getFileIcon } from "../../constants/upload";
import DownloadInSamePage from "modules/shared/components/DownloadInSamePage/DownloadInSamePage";

export default function PreviewDocument({ document, closePreviewDoc }) {
	return (
		<>
			<div className="modal-backdrop show"></div>
			<div className="modal d-block"></div>
			<div className="preview-document-side-modal">
				<div className="d-flex justify-content-between mb-2">
					<div className="d-flex">
						<img
							src={getFileIcon(document)}
							height={40}
							width={40}
						/>
						<div className="d-flex flex-column ml-2">
							<div
								className="bold-600 font-18"
								title={document?.name}
							>
								{document?.name?.length > 45
									? document?.name?.substring(0, 45) + "..."
									: document?.name}
							</div>
							<div className="grey font-11">
								Added on{" "}
								{moment(document?.date).format("DD MMM 'YY")}
							</div>
						</div>
					</div>
					<div className="d-flex align-items-center">
						<DownloadInSamePage
							s3LinkFromProps={document?.source_url}
							doc={document}
						>
							<img
								src={downloadDocument}
								className="cursor-pointer mr-4"
								height={25}
								width={25}
							/>
						</DownloadInSamePage>
						<img
							src={close}
							className="cursor-pointer"
							onClick={closePreviewDoc}
							height={15}
							width={15}
						/>
					</div>
				</div>
				<hr className="m-0 w-100" />
				<div className="mt-3">
					<embed
						src={unescape(document?.source_url)}
						height={700}
						width={"100%"}
					/>
				</div>
			</div>
		</>
	);
}
