import React, { useState, useEffect } from "react";
import warning from "../../../../assets/icons/delete-warning.svg";
import { Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "../../../../UIComponents/Modal/Modal";
function SameDateModal(props) {
	const [dontAsk, setDontAsk] = useState();
	const [automaticallyAssignStartDate, setAutomaticallyAssignStartDate] =
		useState(false);
	const [isRequesting, setIsRequesting] = useState(false);

	function handleSubmit() {
		props.handleModalSave();
		props.setShowSameDateModal(false);
	}

	return (
		<Modal
			show={props.isOpen}
			onClose={() => {
				props.closeModal();
			}}
			size="md"
			footer={true}
			onOk={async () => {
				await handleSubmit();
			}}
			submitInProgress={isRequesting}
			disableOkButton={isRequesting}
			ok={"Assign date to all"}
			cancel={"Do not assign "}
		>
			<div className="d-flex flex-column">
				<div className="mt-6 text-center">
					<img src={warning} alt="warning icon" />
				</div>
				<div
					className=" w-100 mt-2 mb-2 bg-white text-center font-weight-bold border-0"
					style={{ fontSize: "18px" }}
				>
					Assign the same to date all selected users?
				</div>
				<div className="d-flex flex-column text-center grey1 font-14">
					<p className="mb-4">
						The same start date will be assigned for all selected
						users.
					</p>
				</div>
			</div>
		</Modal>
	);
}

export default SameDateModal;
