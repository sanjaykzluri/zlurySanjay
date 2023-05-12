import React from "react";
import PropTypes from "prop-types";
import { Form, Modal, Row, Col } from "react-bootstrap";
import "./AddDepartment.scss";
import close from "../../assets/close.svg";
import Button from "react-bootstrap/Button";

export function AddApplicationToDepartment(props) {
	return (
		<Modal centered show={props.isOpen} onHide={props.handleClose}>
			<Modal.Header closeButton={false}>
				<Modal.Title style={{ fontWeight: "600" }}>
					Add New Department
				</Modal.Title>
				<img alt="Close" onClick={props.handleClose} src={close} />
			</Modal.Header>
			<hr />
			<Modal.Body>
				<div className="addTransactionModal__body_upper">
					<div className="addTransactionModal__body_upper_inner">
						<Form style={{ width: "100%" }}>
							<Form.Group>
								<Form.Label style={{ opacity: 0.8 }}>
									Name
								</Form.Label>
								<div
									style={{
										border: "1px solid #DDDDDD",
										borderRadius: 4,
									}}
									className="d-flex flex-row align-items-center"
								>
									<Form.Control
										bsPrefix="new-class"
										style={{
											border: "none",
											width: "91px!important",
										}}
										as="select"
									>
										<option>1</option>
										<option>2</option>
										<option>3</option>
										<option>4</option>
										<option>5</option>
									</Form.Control>
									<div className="vl"></div>
									<Form.Control
										style={{ border: "none" }}
										type="text"
										placeholder="Department"
									/>
								</div>
							</Form.Group>
						</Form>
					</div>
				</div>
				<div className="addTransactionModal__body_lower">
					<div className="addTransactionModal__body_lower_inner">
						<Form style={{ width: "100%", marginBottom: "64px" }}>
							<Row>
								<Col>
									<Form.Group>
										<Form.Label style={{ opacity: 0.8 }}>
											Head
										</Form.Label>
										<Form.Control
											type="text"
											placeholder="Head"
											bsPrefix="my-class2"
										/>
									</Form.Group>
								</Col>
							</Row>
							<Row>
								<Col>
									<Form.Group>
										<Form.Label style={{ opacity: 0.8 }}>
											Budget
										</Form.Label>
										<Form.Control
											type="number"
											placeholder="Budget"
											bsPrefix="my-class3"
										/>
									</Form.Group>
								</Col>
							</Row>
						</Form>
					</div>
				</div>
			</Modal.Body>
			<hr />
			<Modal.Footer className="addTransactionModal__footer">
				<button className="btn btn-link" onClick={props.handleClose}>
					Cancel
				</button>
				<Button onClick={props.handleClose}>Add Apps</Button>
			</Modal.Footer>
		</Modal>
	);
}

AddApplicationToDepartment.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
};
