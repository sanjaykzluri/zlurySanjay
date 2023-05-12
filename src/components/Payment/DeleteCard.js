import React, { useEffect, useState } from "react";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";
import "./Payment.css";
import close from "../../assets/close.svg";
import deleteIcon from "../../assets/icons/exclamation.svg";

export function DeleteCard(props) {
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
	const [calenderValidationError, setCalenderValidationError] = useState(
		false
	);
	const [payment, setpayment] = useState({
		details: {
			expiry_month: card.expiry_month,
			expiry_year: card.expiry_year,
		},
	});

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
			value ? setInValidDigits(false) : setInValidDigits(true);
		}
	};
	const handleEdit2 = (key, value) => {
		const tempDep = { ...payment, [key]: value };
		setpayment(tempDep);
	};

	const [validated, setValidated] = useState(false);
	const [inValidDigits, setInValidDigits] = useState(false);

	const handleSubmit = (event) => {
		event.preventDefault();
		event.stopPropagation();
		const form = event.currentTarget;
		validateExpiryDate();
		if (
			form.checkValidity() &&
			!calenderValidationError &&
			validateExpiryDate()
		)
			props.handleSubmit(payment, card.id);
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

	return (
		<Modal
			{...props}
			dialogClassName="modal-80w"
			aria-labelledby="contained-modal-title-vcenter"
			centered
			dialogClassName="payment_add_modal"
		>
			<Modal.Header closeButton={false}>
				<Modal.Title
					id="contained-modal-title-vcenter"
					className="delete__title mx-auto d-flex flex-column justify-content-center align-items-center"
				>
					<img width={45} src={deleteIcon} />
					<div>Delete Payment method</div>
				</Modal.Title>
				<img alt="Close" src={close} onClick={props.onHide} />
			</Modal.Header>
			<Modal.Body>
				<div className="w-100 container">
					<Row>
						<Col sm={12} className="m-auto">
							<div className="delete__description">
								Deleting the payment method will remove it from
								transactions it is mapped to. Are you sure you
								want to continue?
							</div>

							<Modal.Footer className="pr-0">
								<Button variant="link" onClick={closeModal}>
									Cancel
								</Button>
								<Button
									variant="primary"
									type="submit"
									className="mr-0"
									onClick={props.onDelete}
								>
									Delete
								</Button>
							</Modal.Footer>
						</Col>
					</Row>
				</div>
			</Modal.Body>
		</Modal>
	);
}
