import { DottedRisk } from "common/DottedRisk/DottedRisk";
import React from "react";
import { Accordion, Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import { capitalizeFirstLetter } from "utils/common";
import { ContextAwareToggle } from "../ContextAwareToggle";
import read_icon from "assets/read.svg";
import write_icon from "assets/write.svg";
import delete_icon from "assets/deleteIcon.svg";
import { entityImageMapper } from "../../scopeDetailCard";
import referenceIcon from "assets/reference-icon.svg";

import browserIcon from "assets/browser.svg";
import { PermissionCard } from "../../PermissionCard/PermissionCard";
import ScopePlan from "../../scopePlan";

const SelectScopeCard = ({ permission, index, onRemove, isEditable }) => {
	return (
		<Accordion key={index + 1}>
			<div>
				<PermissionCard
					key={index}
					permissionIcon={
						permission.integration_scope_type_read_only
							? read_icon
							: write_icon
					}
					title={capitalizeFirstLetter(permission.scope_name)}
					toggelButton={<ContextAwareToggle eventKey={index + 1} />}
					permission={permission}
					onRemove={onRemove}
					isEditable={isEditable}
				/>
			</div>
			<hr className="m-1" />

			<Accordion.Collapse eventKey={index + 1}>
				<>
					<div>
						<div className="p-3 font-12 grey">
							{capitalizeFirstLetter(
								permission.integration_scope_reason
							)}
						</div>
					</div>
					<Card.Body
						style={{
							backgroundColor: "#F8F9FB",
						}}
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
									width: "40%",
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
										permission?.entity_unique_name
									) &&
										permission?.entity_unique_name?.length >
											0 &&
										permission?.entity_unique_name.map(
											(entity, index) => (
												<div className="px-1">
													<OverlayTrigger
														placement="top"
														overlay={
															<Tooltip
																className={""}
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
																] || browserIcon
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
								className="py-2"
								style={{
									width: "30%",
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
									className="font-11 flex  align-items-center"
								>
									<div>
										<DottedRisk
											size="sm"
											normal={true}
											value={permission.scope_sensitivity}
										/>
									</div>
									<div className="ml-2 pt-1">
										{permission.scope_sensitivity}
									</div>
								</div>
							</div>
							<div
								className="py-2 pl-4"
								style={{
									width: "30%",
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
											permission.is_scope_optimal
												? "rgba(64, 227, 149, 0.1)"
												: "rgba(255, 208, 165, 1)",
										width: "30px",
									}}
									className="font-10 p-1"
								>
									{permission.is_scope_optimal ? "YES" : "NO"}
								</div>
							</div>
							<div
								className="py-2"
								style={{
									width: "40%",
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
								<ScopePlan scope={permission} />
							</div>
							<div
								className="py-2"
								style={{
									width: "30%",
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

								{permission?.scope_reference_url?.length && (
									<a
										target="_blank"
										rel="noreferrer"
										href={permission?.scope_reference_url}
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
				</>
			</Accordion.Collapse>
		</Accordion>
	);
};

export default SelectScopeCard;
