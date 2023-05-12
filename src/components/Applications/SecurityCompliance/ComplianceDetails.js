import React, { useEffect, useState } from "react";
import close from "../../../assets/close.svg";
import { Loader } from "../../../common/Loader/Loader";
import {
	Dropdown,
	Form,
	OverlayTrigger,
	Spinner,
	Tooltip as BootstrapTooltip,
	Tooltip,
} from "react-bootstrap";

import {
	getApplicationComplianceDetails,
	addComplianceDocument,
	updateComplianceStatus,
} from "../../../services/api/applications";
import dropdownarrow from "../Overview/dropdownarrow.svg";
import add from "../Contracts/add.svg";
import ShowMoreText from "react-show-more-text";
import OverviewField from "./OverviewField";
import moment from "moment";
import ArrowCorner from "../../GettingStarted/arrow-corner-right.svg";
import { isValidFile, SUPPORTED_FILE_FORMATS } from "../../../constants/upload";
import { FileUpload } from "../Contracts/FileUpload";
import ContentLoader from "react-content-loader";
import approved from "../../../assets/green_tick.svg";
import restricted from "../../../assets/applications/restricted.svg";
import warning from "../../Onboarding/warning.svg";
import _ from "underscore";
import { Button } from "../../../UIComponents/Button/Button";
import { unescape, urlifyImage, withHttp } from "../../../utils/common";
import filesize from "filesize";
import { useDispatch } from "react-redux";
import { fetchApplicationCompliance } from "../../../actions/applications-action";
import needsreview from "../../../assets/applications/needsreview.svg";
import edit from "../../../assets/icons/edit.svg";
import { NameBadge } from "../../../common/NameBadge";
import DownloadInSamePage from "modules/shared/components/DownloadInSamePage/DownloadInSamePage";
import DeleteDocumentOfCompliance from "modules/applications/components/SecurityCompliance/DeleteDocumentOfCompliance";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";
import { UTCDateFormatter } from "utils/DateUtility";

