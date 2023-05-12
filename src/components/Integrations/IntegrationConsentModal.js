import React, { useState } from "react";
import { Button, Modal, Tab, Tabs } from "react-bootstrap";
import PropTypes from "prop-types";
import exchange from "./exchangeArrow.svg";
import zluri from "../../assets/zluri-logo.svg";
import "./IntegrationConsentModal.css";
import SelfConnect from "./SelfConnect.js";
import ToCoWorker from "./ToCoWorker.js";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";

export function IntegrationConsentModal(props) {
	const { partner } = useContext(RoleContext);
	const { integration } = props;
	const { integration_permissions } = integration;

	const imageSize = {
		width: "40px",
	};

	const anchorTermsAndCondition = {
		color: "#717171",
		textDecoration: "underline",
	};

	const termsAndCondition = {
		fontSize: "10px",
		color: "#717171",
		lineHeight: "13px",
	};

	const [key, setKey] = useState("self");

	return (
		<Modal
			show={props.show}
			onHide={props.onHide}
			backdrop="static"
			keyboard={false}
			centered
		>
			<Modal.Header
				className="d-flex flex-column border-bottom-0 pt-3 pb-2 px-4"
				style={{ backgroundColor: "#EBEBEB" }}
			>
				<button
					type="button"
					className="close consent-modal__close mr-1"
					onClick={props.onHide}
				>
					<span aria-hidden="true">&times;</span>
				</button>
				<Modal.Title className="px-4 mt-2 mb-2">
					<div className="ml-4 mr-4 mb-2 d-flex">
						<div className="m-auto">
							<img
								className="ml-auto"
								style={imageSize}
								src={zluri}
							></img>
							<img className="ml-2 mr-2" src={exchange}></img>
							<img
								className="mr-auto"
								style={imageSize}
								src={integration.integration_logo_url}
							></img>
						</div>
					</div>
					Connect {partner?.name} with{" "}
					<span style={{ textTransform: "capitalize" }}>
						{integration.integration_name}
					</span>
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Tabs
					activeKey={key}
					onSelect={(k) => setKey(k)}
					className="tabsStyling mt-2 mb-3"
				>
					<Tab eventKey="self" title="Connect it myself">
						<SelfConnect
							integration={integration}
							setKey={setKey}
						/>
					</Tab>
					<Tab eventKey="coWorker" title="Send to a Co-worker">
						<ToCoWorker
							id={props.integrationID}
							handleIntegrationRequested={
								props.handleIntegrationRequested
							}
							isLoading={props.loadingInviteToCoworker}
							showErrorInSendingInvite={
								props.showErrorInSendingInvite
							}
						></ToCoWorker>
					</Tab>
				</Tabs>
			</Modal.Body>
			{key == "self" ? (
				<Modal.Footer className="justify-content-center">
					<div className="mx-3 mb-2" style={termsAndCondition}>
						Read our{" "}
						<a
							target="_blank"
							rel="noreferrer"
							style={anchorTermsAndCondition}
							href="https://www.zluri.com/privacy-policy/"
						>
							privacy policy
						</a>{" "}
						&{" "}
						<a
							target="_blank"
							rel="noreferrer"
							style={anchorTermsAndCondition}
							href="https://www.zluri.com/zluri-app-terms-of-service/"
						>
							terms of service
						</a>{" "}
						for more information
					</div>
					<Button
						size="lg"
						className="z-btn-primary z-btn--wide mt-3"
						variant="primary"
						onClick={props.onSubmit}
					>
						Connect
					</Button>
				</Modal.Footer>
			) : null}
		</Modal>
	);
}

IntegrationConsentModal.propTypes = {
	show: PropTypes.bool.isRequired,
	integration: PropTypes.object.isRequired,
	onSubmit: PropTypes.func.isRequired,
	onHide: PropTypes.func.isRequired,
};
