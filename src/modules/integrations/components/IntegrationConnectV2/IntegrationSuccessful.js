import React, { useEffect, useState } from "react";
import {
	Accordion,
	Card,
	OverlayTrigger,
	Spinner,
	Tooltip,
	useAccordionToggle,
} from "react-bootstrap";
import { Button } from "UIComponents/Button/Button";
import successInt from "../../../../assets/success-int.svg";
import browserIcon from "../../../../assets/browser.svg";
import collapsedICon from "../../../../assets/collapsed_icon_log.svg";
import downArrowIcon from "../../../../assets/arrowdropdown.svg";
import "./Sidebar/sidebar.css";
import { TriggerIssue } from "utils/sentry";
import { editAccountDetails } from "modules/integrations/service/api";
import { capitalizeFirstLetter } from "utils/common";
import { entityImageMapper } from "../scopeDetailCard";
import { useDispatch } from "react-redux";
import {
	resetInstances,
	resetIntegration,
} from "modules/integrations/redux/integrations";
import warning from "assets/warning.svg";
import { ContextAwareToggle } from "./ContextAwareToggle";

export function IntegrationSuccesful({
	onHide,
	integration,
	orgIntegrationName,
	orgIntegrationId,
	orgIntegrationDescription: intDescription,
	features,
	defaultScopes,
	setIntegrationSuccess,
	callbackOnboardingPageOnSuccess,
	adminData,
	adminView,
}) {
	const [orgIntegrationDescription, setOrgIntegrationDescription] =
		useState(intDescription);
	const [integrationName, setIntegrationName] = useState(orgIntegrationName);
	const [failedToSaveAccountMsg, setFailedToSaveAccountMsg] = useState();
	const [isAccountSaving, setIsAccountSaving] = useState(false);
	const [scopeFeatures, setScopeFeatures] = useState([...features]);
	const [scopeEntities, setScopeEntities] = useState([]);
	const dispatch = useDispatch();

	useEffect(() => {
		setIntegrationName(orgIntegrationName);
	}, [orgIntegrationName]);

	useEffect(() => {
		let featureList = new Set();
		let entityList = new Set();
		defaultScopes?.forEach((scope) => {
			featureList.add(...scope.feature);
			entityList = new Set(
				scope.entity_unique_name?.concat([...entityList])
			);
		});

		setScopeFeatures([...featureList]);
		setScopeEntities([...entityList]);
	}, [defaultScopes]);

	function handleOnChange(e) {
		setOrgIntegrationDescription(e.target.value);
	}

	const saveAccountInfo = (account) => {
		setIsAccountSaving(true);
		try {
			editAccountDetails(
				orgIntegrationId, // need to send right id here
				account,
				adminData?.code
			).then((res) => {
				if (res?.success) {
					setFailedToSaveAccountMsg();
					onHide && onHide();
					setIntegrationSuccess && setIntegrationSuccess(true);
					callbackOnboardingPageOnSuccess &&
						callbackOnboardingPageOnSuccess();
					dispatch(resetIntegration());
					dispatch(resetInstances());
				} else {
					setFailedToSaveAccountMsg(
						res?.error?.response?.data?.error || "some issue"
					);
				}
				setIsAccountSaving(false);
			});
		} catch (error) {
			setIsAccountSaving(false);
			setFailedToSaveAccountMsg("some issue");
			TriggerIssue("Error when editing orgIntegration details", error);
		}
	};

	return (
		<div className="d-flex flex-fill justify-content-center mt-4">
			<div className="z_i_connect_modal_req_coworker_container">
				<Card>
					<Card.Body>
						<div align="center" className="px-5 py-4">
							<img src={successInt} />
							<div className="font-15 bold-600 mb-2">
								Connection successful
							</div>
							The sync for this connection has started. This may
							take 24 to 48 hours.
						</div>
						<div
							style={{
								backgroundColor: "#FCFCFD",
								border: "1px solid #EBEBEB",
							}}
							className="p-2"
						>
							<Accordion key={1}>
								<div className="font-13">
									<div
										style={{
											justifyContent: "space-between",
										}}
										className="flex p-2"
									>
										<div>
											You've enabled the following
											features with this connection
										</div>
										<div>
											<ContextAwareToggle
												eventKey={1}
											></ContextAwareToggle>
										</div>
									</div>

									<Accordion.Collapse eventKey={1}>
										<div
											style={{
												flexWrap: "wrap",
												justifyContent: "space-between",
											}}
											className="flex p-2"
										>
											<div style={{ width: "45%" }}>
												<div
													style={{
														textAlign: "left",
													}}
													className="color-gray-2"
												>
													{" "}
													FEATURES
												</div>
												<div className="flex">
													{Array.isArray(
														scopeFeatures
													) &&
														scopeFeatures.length >
															0 &&
														Array.from(
															scopeFeatures
														).map((feature) => (
															<div
																style={{
																	backgroundColor:
																		"rgba(113, 90, 255, 0.1)",
																	width: "auto",
																	height: "18px",
																	borderRadius:
																		"5px",
																	textAlign:
																		"center",
																	lineHeight:
																		"1.6",
																	color: "rgba(113, 90, 255, 1)",
																}}
																className=" px-2 mr-2 font-11"
															>
																{capitalizeFirstLetter(
																	feature
																)}
															</div>
														))}
												</div>
											</div>
											<div style={{ width: "50%" }}>
												<div className="flex color-gray-2">
													{" "}
													ENTITIES
												</div>
												<div className="flex">
													{Array.isArray(
														scopeEntities
													) &&
														scopeEntities.length >
															0 &&
														Array.from(
															scopeEntities
														).map((entity) => (
															<div className="px-1">
																<OverlayTrigger
																	placement="top"
																	overlay={
																		<Tooltip
																			className={
																				""
																			}
																		>
																			{capitalizeFirstLetter(
																				entity
																			)}
																		</Tooltip>
																	}
																>
																	<img
																		src={
																			entityImageMapper[
																				entity
																			] ||
																			browserIcon
																		}
																		height="12px"
																	/>
																</OverlayTrigger>
															</div>
														))}
												</div>
											</div>
										</div>
									</Accordion.Collapse>
								</div>
							</Accordion>
						</div>
						<div
							style={{
								backgroundColor: "#FCFCFD",
								border: "1px solid #EBEBEB",
							}}
							className="p-2"
						>
							<div
								align="center"
								className="font-13 bold-600 mb-2"
							>
								Connection Details
							</div>
							<div className="p-2">
								<div
									style={{
										justifyContent: "space-between",
									}}
									className="flex"
								>
									<div>
										<label className="font-12 grey ">
											Connection Name
										</label>
									</div>
									{/* <div>
										<img src={editIcon} />
									</div> */}
								</div>
								{/* {manualTaskForm.description.error && (
									<p className="font-12 mt-1 red">
										{
											manualTaskForm.description
												.error_message
										}
									</p>
								)} */}
								<input
									className="p-2 mb-2 w-100"
									name="name"
									type="text"
									placeholder="Connection Name"
									value={integrationName}
									// value={manualTaskForm.description.value}
									onChange={(e) =>
										setIntegrationName(e.target.value)
									}
								/>
							</div>

							<div className="p-2">
								{/* <div
									style={{
										justifyContent: "space-between",
									}}
									className="flex"
								>
									<div>
										<label className="font-12 grey ">
											Description
										</label>
									</div>
									<div>
										<img src={editIcon} />
									</div>
								</div> */}

								{/* {manualTaskForm.description.error && (
									<p className="font-12 mt-1 red">
										{
											manualTaskForm.description
												.error_message
										}
									</p>
								)} */}
								<input
									className="p-2 mb-2 w-100"
									name="description"
									type="text"
									placeholder="Description (Optional)"
									value={orgIntegrationDescription}
									onChange={(e) =>
										setOrgIntegrationDescription(
											e.target.value
										)
									}
								/>
								{failedToSaveAccountMsg && (
									<div className="d-flex warningMessage w-100 p-2 mb-3">
										<img src={warning} />
										<div className="font-12 ml-1">
											We could not save your info due to{" "}
											{failedToSaveAccountMsg}. Please try
											again.
										</div>
									</div>
								)}
							</div>
						</div>
					</Card.Body>
					<Button
						className="z-button-primary px-4 mb-2"
						size="lg"
						style={{ width: "30%", margin: "auto" }}
						onClick={() =>
							saveAccountInfo({
								accountName:
									integrationName || orgIntegrationName,
								accountDescription: orgIntegrationDescription,
							})
						}
						disabled={isAccountSaving || !integrationName?.length}
					>
						{isAccountSaving && (
							<Spinner
								animation="border"
								role="status"
								variant="light"
								size="sm"
								className="mr-1"
								style={{
									borderWidth: 2,
									width: "13px",
									height: "13px",
								}}
							>
								<span className="sr-only"></span>
							</Spinner>
						)}
						Save
					</Button>
					<div className="privilige-warning d-flex justify-content-center font-10 min-width-409 align-items-center mt-3">
						<span className="color-gray-2">
							Is the sync taking longer than expected?
						</span>
					</div>
					<a
						href="https://help.zluri.com"
						target="_blank"
						rel="noreferrer"
						className="btn btn-link btn-sm text-decoration-none text-glow ml-0 font-10 p-0 m-2"
					>
						Contact Support
					</a>
				</Card>
			</div>
		</div>
	);
}
