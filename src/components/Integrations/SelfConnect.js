import { Accordion, Card, Badge } from "react-bootstrap";
import React from "react";
import check from "./greenTick.svg";
import caret from "./caret.svg";
import "./IntegrationConsentModal.css";
import { Link } from "react-router-dom";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";

function SelfConnect(props) {
	const { partner } = useContext(RoleContext);

	const badge = {
		fontSize: "10px",
		lineHeight: "13px",
		opacity: "0.5",
		border: "0.5px solid #DDDDDD",
		fontWeight: "normal",
		padding: "2px 5px",
		height: "fit-content",
	};

	function getConditionsElement(text, permission, description, uniqueKey) {
		var isDisabled; //Will be used when we have edit for input tag

		if (permission == "read only") {
			isDisabled = true;
		} else if (permission == "read and write") {
			isDisabled = false;
		}

		return (
			<Card
				style={{ borderBottom: "0.5px solid #EBEBEB" }}
				className="border-left-0 border-top-0 border-right-0"
			>
				<Card.Header
					style={{ padding: "0" }}
					className="bg-white border-0"
				>
					<Accordion.Toggle
						style={{
							color: "#484848",
							fontSize: "13px",
							border: "0",
							padding: "16px 12px",
							cursor: "pointer",
						}}
						as={Card.Header}
						className="bg-white d-flex"
						variant="link"
						eventKey={uniqueKey}
					>
						<img className="mr-2" src={check}></img>
						{text}
						<div className="ml-auto mt-auto mb-auto">
							<Badge
								className="ml-1 mr-1 textColor"
								style={badge}
								pill
								variant="light"
							>
								{permission}
							</Badge>
						</div>
						<img className="ml-1" src={caret}></img>
					</Accordion.Toggle>
				</Card.Header>
				<Accordion.Collapse eventKey={uniqueKey}>
					<Card.Body className="ml-2 pl-4 textColor pt-2">
						{description}
					</Card.Body>
				</Accordion.Collapse>
			</Card>
		);
	}

	return (
		<div style={{ fontSize: "12px" }} className="m-auto consentScreenWidth">
			<p style={{ fontSize: "12px" }} className="mb-4 textColor">
				You <b>need Admin access</b> to connect with{" "}
				{props.integration.integration_name}.{" "}
				<div
					onClick={() => props.setKey("coWorker")}
					className="btn btn-link"
					style={{ fontSize: "inherit", display: "contents" }}
				>
					Don’t have admin privileges?
				</div>
			</p>
			<div>
				<p
					style={{ fontSize: "14px", fontWeight: "500" }}
					className="mb-0"
				>
					{partner?.name} would like to:
				</p>
				<Accordion style={{ maxHeight: "30vh", overflow: "scroll" }}>
					{props.integration?.integration_permissions?.map(
						(permission, index) =>
							getConditionsElement(
								permission.title,
								permission.scope,
								permission.description,
								String(index)
							)
					)}
				</Accordion>
			</div>
		</div>
	);
}

export default SelfConnect;
