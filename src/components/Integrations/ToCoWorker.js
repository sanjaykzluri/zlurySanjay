import { Form, Button } from "react-bootstrap";
import React, { useState, useCallback } from "react";
import "./IntegrationConsentModal.css";
import { Loader } from "../../common/Loader/Loader";
import warning from "../Onboarding/warning.svg";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";
// import {requestCoWorker} from '../../services/api/onboarding';

function ToCoWorker(props) {
	const { partner } = useContext(RoleContext);

	const defaultCoWorker = {
		name: "",
		email: "",
		message: `Hi , I was trying to set up ${partner?.name} for our organization. It needs authorisation from the SSO administrator. Can you please help me with this?`,
	};

	const [coWorker, setCoWorker] = useState({ ...defaultCoWorker });
	const [validated, setValidated] = useState(false);
	const [toggle, setToggle] = useState(false);

	const handleEdit = (key, value) => {
		let coWorkerObj = { ...coWorker, [key]: value };
		if (key == "name") {
			coWorkerObj.message = coWorker.message.replace(
				/Hi [a-zA-Z0-9_ -!@#$&()\-\`\'\;\:\[\]\|\\.+/\"\=]*,*/,
				`Hi ${value},`
			);
			setToggle(!toggle);
		}
		setCoWorker(coWorkerObj);
	};

	const handleSubmit = (event) => {
		const form = event.currentTarget;
		if (form.checkValidity() === false) {
			event.preventDefault();
			event.stopPropagation();
		} else {
			props.handleIntegrationRequested(coWorker);
			event.preventDefault();
			event.stopPropagation();
		}
		setValidated(true);
	};

	return (
		<div className="m-auto consentScreenWidth">
			<p style={{ fontSize: "12px" }} className="textColor">
				Enter a coworker’s email and we’ll send them everything they
				need to complete this step.
			</p>
			<Form validated={validated} onSubmit={handleSubmit}>
				<Form.Group controlId="name">
					<Form.Label>Name</Form.Label>
					<Form.Control
						type="text"
						placeholder="Name"
						onChange={(e) => handleEdit("name", e.target.value)}
						required
					/>
				</Form.Group>
				<Form.Group controlId="email">
					<Form.Label>Email</Form.Label>
					<Form.Control
						type="email"
						placeholder="Email"
						onChange={(e) => handleEdit("email", e.target.value)}
						required
					/>
				</Form.Group>
				<Form.Group controlId="message">
					<Form.Label>Message</Form.Label>
					<Form.Control
						key={toggle}
						as="textarea"
						rows={3}
						defaultValue={coWorker.message}
						onChange={(e) => handleEdit("message", e.target.value)}
						required
					/>
				</Form.Group>
				<Button
					variant="primary"
					type="submit"
					size="lg"
					className="btn btn-link d-flex align-items-center mt-4 mb-4 ml-auto mr-auto p-0"
					style={{ width: "40%", height: "40px" }}
				>
					<div className="d-flex align-items-center m-auto">
						{props.isLoading ? (
							<Loader height={40} width={40} />
						) : props.showErrorInSendingInvite ? (
							<img
								src={warning}
								alt="failed"
								className="mr-2"
							></img>
						) : null}
						<div style={{ fontSize: "13px", color: "#FFFFFF" }}>
							Send
						</div>
					</div>
				</Button>
			</Form>
		</div>
	);
}

export default ToCoWorker;
