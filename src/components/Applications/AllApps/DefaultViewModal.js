import React from "react";
import { Modal, Spinner } from "react-bootstrap";
import { Button } from "UIComponents/Button/Button";
import warning from "assets/warning.svg";
import dangerIcon from "assets/icons/delete-warning.svg";

const DefaultViewModal = ({
	selectedView,
	onHide,
	handleDefaultViewAction,
	isLoading,
	failedToSaveDefault,
}) => {
	return (
		<>
			<Modal
				show={true}
				onHide={onHide}
				style={{ maxWidth: "50%!important" }}
				centered
				className=""
			>
				<Modal.Body className="bg-white rounded-top">
					<div className="px-5 py-4">
						<div align="center">
							<img src={dangerIcon} />
							<div className="font-14 mt-3">
								Setting this view as default for all
								applications will update default views for
								particular app. Do you really want to continue?
							</div>
						</div>
						{failedToSaveDefault && (
							<div className="d-flex warningMessage w-100 p-2 mb-3">
								<img src={warning} />
								<div className="font-12 ml-1">
									We could not set this as default. Please try
									again.
								</div>
							</div>
						)}
					</div>
				</Modal.Body>
				<Modal.Footer
					style={{ justifyContent: "center" }}
					className="border-top"
				>
					<Button type="link" onClick={onHide}>
						Cancel
					</Button>
					{failedToSaveDefault ? (
						<Button
							type="submit"
							className="d-flex btn btn-outline-danger"
							style={{ width: "60px" }}
							onClick={() =>
								handleDefaultViewAction(e, selectedView)
							}
						>
							Retry
						</Button>
					) : (
						<Button
							className="z-button-primary px-4"
							onClick={(e) =>
								handleDefaultViewAction(e, selectedView)
							}
						>
							{isLoading && (
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
							Continue
						</Button>
					)}
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default DefaultViewModal;