export const complianceStatusObject = {
	approved: {
		image: approved,
		tooltip: "Approved",
		overviewTooltip: "This compliance is approved by the IT Admin",
		apiValue: "approved",
	},
	rejected: {
		image: restricted,
		tooltip: "Rejected",
		overviewTooltip: "This Compliance is rejected by the IT Admin",
		apiValue: "rejected",
	},
	available: {
		image: approved,
		tooltip: "Available",
		apiValue: "available",
	},
	review_now: {
		image: needsreview,
		tooltip: "Review Now",
	},
	"review now": {
		image: needsreview,
		tooltip: "Review Now",
	},
};
export default function ComplianceDetailsSection(props) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [data, setData] = useState();
	const [status, setStatus] = useState();
	const dispatch = useDispatch();
	const [invalidFileUploaded, setInavlidFileUploaded] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [uploadedFile, setUploadedFile] = useState();
	const [statusUpdateInProgress, setStatusUpdateInProgress] = useState(false);

	const fetchData = () => {
		getApplicationComplianceDetails(
			props.application.app_id,
			props.compliance?.compliance_id
		)
			.then((compliance) => {
				setData(compliance);
				if (compliance.compliance_status) {
					setStatus(
						complianceStatusObject[compliance?.compliance_status]
					);
				} else {
					setStatus(complianceStatusObject.review_now);
				}
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
				setError(true);
			});
	};
	useEffect(() => {
		fetchData();
	}, [props.compliance]);

	const handleFileSelection = (e) => {
		let fileArray = [];
		const fileObj = e.target.files;
		Object.keys(fileObj).forEach((fileObjKey) => {
			if (isValidFile(fileObj[fileObjKey])) {
				fileArray.push(fileObj[fileObjKey]);
			} else {
				setInavlidFileUploaded(true);
				setTimeout(() => {
					setInavlidFileUploaded(false);
				}, 5000);
			}
		});
		setSelectedFiles([...selectedFiles, ...fileArray]);
	};

	const handleFileUploadCancel = (file, resourceUrl) => {
		let filterredSelectedFiles = selectedFiles.filter(
			(selectedFile) => selectedFile.name !== file.name
		);

		setSelectedFiles(filterredSelectedFiles);
		setUploadedFile("");
	};

	const handleStatusChange = (status) => {
		setStatusUpdateInProgress(true);
		updateComplianceStatus(
			props.application.app_id,
			props.compliance.compliance_id,
			{ status: status?.apiValue }
		)
			.then(() => {
				setStatus(status);
				dispatch(fetchApplicationCompliance(props.application.app_id));
				setStatusUpdateInProgress(false);
			})
			.catch(() => {
				setStatusUpdateInProgress(false);
			});
	};
	const handleComplete = (name, source_url, file) => {
		const { size, type } = file;
		const body = {
			documents: [
				{
					name,
					source_url,
					size,
					type,
				},
			],
		};
		addComplianceDocument(
			props.application.app_id,
			props.compliance?.compliance_id,
			body
		).then(() => {
			setSelectedFiles([]);
			fetchData();
		});
	};

	const auth_status_dropdown = React.forwardRef(
		({ children, onClick }, ref) => (
			<a
				className="cursor-pointer overview__dropdownbutton text-decoration-none pl-1"
				ref={ref}
				onClick={(e) => {
					e.preventDefault();
					onClick(e);
				}}
			>
				{children}
			</a>
		)
	);

	const complianceStatusPill = (
		<div className="overview__dropdownbutton__d2 grey bold-normal text-capitalize">
			{statusUpdateInProgress ? (
				<Spinner className="compliance-spinner" animation="border" />
			) : (
				<>
					{status?.tooltip}
					<img className="ml-1" src={dropdownarrow} />
				</>
			)}
		</div>
	);

	const onDeleteDocument = (index) => {
		const fileArray = data?.documents;
		if (index > -1) {
			fileArray.splice(index, 1);
		}
		setData({
			...data,
			documents: fileArray,
		});
	};

	return (
		<>
			<div className="modal-backdrop show"></div>
			<div className="addContractModal__TOP" style={{ height: "100%" }}>
				{loading ? (
					_.times(5, (number) => (
						<div className="eventCard mb-3 ml-3 mr-3" key={number}>
							<ContentLoader height="105" width="100%">
								<rect
									width="160"
									height="10"
									rx="2"
									fill="#EBEBEB"
									y="15"
									x="20"
								/>
								<rect
									width="50%"
									height="17"
									rx="2"
									x={100}
									fill="#EBEBEB"
									y="35"
									x="20"
								/>
								<rect
									width="80%"
									height="12"
									rx="2"
									x={100}
									fill="#EBEBEB"
									y="63"
									x="20"
								/>
								<rect
									width="40%"
									height="12"
									rx="2"
									x={100}
									fill="#EBEBEB"
									y="85"
									x="20"
								/>
							</ContentLoader>
						</div>
					))
				) : error ? (
					<div
						className="d-flex flex-column p-3"
						style={{ height: "50vh" }}
					>
						<img
							src={warning}
							className="ml-auto mr-auto mt-auto"
							style={{ width: "45.42px" }}
						/>
						<div className="grey-1 font-18 text-center mt-2">
							An error occured. Please try again
						</div>
						<Button
							className="btn btn-outline-primary ml-auto mr-auto mt-2 mb-auto"
							onClick={() => window.reload()}
						>
							<div className="font-13">Retry</div>
						</Button>
					</div>
				) : (
					<>
						<div
							className="flex-center"
							style={{
								marginTop: "24px",
								display: "flex",
								justifyContent: "space-between",
								padding: "0 20px",
								width: "fit-content",
							}}
						>
							<div
								className="row"
								style={{ marginLeft: "15px", width: "400px" }}
							>
								<div
									style={{
										paddingRight: "5px",
										paddingTop: "2.5px",
										display: "flex",
									}}
								>
									<div className="d-flex align-items-center">
										{props.application?.app_logo ? (
											<img
												src={
													props.application?.app_logo
												}
												width={28}
												height={28}
											/>
										) : (
											<NameBadge
												width={28}
												height={28}
												name={
													props.application?.app_name
												}
											/>
										)}
									</div>
									<div className="ml-2 font-18 mr-2 d-flex align-items-center">
										{props.application?.app_name} Compliance
									</div>
									<div className="mr-2 d-flex align-items-center">
										<Button
											type="link"
											onClick={props.onEdit}
										>
											<div className="d-flex align-items-center">
												<img
													src={edit}
													height={14}
													width={14}
												/>
												<span
													style={{
														marginLeft: "3px",
													}}
												>
													Edit
												</span>
											</div>
										</Button>
									</div>
								</div>
							</div>
							<div>
								<img
									alt="Close"
									onClick={props.onHide}
									src={close}
									style={{
										marginLeft: "75px",
										cursor: "pointer",
									}}
								/>
							</div>
						</div>
						<hr
							style={{
								marginBottom: "0px",
								marginLeft: "6px",
								marginRight: "6px",
							}}
						/>
						<div className="compliance__title">
							<div className="compliance__title__header">
								<div className="d-flex">
									<div
										className="background-contain background-no-repeat background-position-center"
										style={{
											backgroundImage: `url(${urlifyImage(
												unescape(data?.compliance_image)
											)})`,
											height: 40,
											width: 40,
											marginTop: "3px",
										}}
									></div>
									<div className="ml-2 font-18 mr-2 d-flex align-items-center">
										{data?.compliance_name}
									</div>
								</div>
								<div>
									<Dropdown>
										<Dropdown.Toggle
											as={auth_status_dropdown}
										>
											<img
												src={status?.image}
												width={15}
												height={15}
											/>
											{status?.overviewTooltip ? (
												<OverlayTrigger
													placement="top"
													overlay={
														<BootstrapTooltip>
															{
																status?.overviewTooltip
															}
														</BootstrapTooltip>
													}
												>
													{complianceStatusPill}
												</OverlayTrigger>
											) : (
												complianceStatusPill
											)}
										</Dropdown.Toggle>
										<Dropdown.Menu>
											<Dropdown.Item
												onClick={() =>
													handleStatusChange(
														complianceStatusObject.approved
													)
												}
											>
												<div className="d-flex flex-row align-items-center">
													<img
														src={approved}
														width={15.33}
													/>
													<div className="overview__dropdownbutton__d2">
														Approved
													</div>
												</div>
											</Dropdown.Item>
											<Dropdown.Item
												onClick={() =>
													handleStatusChange(
														complianceStatusObject.rejected
													)
												}
											>
												<div className="d-flex flex-row align-items-center">
													<img
														src={restricted}
														width={15.33}
													/>
													<div className="overview__dropdownbutton__d2">
														Rejected
													</div>
												</div>
											</Dropdown.Item>
										</Dropdown.Menu>
									</Dropdown>
								</div>
							</div>
							<div>
								<ShowMoreText
									lines={2}
									more="view more"
									less="view less"
									className="mt-2 font-13"
									expanded={false}
								>
									<span>
										{" "}
										{data?.compliance_description}{" "}
									</span>
								</ShowMoreText>
							</div>
						</div>
						<div
							style={{
								padding: 20,
								overflowY: "auto",
								height: "90vh",
							}}
						>
							<OverviewField
								className="mt-2"
								label="EFFECTIVE DATE"
								keyClassName="w-50"
								value={UTCDateFormatter(
									data?.compliance_start_date
								)}
								dataUnavailable={!data?.compliance_start_date}
							/>
							<OverviewField
								className="mt-2"
								label="EXPIRATION DATE"
								keyClassName="w-50"
								value={UTCDateFormatter(
									data?.compliance_end_date
								)}
								dataUnavailable={!data?.compliance_end_date}
							/>
							<OverviewField
								className="mt-4"
								label="EXTERNAL LINK"
								keyClassName="w-50"
								value={
									<div>
										{data?.proofs?.map((url) => (
											<div
												key={url}
												className="getting__started-resource-link mb-3"
											>
												<a
													target="_blank"
													rel="noreferrer"
													href={withHttp(url)}
												>
													{url}{" "}
													<img src={ArrowCorner} />
												</a>
											</div>
										))}
									</div>
								}
							/>
							<div className="contractins__bottomdivright__div1 border-bottom mt-4">
								<div className="mr-auto">DOCUMENTS</div>
								<Form.File id="formcheck-api-regular">
									<Form.File.Label className="btn d-flex">
										<img src={add} alt=""></img>
										<span className="aaaaaa">
											Add Documents
										</span>
									</Form.File.Label>
									<Form.File.Input
										multiple
										value={uploadedFile}
										onChange={(e) => handleFileSelection(e)}
										accept={SUPPORTED_FILE_FORMATS.toString()}
									/>
								</Form.File>
							</div>
							{invalidFileUploaded && (
								<div className="d-flex flex-row justify-content-center red">
									Certain file types are not supported.
								</div>
							)}
							{Array.isArray(selectedFiles) &&
								selectedFiles?.length > 0 && (
									<div className="mb-0 w-100 mt-2">
										{selectedFiles.map((file) => (
											<FileUpload
												file={file}
												onCancel={
													handleFileUploadCancel
												}
												onComplete={(name, url) =>
													handleComplete(
														name,
														url,
														file
													)
												}
											/>
										))}
									</div>
								)}
							{!!data?.documents?.length && (
								<div className="w-100 pb-5">
									<table className="appsdata">
										<thead>
											<tr>
												<th
													style={{
														width: "240px",
													}}
												>
													Document Name
												</th>
												<th></th>
												<th></th>
												<th></th>
											</tr>
										</thead>
										<tbody>
											{data?.documents?.map(
												(item, index) => {
													return (
														<tr key={index}>
															<td>
																<LongTextTooltip
																	text={
																		item.name
																	}
																	maxWidth={
																		230
																	}
																	style={{
																		width: "fit-content",
																	}}
																/>
															</td>
															<td>
																<div className="grey-1">
																	{filesize(
																		item.size ||
																			0
																	)}
																</div>
															</td>
															<td>
																<DownloadInSamePage
																	s3LinkFromProps={
																		item.source_url
																	}
																	doc={item}
																>
																	<div className="z-text-primary cursor-pointer">
																		Download
																	</div>
																</DownloadInSamePage>
															</td>
															<td>
																<DeleteDocumentOfCompliance
																	documentId={
																		item._id
																	}
																	appId={
																		props
																			?.application
																			?.app_id
																	}
																	complianceId={
																		props
																			?.compliance
																			?.compliance_id
																	}
																	onDelete={() =>
																		onDeleteDocument(
																			index
																		)
																	}
																/>
															</td>
														</tr>
													);
												}
											)}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</>
				)}
			</div>
		</>
	);
}
