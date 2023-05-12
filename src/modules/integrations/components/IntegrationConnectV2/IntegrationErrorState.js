import { updateStep } from "common/Stepper/redux";
import React from "react";
import { Card } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { Button } from "UIComponents/Button/Button";
import errorInt from "../../../../assets/error-int.svg";
import questionMark from "../../../../assets/question-mark.svg";

export function IntegrationError({ onHide, errorMessage, onRetry }) {
	return (
		<div className="d-flex flex-fill justify-content-center mt-4">
			<div
				style={{ minHeight: "600px", minWidth: "530px" }}
				className="z_i_connect_modal_req_coworker_container"
			>
				<Card>
					<Card.Body>
						<div align="center" className="px-5 py-4">
							<img src={errorInt} />
							<div className="font-15 bold-600 mb-2">
								{errorMessage}
							</div>
							Couldn't connect with the integration.
						</div>
						<div className="py-1 font-13">Help Articles</div>
						<hr />
						<div
							className="flex"
							style={{
								flexDirection: "column",
								alignItems: "flex-start",
								textAlign: "left",
							}}
						>
							<a
								style={{
									backgroundColor: "rgba(245, 246, 249, 1)",
								}}
								target="_blank"
								rel="noreferrer"
								href="https://help.zluri.com/en/articles/6341724-how-to-add-another-instance-of-the-integration"
								className="mb-2 p-2 w-100"
							>
								<img
									width="15px"
									className="mx-1"
									src={questionMark}
								/>
								How to add another instance of an integration?
							</a>
							<a
								style={{
									backgroundColor: "rgba(245, 246, 249, 1)",
								}}
								className="mb-2 p-2 w-100"
								target="_blank"
								rel="noreferrer"
								href="https://help.zluri.com/en/articles/6341728-how-to-connect-an-integration
"
							>
								<img
									width="15px"
									className="mx-2"
									src={questionMark}
								/>
								How to connect to an integration?
							</a>
							<a
								style={{
									backgroundColor: "rgba(245, 246, 249, 1)",
								}}
								className="mb-2 p-2 w-100"
								target="_blank"
								rel="noreferrer"
								href="https://help.zluri.com/en/articles/6341731-how-to-find-recommended-integrations"
							>
								<img
									width="15px"
									className="mx-1"
									src={questionMark}
								/>
								Where to find recommended integrations?
							</a>
						</div>
					</Card.Body>
					<Button
						className="z-button-primary px-4 mb-5"
						size="lg"
						style={{ width: "30%", margin: "auto" }}
						onClick={() => {
							onRetry();
						}}
					>
						Retry
					</Button>
				</Card>
			</div>
		</div>
	);
}
