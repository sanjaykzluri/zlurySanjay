import React, { useState, useEffect } from "react";
import warning from "../../../../assets/icons/delete-warning.svg";
import { Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "../../../../UIComponents/Modal/Modal";
function AutomaticallyAssignModal(props) {
	const [dontAsk, setDontAsk] = useState();
	const [automaticallyAssignStartDate, setAutomaticallyAssignStartDate] =
		useState(false);
	const [isRequesting, setIsRequesting] = useState(false);

	function handleSubmit() {
		props.setDontAskAgain(dontAsk);
		props.setAutoAssignStartDate(automaticallyAssignStartDate);
		props.handleModalSave(true);
	}
	useEffect(() => {
		setDontAsk(props.dontAskAgain);
		setAutomaticallyAssignStartDate(props.autoAssignStartDate);
	}, []);

	return (
		<Modal
			show={props.isOpen}
			onClose={() => {
				if (props.setAutomaticallyAssignModalOpen) {
					props.setAutomaticallyAssignModalOpen(false);
					return;
				}
				props.closeModal();
			}}
			size="md"
			footer={true}
			onOk={async () => {
				await handleSubmit();
			}}
			submitInProgress={isRequesting}
			disableOkButton={isRequesting}
			ok={"Set Automatically"}
			cancel={"Skip"}
		>
			<div className="d-flex flex-column">
				<div className="mt-4 text-center">
					<img src={warning} alt="warning icon" />
				</div>
				<div
					className=" w-100 mt-2 mb-2 bg-white text-center font-weight-bold border-0"
					style={{ fontSize: "18px" }}
				>
					Automatically assign start date?
				</div>
				<div className="d-flex flex-column text-center grey1 font-14">
					<p className="mb-1">
						Start date of license would be automatically set as the
						day user was detected using this app.
					</p>
				</div>
				<div
					className="d-flex flex-row align-items-center ml-4"
					style={{ marginTop: "15px" }}
				>
					<Form.Check
						className=""
						onChange={() => {
							setAutomaticallyAssignStartDate(
								!automaticallyAssignStartDate
							);
						}}
						checked={automaticallyAssignStartDate}
					></Form.Check>
					<div className="font-14">
						Assign date automatically for all further license
						mapping
					</div>
				</div>
				<div
					className="d-flex flex-row align-items-center ml-4"
					style={{ marginTop: "10px" }}
				>
					<Form.Check
						className=""
						onChange={() => {
							setDontAsk(!dontAsk);
						}}
						checked={dontAsk}
					></Form.Check>
					<div className="font-14">Don’t ask again</div>
				</div>
			</div>
		</Modal>
	);
}

export default AutomaticallyAssignModal;
