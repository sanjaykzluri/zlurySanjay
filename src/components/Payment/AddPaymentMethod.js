import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Modal, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import "./AddBankAccount.css";
import close from "../../assets/close.svg";
import dddown from "./dddown.svg";
import paymenticon from "./paymenticon.svg";
import { uploadImage } from "../../services/upload/upload";
import { useDispatch, useSelector } from "react-redux";
import { SUPPORTED_IMAGE_FORMATS } from "../../constants/upload";
import { currencyOptions } from "../../constants/currency";
export function AddPaymentMethod(props) {
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
	const initialPaymentDetails = {
		type: "other",
		logo_url: null,
		details: {},
	};
	const [payment, setPayment] = useState(initialPaymentDetails);
	const [ddactive, setddactive] = useState(false);
	const [ddvalue, setddvalue] = useState(currencies[0].name);
	const [uploadInProgress, setUploadInProgress] = useState(false);
	const [validated, setValidated] = useState(false);
	const [displayLogoError, setDisplayLogoError] = useState(false);
	const handleInput = (event) => {
		setddvalue(event.target.value);
	};
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const handlePaymentDetailsEdit = (key, value) => {
		const tempDep = { ...payment };
		tempDep.details = { ...tempDep.details, [key]: value };
		setPayment(tempDep);
	};

	const handlePaymentEdit = (key, value) => {
		value = value?.trimStart();
		const tempDep = { ...payment, [key]: value };
		setPayment(tempDep);
	};

	const handlePaymentMethodLogoChange = (e) => {
		let file = e.target.files[0];

		setUploadInProgress(true);
		uploadImage(file)
			.then((res) => {
				setUploadInProgress(false);
				setDisplayLogoError(false);
				handlePaymentEdit("logo_url", res.resourceUrl);
			})
			.catch((err) => {
				setUploadInProgress(false);
				console.error("Error uploading image:", err);
			});
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		event.stopPropagation();
		const form = event.currentTarget;

		if (!payment.logo_url) {
			setDisplayLogoError(true);
			return;
		}

		if (form.checkValidity()) props.handleSubmit(payment);
		setValidated(true);
	};

	const handleClose = () => {
		setValidated(false);
		setDisplayLogoError(false);
		setPayment(initialPaymentDetails);
		props.onHide();
	};

	useEffect(() => {
		//Segment Implementation for Add-Other-Payment-Method
		if (props.show) {
			window.analytics.page(
				"Transactions",
				"Payment-Methods; Add-Other-Payment-Method",
				{
					orgId: orgId || "",
					orgName: orgName || "",
				}
			);
		}
	}, [props.show]);

	return (
		<Modal
			{...props}
			onHide={handleClose}
			dialogClassName="modal-90w payment_add_modal"
			centered
		>
			<div className="addBA__cont">
				<div className="addBA__cont__d1">
					<div className="addBA__cont__d1__d1">
						Add Payment Method
					</div>
					<img
						className="cursor-pointer"
						src={close}
						onClick={handleClose}
					></img>
				</div>
				<hr style={{ margin: "0px 10px" }}></hr>
				<Form noValidate validated={validated} onSubmit={handleSubmit}>
					<Form.Group
						className="addBA__cont__d2"
						controlId="PaymentMethodName"
					>
						<Form.Label>Payment Method Name</Form.Label>
						<Form.Control
							required
							type="text"
							placeholder="Payment Name"
							value={payment.name}
							onChange={(e) =>
								handlePaymentEdit("name", e.target.value)
							}
						/>
						<Form.Control.Feedback type="invalid">
							Please enter the payment method name
						</Form.Control.Feedback>
					</Form.Group>

					<div className="addBA__bottomcont">
						<div className="mb-4">
							<label>Payment Method Logo</label>
							<div className="addPM__d1 w-100">
								<div className="logo-container position-relative">
									{uploadInProgress && (
										<div className="preview-loader">
											<Spinner
												animation="border"
												variant="secondary"
											/>
										</div>
									)}
									{payment.logo_url ? (
										<img
											src={payment.logo_url}
											width="54"
										/>
									) : (
										<div className="addPM__PI">
											<img src={paymenticon}></img>
										</div>
									)}
								</div>
								<label className="cursor-pointer mb-0 ml-4">
									<input
										type="file"
										accept={SUPPORTED_IMAGE_FORMATS.toString()}
										disabled={uploadInProgress}
										onChange={handlePaymentMethodLogoChange}
									/>
									Add Icon
								</label>
							</div>
							{displayLogoError && (
								<>
									<div className="invalid-feedback d-inline">
										Please upload logo.
									</div>
								</>
							)}
						</div>
						<div className="mb-4">
							<Form.Label>Default Currency</Form.Label>
							<Form.Control
								as="select"
								defaultValue={currency}
								custom
								onChange={(e) =>
									handlePaymentDetailsEdit(
										"currency",
										e.target.value
									)
								}
							>
								{currencyOptions}
							</Form.Control>
						</div>
					</div>
					<hr style={{ margin: "0px 10px" }}></hr>
					<Modal.Footer className="addBA__buttons">
						<Button
							variant="link"
							onClick={handleClose}
							className="btn btn-link btn-sm"
						>
							Close
						</Button>
						<Button
							variant="primary"
							type="submit"
							className="z-btn-primary py-2 px-3 ml-3"
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
									<span className="sr-only">Loading...</span>
								</Spinner>
							) : (
								"Add Payment Method"
							)}
						</Button>
					</Modal.Footer>
				</Form>
			</div>
		</Modal>
	);
}

AddPaymentMethod.propTypes = {
	submitting: PropTypes.bool,
};
