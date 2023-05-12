import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spinner } from "react-bootstrap";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import arrowdropdown from "assets/arrowdropdown.svg";
import rightarrow from "assets/users/rightarrow.svg";

const IntegrationAccounts = ({
	workflow,
	integrationsDetails,
	application,
	onOrgIngChange,
	isLoadingIntegrations,
	isAddingIntegration,
	isEditing,
	isDeleting,
	applicationId,
	handleIntegrationChange,
}) => {
	const dispatch = useDispatch();

	const integrationAccounts = useSelector(
		(state) => state.workflows.integrationAccounts
	);
	const [allIntegrations, setAllIntegrations] = useState();

	useEffect(() => {
		if (integrationAccounts) {
			const integrations = integrationAccounts[applicationId];
			const availableIntegrations = integrations?.filter(
				(integration) => integration?.available
			);
			setAllIntegrations(availableIntegrations);
		}
	}, [integrationAccounts, applicationId]);

	return (
		<>
			{allIntegrations && !application.isGrouped ? (
				<div
					style={{ maxWidth: "300px" }}
					className="d-inline-block mr-2"
				>
					{allIntegrations &&
					Array.isArray(allIntegrations) &&
					allIntegrations?.length > 0 ? (
						<>
							{!isEditing ? (
								<div
									className="d-flex align-items-center"
									style={{
										height: "34px",
										padding: "0 8px",
										borderColor: "#dddddd !important",
									}}
								>
									<div
										style={{
											maxWidth: "200px",
											textAlign: "end",
										}}
										className="font-12 primary-color ml-1"
									>
										{application?.orgIntegrationName ||
											"Select Integration"}
									</div>
									<img
										alt=""
										src={arrowdropdown}
										style={{ marginLeft: "8px" }}
									/>
								</div>
							) : (
								<Dropdown
									isParentDropdown={true}
									toggler={
										<div
											className="d-flex align-items-center"
											style={{
												height: "34px",
												padding: "0 8px",
												borderColor:
													"#dddddd !important",
											}}
										>
											<div
												style={{
													maxWidth: "200px",
													textAlign: "end",
												}}
												className="font-12 primary-color ml-1"
											>
												{application?.orgIntegrationName ||
													"Select Integration"}
											</div>
											<img
												alt=""
												src={arrowdropdown}
												style={{ marginLeft: "8px" }}
											/>
										</div>
									}
									top={35}
									right={0}
									options={allIntegrations || []}
									optionFormatter={(option) => (
										<Dropdown
											top={0}
											localSearch
											localSearchKey="name"
											toggler={
												<div
													className="d-flex align-items-center"
													style={{
														minHeight: "34px",
														width: "auto",
													}}
												>
													<div
														style={{
															maxWidth: "150px",
														}}
														className="d-flex align-items-center font-12"
													>
														{
															option?.integration
																?.integration_name
														}
													</div>
													<img
														alt=""
														src={rightarrow}
														style={{
															marginLeft: "8px",
														}}
													/>
												</div>
											}
											options={
												option?.accounts?.length
													? option?.accounts
													: []
											}
											optionFormatter={(option) => {
												return option?.name;
											}}
											onOptionSelect={(option) => {
												handleIntegrationChange(option);
											}}
											optionStyle={{
												padding: "0px !important",
												flexDirection: "column",
												alignItems: "flex-start",
												paddingTop: "6px",
												paddingBottom: "6px",
												justifyContent: "center",
											}}
											menuStyle={{
												width: "200px",
												left: "-216px",
											}}
										/>
									)}
									menuStyle={{
										overflow: "unset",
										width: "180px",
									}}
									optionStyle={{ padding: "0px !important" }}
								/>
							)}
						</>
					) : integrationsDetails?.available ? (
						<span className="font-12 primary-color  mr-2">
							Integration Available
						</span>
					) : (
						<span className="font-12 grey-1 mr-2">
							No Integration Available
						</span>
					)}
				</div>
			) : workflow.isExecuted ? (
				<span className="font-12 primary-color  mr-2">
					{application?.orgIntegrationName}
				</span>
			) : (
				isEditing &&
				isLoadingIntegrations &&
				!isDeleting && (
					<Spinner
						className="mr-2 blue-spinner action-edit-spinner"
						animation="border"
					/>
				)
			)}
		</>
	);
};

export default IntegrationAccounts;
