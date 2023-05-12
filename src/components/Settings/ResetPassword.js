import React, { useState } from "react";
import PropTypes from "prop-types";
import { Form, Modal, Row, Col } from "react-bootstrap";
import close from "../../assets/close.svg";
import Button from "react-bootstrap/Button";
import greenRightTick from "../../assets/green_tick.svg";
export function ResetPassword(props) {
	return (
		<Modal centered show={props.isOpen} onHide={props.handleClose}>
			<Modal.Header closeButton={false}>
				<Modal.Title style={{ fontWeight: "600" }}> </Modal.Title>
				<img alt="Close" onClick={props.handleClose} src={close} />
			</Modal.Header>
			{/* <hr /> */}
			<Modal.Body>
				<div className="addTransactionModal__body_lower">
					<div
						className="addTransactionModal__body_lower_inner"
						style={{ width: "91%" }}
					>
						<div
							className="d-flex flex-column w-100 justify-content-center align-items-center"
							style={{
								height: "207px",
							}}
						>
							<img src={greenRightTick} height={46} width={46} />
							<h6 className="mt-4 mb-4 font-weight-bold">
								A password reset link has been sent to your
								email
							</h6>
							<Button onClick={props.handleClose}> Close</Button>
						</div>
					</div>
				</div>
			</Modal.Body>
		</Modal>
	);
}

ResetPassword.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
};
