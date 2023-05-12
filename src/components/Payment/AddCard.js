import React, { useEffect, useState, useRef } from "react";
import { Modal, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import "./Payment.css";
import { useDispatch, useSelector } from "react-redux";
import close from "../../assets/close.svg";
import warning from "../../assets/warning.svg";
import Calendar from "react-calendar";
import useOutsideClick from "../../common/OutsideClick/OutsideClick";
import { currencyOptions } from "../../constants/currency";
import { allowDigitsOnly } from "utils/common";

export function AddCard(props) {
	const currency = useSelector((state) => state.userInfo?.org_currency);
	const refExpiryDate = useRef();
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
	const dispatch = useDispatch();
	const initialCardDetails = {
		type: "credit_card",
		details: {
			expiry_month: "--",
			expiry_year: "----",
		},
	};
	const [payment, setPayment] = useState(initialCardDetails);
	const handleEdit = (key, value) => {
		value = value?.trimStart();
		const tempDep = { ...payment };
		tempDep.details = { ...tempDep.details, [key]: value };
		setPayment(tempDep);
		if (key == "number") {
			value.length === 4
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
	const [showcalendar, setshowcalendar] = useState(false);
	const [calenderValidationError, setCalenderValidationError] =
		useState(false);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	useEffect(() => {
		setCalenderValidationError(false);
		setValidated(false);
	}, [props]);

	const validateExpiryDate = () => {
		if (
			!Number.isInteger(payment.details.expiry_month) ||
			!Number.isInteger(payment.details.expiry_year)
		) {
			setCalenderValidationError(true);
			return false;
		}
		return true;
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		event.stopPropagation();
		const form = event.currentTarget;
		validateExpiryDate();
		if (
			form.checkValidity() &&
			!calenderValidationError &&
			validateExpiryDate() &&
			payment.details.number.length == 4
		)
			props.handleSubmit(payment);
		setValidated(true);
	};

	const closeModal = () => {
		setValidated(false);
		setInValidDigits(false);
		setshowcalendar(false);
		setPayment(initialCardDetails);
		props.onHide();
	};

	const onChangeDate = (date) => {
		setPayment({
			...payment,
			details: {
				...payment.details,
				expiry_month: date.getMonth() + 1,
				expiry_year: date.getFullYear(),
			},
		});
		setshowcalendar(false);
		setCalenderValidationError(false);
	};

	useOutsideClick(refExpiryDate, () => {
		refExpiryDate && setshowcalendar(false);
	});

	useEffect(() => {
		//Segment Implementation for Add-Credit-Card
		if (props.show) {
			window.analytics.page(
				"Transactions",
				"Payment-Methods; Add-Credit-Card",
				{
					orgId: orgId || "",
					orgName: orgName || "",
				}
			);
		}
	}, [props.show]);

	return (
		<Modal
			onHide={closeModal}
			show={props.show}
			aria-labelledby="contained-modal-title-vcenter"
			centered
			dialogClassName="payment_add_modal"
		>
			<Modal.Header closeButton={false}>
				<Modal.Title
					id="contained-modal-title-vcenter"
					style={{ margin: "auto" }}
				>
					Add Credit Card
				</Modal.Title>
				<img alt="Close" src={close} onClick={() => closeModal()} />
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
									controlId="CardName"
								>
									<Form.Label>Card Name</Form.Label>
									<Form.Control
										size="lg"
										type="text"
										name="name"
										required
										placeholder="Card Name"
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
									controlId="CreditCardDigits"
								>
									<Form.Label>
										Last 4 Digits of Credit Card
									</Form.Label>
									<Form.Control
										required
										name="number"
										placeholder="_ _ _ _"
										isInvalid={inValidDigits}
										maxLength="4"
										minLength="4"
										onKeyDown={allowDigitsOnly}
										onChange={(e) =>
											handleEdit("number", e.target.value)
										}
									/>
									<Form.Control.Feedback type="invalid">
										Please enter a valid digits
									</Form.Control.Feedback>
									{props.showWarningMessage ? (
										<label
											class="d-flex text-center alert alert-danger mb-0 mt-2 p-2 align-items-center warningMessage border border-danger"
											role="alert"
										>
											<img
												src={warning}
												className="pr-1"
											></img>
											This card number already exists.
											Please try again with another card
										</label>
									) : null}
								</Form.Group>
								<Form.Group
									className="add__card-form-group"
									controlId="ChooseCard"
								>
									<Form.Label>Choose Card</Form.Label>
									<Form.Control
										required
										className="cursor-pointer"
										as="select"
										placeholder="Card Name"
										custom
										name="type"
										onChange={(e) =>
											handleEdit("type", e.target.value)
										}
									>
										<option value="">Choose</option>
										<option value={"visa"}>Visa</option>
										<option value={"mastercard"}>
											Mastercard
										</option>
										<option value={"american_express"}>
											American Express
										</option>
									</Form.Control>
									<Form.Control.Feedback type="invalid">
										Please select a card type
									</Form.Control.Feedback>
								</Form.Group>
								<Form.Group>
									<Form.Label>Expiry Date</Form.Label>
									<div
										className="new__calendar__div"
										role="button"
										ref={refExpiryDate}
										onClick={() => {
											setshowcalendar(true);
										}}
									>
										{`${payment.details.expiry_month} / ${payment.details.expiry_year}`}
										{showcalendar && (
											<div>
												<Calendar
													onChange={onChangeDate}
												/>
											</div>
										)}
									</div>
									{calenderValidationError && (
										<div
											className="invalid-feedback"
											style={{ display: "block" }}
										>
											Please select an expiry date.
										</div>
									)}
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
										defaultValue={currency}
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
											"Add Card"
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
