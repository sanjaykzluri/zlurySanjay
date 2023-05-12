import React, { useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import close from "assets/close.svg";
import { Button } from "UIComponents/Button/Button";
import dangerIcon from "assets/icons/delete-warning.svg";
import { useHistory } from "react-router-dom";
import { useContext } from "react";
import RoleContext from "services/roleContext/roleContext";

const IntegrationConfirmationModal = ({
	onHide,
	showConfirmationModal,
	instancesCount,
	integrationName,
	setShowConnectModal,
}) => {
	const history = useHistory();
	const { partner } = useContext(RoleContext);
	return (
		<>
			<Modal
				show={showConfirmationModal}
				onHide={onHide}
				style={{ maxWidth: "50%!important" }}
				centered
				className=""
			>
				<Modal.Body className="bg-white rounded-top">
					<div className="px-3 py-4">
						<div align="center">
							<img src={dangerIcon} />
							<div className="font-16 bold-500 mt-2">
								Are you sure you want to connect another
								instance?
							</div>
							<div className="font-12 mt-3 px-2">
								There are already {instancesCount} instaces
								connected for {integrationName}. Adding the same
								instance again may lead to discrepency in data
								on {partner?.name}.
							</div>
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer
					style={{ justifyContent: "center" }}
					className="border-top"
				>
					<Button
						type="link"
						style={{
							color: "#484848",
							border: " 1px solid #717171",
							borderRadius: "4px",
						}}
						onClick={setShowConnectModal}
					>
						Add Instance Anyway
					</Button>
					<Button className="z-button-primary px-4" onClick={onHide}>
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default IntegrationConfirmationModal;
