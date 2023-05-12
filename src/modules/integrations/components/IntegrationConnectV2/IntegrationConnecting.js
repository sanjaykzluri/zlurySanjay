import { Loader } from "common/Loader/Loader";
import React from "react";
import { Card, Spinner } from "react-bootstrap";
import { Button } from "UIComponents/Button/Button";
import errorInt from "../../../../assets/error-int.svg";
import questionMark from "../../../../assets/question-mark.svg";

export function IntegrationConnecting({ onHide, integration }) {
	return (
		<div className="d-flex flex-fill justify-content-center mt-8">
			<div className="z_i_connect_modal_req_coworker_container">
				<Card>
					<Card.Body>
						<div align="center" className="px-5 py-4 my-8">
							<div>
								<Spinner
									animation="border"
									role="status"
									variant="primary"
									size="lg"
									className="ml-2"
									style={{ borderWidth: 2 }}
								>
									<span className="sr-only">Loading...</span>
								</Spinner>
							</div>
							<div className="font-15 bold-600 mb-2">
								Connection in progress..
							</div>
							A new window has been opened for you to authorise
							this connection
						</div>
					</Card.Body>
				</Card>
			</div>
		</div>
	);
}
