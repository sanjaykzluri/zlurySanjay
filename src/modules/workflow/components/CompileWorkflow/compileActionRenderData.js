import { ACTION_TYPE } from "modules/workflow/constants/constant";
import React, { useState } from "react";
import { Accordion, Card, useAccordionToggle } from "react-bootstrap";
import "../ViewPlaybook/ViewPlaybook.css";
import filledDownArrow from "assets/workflow/filled-down-arrow.svg";
import filledRightArrow from "assets/workflow/filled-right-arrow.svg";

const CompileWorkflowActionRenderData = ({ action }) => {
	const manualTaskSelectedData = action && (
		<>
			{action?.action_type === ACTION_TYPE.MANUAL && (
				<>
					{Object.keys(action?.action_data).length > 0 && (
						<Accordion className="pt-2">
							<Card
								style={{
									border: "0px",
									backgroundColor: "#fff",
								}}
							>
								<ContextAwareToggle
									className="border-0 p-0 grey-1"
									style={{
										backgroundColor: "#fff",
										fontSize: "10px",
										fontWeight: "600",
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
									}}
									as={Card.Header}
									variant="link"
									eventKey="0"
								>
									PARAMETERS CONFIGURED
								</ContextAwareToggle>
								<Accordion.Collapse eventKey="0">
									<Card.Body className="p-0">
										{action?.action_data?.title && (
											<div className="d-flex flex-1 align-items-center">
												<span
													style={{
														fontSize: "10px",
														fontWeight: "400",
													}}
													className="grey-1 mr-2"
												>
													{"Title : "}
												</span>
												<span
													style={{
														fontSize: "10px",
														fontWeight: "400",
													}}
													className="grey-1 mr-2"
												>
													{action?.action_data?.title}
												</span>
											</div>
										)}
										{action?.action_data.description && (
											<div className="d-flex flex-1 align-items-center">
												<span
													style={{
														fontSize: "10px",
														fontWeight: "400",
													}}
													className="grey-1 mr-2"
												>
													{"Description : "}
												</span>
												<span
													style={{
														fontSize: "10px",
														fontWeight: "400",
													}}
													className="grey-1 mr-2"
												>
													{
														action?.action_data
															?.description
													}
												</span>
											</div>
										)}
										{action?.action_data.assignee &&
											action?.action_data.assignee
												?.length > 0 && (
												<div className="d-flex flex-1 align-items-center">
													<span
														style={{
															fontSize: "10px",
															fontWeight: "400",
														}}
														className="grey-1 mr-2"
													>
														{"Assignee : "}
													</span>
													{action?.action_data.assignee?.map(
														(item, index) => {
															return (
																<span
																	key={index}
																	style={{
																		fontSize:
																			"10px",
																		fontWeight:
																			"400",
																	}}
																	className="grey-1 mr-2"
																>
																	{item?.user_name ||
																		item?.user_email ||
																		item?.title ||
																		""}
																</span>
															);
														}
													)}
												</div>
											)}
										{action?.dueDateData &&
											action?.dueDateData?.time &&
											action?.dueDateData?.unit &&
											action?.dueDateData?.duration && (
												<div className="d-flex flex-1 align-items-center">
													<span
														style={{
															fontSize: "10px",
															fontWeight: "400",
														}}
														className="grey-1 mr-2"
													>
														{"Due In : "}
													</span>
													<span
														style={{
															fontSize: "10px",
															fontWeight: "400",
														}}
														className="grey-1 mr-2"
													>
														{
															action?.dueDateData
																?.duration
														}
													</span>
												</div>
											)}
									</Card.Body>
								</Accordion.Collapse>
							</Card>
						</Accordion>
					)}
				</>
			)}
		</>
	);

	const getSelectedOption = () => {
		const keys = Object.keys(action?.selected_dynamic_options || {});
		if (keys.length) {
			return action?.selected_dynamic_options[keys[0]];
		}
		return null;
	};

	const integrationSelectedData = action &&
		action?.selected_dynamic_options &&
		Object.keys(action?.selected_dynamic_options).length > 0 &&
		action?.action_type === ACTION_TYPE.INTEGRATION && (
			<>
				{
					<Accordion className="pt-2">
						<Card
							style={{ border: "0px", backgroundColor: "#fff" }}
						>
							<ContextAwareToggle
								className="border-0 p-0 grey-1"
								style={{
									backgroundColor: "#fff",
									fontSize: "10px",
									fontWeight: "600",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
								}}
								as={Card.Header}
								variant="link"
								eventKey="0"
							>
								PARAMETERS CONFIGURED
							</ContextAwareToggle>
							<Accordion.Collapse eventKey="0">
								<Card.Body className="p-0">
									{getSelectedOption() &&
										Object.keys(getSelectedOption()).map(
											(key, index) => (
												<div
													className="d-flex flex-1 align-items-center"
													key={index}
												>
													<span
														style={{
															fontSize: "10px",
															fontWeight: "400",
														}}
														className="grey-1 mr-2"
													>
														{`${key} : `}
													</span>
													<span
														style={{
															fontSize: "10px",
															fontWeight: "400",
														}}
														className="grey-1 mr-2"
													>
														{getSelectedOption()
															? getSelectedOption()[
																	key
															  ]?.option &&
															  getSelectedOption()[
																	key
															  ]?.option.length >
																	0
																? getSelectedOption()[
																		key
																  ]?.option.map(
																		(
																			item,
																			index
																		) => {
																			return (
																				<>
																					{typeof item?.value ===
																					"boolean"
																						? item?.value ===
																						  true
																							? "true"
																							: "false"
																						: item?.[
																								getSelectedOption()?.[
																									key
																								]
																									?.label
																						  ] ||
																						  item?.name ||
																						  item?.value}
																					{index !==
																					getSelectedOption()[
																						key
																					]
																						?.option
																						?.length -
																						1
																						? ", "
																						: ""}
																				</>
																			);
																		}
																  )
																: getSelectedOption()[
																		key
																  ]?.value
															: ""}
													</span>
												</div>
											)
										)}
								</Card.Body>
							</Accordion.Collapse>
						</Card>
					</Accordion>
				}
			</>
		);

	const internalSelectedData = action && (
		<>
			{action?.action_type === ACTION_TYPE.INTERNAL && (
				<>
					{action?.action_data &&
						Object.keys(action?.action_data).length > 0 && (
							<Accordion className="pt-2">
								<Card
									style={{
										border: "0px",
										backgroundColor: "#fff",
									}}
								>
									<ContextAwareToggle
										className="border-0 p-0 grey-1"
										style={{
											backgroundColor: "#fff",
											fontSize: "10px",
											fontWeight: "600",
											cursor: "pointer",
											display: "flex",
											alignItems: "center",
										}}
										as={Card.Header}
										variant="link"
										eventKey="0"
									>
										PARAMETERS CONFIGURED
									</ContextAwareToggle>
									<Accordion.Collapse eventKey="0">
										<Card.Body className="p-0">
											{action?.action_data &&
												Object.keys(
													action?.action_data
												).map((key, index) => (
													<div
														className="d-flex flex-1 align-items-center"
														key={index}
													>
														<span
															style={{
																fontSize:
																	"10px",
																fontWeight:
																	"400",
															}}
															className="grey-1 mr-2"
														>
															{`${key} : `}
														</span>
														<span
															style={{
																fontSize:
																	"10px",
																fontWeight:
																	"400",
															}}
															className="grey-1 mr-2"
														>
															{Array.isArray(
																action
																	?.action_data[
																	key
																]
															) &&
															action?.action_data[
																key
															].length > 0
																? action?.action_data[
																		key
																  ].map(
																		(
																			i,
																			idx
																		) => {
																			return (
																				<>
																					{i?.value ||
																						i?.name}
																					{idx !==
																					action
																						?.action_data[
																						key
																					]
																						?.length -
																						1
																						? ", "
																						: ""}
																				</>
																			);
																		}
																  )
																: typeof action
																		?.action_data[
																		key
																  ] ===
																  "boolean"
																? action
																		?.action_data[
																		key
																  ] === true
																	? "true"
																	: "false"
																: action
																		?.action_data[
																		key
																  ] || ""}
														</span>
													</div>
												))}
										</Card.Body>
									</Accordion.Collapse>
								</Card>
							</Accordion>
						)}
				</>
			)}
		</>
	);

	const staticSelectedData = action && (
		<>
			{action?.action_type === ACTION_TYPE.STATIC && (
				<>
					{action?.action_data &&
						Object.keys(action?.action_data).length > 0 && (
							<Accordion className="pt-2">
								<Card
									style={{
										border: "0px",
										backgroundColor: "#fff",
									}}
								>
									<ContextAwareToggle
										className="border-0 p-0 grey-1"
										style={{
											backgroundColor: "#fff",
											fontSize: "10px",
											fontWeight: "600",
											cursor: "pointer",
											display: "flex",
											alignItems: "center",
										}}
										as={Card.Header}
										variant="link"
										eventKey="0"
									>
										PARAMETERS CONFIGURED
									</ContextAwareToggle>
									<Accordion.Collapse eventKey="0">
										<Card.Body className="p-0">
											{action?.action_data &&
												Object.keys(
													action?.action_data
												).map((key, index) => (
													<div
														className="d-flex flex-1 align-items-center"
														key={index}
													>
														<span
															style={{
																fontSize:
																	"10px",
																fontWeight:
																	"400",
															}}
															className="grey-1 mr-2"
														>
															{`${key} : `}
														</span>
														<span
															style={{
																fontSize:
																	"10px",
																fontWeight:
																	"400",
															}}
															className="grey-1 mr-2"
														>
															{Array.isArray(
																action
																	?.action_data[
																	key
																]
															) &&
															action?.action_data[
																key
															].length > 0
																? action?.action_data[
																		key
																  ].map(
																		(
																			i,
																			idx
																		) => {
																			return (
																				<>
																					{
																						i?.value
																					}
																					{idx !==
																					action
																						?.action_data[
																						key
																					]
																						?.length -
																						1
																						? ", "
																						: ""}
																				</>
																			);
																		}
																  )
																: typeof action
																		?.action_data[
																		key
																  ] ===
																  "boolean"
																? action
																		?.action_data[
																		key
																  ] === true
																	? "true"
																	: "false"
																: action
																		?.action_data[
																		key
																  ] || ""}
														</span>
													</div>
												))}
										</Card.Body>
									</Accordion.Collapse>
								</Card>
							</Accordion>
						)}
				</>
			)}
		</>
	);

	return (
		<div className="d-flex flex-1 flex-column">
			{manualTaskSelectedData}
			{integrationSelectedData}
			{internalSelectedData}
			{staticSelectedData}
		</div>
	);
};

export default CompileWorkflowActionRenderData;

function ContextAwareToggle({
	className,
	style,
	children,
	eventKey,
	callback,
}) {
	const [toggleState, setToggleState] = useState(false);

	const decoratedOnClick = useAccordionToggle(eventKey, () => {
		setToggleState(!toggleState);
		callback && callback(eventKey);
	});

	return (
		<div className={className} style={style} onClick={decoratedOnClick}>
			{children}
			<img
				alt=""
				onClick={decoratedOnClick}
				src={toggleState ? filledDownArrow : filledRightArrow}
				width="10px"
				className="ml-2"
				height={!toggleState ? "8px" : "10px"}
			/>
		</div>
	);
}
