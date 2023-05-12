import React, { useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import close from "assets/close.svg";
import { Button } from "UIComponents/Button/Button";
import {
	editAccountDetails,
	removeAccount,
} from "modules/integrations/service/api";
import warning from "assets/warning.svg";
import ExclamationCircleSVG from "assets/icons/exclamation-circle.svg";
import dangerIcon from "assets/icons/delete-warning.svg";
import { showNotificationCard } from "modules/licenses/utils/LicensesUtils";
import { TriggerIssue } from "utils/sentry";
import authorizedGreen from "../../../../assets/icons/check-circle.svg";
import { getValueFromLocalStorage } from "utils/localStorage";
import { useContext } from "react";
import RoleContext from "services/roleContext/roleContext";

const RemoveInstanceModal = ({ instance, onHide, handleRefresh }) => {
	const [failedToSaveAccountMsg, setFailedToSaveAccountMsg] = useState();
	const [isAccountSaving, setIsAccountSaving] = useState(false);
	const [isRemovingAccount, setIsRemovingAccount] = useState(false);
	const [failedToRemoveAccount, setFailedToRemoveAccount] = useState(false);
	const [successfullyRemovedAccount, setSuccessfullyRemovedAccount] =
		useState(false);
	const userDetails = getValueFromLocalStorage("userInfo");
	const { partner } = useContext(RoleContext);

	const handleRemoveAccount = () => {
		try {
			setIsRemovingAccount(true);
			removeAccount(instance.id, userDetails?.user_id).then((res) => {
				if (res.success) {
					setFailedToRemoveAccount(false);
					setSuccessfullyRemovedAccount(true);
					onHide && onHide();
					handleRefresh();
					setTimeout(() => {
						showNotificationCard(
							`${instance.name} has been removed`,
							"Associated data will be removed shortly",
							authorizedGreen
						);
						setSuccessfullyRemovedAccount(false);
					}, [1000]);
				} else {
					setFailedToRemoveAccount(true);
				}
				setIsRemovingAccount(false);
			});
		} catch (error) {
			setFailedToRemoveAccount(true);
			setIsRemovingAccount(false);
			TriggerIssue("Error when removing orgItegration", error);
		}
	};
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
							<div className="font-16 bold-500 mt-2">
								You are about to remove this instance
							</div>
							<div className="font-12 mt-1">
								On removing this instance, all the associated
								data (users, usage, license data) will also be
								removed from {partner?.name}.
							</div>
						</div>
						{failedToSaveAccountMsg && (
							<div className="d-flex warningMessage w-100 p-2 mb-3">
								<img src={warning} />
								<div className="font-12 ml-1">
									We could not remove this instance. Please
									try again.
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
					{failedToRemoveAccount ? (
						<Button
							type="submit"
							className="d-flex btn btn-outline-danger"
							style={{ width: "60px" }}
							onClick={() => handleRemoveAccount()}
						>
							Retry
						</Button>
					) : (
						<Button
							className="z-button-primary px-4"
							onClick={() => handleRemoveAccount()}
						>
							{isRemovingAccount && (
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
							Remove Instance
						</Button>
					)}
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default RemoveInstanceModal;
