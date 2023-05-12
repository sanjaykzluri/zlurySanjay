import React from "react";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { Button } from "../../../../UIComponents/Button/Button";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import pendingIcon from "../../../../assets/pending_icon.svg";

export default function RunPlaybookBulkUserModal(props) {
	const {
		openModal,
		title,
		onCloseModal,
		onContinue,
		buttonTitle,
		modalClass,
		showButton,
	} = props;

	return (
		<Modal
			contentClassName={modalClass}
			dialogClassName="z_i_connect_modal_dialog"
			show={openModal}
			title={""}
			onClose={() => onCloseModal()}
		>
			<React.Fragment>
				<div
					style={{
						borderRadius: "5px",
						padding: "10px",
						paddingTop: "50px",
						paddingBottom: "20px",
					}}
					className="d-flex flex-1 flex-column justify-content-center align-items-center"
				>
					<img
						src={pendingIcon}
						alt=""
						height={"50px"}
						width="50px"
					/>
					<OverlayTrigger
						placement="top"
						overlay={<Tooltip>{`${title}` || ""}</Tooltip>}
					>
						<span className="title-text font-18 bold-600 black text-capitalize truncate_15vw mt-3">
							{title}
						</span>
					</OverlayTrigger>
				</div>
				<div
					className={`px-4 mt-2 mb-2 d-flex flex-column justify-content-center align-items-center ${
						!showButton ? "pb-4" : ""
					}`}
				>
					<div className="d-flex flex-1 flex-row justify-content-center">
						<span
							style={{ textAlign: "center" }}
							className="title-text font-13 bold-400 o-5"
						>
							This action usually takes few minutes to complete.
							Please check back after a short while.
						</span>
					</div>
				</div>
				{showButton && (
					<>
						<div style={{ borderTop: "1px solid #EBEBEB" }} />
						<div className="text-center">
							<Button
								type="link"
								className="p-3"
								onClick={() => {
									onContinue();
								}}
							>
								{buttonTitle}
							</Button>
						</div>
					</>
				)}
			</React.Fragment>
		</Modal>
	);
}
