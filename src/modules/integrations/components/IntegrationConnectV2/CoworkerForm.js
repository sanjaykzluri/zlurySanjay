import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { IntegrationRequestCoworker } from "../../containers/IntegrationRequestCoworker/IntegrationRequestCoworker";

export function CoworkerForm({
	onRequestSent,
	integration,
	onConnectionSuccessfull,
	showOnlyForm = false,
	selectedScopes,
	fixedScopes,
	orgIntegrationId,
}) {
	let [fixedScopeValues, setFixedScopeValues] = useState([]);
	useEffect(() => {
		let scopes = [];

		if (fixedScopes?.length) {
			fixedScopes.map((scope) =>
				scopes.push(scope.integration_scope_value)
			);
		}
		setFixedScopeValues(scopes);
	}, [fixedScopes]);

	return (
		<div className="d-flex flex-fill justify-content-center">
			<div className="z_i_connect_modal_req_coworker_container">
				{showOnlyForm ? (
					<IntegrationRequestCoworker
						onRequestSent={(data) => {
							onRequestSent(data);
						}}
						onConnectionSuccessfull={onConnectionSuccessfull}
						integration={integration}
						scopes={
							selectedScopes.length > 0
								? selectedScopes
								: fixedScopeValues
						}
						addScopesToOrgID={orgIntegrationId}
					/>
				) : (
					<Card>
						<Card.Header>
							<div
								style={{
									backgroundColor: "rgba(248, 249, 251, 1)",
								}}
								className="d-flex align-items-center font-16 bold-500"
							>
								Send connection request to a co-worker
							</div>
						</Card.Header>
						<Card.Body>
							<IntegrationRequestCoworker
								onRequestSent={(data) => {
									onRequestSent(data);
								}}
								onConnectionSuccessfull={
									onConnectionSuccessfull
								}
								integration={integration}
								scopes={selectedScopes}
								addScopesToOrgID={orgIntegrationId}
							/>
						</Card.Body>
					</Card>
				)}
			</div>
		</div>
	);
}
