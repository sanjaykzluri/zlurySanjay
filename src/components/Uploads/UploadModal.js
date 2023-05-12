import React, { Component, useEffect, useState } from "react";
import { fetchUploads } from "../../actions/transactions-action";
import { useDispatch, useSelector, connect } from "react-redux";
import {
	Row,
	Col,
	Form,
	Button,
	Spinner,
	Accordion,
	Card,
} from "react-bootstrap";
import "./Uploads.css";
import image from "./image.svg";
import { getUploads } from "../../services/api/transactions";
import ProgressBar from "./ProgressBar";
import ReactFileReader from "react-file-reader";
import download from "./download.svg";
import { addUpload, processUpload } from "../../services/api/transactions";
import close from "../../assets/close.svg";
import { uploadFile } from "../../services/upload/upload";
import { Modal } from "../../UIComponents/Modal/Modal";
import Upload from "../../UIComponents/Upload/Upload";
import wrongFileFormat from "./wrongFileFormat.svg";
import warning from "../Onboarding/warning.svg";
import { client } from "../../utils/client";
import caret from "../Integrations/caret.svg";
import errorFile from "../../assets/errorFile.svg";

function WithoutSumbit(props) {
	return (
		<>
			<div className="mt-2 ml-auto mr-auto">
				<img src={image} alt="" style={{ opacity: "0.2" }}></img>
			</div>
			<div id="dragor" className="mb-2 mt-2">
				Drag and drop a CSV or
			</div>
		</>
	);
}

function WithSubmit(props) {
	const dispatch = useDispatch();
	useEffect(() => {
		if (props.uploadProgress > 99) {
			dispatch(fetchUploads(props.page, 10, true, props?.cancelToken));
		}
	}, [props.uploadProgress]);
	const [expanded, setExpanded] = useState(false);

	const warningAccordionCSS = {
		backgroundColor: "#f3f3f357",
	};

	return (
		<div className="m-auto d-flex flex-column">
			<div className="mt-auto ml-auto mr-auto mb-2">
				<img
					src={props.error ? errorFile : image}
					alt=""
					style={{ width: "46px" }}
				></img>
			</div>
			<div id="dragor" className="m-2">
				{props.error ? (
					<div
						className="warningMessage text-center"
						style={{
							display: "block",
							textAlign: "center",
							fontSize: "12px",
						}}
					>
						<p className="m-auto">
							{typeof props.error.userFriendlyMessage ==
								"string" &&
								props.error.userFriendlyMessage != null &&
								props.error.userFriendlyMessage.length > 0 &&
								props.error.userFriendlyMessage}
						</p>
					</div>
				) : props.uploadProgress !== 100 ? (
					"Uploading your file..."
				) : (
					"Your file is uploaded."
				)}
			</div>
			{props.error?.errorResponse?.message > 0 &&
				typeof props.error?.errorResponse?.message == "string" && (
					<Accordion className="w-100 border-0 m-auto">
						<Card
							className="p-0 w-100 ml-auto mr-auto border-0 ml-2 mr-2"
							style={warningAccordionCSS}
						>
							<Accordion.Toggle
								as={Card.Header}
								onClick={() => setExpanded(!expanded)}
								className="p-1 d-flex border-0 bg-none"
								variant="link"
								eventKey="0"
							>
								<div className="grey1 text-uppercase mr-auto mt-auto mb-auto ml-1 font-11">
									More info
								</div>
								<div className="mr-1">
									<img
										className="m-1"
										style={
											expanded
												? {
														transform:
															"rotate(270deg)",
												  }
												: null
										}
										src={caret}
									></img>
								</div>
							</Accordion.Toggle>
							<Accordion.Collapse
								eventKey="0"
								className="border-top"
							>
								<Card.Body
									className="p-2 font-11 m-0 pl-0 pr-0 pb-3"
									style={warningAccordionCSS}
								>
									{props.error?.errorResponse?.message}
								</Card.Body>
							</Accordion.Collapse>
						</Card>
					</Accordion>
				)}
			{!props.error ? (
				<div style={{ marginTop: "20px" }}>
					<ProgressBar
						value={props.uploadProgress}
						error={props.error}
					/>
				</div>
			) : (
				<button
					className="btn btn-primary ml-auto mr-auto mt-3"
					style={{ width: "100px" }}
					onClick={() => props.retryFileUpload()}
				>
					Retry
				</button>
			)}
		</div>
	);
}

class UploadModalCont extends Component {
	constructor(props) {
		super(props);

		this.state = {
			fileuploaded: false,
			file: null,
			uploadProgress: 0,
			uploadInProgress: false,
			error: "",
			fileChanged: false,
			wrongFormat: false,
		};
		this.handleFileSelect = this.handleFileSelect.bind(this);
		this.fileUploadStatus = this.fileUploadStatus.bind(this);
		this.fileDropStateChange = this.fileDropStateChange.bind(this);
		this.retryFileUpload = this.retryFileUpload.bind(this);
		this.cancelToken = React.createRef();
	}

