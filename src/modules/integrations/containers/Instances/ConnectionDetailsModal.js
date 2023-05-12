import React, { useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import close from "assets/close.svg";
import { Button } from "UIComponents/Button/Button";
import { editAccountDetails } from "modules/integrations/service/api";
import warning from "assets/warning.svg";

const ConnectionDetailsModal = ({ instance, onHide, handleRefresh }) => {
	const [instanceDescription, setInstanceDescription] = useState(
		instance?.description
	);
	const [instanceName, setInstanceName] = useState(instance?.name);
	const [failedToSaveAccountMsg, setFailedToSaveAccountMsg] = useState();
	const [isAccountSaving, setIsAccountSaving] = useState(false);

	const saveAccountInfo = (account) => {
		setIsAccountSaving(true);
		try {
			editAccountDetails(
				instance?.orgIntegrationID, // need to send right id here
				account
			).then((res) => {
				if (res?.success) {
					setFailedToSaveAccountMsg();
					handleRefresh();
					onHide && onHide();
				} else {
					setFailedToSaveAccountMsg(
						res?.error?.response?.data?.error || "some issue"
					);
				}
				setIsAccountSaving(false);
			});
		} catch (error) {
			setIsAccountSaving(false);
			setFailedToSaveAccountMsg("some issue");
			TriggerIssue("Error when editing orgIntegration details", error);
		}
	};

	return (
		<>
			<Modal
				show={true}
				onHide={() => onHide}
				style={{ maxWidth: "50%!important" }}
				centered
				className="custom-map-modal"
			>
				<div
					style={{ backgroundColor: "rgba(235, 235, 235, 0.5)" }}
					className="d-flex flex-row align-items-center py-4"
				>
					<div className="m-auto">
						<span className="contracts__heading d-flex flex-row">
							Edit Instance Details
						</span>
					</div>
					<img
						className="pr-4 cursor-pointer"
						alt="Close"
						onClick={onHide}
						src={close}
					/>
				</div>
				<Modal.Body className="bg-white rounded-top">
					<div className="px-5 py-4">
						<div className="p-2">
							<div>
								<label className="font-12 grey ">
									Connection Name
								</label>
							</div>
							<input
								className="p-2 mb-2 w-100"
								name="name"
								type="text"
								placeholder="Connection Name"
								value={instanceName}
								// value={manualTaskForm.description.value}
								onChange={(e) =>
									setInstanceName(e.target.value)
								}
							/>
						</div>
						<div className="p-2">
							<label className="font-12 grey ">Description</label>
							<input
								className="p-2 mb-2 w-100"
								name="description"
								type="text"
								placeholder="Description (Optional)"
								value={instanceDescription}
								onChange={(e) =>
									setInstanceDescription(e.target.value)
								}
							/>
						</div>
						{failedToSaveAccountMsg && (
							<div className="d-flex warningMessage w-100 p-2 mb-3">
								<img src={warning} />
								<div className="font-12 ml-1">
									We could not save your info due to{" "}
									{failedToSaveAccountMsg}. Please try again.
								</div>
							</div>
						)}
					</div>
				</Modal.Body>
				<hr></hr>
				<Modal.Footer className="border-top">
					<Button type="link" onClick={onHide}>
						Cancel
					</Button>
					{failedToSaveAccountMsg ? (
						<Button
							type="submit"
							className="d-flex btn btn-outline-danger"
							style={{ width: "90px" }}
							disabled={!instanceName}
							onClick={() =>
								saveAccountInfo({
									accountName: instanceName || instance?.name,
									accountDescription: instanceDescription,
								})
							}
						>
							Retry
						</Button>
					) : (
						<Button
							className="z-button-primary px-4"
							onClick={() =>
								saveAccountInfo({
									accountName: instanceName || instance?.name,
									accountDescription: instanceDescription,
								})
							}
							disabled={!instanceName && !instanceDescription}
						>
							{isAccountSaving && (
								<Spinner
									animation="border"
									role="status"
									variant="light"
									size="sm"
									className="mr-1"
									style={{
										borderWidth: 2,
										width: "13px",
										height: "13px",
									}}
								>
									<span className="sr-only"></span>
								</Spinner>
							)}
							Save Changes
						</Button>
					)}
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default ConnectionDetailsModal;
