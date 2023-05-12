import React, { useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import close from "assets/close.svg";
import { Button } from "UIComponents/Button/Button";
import dangerIcon from "assets/icons/delete-warning.svg";
import { useHistory } from "react-router-dom";

const UpgradeBannerModal = ({ onHide, showUpgradeModal }) => {
	const history = useHistory();
	return (
		<>
			<Modal
				show={showUpgradeModal}
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
								Cannot connect Integration
							</div>
							<div className="font-12 mt-1">
								Upgrade needed to connect to integration
							</div>
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer
					style={{ justifyContent: "center" }}
					className="border-top"
				>
					<Button
						className="z-button-primary px-4"
						onClick={() => history.push("/settings/billing")}
					>
						Upgrade Now
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default UpgradeBannerModal;