	handleClose(event) {
		this.setState({ fileuploaded: false, error: "", wrongFormat: false });
	}

	fileUploadStatus(status, err = null) {
		if (status) {
			this.setState({
				...this.state,
				...{
					fileuploaded: true,
					uploadInProgress: false,
					uploadProgress: 100,
					fileChanged: false,
				},
			});
		} else {
			this.setState({
				...this.state,
				...{
					fileuploaded: true,
					uploadInProgress: false,
					error: err,
					fileChanged: false,
				},
			});
			this.props.setUploadedFile && this.props.setUploadedFile({});
		}
	}

	fileDropStateChange(file) {
		if (file.name?.match(/\.csv\b/)) {
			this.setState({
				...this.state,
				...{
					file: file,
					uploadInProgress: true,
					fileChanged: true,
					wrongFormat: false,
				},
			});
			this.props.setUploadedFile && this.props.setUploadedFile(file);
		} else {
			this.setState({
				wrongFormat: true,
			});
		}
	}

	handleFileSelect = async (e) => {
		try {
			let file = e.target.files[0];
			this.setState({
				file: file,
				uploadInProgress: true,
				fileChanged: true,
			});
			this.props.setUploadedFile && this.props.setUploadedFile(file);
		} catch (err) {
			console.log(err);
		}
	};

	retryFileUpload() {
		const file = this.state.file;
		this.setState(
			{
				file: null,
				fileChanged: false,
				error: "",
			},
			() => {
				this.setState({
					file: file,
					fileChanged: true,
				});
			}
		);
	}

	componentDidUpdate(prevProps, props) {
		if (prevProps.show != this.props.show && this.props.show == false) {
			this.handleClose();
		}

		this.props.show &&
			(this.cancelToken.current = client.CancelToken.source());
	}

	render() {
		return (
			<Modal
				onClose={this.props.onHide}
				size="md"
				footer={false}
				show={this.props.show}
			>
				{/* <div> */}
				<div className="upload__modal__header">
					<div className="upload__modal__header__d1">
						Upload a transaction file
					</div>

					<div
						className="font-weight-normal mt-1"
						style={{ fontSize: 16 }}
					>
						Upload a CSV
					</div>
				</div>
				<div
					className="font-weight-normal mt-1"
					style={{ fontSize: 16 }}
				></div>
				<Upload
					fileUploadStatus={this.fileUploadStatus}
					file={this.state.file}
					fileChanged={this.state.fileChanged}
					fileDropStateChange={this.fileDropStateChange}
				>
					<div
						className={
							this.state.fileuploaded
								? "container__uploads__uploaded"
								: "container__uploads"
						}
						ref={this?.cancelToken}
					>
						{this.state.wrongFormat ? (
							<div className="d-flex flex-column mt-auto mb-1">
								<img
									src={wrongFileFormat}
									className="mt-2 ml-auto mr-auto"
									alt="wrong file format"
								></img>
								<div className="warningMessage text-center p-1 mb-1 mt-2">
									This file type is not supported. Please
									upload a CSV
								</div>
							</div>
						) : this.state.fileuploaded ? (
							<WithSubmit
								error={this.state.error}
								uploadProgress={this.state.uploadProgress}
								page={this.props.page}
								retryFileUpload={() => this.retryFileUpload()}
								cancelToken={this?.cancelToken}
							></WithSubmit>
						) : (
							<div className="d-flex flex-column mt-auto mb-1">
								<WithoutSumbit></WithoutSumbit>
							</div>
						)}
						{this.state.fileuploaded ? null : (
							<>
								{this.state.uploadInProgress ? (
									<Spinner
										animation="border"
										variant="primary"
										className="mt-3"
									/>
								) : (
									<label
										className="custom-file-upload mt-0 mb-2"
										style={{ opacity: 1 }}
									>
										<input
											type="file"
											accept=".csv"
											onChange={this.handleFileSelect}
											// value={this.state.file}
										/>
										Select File
									</label>
								)}
								<div className="refer__sample__file mt-auto mb-auto">
									<div className="refer__sample__file__d1 mr-2">
										Refer sample file:
									</div>
									<a
										href="https://zluri-assets-new.s3-us-west-1.amazonaws.com/files/sample_transaction_upload_format.csv"
										className="refer__sample__file__d2 mr-2"
										download
									>
										<img
											src={download}
											style={{ marginRight: "6px" }}
										/>
										Minimalist CSV
									</a>
								</div>
							</>
						)}
					</div>

					{this.state.fileuploaded ? (
						<div className="uploads__modal__filetext text-center">
							This file will get processed in the background while
							you do other things. We’ll notify you once its done
						</div>
					) : null}
					<div
						className="uploads__modal__bottom"
						style={{ marginTop: 19, marginBottom: 23 }}
					></div>
				</Upload>
				{/* </div> */}
			</Modal>
		);
	}
}

export const UploadModal = UploadModalCont;
