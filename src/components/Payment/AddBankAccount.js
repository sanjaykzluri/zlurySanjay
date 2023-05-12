import React, { Component, useState } from "react";

import { Modal, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import "./AddBankAccount.css";
import close from "../../assets/close.svg";
import warning from "../../assets/warning.svg";
import { useDispatch, useSelector } from "react-redux";
import { currencyOptions } from "../../constants/currency";
import { allowDigitsOnly } from "utils/common";

export function AddBankAccount(props) {
	const currency = useSelector((state) => state.userInfo?.org_currency);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const currencies = [
		{
			type: "currency",
			name: "USD",
		},
		{
			type: "currency",
			name: "INR",
		},
	];
	const initialBankDetails = {
		type: "bank",
		details: {},
	};
	const [payment, setPayment] = useState(initialBankDetails);
	const handleEdit = (key, value) => {
		value = value?.trimStart();
		const tempDep = { ...payment };
		tempDep.details = { ...tempDep.details, [key]: value };
		setPayment(tempDep);
		if (key == "number") {
			value.length === 5
				? setInValidDigits(false)
				: setInValidDigits(true);
		}
	};
	const handleEdit2 = (key, value) => {
		value = value?.trimStart();
		const tempDep = { ...payment, [key]: value };
		setPayment(tempDep);
	};

	const [validated, setValidated] = useState(false);
	const [inValidDigits, setInValidDigits] = useState(false);

	const handleSubmit = (event) => {
		const form = event.currentTarget;
		if (
			form.checkValidity() === false ||
			payment.details.number.length != 5
		) {
			event.preventDefault();
			event.stopPropagation();
		} else {
			props.handleSubmit(payment);
			event.preventDefault();
			event.stopPropagation();
		}

		setValidated(true);
	};

	const closeModal = (event) => {
		setValidated(false);
		setInValidDigits(false);
		setPayment(initialBankDetails);

		props.onHide();
	};
	const onOpen = (e) => {
		setValidated(false);

		//Segment Implementation for Add-Bank-Card
		// if(addBankAccountshow) {
		window.analytics.page(
			"Transactions",
			"Payment-Methods; Add-Bank-Account",
			{
				orgId: orgId || "",
				orgName: orgName || "",
			}
		);

		// }
	};

	return (
		<Modal
			{...props}
			aria-labelledby="contained-modal-title-vcenter"
			centered
			dialogClassName="payment_add_modal"
			onShow={(e) => onOpen(e)}
			onHide={closeModal}
		>
			<Modal.Header closeButton={false}>
				<Modal.Title
					id="contained-modal-title-vcenter"
					style={{ margin: "auto" }}
				>
					Add Bank Account
				</Modal.Title>
				<img alt="Close" src={close} onClick={props.onHide} />
			</Modal.Header>
			<Modal.Body>
				<div className="w-100 container">
					<Row>
						<Col sm={12} className="m-auto">
							<Form
								noValidate
								validated={validated}
								onSubmit={handleSubmit}
							>
								<Form.Group
									className="add__card-form-group"
									controlId="AccountName"
								>
									<Form.Label>Account Name</Form.Label>
									<Form.Control
										required
										size="lg"
										type="text"
										name="name"
										placeholder="Account Name"
										value={payment.name}
										onChange={(e) =>
											handleEdit2("name", e.target.value)
										}
									/>
									<Form.Control.Feedback type="invalid">
										Please enter a valid name
									</Form.Control.Feedback>
								</Form.Group>
								<Form.Group
									className="add__card-form-group"
									controlId="BenifiacaryName"
								>
									<Form.Label>Beneficiary Name</Form.Label>
									<Form.Control
										required
										size="lg"
										type="text"
										name="name"
										placeholder="Name"
										value={payment.details.name}
										onChange={(e) =>
											handleEdit("name", e.target.value)
										}
									/>
									<Form.Control.Feedback type="invalid">
										Please enter a valid name
									</Form.Control.Feedback>
								</Form.Group>
								<Form.Group
									className="add__card-form-group"
									controlId="CreditCardDigits"
								>
									<Form.Label>
										Last 5 Digits of Account Number
									</Form.Label>
									<Form.Control
										required
										type="text"
										name="number"
										placeholder="_ _ _ _ _"
										isInvalid={inValidDigits}
										maxLength="5"
										minLength="5"
										onKeyDown={allowDigitsOnly}
										value={payment.details.number}
										onChange={(e) =>
											handleEdit("number", e.target.value)
										}
									/>
									<Form.Control.Feedback type="invalid">
										Please enter a valid digits
									</Form.Control.Feedback>
									{props.showWarningMessage && validated ? (
										<label
											class="d-flex text-center alert alert-danger mb-0 mt-2 p-2 align-items-center warningMessage border border-danger"
											role="alert"
										>
											<img
												src={warning}
												className="pr-1"
											></img>
											This account number already exists.
											Please try again with another
											account
										</label>
									) : null}
								</Form.Group>
								<Form.Group
									className="add__card-form-group"
									controlId="DefaultCurrency"
								>
									<Form.Label>Default Currency</Form.Label>
									<Form.Control
										className="cursor-pointer"
										as="select"
										placeholder="Default Currency"
										custom
										name="currency"
										onChange={(e) =>
											handleEdit(
												"currency",
												e.target.value
											)
										}
										defaultValue={
											currency || currencies[0].name
										}
									>
										{currencyOptions}
									</Form.Control>
								</Form.Group>
								<Modal.Footer className="pr-0">
									<Button variant="link" onClick={closeModal}>
										Close
									</Button>
									<Button
										variant="primary"
										type="submit"
										className="mr-0"
									>
										{props.submitting ? (
											<Spinner
												animation="border"
												role="status"
												variant="light"
												size="sm"
												className="ml-2"
												style={{ borderWidth: 2 }}
											>
												<span className="sr-only">
													Loading...
												</span>
											</Spinner>
										) : (
											"Add Account"
										)}
									</Button>
								</Modal.Footer>
							</Form>
						</Col>
					</Row>
				</div>
			</Modal.Body>
		</Modal>
	);
}
