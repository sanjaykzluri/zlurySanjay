import { ACTION_TYPE } from "modules/workflow/constants/constant";
import React, { useEffect, useState } from "react";
import { Accordion, Card } from "react-bootstrap";

const RunLogsConfiguredParameters = ({ action }) => {
	const [hasLogMetaData, setHasLogMetaData] = useState(false);
	useEffect(() => {
		let temp = action?.log_meta?.configuredParams;
		if (
			(temp &&
				!temp?.selected_dynamic_options &&
				Object.keys(temp).length > 0) ||
			(temp &&
				temp?.selected_dynamic_options &&
				Object.keys(temp?.selected_dynamic_options).length > 0)
		)
			setHasLogMetaData(true);
	}, [action]);

	const getSelectedOptionLogMeta = () => {
		const dynamicOptions =
			action?.log_meta?.configuredParams?.selected_dynamic_options;
		if (!dynamicOptions || Object.keys(dynamicOptions).length === 0) {
			return null;
		}
		const key = Object.keys(dynamicOptions)[0];
		return dynamicOptions[key];
	};

	const keyStringValueComp = (keyText, value) => {
		return (
			value && (
				<div className="d-flex flex-1 align-items-center">
					<span
						style={{
							fontSize: "10px",
							fontWeight: "500",
						}}
						className="grey-1 mr-2"
					>
						{`${keyText} : `}
					</span>
					<span
						style={{
							fontSize: "10px",
							fontWeight: "400",
						}}
						className="grey-1 mr-2"
					>
						{value}
					</span>
				</div>
			)
		);
	};

	const logMetaData = action?.log_meta && (
		<>
			{
				<>
					{hasLogMetaData ? (
						<Accordion className="p-3 ml-1">
							<Card
								style={{
									border: "0px",
									backgroundColor: "#F8F9FB",
								}}
							>
								<Card.Body className="p-0">
									{action?.action_type ===
										ACTION_TYPE.MANUAL && (
										<>
											{keyStringValueComp(
												"Action Id",
												action?.log_meta
													?.configuredParams
													?.action_id
											)}
											{keyStringValueComp(
												"Board Id",
												action?.log_meta
													?.configuredParams?.boardId
											)}
											{keyStringValueComp(
												"User Id",
												action?.log_meta
													?.configuredParams?.user_id
											)}
											{keyStringValueComp(
												"Workflow Id",
												action?.log_meta
													?.configuredParams
													?.workflow_id
											)}
											{keyStringValueComp(
												"Email",
												action?.log_meta
													?.configuredParams?.email
											)}
											{keyStringValueComp(
												"Schedule Time",
												action?.log_meta
													?.configuredParams
													?.schedule_time
											)}
										</>
									)}

									{action?.log_meta?.configuredParams
										?.approvers &&
										action?.log_meta?.configuredParams
											?.approvers?.length > 0 && (
											<div className="d-flex flex-1 align-items-center">
												<span
													style={{
														fontSize: "10px",
														fontWeight: "500",
													}}
													className="grey-1 mr-2"
												>
													{"Aprrovers : "}
												</span>
												{action?.log_meta?.configuredParams?.approvers?.map(
													(item, index) => {
														return (
															<span
																style={{
																	fontSize:
																		"10px",
																	fontWeight:
																		"400",
																}}
																className="grey-1 mr-2"
															>
																{item?.title ||
																	item?.user_name ||
																	item?.user_email ||
																	""}
															</span>
														);
													}
												)}
											</div>
										)}

									{action?.log_meta?.configuredParams
										?.scheduledData && (
										<div className="d-flex flex-1 align-items-center">
											{Object.entries(
												action?.log_meta
													?.configuredParams
													?.scheduledData
											).map(([key, value]) => (
												<React.Fragment key={key}>
													<span
														style={{
															fontSize: "10px",
															fontWeight: "500",
														}}
														className="grey-1 mr-2"
													>
														{`${key}: `}
													</span>
													<span
														style={{
															fontSize: "10px",
															fontWeight: "400",
														}}
														className="grey-1 mr-2"
													>
														{JSON.stringify(value)}
													</span>
												</React.Fragment>
											))}
										</div>
									)}
									{action?.action_type ===
										ACTION_TYPE.STATIC &&
										Object.keys(
											action?.log_meta?.configuredParams
										).map((key, index) => (
											<div
												className="d-flex flex-1 align-items-center"
												key={index}
											>
												<span
													style={{
														fontSize: "11px",
														fontWeight: "500",
													}}
													className="grey-1 mr-2"
												>
													{`${key} : `}
												</span>
												<span
													style={{
														fontSize: "11px",
														fontWeight: "400",
													}}
													className="grey-1 mr-2"
												>
													{Array.isArray(
														action?.log_meta
															?.configuredParams[
															key
														]
													) &&
													action?.log_meta
														?.configuredParams?.[
														key
													].length > 0
														? action?.log_meta?.configuredParams?.[
																key
														  ].map((i, idx) => {
																return (
																	<>
																		{
																			i?.value
																		}
																		{idx !==
																		action
																			?.log_meta
																			?.configuredParams?.[
																			key
																		]
																			?.length -
																			1
																			? ", "
																			: ""}
																	</>
																);
														  })
														: typeof action
																?.log_meta
																?.configuredParams[
																key
														  ] === "boolean"
														? action?.log_meta
																?.configuredParams[
																key
														  ] === true
															? "true"
															: "false"
														: action?.log_meta
																?.configuredParams[
																key
														  ] || ""}
												</span>
											</div>
										))}
									{(action?.action_type ===
										ACTION_TYPE.INTERNAL ||
										action?.action_type ===
											ACTION_TYPE.INTEGRATION) &&
										Object.keys(
											action?.log_meta?.configuredParams
										).length > 0 &&
										Object.keys(
											action?.log_meta?.configuredParams
										).map((key, index) => {
											return key !==
												"selected_dynamic_options" ? (
												<div
													className="d-flex flex-1 align-items-center"
													key={index}
												>
													<span
														style={{
															fontSize: "11px",
															fontWeight: "500",
														}}
														className="grey-1 mr-2"
													>
														{`${key} : `}
													</span>
													<span
														style={{
															fontSize: "11px",
															fontWeight: "400",
														}}
														className="grey-1 mr-2"
													>
														{typeof action?.log_meta
															?.configuredParams[
															key
														] === "boolean"
															? action?.log_meta
																	?.configuredParams[
																	key
															  ] === true
																? "true"
																: "false"
															: typeof action
																	?.log_meta
																	?.configuredParams[
																	key
															  ] !== "object"
															? action?.log_meta
																	?.configuredParams[
																	key
															  ]
															: JSON.stringify(
																	action
																		?.log_meta
																		?.configuredParams[
																		key
																	]
															  )}
													</span>
												</div>
											) : (
												<>
													{getSelectedOptionLogMeta() &&
														Object.keys(
															getSelectedOptionLogMeta()
														).map((key, index) => {
															return (
																<div
																	className="d-flex flex-1 align-items-center"
																	key={index}
																>
																	<span
																		style={{
																			fontSize:
																				"11px",
																			fontWeight:
																				"500",
																		}}
																		className="grey-1 mr-2"
																	>
																		{`${key} : `}
																	</span>
																	<span
																		style={{
																			fontSize:
																				"11px",
																			fontWeight:
																				"400",
																		}}
																		className="grey-1 mr-2"
																	>
																		{getSelectedOptionLogMeta()
																			? getSelectedOptionLogMeta()?.[
																					key
																			  ]
																					?.option &&
																			  getSelectedOptionLogMeta()?.[
																					key
																			  ]
																					?.option
																					.length >
																					0
																				? getSelectedOptionLogMeta()?.[
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
																										: item[
																												getSelectedOptionLogMeta()?.[
																													key
																												]
																													?.label
																										  ] ||
																										  item?.name ||
																										  item?.value}
																									{index !==
																									getSelectedOptionLogMeta()?.[
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
																				: Array.isArray(
																						getSelectedOptionLogMeta()?.[
																							key
																						]
																							?.value
																				  ) &&
																				  getSelectedOptionLogMeta()?.[
																						key
																				  ]
																						?.value
																						?.length >
																						0
																				? getSelectedOptionLogMeta()?.[
																						key
																				  ]?.value?.map(
																						(
																							item
																						) => {
																							return (
																								<>
																									{typeof item?.value ===
																									"boolean"
																										? item?.value ===
																										  true
																											? "true"
																											: "false"
																										: item[
																												getSelectedOptionLogMeta()?.[
																													key
																												]
																													?.label
																										  ] ||
																										  item?.name ||
																										  item?.value}
																									{index !==
																									getSelectedOptionLogMeta()?.[
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
																				: getSelectedOptionLogMeta()?.[
																						key
																				  ]
																						?.value
																			: getSelectedOptionLogMeta()?.[
																					key
																			  ]
																					?.value ||
																			  ""}
																	</span>
																</div>
															);
														})}
												</>
											);
										})}
								</Card.Body>
							</Card>
						</Accordion>
					) : (
						<>
							<Accordion className="p-3 ml-1">
								<Card
									style={{
										border: "0px",
										backgroundColor: "#F8F9FB",
									}}
								>
									<span>No parameters configured</span>
								</Card>
							</Accordion>
						</>
					)}
				</>
			}
		</>
	);

	const manualTaskSelectedData = action && (
		<>
			{action?.action_type === ACTION_TYPE.MANUAL && action.action_data && (
				<>
					{action?.action_data &&
					Object.keys(action?.action_data).length > 0 ? (
						<Accordion className="p-3 ml-1">
							<Card
								style={{
									border: "0px",
									backgroundColor: "#F8F9FB",
								}}
							>
								<Card.Body className="p-0">
									{keyStringValueComp(
										"Title",
										action?.action_data?.title ||
											action?.action_name
									)}
									{keyStringValueComp(
										"Description",
										action?.action_data?.description ||
											action?.action_description
									)}

									{action?.action_data?.assignee &&
										action?.action_data?.assignee?.length >
											0 && (
											<div className="d-flex flex-1 align-items-center">
												<span
													style={{
														fontSize: "10px",
														fontWeight: "500",
													}}
													className="grey-1 mr-2"
												>
													{"Assignee : "}
												</span>
												{action?.action_data?.assignee?.map(
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
																{item?.title ||
																	item?.user_name ||
																	item?.user_email ||
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
														fontWeight: "500",
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
							</Card>
						</Accordion>
					) : (
						<>
							<Accordion className="p-3 ml-1">
								<Card
									style={{
										border: "0px",
										backgroundColor: "#F8F9FB",
									}}
								>
									<span>No parameters configured</span>
								</Card>
							</Accordion>
						</>
					)}
				</>
			)}
		</>
	);

	const getSelectedOption = () => {
		const keys = Object.keys(
			action?.selected_dynamic_options ||
				action?.action_data?.selectedDynamicOptions ||
				{}
		);
		if (keys.length) {
			if (action?.selected_dynamic_options) {
				return action?.selected_dynamic_options[keys[0]];
			}
			return action?.action_data?.selectedDynamicOptions[keys[0]];
		}
		return null;
	};

	const integrationSelectedData = action &&
		action?.action_data &&
		(action?.selected_dynamic_options ||
			action?.action_data?.selectedDynamicOptions) &&
		Object.keys(
			action?.selected_dynamic_options ||
				action?.action_data?.selectedDynamicOptions
		).length > 0 &&
		action?.action_type === ACTION_TYPE.INTEGRATION && (
			<>
				{action?.action_data &&
					Object.keys(action?.action_data).length > 0 && (
						<Accordion className="p-3 ml-1">
							<Card
								style={{
									border: "0px",
									backgroundColor: "#F8F9FB",
								}}
							>
								<Card.Body className="p-0">
									{getSelectedOption() &&
										Object.keys(getSelectedOption()).map(
											(key, index) => {
												return (
													<div
														className="d-flex flex-1 align-items-center"
														key={index}
													>
														<span
															style={{
																fontSize:
																	"11px",
																fontWeight:
																	"500",
															}}
															className="grey-1 mr-2"
														>
															{`${key} : `}
														</span>
														<span
															style={{
																fontSize:
																	"11px",
																fontWeight:
																	"400",
															}}
															className="grey-1 mr-2"
														>
															{getSelectedOption()
																? getSelectedOption()?.[
																		key
																  ]?.option &&
																  getSelectedOption()?.[
																		key
																  ]?.option
																		.length >
																		0
																	? getSelectedOption()?.[
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
																							: item[
																									getSelectedOption()?.[
																										key
																									]
																										?.label
																							  ] ||
																							  item?.name ||
																							  item?.value}
																						{index !==
																						getSelectedOption()?.[
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
																	: getSelectedOption()?.[
																			key
																	  ]?.value
																: getSelectedOption()?.[
																		key
																  ]?.value ||
																  ""}
														</span>
													</div>
												);
											}
										)}
								</Card.Body>
							</Card>
						</Accordion>
					)}
			</>
		);

	const internalSelectedData = action && (
		<>
			{action?.action_type === ACTION_TYPE.INTERNAL &&
				action.action_data && (
					<>
						{action?.action_data &&
						Object.keys(action?.action_data).length > 0 ? (
							<Accordion className="p-3 ml-1">
								<Card
									style={{
										border: "0px",
										backgroundColor: "#F8F9FB",
									}}
								>
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
															fontSize: "11px",
															fontWeight: "500",
														}}
														className="grey-1 mr-2"
													>
														{`${key} : `}
													</span>
													<span
														style={{
															fontSize: "11px",
															fontWeight: "400",
														}}
														className="grey-1 mr-2"
													>
														{action?.action_data[
															key
														] || ""}
													</span>
												</div>
											))}
									</Card.Body>
								</Card>
							</Accordion>
						) : (
							<>
								<Accordion className="p-3 ml-1">
									<Card
										style={{
											border: "0px",
											backgroundColor: "#F8F9FB",
										}}
									>
										<span>No parameters configured</span>
									</Card>
								</Accordion>
							</>
						)}
					</>
				)}
		</>
	);

	const staticSelectedData = action && (
		<>
			{action?.action_type === ACTION_TYPE.STATIC && action?.action_data && (
				<>
					{action?.action_data &&
					Object.keys(action?.action_data).length > 0 ? (
						<Accordion className="p-3 ml-1">
							<Card
								style={{
									border: "0px",
									backgroundColor: "#F8F9FB",
								}}
							>
								<Card.Body className="p-0">
									{action?.action_data &&
										Object.keys(action?.action_data).map(
											(key, index) => (
												<div
													className="d-flex flex-1 align-items-center"
													key={index}
												>
													<span
														style={{
															fontSize: "11px",
															fontWeight: "500",
														}}
														className="grey-1 mr-2"
													>
														{`${key} : `}
													</span>
													<span
														style={{
															fontSize: "11px",
															fontWeight: "400",
														}}
														className="grey-1 mr-2"
													>
														{Array.isArray(
															action?.action_data[
																key
															]
														) &&
														action?.action_data?.[
															key
														].length > 0
															? action?.action_data?.[
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
																					?.action_data?.[
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
															  ] === "boolean"
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
											)
										)}
								</Card.Body>
							</Card>
						</Accordion>
					) : (
						<>
							<Accordion className="p-3 ml-1">
								<Card
									style={{
										border: "0px",
										backgroundColor: "#F8F9FB",
									}}
								>
									<span>No parameters configured</span>
								</Card>
							</Accordion>
						</>
					)}
				</>
			)}
		</>
	);

	return (
		<div
			style={{
				backgroundColor: "#F8F9FB",
			}}
			className="d-flex flex-1 flex-column h-auto w-auto ml-4 mb-1"
		>
			{action?.log_meta ? (
				logMetaData
			) : (
				<>
					{manualTaskSelectedData}
					{integrationSelectedData}
					{internalSelectedData}
					{staticSelectedData}
				</>
			)}
		</div>
	);
};

export default RunLogsConfiguredParameters;
