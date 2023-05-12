import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import close from "../../assets/close.svg";
import { Loader } from "../../common/Loader/Loader";
import "./DeactivateModal.css";
import greenTick from "../../assets/green_tick.svg";
import inactive from "../../assets/agents/inactive.svg";

export function ActivateModal(props) {
	const {
		show,
		handleClose,
		onActivateClick,
		activating,
		activateComplete,
		activateFailed,
		onSuccess,
	} = props;
	return (
		<>
			<Modal show={show} onHide={handleClose} centered>
				<div className="deactivate__cont">
					{activating ? (
						<Loader width={80} height={80} />
					) : (
						<>
							<img
								src={close}
								onClick={handleClose}
								className="cursor-pointer"
							/>
							{!(activateComplete || activateFailed) && (
								<div className="deactivate__cont__d1">
									Activate this file?
								</div>
							)}
							<div className="deactivate__cont__d2 d-flex flex-column align-items-center">
								{(activateComplete || activateFailed) && (
									<img
										src={
											activateFailed
												? inactive
												: greenTick
										}
										height="54px"
										width="54px"
										style={{ marginBottom: "10px" }}
									/>
								)}
								{activateFailed
									? "Server Error! We couldn't complete your request."
									: activateComplete
									? "The file was successfully activated."
									: "All the transactions associated to this file will be activated."}
							</div>
							{!(activateComplete || activateFailed) && (
								<button
									className="deactivate__cont__d3"
									onClick={() => {
										onActivateClick();
									}}
								>
									ACTIVATE
								</button>
							)}
							<button
								className={
									activateComplete || activateFailed
										? "deactivate__cont__d3"
										: "deactivate__cont__d4"
								}
								onClick={() => {
									activateComplete && onSuccess();
									handleClose();
								}}
							>
								{activateComplete || activateFailed
									? "Close"
									: "Cancel"}
							</button>
						</>
					)}
				</div>
			</Modal>
		</>
	);
}
