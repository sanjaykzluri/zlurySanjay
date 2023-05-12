import React from "react";
import ExclamationCircleSVG from "../../../assets/icons/exclamation-circle.svg";
import MergeSVG from "../../../assets/icons/merge.svg";
import { Button, Modal, Spinner } from "react-bootstrap";
import { NameBadge } from "../../../common/NameBadge";

function MergeConformation(props) {
	let { mergingStatus, isUser = false } = props;
	const iconContainer = {
		borderRadius: "50%",
		width: "30px",
		height: "30px",
		display: "flex",
		border: "1px solid #dee2e6",
	};

	const appPill = {
		padding: "8px 8px",
		width: "fit-content",
		backgroundColor: "#F5F5F5",
	};

	return (
		<>
			<Modal.Body className="merge-app-modal-body bg-white rounded-top">
				<div className="px-5 py-4">
					<div className="d-flex my-3">
						<div style={{ width: "45%" }}>
							<div
								className="d-flex rounded-pill align-items-center ml-auto h-100"
								style={appPill}
							>
								{props.source?.app_logo ||
								props.source?.user_profile ? (
									<div style={iconContainer} className="mr-2">
										<img
											src={
												props.source?.app_logo ||
												props.source?.image ||
												props.source?.user_profile
											}
											width="24"
											className="m-auto"
										/>
									</div>
								) : (
									<NameBadge
										name={
											props.source?.app_name ||
											props.source?.name ||
											props.source?.user_name
										}
										width={24}
										variant="round"
										className="mr-2"
									/>
								)}
								<span className="text-truncate mr-2">
									{props.source.app_name ||
										props.source.user_name}
								</span>
							</div>
						</div>
						<div
							className="align-self-center mx-4"
							style={{ flexShrink: 0 }}
						>
							<img src={MergeSVG} width="18" />
						</div>
						<div style={{ width: "45%" }}>
							<div
								className="d-flex rounded-pill align-items-center mr-auto h-100"
								style={appPill}
							>
								{props.targetSource?.app_logo ||
								props.targetSource?.user_profile ? (
									<div style={iconContainer} className="mr-2">
										<img
											src={
												props.targetSource?.app_logo ||
												props.targetSource?.user_profile
											}
											width="24"
											className="m-auto"
										/>
									</div>
								) : (
									<NameBadge
										name={
											props.targetSource?.app_name ||
											props.targetSource?.user_name
										}
										width={24}
										variant="round"
										className="mr-2"
									/>
								)}
								<span className="text-truncate mr-2">
									{props.targetSource?.app_name ||
										props.targetSource?.user_name}
								</span>
							</div>
						</div>
					</div>
					<div className="d-flex mt-4 flex-column align-items-center">
						<p className="font-18 bold-600">
							{mergingStatus
								? "Merging in progress.."
								: `You are about the merge data for the above ${
										isUser ? "users" : "apps"
								  }`}
						</p>
						{mergingStatus ? (
							<div className="m-2">
								<Spinner
									animation="border"
									role="status"
									size="md"
									variant="primary"
									className="ml-2"
									style={{ borderWidth: 1 }}
								>
									<span className="sr-only">Loading...</span>
								</Spinner>
							</div>
						) : (
							<p>Are you sure you want to continue?</p>
						)}
						{mergingStatus ? (
							<p
								style={{
									color: "#484848",
									fontSize: "13px",
									textAlign: "center",
								}}
							>
								This action usually takes few minutes to
								complete. You may close this modal and do other
								things. We’ll notify you once its done.{" "}
							</p>
						) : (
							<div className="alert-message d-flex align-items-start p-2">
								<img
									src={ExclamationCircleSVG}
									className="mr-2"
								/>
								<span>
									You cannot undo this action, once taken
								</span>
							</div>
						)}
					</div>
				</div>
			</Modal.Body>
			<hr></hr>
			{mergingStatus ? (
				<div className="d-flex justify-content-center ">
					<p
						className="mt-1 cursor-pointer"
						style={{ color: "#2266E2", fontSize: "13px" }}
						onClick={props.onHide}
					>
						Close
					</p>
				</div>
			) : (
				<Modal.Footer className="border-top">
					<Button variant="link" onClick={props.onHide}>
						Cancel
					</Button>
					<Button
						className="z-button-primary px-4"
						size="lg"
						onClick={props.handleMapping}
					>
						Continue
					</Button>
				</Modal.Footer>
			)}
		</>
	);
}

export default MergeConformation;
