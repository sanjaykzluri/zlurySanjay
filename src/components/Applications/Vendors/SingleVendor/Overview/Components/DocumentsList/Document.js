import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Dropdown, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import { Button } from "UIComponents/Button/Button";
import Ellipsis from "../../../../../../../assets/icons/ellipsis-v.svg";
import documentIcon from "../../../../../../../assets/documentIcon.svg";
import moment from "moment";
import { deleteVendorDocument } from "../../../../../../../services/api/applications";
import { unescape } from "../../../../../../../utils/common";
import PreviewDocument from "../../../../../../../UIComponents/PreviewDocument/PreviewDocument";
import csv from "../../../../../../../components/Onboarding/csv.svg";
import pdf from "../../../../../../../assets/licenses/pdf.svg";
import _ from "underscore";
import useOutsideClick from "../../../../../../../common/OutsideClick/OutsideClick";
import cancel from "assets/icons/cancel.svg";
import acceptbutton from "assets/icons/acceptbutton.svg";
import { SUPPORTED_FILE_FORMATS } from "constants/upload";
import DownloadInSamePage from "modules/shared/components/DownloadInSamePage/DownloadInSamePage";

export function DocumentItem({
	document,
	className,
	fetchVendorOverview,
	isModal,
	isContractDocumentPage,
	deleteDocument,
	logoSize = 40,
	isEditable = false,
	onDocNameChange,
}) {
	const date = moment(document.date).format("DD MMM YY");

	const ref = useRef();
	const editNameRef = useRef();
	const [showDropdown, setShowDropdown] = useState(false);
	const [showPreviewDocModal, setShowPreviewDocModal] = useState(false);
	const [docName, setDocName] = useState(document.name);
	const [editFileName, setEditFileName] = useState(false);
	const [fileNameEditing, setFileNameEditing] = useState(false);

	const handleDeleteDocument = () => {
		const vendorId = window.location.pathname.split("/")[3];
		deleteVendorDocument(vendorId, document._id).then(() => {
			fetchVendorOverview();
		});
	};

	const extension = SUPPORTED_FILE_FORMATS.includes(
		"." + _.last(document?.type?.split("/"))
	)
		? _.last(document?.type?.split("/"))
		: _.last(document?.name?.split("."));

	useOutsideClick(ref, () => {
		if (showDropdown) setShowDropdown(false);
	});

	useOutsideClick(editNameRef, () => {
		if (editFileName) {
			setEditFileName(false);
			setDocName(document.name);
		}
	});

	return (
		<>
			<div className={`vendor__document__tile mr-2 ${className}`}>
				<div className="vendor__document__tile__left-section">
					<div className="note-content">
						<img
							src={
								extension === "csv"
									? csv
									: extension === "pdf"
									? pdf
									: documentIcon
							}
							height={logoSize}
							width={logoSize}
						/>
					</div>
					<div className="vendor__document__details">
						<div className="vendor__document__name">
							{editFileName ? (
								<>
									<div
										className="z__if__edit d-flex  align-items-center"
										ref={editNameRef}
									>
										<input
											value={docName}
											placeholder={"Enter the file name"}
											type="text"
											className={`w-100 pl-2 pr-1 `}
											onChange={(e) => {
												setDocName(e.target.value);
											}}
										/>
										<div
											className={`z__if__edit_actions  d-flex ${"flex-row align-items-center h-100"}`}
										>
											{fileNameEditing ? (
												<Spinner
													animation="border"
													variant="light"
													bsPrefix="my-custom-spinner"
													className="my-custom-spinner mr-2"
												/>
											) : (
												<>
													<Button
														className="p-0 pl-1 pr-1"
														onClick={() => {
															setEditFileName(
																false
															);
															setDocName(
																document.name
															);
														}}
													>
														<img
															width={8}
															src={cancel}
														/>
													</Button>
													<Button
														className="p-0 pl-1 pr-1"
														onClick={() => {
															setFileNameEditing(
																true
															);
															onDocNameChange &&
																onDocNameChange(
																	docName
																);
														}}
													>
														<img
															width={14}
															src={acceptbutton}
														/>
													</Button>
												</>
											)}
										</div>
									</div>
								</>
							) : (
								<div className="d-flex">
									<OverlayTrigger
										overlay={
											<Tooltip>{document.name}</Tooltip>
										}
									>
										<div className="truncate_15vw mr-2">
											{document.name}
										</div>
									</OverlayTrigger>
									{document.doc_type && (
										<div className="filter-capsule d-flex align-items-center pl-2 pr-2">
											<span
												className="filter-capsule-text grey-1 text-capitalize font-10"
												style={{
													minWidth: "130px",
													textAlign: "center",
												}}
											>
												{`${document.doc_type} document`}
											</span>
										</div>
									)}
								</div>
							)}
						</div>
						<div className="vendor__document__desc">
							Added on {date} by {document?.added_by?.name}
						</div>
					</div>
				</div>
				{isModal && (
					<DownloadInSamePage
						s3LinkFromProps={document.source_url}
						doc={document}
					>
						<div className="primary-color cursor-pointer mr-4">
							Open
						</div>
					</DownloadInSamePage>
				)}
				{isContractDocumentPage && (
					<div
						className="primary-color cursor-pointer mr-3"
						onClick={() => setShowPreviewDocModal(true)}
					>
						Open
					</div>
				)}
				<div
					onClick={() => setShowDropdown(!showDropdown)}
					className="cursor-pointer"
				>
					<img src={Ellipsis} width="12" />
				</div>
				<div className="document-item-dropdown-container">
					<div
						className="riskcriticalsecondtab__d1__d2__b1__options mt-1"
						hidden={!showDropdown}
						ref={(el) => {
							if (el) {
								ref.current = el;
							}
						}}
						style={{
							transform: "scale(1.1)",
							top: "50px",
							right: "10px",
						}}
					>
						{isEditable && (
							<div
								className="riskcriticalsecondtab__d1__d2__b1__options__d1 cursor-pointer"
								onClick={() => {
									setEditFileName(true);
									setShowDropdown(false);
								}}
							>
								Edit Filename
							</div>
						)}
						<div
							className="riskcriticalsecondtab__d1__d2__b1__options__d1 cursor-pointer"
							onClick={() => {
								deleteDocument
									? deleteDocument()
									: handleDeleteDocument();
								setShowDropdown(false);
							}}
						>
							Delete Document
						</div>
						{!isModal && (
							<DownloadInSamePage
								s3LinkFromProps={document.source_url}
								doc={document}
							>
								<div
									className="riskcriticalsecondtab__d1__d2__b1__options__d1 cursor-pointer"
									onClick={() => setShowDropdown(false)}
								>
									Download Document
								</div>
							</DownloadInSamePage>
						)}
					</div>
				</div>
			</div>
			{showPreviewDocModal && (
				<PreviewDocument
					document={document}
					closePreviewDoc={() => setShowPreviewDocModal(false)}
				/>
			)}
		</>
	);
}

DocumentItem.propTypes = {
	document: PropTypes.object.isRequired,
};

DocumentItem.defaultProps = {
	className: "",
};
