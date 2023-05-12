import React, { useState, useEffect } from "react";
import { Modal } from "../../UIComponents/Modal/Modal";
import warning from "../../assets/icons/delete-warning.svg";
import { useDispatch, useSelector } from "react-redux";
function ArchiveModal(props) {
	const [isRequesting, setIsRequesting] = useState(false);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	function handleSubmit() {
		let req_Ids = [];
		if (Array.isArray(props.id)) {
			req_Ids = props.id;
		} else {
			req_Ids = [props.id];
		}
		try {
			setIsRequesting(true);

			props.ArchiveFunc(req_Ids, props.status).then((res) => {
				if (res.status === "success") {
					props.successResponse();
					props.closeModal();
					setIsRequesting(false);
				} else {
					console.log("Response is not as expected", res);
				}
			});
		} catch (error) {
			setIsRequesting(false);
			console.log(error, "Error when archiving " + props.type);
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
			ok={"Archive"}
		>
			<div className="d-flex flex-column">
				<div className="mt-4 text-center">
					<img src={warning} alt="warning icon" />
				</div>
				<div
					className="warningMessage w-100 mt-2 mb-2 bg-white text-center font-weight-bold border-0"
					style={{ fontSize: "18px" }}
				>
					You're about to archive {props.name}
				</div>
				<div className="d-flex flex-column text-center grey1 font-14">
					<p className="mb-1">
						{props.subtext ||
							`You will no longer be able to track this ${props.type} on
						archiving.`}
					</p>
					<p>Are you sure you want to continue?</p>
				</div>
			</div>
		</Modal>
	);
}

export default ArchiveModal;
