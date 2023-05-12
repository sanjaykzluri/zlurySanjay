import React, { useEffect, useState } from "react";
import { Modal, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import "./AddBankAccount.css";
import close from "../../assets/close.svg";
import dddown from "./dddown.svg";
import paymenticon from "./paymenticon.svg";
import { useDispatch, useSelector } from "react-redux";
import { currencyOptions } from "../../constants/currency";
import { SUPPORTED_IMAGE_FORMATS } from "../../constants/upload";
import { uploadImage } from "../../services/upload/upload";
import { unescape } from "../../utils/common";

export function EditOther(props) {
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
	const [payment, setpayment] = useState({
		type: "other",
		details: {},
	});
	const [ddactive, setddactive] = useState(false);
	const [validated, setValidated] = useState(false);
	const [ddvalue, setddvalue] = useState(currencies[0].name);
	const [uploadInProgress, setUploadInProgress] = useState(false);
	const handleInput = (event) => {
		setddvalue(event.target.value);
	};
	const handleEdit = (key, value) => {
		const tempDep = { ...payment };
		tempDep.details = { ...tempDep.details, [key]: value };
		setpayment(tempDep);
	};
	const handleEdit2 = (key, value) => {
		value = value?.trimStart();
		const tempDep = { ...payment, [key]: value };
		setpayment(tempDep);
	};
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const handleSubmit = (event) => {
		event.preventDefault();
		event.stopPropagation(); /* is this needed? */

		if (payment["name"] !== "") {
			props.handleSubmit(payment, props.card.id);
		}

		setValidated(true);
	};

	useEffect(() => {
		//Segment Implementation for Edit-Other-Payment-Method
		if (props.show) {
			window.analytics.page(
				"Transactions",
				"Payment-Methods; Edit-Other-Payment-Method",
				{
					cardId: props.card?.id,
					cardName: props.card?.name,
					orgId: orgId || "",
					orgName: orgName || "",
				}
			);
		}
	}, [props.show]);

	const handlePaymentMethodLogoChange = (e) => {
		let file = e.target.files[0];

		setUploadInProgress(true);
		uploadImage(file)
			.then((res) => {
				setUploadInProgress(false);
				handleEdit2("logo_url", res.resourceUrl);
			})
			.catch((err) => {
				setUploadInProgress(false);
				console.error("Error uploading image:", err);
			});
	};

	return (
		<Modal
			{...props}
			dialogClassName="modal-90w"
			centered
			dialogClassName="payment_add_modal"
		>
			<div className="addBA__cont">
				<div className="addBA__cont__d1">
					<div className="addBA__cont__d1__d1">
						Edit Payment Method
					</div>
					<img
						className="cursor-pointer"
						src={close}
						onClick={props.onHide}
					></img>
				</div>
				<hr style={{ margin: "0px 10px" }}></hr>
				<div className="addBA__cont__d2">
					<div className="addBA__cont__d2__d1">
						Payment Method Name
					</div>
					<input
						type="text"
						placeholder="Payment Name"
						value={payment["name"]}
						defaultValue={props.card.name}
						onChange={(e) => handleEdit2("name", e.target.value)}
					></input>
				</div>
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
								{payment.logo_url || props.card.logo ? (
									<img
										src={unescape(payment.logo_url || props.card.logo)}
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
					</div>
					<div className="mb-4">
						<Form.Label>Default Currency</Form.Label>
						<Form.Control
							as="select"
							defaultValue={props.card.currency || currency}
							custom
							onChange={(e) =>
								handleEdit("currency", e.target.value)
							}
						>
							{currencyOptions}
						</Form.Control>
					</div>
				</div>
			</div>
			<hr style={{ margin: "0px 10px" }}></hr>
			<div className="addBA__buttons">
				<button
					className="btn btn-link"
					onClick={props.onHide}
					style={{ marginRight: "10px" }}
				>
					Cancel
				</button>
				<Button
					disabled={props.submitInProgress}
					onClick={handleSubmit}
				>
					Edit Payment Method
					{props.submitInProgress && (
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
					)}
				</Button>
			</div>
		</Modal>
	);
}
