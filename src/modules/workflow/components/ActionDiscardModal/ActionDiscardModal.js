import { Button } from "UIComponents/Button/Button";
import { Modal } from "UIComponents/Modal/Modal";
import React from "react";
import info from "../../../../assets/icons/info-orange.svg";

const ActionDiscardModal = ({
	application,
	modalClass,
	show,
	onHide,
	onClick,
}) => {
	return (
		<Modal
			contentClassName={modalClass}
			dialogClassName="z_i_connect_modal_dialog"
			show={show}
			centered
			title={
				<div>
					<img height={40} width={40} alt="" src={info} />
				</div>
			}
			style={{ maxWidth: "50%!important" }}
			onClose={() => onHide()}
		>
			<React.Fragment>
				<div style={{ borderTop: "1px solid #EBEBEB" }} />
				<div className="px-5">
					<div className="d-flex mt-4 flex-column align-items-center">
						<p className="font-18 bold-600 text-align-center">
							Changing the instance will reset all fields for this
							action.
						</p>
						<p
							style={{
								textAlign: "center",
								color: "#717171",
								fontFamily: "Sora",
							}}
						>
							Are you sure you would like to go ahead?
						</p>
					</div>
				</div>
				<div className="flex-1 d-flex justify-content-end px-4 py-3">
					<Button
						type="link"
						className="text-center"
						onClick={() => onHide()}
					>
						Cancel
					</Button>
					<Button
						className="text-center"
						onClick={() => {
							onClick && onClick();
						}}
					>
						Switch Account
					</Button>
				</div>
			</React.Fragment>
		</Modal>
	);
};

export default ActionDiscardModal;
