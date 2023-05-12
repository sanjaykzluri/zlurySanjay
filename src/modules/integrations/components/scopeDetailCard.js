import React from "react";
import collapsedICon from "../../../assets/collapsed_icon_log.svg";
import downArrowIcon from "../../../assets/arrowdropdown.svg";
import referenceIcon from "../../../assets/reference-icon.svg";
import browserIcon from "assets/integrations/browser.svg";
import read from "assets/read-scope.svg";
import write from "assets/write-scope.svg";
import inactiveScope from "assets/inactive-scope.svg";
import activeScope from "assets/active-scope.svg";
import { Accordion, Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import { DottedRisk } from "common/DottedRisk/DottedRisk";

import accounts from "assets/integrations/accounts.svg";
import agents from "assets/integrations/agents.svg";
import alarm from "assets/integrations/alarm.svg";
import analytics from "assets/integrations/analytics.svg";
import applicationsIcon from "assets/integrations/applications.svg";
import audit from "assets/integrations/audit.svg";
import billings from "assets/integrations/billings.svg";
import boards from "assets/integrations/boards.svg";
import calendar from "assets/integrations/calendar.svg";
import centres from "assets/integrations/centres.svg";
import coding from "assets/integrations/coding.svg";
import content from "assets/integrations/content-write.svg";
import database from "assets/integrations/database.svg";
import emails from "assets/integrations/emails.svg";
import emojis from "assets/integrations/emojis.svg";
import events from "assets/integrations/events.svg";
import filesIcon from "assets/integrations/files-int.svg";
import groups from "assets/integrations/groups.svg";
import hashIcon from "assets/integrations/hash-int.svg";
import licenseIcon from "assets/integrations/license.svg";
import licenseIcon2 from "assets/integrations/license-2.svg";
import messages from "assets/integrations/messages.svg";
import notifications from "assets/integrations/notifications.svg";
import orgIcon from "assets/integrations/org.svg";
import paginate from "assets/integrations/paginate.svg";
import phoneIcon from "assets/integrations/phone.svg";
import plansIcon from "assets/integrations/plans.svg";
import printerIcon from "assets/integrations/printer.svg";
import repositories from "assets/integrations/repositories.svg";
import requestsIcon from "assets/integrations/requests.svg";
import sessionsIcon from "assets/integrations/sessions.svg";
import taskEditIcon from "assets/integrations/task-edit.svg";
import multiTaskIcon from "assets/integrations/task-multi.svg";
import plainTaskIcon from "assets/integrations/task-plain.svg";
import teams from "assets/integrations/teams.svg";
import usage from "assets/integrations/usage.svg";
import userIntIcon from "assets/integrations/user-int.svg";
import usersIcon from "assets/user-icon.svg";
import workspaceIcon from "assets/integrations/workspaces.svg";
import ScopePlan from "./scopePlan";
import defaultScopeIcon from "assets/integrations/default-scope.svg";

const { capitalizeFirstLetter, truncateText } = require("utils/common");

const {
	ContextAwareToggle,
} = require("./IntegrationConnectV2/ContextAwareToggle");

export const entityImageMapper = {
	users: usersIcon,
	domain: browserIcon,
	license: licenseIcon,
	licenses: licenseIcon,
	repositories: repositories,
	org: orgIcon,
	usage: usage,
	audit: audit,
	notification: notifications,
	notifications: notifications,
	admin: teams,
	message: messages,
	messages: messages,
	groups: groups,
	teams: teams,
	jobs: taskEditIcon,
	records: multiTaskIcon,
	requests: requestsIcon,
	files: filesIcon,
	emojis: emojis,
	sessions: sessionsIcon,
	invoices: billings,
	agents: agents,
	activities: analytics,
	boards: boards,
	events: events,
	transcripts: plainTaskIcon,
	calls: phoneIcon,
	applications: applicationsIcon,
	workspaces: workspaceIcon,
	roles: userIntIcon,
	alerts: alarm,
	event_types: calendar,
	messages: messages,
	contacts: licenseIcon2,
	data: database,
	emails: emails,
	printers: printerIcon,
	logs: content,
	token: coding,
	channels: hashIcon,
	centres: centres,
	plans: plansIcon,
	info: paginate,
	accounts: accounts,
};

const ScopeDetailCard = ({
	index,
	scope,
	width,
	showScopeState = false,
	showDescription = true,
	showFeatures = true,
	numberOfItems = 3,
	iconButton = false,
	showConnectedScopes,
	fontSize = "14px",
	fontWeight = "500",
	truncateTextSize = 35,
	showDashedBorder = true,
}) => {
	return (
		<>
			<div
				key={index}
				style={{
					width: width || "48%",
					backgroundColor: "#FCFCFD",
					border: showDashedBorder ? "1px solid #F5F6F9" : "none",
				}}
				className="p-1 my-2 mr-2"
			>
				<Accordion key={index + 1}>
					<Card
						style={{
							border: "none",
							lineHeight: "18px",
							fontSize: fontSize,
							backgroundColor: "#FCFCFD",
						}}
					>
						<Card.Header
							style={{
								border: "none",
								backgroundColor: "#FCFCFD",
							}}
							className="px-3 py-2"
						>
							<div
								style={{
									justifyContent: "space-between",
								}}
								className="flex"
							>
								<div
									style={{
										fontSize: fontSize,
										fontWeight: fontWeight,
									}}
								>
									{iconButton
										? iconButton
										: showScopeState && (
												<img
													src={
														scope.connected ||
														showConnectedScopes
															? activeScope
															: inactiveScope
													}
													width="12px"
													className="mr-2"
												/>
										  )}
									<OverlayTrigger
										placement="top"
										overlay={
											<Tooltip>
												{scope?.scope_name}
											</Tooltip>
										}
									>
										<span
											style={{
												borderBottom: showDashedBorder
													? "0.5px dashed #DDDDDD"
													: "none",
											}}
											className="pb-1"
										>
											{capitalizeFirstLetter(
												truncateText(
													scope.scope_name,
													truncateTextSize
												)
											)}{" "}
											{scope.is_default && (
												<img
													className="ml-2"
													src={defaultScopeIcon}
												/>
											)}
										</span>
									</OverlayTrigger>
									<ContextAwareToggle
										eventKey={index + 1}
									></ContextAwareToggle>
								</div>{" "}
								<div
									style={{
										color: scope.integration_scope_type_read_only
											? "rgba(95, 207, 100, 1)"
											: "rgba(255, 177, 105, 1)",
									}}
									className="font-10 bold-600 flex"
								>
									<div>
										<img
											width={"10px"}
											className="mr-1"
											src={
												scope.integration_scope_type_read_only
													? read
													: write
											}
										/>
									</div>
									<div>
										{scope.integration_scope_type_read_only
											? "READ"
											: "WRITE"}
									</div>
								</div>
							</div>
						</Card.Header>
						{showDescription && (
							<div className="p-3 font-12 grey">
								{capitalizeFirstLetter(
									scope.integration_scope_reason
								)}
							</div>
						)}
						{showFeatures && (
							<div className="flex px-3 my-2">
								{Array.isArray(scope.feature)
									? scope.feature?.map((feature) => (
											<div
												style={{
													backgroundColor:
														"rgba(113, 90, 255, 0.1)",
													width: "auto",
													height: "25px",
													borderRadius: "5px",
													textAlign: "center",
												}}
												className="px-2 pt-1 mr-2 font-12"
											>
												{capitalizeFirstLetter(feature)}
											</div>
									  ))
									: scope.feature && (
											<div
												style={{
													backgroundColor:
														"rgba(113, 90, 255, 0.1)",
													width: "auto",
													height: "25px",
													borderRadius: "5px",
													textAlign: "center",
												}}
												className="px-2 mr-2 pt-1 font-12"
											>
												{capitalizeFirstLetter(
													scope.feature
												)}
											</div>
									  )}
							</div>
						)}
						<Accordion.Collapse eventKey={index + 1}>
							<Card.Body
								style={{
									backgroundColor: "#F5F6F9",
								}}
								className="px-3 py-2"
							>
								<div
									style={{
										flexWrap: "wrap",
										fontSize: "14px",
									}}
									className="flex"
								>
									<div
										className="py-2"
										style={{
											width:
												numberOfItems === 2
													? "50%"
													: "40%",
										}}
									>
										<div
											style={{
												color: "rgba(113, 113, 113, 1)",
											}}
											className="font-10"
										>
											ENTITIES
										</div>
										<div className="flex flex-wrap">
											{Array.isArray(
												scope?.entity_unique_name
											) &&
												scope?.entity_unique_name
													?.length > 0 &&
												scope?.entity_unique_name.map(
													(entity, index) => (
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
													)
												)}
										</div>
									</div>
									<div
										className="py-2 "
										style={{
											width:
												numberOfItems === 2
													? "50%"
													: "30%",
										}}
									>
										<div
											style={{
												color: "rgba(113, 113, 113, 1)",
											}}
											className="font-10"
										>
											SCOPE SENSITIVITY
										</div>
										<div
											align="center"
											className="font-11 flex align-items-center"
										>
											<div>
												<DottedRisk
													size="sm"
													normal={true}
													value={
														scope.scope_sensitivity
													}
												/>
											</div>
											<div className="ml-2 pt-1">
												{scope.scope_sensitivity}
											</div>
										</div>
									</div>
									<div
										className="py-2"
										style={{
											width:
												numberOfItems === 2
													? "50%"
													: "30%",
										}}
									>
										<div
											style={{
												color: "rgba(113, 113, 113, 1)",
											}}
											className="font-10"
										>
											SCOPE OPTIMAL
										</div>
										<div
											style={{
												backgroundColor:
													scope.is_scope_optimal
														? "rgba(64, 227, 149, 0.1)"
														: "rgba(255, 208, 165, 1)",
												width: "30px",
												borderRadius: "5px",
											}}
											className="font-10 p-1"
										>
											{scope.is_scope_optimal
												? "YES"
												: "NO"}
										</div>
									</div>
									<div
										className="py-2"
										style={{
											width:
												numberOfItems === 2
													? "50%"
													: "40%",
										}}
									>
										<div
											style={{
												color: "rgba(113, 113, 113, 1)",
											}}
											className="font-10"
										>
											PLANS
										</div>
										<ScopePlan scope={scope} />
									</div>
									<div
										className="py-2"
										style={{
											width:
												numberOfItems === 2
													? "50%"
													: "30%",
										}}
									>
										<div
											style={{
												color: "rgba(113, 113, 113, 1)",
											}}
											className="font-10 mb-1"
										>
											RESOURCES
										</div>

										{scope.scope_reference_url.length && (
											<a
												href={scope.scope_reference_url}
												target="_blank"
												rel="noreferrer"
												style={{
													backgroundColor:
														"rgba(90, 186, 255, 0.05)",
													color: "rgba(90, 186, 255, 1)",
												}}
											>
												<span className="p-1 font-11">
													Reference Url
													<img
														width={"12px"}
														src={referenceIcon}
														className="ml-1"
													/>
												</span>
											</a>
										)}
									</div>
								</div>
							</Card.Body>
						</Accordion.Collapse>
					</Card>
				</Accordion>
			</div>
		</>
	);
};

export default ScopeDetailCard;
