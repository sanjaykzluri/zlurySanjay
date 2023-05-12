import React, { useState, useEffect } from "react";
import { Modal } from "../../UIComponents/Modal/Modal";
import warning from "../../assets/icons/delete-warning.svg";
import { useDispatch, useSelector } from "react-redux";
import "./UserTypeModal.css";
import { TriggerIssue } from "../../utils/sentry";
import { ErrorModal } from "../../modules/shared/components/ManualUsage/ErrorModal/ErrorModal";
function UserTypeModal(props) {
	const [isRequesting, setIsRequesting] = useState(false);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const [error, setError] = useState();
	const [patchObj, setPatchObj] = useState({
		patches: [
			{
				op: "replace",
				field: "account_type",
				value: "",
			},
		],
	});
	const orgName = useSelector((state) => state.userInfo.org_name);
	function handleSubmit() {
		try {
			setIsRequesting(true);
			props.UserTypeFunc(props.id, patchObj).then((res) => {
				if (res?.error) {
					setError(res?.error);
					props.closeModal();
				} else if (res.status === "success") {
					props.successResponse();
					props.closeModal();
					setIsRequesting(false);
				}
			});
		} catch (error) {
			TriggerIssue("Error in Changing User Type", error);
			setIsRequesting(false);
			setError(error);
		}
	}
	useEffect(() => {
		let tempPatchObj = { ...patchObj };
		tempPatchObj.patches[0].value = props.type;
		setPatchObj(tempPatchObj);
	}, []);
	return (
		<>
			<Modal
				className={"userTypeModal"}
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
				ok={"Continue"}
			>
				<div className="d-flex flex-column">
					<div className="mt-5 text-center">
						<img src={warning} alt="warning icon" />
					</div>
					<div
						className="d-flex flex-column text-center black1 font-18 bold-600"
						style={{ marginTop: "16px" }}
					>
						<p className="mb-1">
							Are you sure you want to change the user type to{" "}
							{props.type} account?
						</p>
					</div>
				</div>
			</Modal>
			{error && (
				<ErrorModal
					isOpen={error}
					handleClose={() => {
						setError(null);
					}}
					errorMessage={error}
				/>
			)}
		</>
	);
}

export default UserTypeModal;
