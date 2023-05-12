import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import close from "../../assets/close.svg";
import { Loader } from "../../common/Loader/Loader";
import "./DeactivateModal.css";
import greenTick from "../../assets/green_tick.svg";
import inactive from "../../assets/agents/inactive.svg";

export function DeactivateModal(props) {
	const { show, handleClose, onDeactivateClick, deactivating, deactivateComplete, deactivateFailed, onSuccess } = props;
	return (
		<>
			<Modal show={show} onHide={handleClose} centered>
				<div className="deactivate__cont">
					{deactivating ? (
						<Loader width={80} height={80} />
					) : (
						<>
							<img src={close} onClick={handleClose} className="cursor-pointer" />
							{!(deactivateComplete || deactivateFailed) && (
								<div className="deactivate__cont__d1">
									Deactivate this file?
								</div>
							)}
							<div className="deactivate__cont__d2 d-flex flex-column align-items-center">
								{(deactivateComplete || deactivateFailed) && (
									<img
										src={
											deactivateFailed
												? inactive
												: greenTick
										}
										height="54px"
										width="54px"
										style={{ marginBottom: "10px" }}
									/>
								)}
								{deactivateFailed
									? "Server Error! We couldn't complete your request."
									: deactivateComplete
									? "The file was successfully deactivated."
									: "All the transactions associated to this file will be archived."}
							</div>
							{!(deactivateComplete || deactivateFailed) && (
								<button
									className="deactivate__cont__d3"
									onClick={() => {
										onDeactivateClick();
									}}
								>
									DEACTIVATE
								</button>
							)}
							<button
								className={
									deactivateComplete || deactivateFailed
										? "deactivate__cont__d3"
										: "deactivate__cont__d4"
								}
								onClick={() => {
									deactivateComplete && onSuccess();
									handleClose();
								}}
							>
								{deactivateComplete || deactivateFailed
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
