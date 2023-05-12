import React, { useState } from "react";
import { Modal } from "../../../UIComponents/Modal/Modal";
import warning from "../../../assets/icons/delete-warning.svg";
import { TriggerIssue } from "../../../utils/sentry";

function ConfirmRemoveUser(props) {
	const [isRequesting, setIsRequesting] = useState(false);
	function handleSubmit() {
		try {
			setIsRequesting(true);
			props.removeUser(props.user?._id, props.user?.role).then((res) => {
				if (res.status === "success") {
					props.successResponse && props.successResponse();
					props.closeModal && props.closeModal();
					setIsRequesting(false);
				} else {
					TriggerIssue("Response is not as expected", res);
				}
			});
		} catch (error) {
			setIsRequesting(false);
			TriggerIssue("Error when removing user ", error);
		}
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
			ok={`Remove ${props.user?.role || "privileges"}`}
		>
			<div className="d-flex flex-column">
				<div className="mt-4 text-center">
					<img src={warning} alt="warning icon" />
				</div>
				<div
					className="warningMessage p-2 mt-2 mb-2 bg-white text-center font-weight-bold border-0 w-100"
					style={{ fontSize: "18px" }}
				>
					You're about to remove {props.user?.role} privileges for {props.user?.email || "this member"}
				</div>
				<div className="d-flex flex-column text-center grey1 font-14">
					<p>Are you sure you want to continue?</p>
				</div>
			</div>
		</Modal>
	);
}

export default ConfirmRemoveUser;
