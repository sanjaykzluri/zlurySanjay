import React from "react";
import { Card } from "react-bootstrap";
import { Button } from "UIComponents/Button/Button";
import successInt from "../../../../assets/success-int.svg";

export function IntegrationComplete({ onHide, integration, requestSentData }) {
	return (
		<div className="d-flex flex-fill justify-content-center mt-4">
			<div
				align="center"
				className="z_i_connect_modal_req_coworker_container"
			>
				<Card>
					<Card.Body>
						<div className="px-5 py-4">
							<img src={successInt} />
							<div className="font-15 bold-600 mb-2">
								Request sent
							</div>
							{`A mail has been sent to ${requestSentData?.to_email}  with the
							instructions complete this connection`}
						</div>
					</Card.Body>
					<Button
						className="z-button-primary px-4 mb-4"
						size="lg"
						style={{ width: "30%", margin: "auto" }}
						onClick={() => onHide(false)}
					>
						Close
					</Button>
				</Card>
			</div>
		</div>
	);
}
