import React, { useEffect, useState } from "react";
import { Modal, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import "./Payment.css";
import close from "../../assets/close.svg";
import Calendar from "react-calendar";
import { useDispatch, useSelector } from "react-redux";
import { currencyOptions } from "../../constants/currency";
import { allowDigitsOnly } from "../../utils/common";

export function EditCard(props) {
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
	const [showcalendar, setshowcalendar] = useState(false);
	const [calenderValidationError, setCalenderValidationError] =
		useState(false);
	const [payment, setpayment] = useState({
		details: {
			expiry_month: card?.expiry_month,
			expiry_year: card?.expiry_year,
			type: card?.type,
			number: card?.number,
		},
		name: card?.name,
	});
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
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

	const handleEdit = (key, value) => {
		const tempDep = { ...payment };
		tempDep.details = { ...tempDep.details, [key]: value };
		setpayment(tempDep);
		if (key == "number") {
			value.length === 4
				? setInValidDigits(false)
				: setInValidDigits(true);
		}
	};
	const handleEdit2 = (key, value) => {
		value = value?.trimStart();
		const tempDep = { ...payment, [key]: value };
		setpayment(tempDep);
	};

	const [validated, setValidated] = useState(false);
	const [inValidDigits, setInValidDigits] = useState(false);

	const handleSubmit = (event) => {
		if (!event) return;

		event.preventDefault();
		event.stopPropagation();
		const form = event.currentTarget;
		validateExpiryDate();
		if (payment?.details?.number === 4) {
			setInValidDigits(false);
		} else {
			setInValidDigits(true);
		}
		if (
			form.checkValidity() &&
			!calenderValidationError &&
			validateExpiryDate() &&
			payment?.details?.number?.length === 4
		) {
			props.handleSubmit(payment, card.id);
		}
		setValidated(true);
	};

	useEffect(() => {
		setValidated(false);
		setCalenderValidationError(false);
		setInValidDigits(false);
	}, [props]);

	const closeModal = (event) => {
		setValidated(false);
		setInValidDigits(false);
		event.preventDefault();
		event.stopPropagation();
		props.onHide();
	};

	const onChangeDate = (date) => {
		setCard({
			...card,
			expiry_month: date.getMonth() + 1,
			expiry_year: date.getFullYear(),
		});
		setpayment({
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

	useEffect(() => {
		//Segment Implementation for Edit-Credit-Card
		if (props.show) {
			window.analytics.page(
				"Transactions",
				"Payment-Methods; Edit-Credit-Card",
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
			dialogClassName="payment_add_modal"
		>
			<Modal.Header closeButton={false}>
				<Modal.Title
					id="contained-modal-title-vcenter"
					style={{ margin: "auto" }}
				>
					Edit Credit Card
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
									controlId="CardName"
								>
									<Form.Label>Card Name</Form.Label>
									<Form.Control
										required
										size="lg"
										type="text"
										name="Card Name"
										value={payment.name}
										defaultValue={card.bankname}
										placeholder="Card Name"
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
									controlId="CreditCardDigits"
								>
									<Form.Label>
										Last 4 Digits of Credit Card
									</Form.Label>
									<Form.Control
										type="text"
										name="Credit Card Digits"
										required
										defaultValue={card.number}
										placeholder="_ _ _ _"
										isInvalid={inValidDigits}
										onKeyDown={allowDigitsOnly}
										maxLength="4"
										minLength="4"
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
									controlId="ChooseCard"
								>
									<Form.Label>Choose Card</Form.Label>
									<Form.Control
										required
										as="select"
										placeholder={card.masorvi}
										defaultValue={card.masorvi}
										custom
										onChange={(e) =>
											handleEdit("type", e.target.value)
										}
									>
										<option value="visa">Visa</option>
										<option value="mastercard">
											Mastercard
										</option>
										<option value={"american_express"}>
											American Express
										</option>
									</Form.Control>
								</Form.Group>
								<Form.Group>
									<Form.Label>Expiry Date</Form.Label>
									<div
										className="new__calendar__div"
										role="button"
										onClick={() => {
											setshowcalendar(true);
										}}
									>
										{`${
											card.expiry_month
												? card.expiry_month
												: "--"
										} / ${
											card.expiry_year
												? card.expiry_year
												: "---"
										}`}
										{showcalendar && (
											<div>
												<Calendar
													onChange={onChangeDate}
													value={card.date}
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
										as="select"
										defaultValue={card.currency || currency}
										custom
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
										Edit Card
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

// TODO: EditCard.propTypes
