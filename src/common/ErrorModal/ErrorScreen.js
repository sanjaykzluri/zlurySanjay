import React, { Fragment } from "react";
import { Button } from "../../UIComponents/Button/Button";
import { Modal } from "../../UIComponents/Modal/Modal";

import warning from "../../components/Onboarding/warning.svg";
import { Spinner } from "react-bootstrap";
import CheckCircleSVG from "../../assets/icons/check-circle.svg";

function ErrorScreen({
	isOpen,
	isSuccess,
	closeModal,
	successMsgHeading,
	warningMsgDescription,
	warningMsgHeading,
	retryFunction,
	loading,
	errors,
	entity,
}) {
	return (
		<Fragment>
			<div
				className="modal-backdrop show"
				style={{ zIndex: "1050" }}
			></div>
			<Modal
				show={isOpen}
				onClose={() => {
					closeModal && closeModal();
				}}
				size="md"
				footer={false}
			>
				<div
					className="d-flex flex-column p-4"
					style={{ height: "300px" }}
				>
					<img
						src={!isSuccess ? warning : CheckCircleSVG}
						style={{ width: "45px" }}
						className="mt-auto ml-auto mr-auto mb-3"
					/>
					{isSuccess ? (
						<div className="bold-600 font-18 ml-auto mr-auto mb-4 text-center">
							{successMsgHeading}
						</div>
					) : (
						<div className="bold-600 font-18 ml-auto mr-auto mb-1 text-center">
							{warningMsgHeading}
						</div>
					)}
					{!isSuccess && warningMsgDescription && (
						<div className="font-14 bold-normal ml-auto mb-3 mr-auto text-center">
							{typeof errors === "string" &&
							errors.includes("duplicate")
								? `The ${entity} already exists!`
								: warningMsgDescription}
						</div>
					)}
					{(typeof errors === "string" &&
						errors.includes("duplicate")) ||
					isSuccess ||
					!retryFunction ? (
						<Button
							className="mb-auto ml-auto mr-auto"
							onClick={() => closeModal && closeModal()}
						>
							Close
						</Button>
					) : (
						<Button
							onClick={(e) => {
								retryFunction && retryFunction(e);
							}}
							size="sm"
							className="mb-auto ml-auto mr-auto"
							disabled={loading}
						>
							Retry
							{loading && (
								<Spinner
									animation="border"
									role="status"
									variant="light"
									size="sm"
									className="ml-2"
									style={{ borderWidth: 2 }}
								>
									<span className="sr-only">Loading...</span>
								</Spinner>
							)}
						</Button>
					)}
				</div>
			</Modal>
		</Fragment>
	);
}

export default ErrorScreen;
