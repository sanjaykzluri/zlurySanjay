import React, { Component, useEffect, useState } from "react";
import { Modal, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import "./AddBankAccount.css";
import { useDispatch, useSelector } from "react-redux";
import close from "../../assets/close.svg";
import { currencyOptions } from "../../constants/currency";
import { allowDigitsOnly } from "utils/common";
export function EditBank(props) {
	const currency = useSelector((state) => state.userInfo?.org_currency);
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
	const [card, setCard] = useState(props.card);
	const [payment, setpayment] = useState({
		type: "bank",
		details: {
			number: card?.number,
		},
	});
	const handleEdit = (key, value) => {
		value = value?.trimStart();
		const tempDep = { ...payment };
		tempDep.details = { ...tempDep.details, [key]: value };
		setpayment(tempDep);
		if (key == "number") {
			value.length === 5
				? setInValidDigits(false)
				: setInValidDigits(true);
		}
	};

	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);

	const handleEdit2 = (key, value) => {
		value = value?.trimStart();
		const tempDep = { ...payment, [key]: value };
		setpayment(tempDep);
	};

	const [validated, setValidated] = useState(false);
	const [inValidDigits, setInValidDigits] = useState(false);

	const handleSubmit = (event) => {
		const form = event.currentTarget;

		event.preventDefault();
		event.stopPropagation();

		if (payment?.details?.number?.length === 5) {
			setInValidDigits(false);
		} else {
			setInValidDigits(true);
		}
		if (form.checkValidity() && payment?.details?.number?.length === 5) {
			props.handleSubmit(payment, props.card.id);
		}

		setValidated(true);
	};

	const closeModal = (event) => {
		setValidated(false);
		setInValidDigits(false);
		event.preventDefault();
		event.stopPropagation();
		props.onHide();
	};

	useEffect(() => {
		setInValidDigits(false);
		setValidated(false);
	}, [props]);

	useEffect(() => {
		//Segment Implementation for Edit-Bank-Account
		if (props.show) {
			window.analytics.page(
				"Transactions",
				"Payment-Methods; Edit-Bank-Account",
				{
					cardId: props.card?.id,
					cardName: props.card?.bankname,
					orgId: orgId || "",
					orgName: orgName || "",
				}
			);
		}
	}, [props.show]);

	return (
		<Modal
			{...props}
			aria-labelledby="contained-modal-title-vcenter"
			centered
			dialogClassName="modal-90w"
			dialogClassName="payment_add_modal"
		>
			<Modal.Header closeButton={false}>
				<Modal.Title
					id="contained-modal-title-vcenter"
					style={{ margin: "auto" }}
				>
					Edit Bank Account
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
										defaultValue={card.bankname}
										onChange={(e) =>
											handleEdit2("name", e.target.value)
										}
									/>
									<Form.Control.Feedback type="invalid">
										"Please enter a valid name"
									</Form.Control.Feedback>
								</Form.Group>
								<Form.Group
									className="add__card-form-group"
									controlId="BenifiacaryName"
								>
									<Form.Label>Benifiacary Name</Form.Label>
									<Form.Control
										required
										size="lg"
										type="text"
										name="name"
										placeholder="Name"
										value={payment.details.name}
										defaultValue={card.benefname}
										onChange={(e) =>
											handleEdit("name", e.target.value)
										}
									/>
									<Form.Control.Feedback type="invalid">
										"Please enter a valid name"
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
										required
										placeholder="_ _ _ _ _"
										onKeyDown={allowDigitsOnly}
										defaultValue={card.number}
										isInvalid={inValidDigits}
										maxLength="5"
										minLength="5"
										onChange={(e) =>
											handleEdit("number", e.target.value)
										}
									/>
									<Form.Control.Feedback type="invalid">
										"Please enter a valid digits"
									</Form.Control.Feedback>
								</Form.Group>
								<Form.Group
									className="add__card-form-group"
									controlId="DefaultCurrency"
								>
									<Form.Label>Default Currency</Form.Label>
									<Form.Control
										as="select"
										placeholder="Default Currency"
										custom
										name="currency"
										defaultValue={card.currency || currency}
										onChange={(e) =>
											handleEdit(
												"currency",
												e.target.value
											)
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
										disabled={props.submitInProgress}
									>
										Edit Account
										{props.submitInProgress && (
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
