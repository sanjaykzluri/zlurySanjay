import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import ruleConditionLineIcon from "assets/appPlaybooks/rule_condition.svg";
import { updateTriggerTitle } from "modules/applications/utils/applicationutils";
import { useState } from "react";
import { useEffect } from "react";

const WorkflowNameCondition = ({
	workflow,
	app,
	type,
	showPriorityOrder = "true",
}) => {
	const { name, description, priority_order } = workflow;
	let when_name;
	if (type === "#app_rules") {
		when_name =
			updateTriggerTitle(workflow?.global_event?.trigger?.title, app) ||
			"N/A";
	} else {
		when_name =
			workflow?.global_event?.trigger?.title?.length > 0
				? `${workflow?.global_event?.trigger?.title} `
				: "N/A";
	}

	let then_name;
	if (type === "apprequisition_rules") {
		let temp = workflow?.events?.[0]?.type;
		then_name =
			temp === "initiate_approval_process"
				? "Initiate approval process"
				: temp === "auto_rejection"
				? "Auto Reject"
				: "N/A";
	} else {
		then_name =
			Array.isArray(workflow?.events) && workflow?.events?.length > 0
				? workflow?.events?.map((event) => event?.workflowTemplateName)
				: null;

		then_name = then_name?.length > 0 ? `Run ${then_name} ` : "N/A";
	}
	let check_if = "N/A";
	if (workflow?.condition_count >= 1) {
		let temp = workflow?.conditions?.any?.[0]?.all?.[0];

		let a = temp?.name;
		let b = "";
		temp?.operators?.forEach((el) => {
			if (el?.value === temp?.operator) {
				b = el?.label;
			}
		});

		let c = "";

		if (
			Array.isArray(temp?.selectedValue) &&
			temp?.selectedValue?.length > 0
		) {
			c = "";
			for (let i = 0; i < temp?.selectedValue?.length; i++) {
				c +=
					temp?.selectedValue[i]?.label ||
					temp?.selectedValue[i]?.dept_name ||
					temp?.selectedValue[i]?.user_name ||
					temp?.selectedValue[i]?.app_name ||
					temp?.selectedValue[i]?.source_name ||
					temp?.selectedValue[i]?.org_integration_name;

				if (i < temp?.selectedValue?.length - 2) {
					c += ", ";
				} else if (i === temp?.selectedValue?.length - 2) {
					c += " and ";
				}
			}
		} else if (
			typeof temp?.selectedValue === "object" &&
			Object.keys(temp?.selectedValue).length > 0
		) {
			c = temp?.selectedValue?.label || temp?.selectedValue?.dept_name;
		} else if (Array.isArray(temp?.values) && temp?.values?.length > 0) {
			temp?.values?.forEach((el) => {
				if (Array.isArray(temp?.value) && temp?.value?.length > 0) {
					let str = "";
					for (let i = 1; i < temp?.value?.length; i++) {
						if (temp[i] === el?.value) {
							str += "," + temp[i];
						}
					}
					c = str;
				} else {
					if (el?.value === temp?.value) {
						c = el.label;
					}
				}
			});
		} else if (
			temp?.type === "string" ||
			temp?.type === "numeric" ||
			temp?.type === "inputbox" ||
			temp?.type === "date"
		) {
			c = temp?.value;
		} else if (temp?.type === "text") {
			c = temp?.value?.value;
		}

		if (temp?.fact === "no_conditions") check_if = "N/A";
		else check_if = `${a} ${b} ${c}`;
	}

	return (
		<div>
			<div className="d-flex flex-column mt-2">
				<OverlayTrigger
					placement="top"
					overlay={<Tooltip>{name || ""}</Tooltip>}
				>
					<div className="truncate_20vw black-1 font-16 text-capitalize pr-3 pb-2 mb-1 pl-2">
						{showPriorityOrder && (
							<span className="position-relative font-10 z-action-index mr-3 text-center px-2 py-1">
								<span className="position-center">
									{priority_order || 0}
								</span>
							</span>
						)}
						{name?.charAt(0)?.toUpperCase() + name?.slice(1) ||
							"N/A"}
					</div>
				</OverlayTrigger>

				<div
					className="d-flex font-12"
					style={{
						lineHeight: "15px",
						color: "#484848",
					}}
				>
					<div>
						<img
							alt="ruleConditionLine"
							height={workflow?.condition_count >= 1 ? 68 : 40}
							width={28}
							src={ruleConditionLineIcon}
						/>
					</div>

					<div className="d-flex flex-column align-items-flex-start">
						<div className="d-flex">
							<p className="font-10 font-weight-bold when-rule">
								TRIGGER WHEN
							</p>
							<p
								className="font-10 app-trigger-rule"
								style={{
									textIndent: "8px",
								}}
							>
								{when_name}
							</p>
						</div>
						{workflow?.condition_count >= 1 && (
							<div className="d-flex">
								<p
									className="font-8 font-weight-bold when-rule"
									style={{ color: "#9fd6ff" }}
								>
									CHECK IF
								</p>
								<OverlayTrigger
									placement="top"
									overlay={
										<Tooltip>{check_if || ""}</Tooltip>
									}
								>
									<p
										className=" truncate_20vw font-8 app-trigger-rule"
										style={{
											textIndent: "8px",
										}}
									>
										{check_if}
									</p>
								</OverlayTrigger>

								{workflow?.condition_count > 1 && (
									<p
										className="font-8 rule-condition-count"
										// style={{ color: "#9fd6ff" }}
									>
										{` + ${
											workflow?.condition_count - 1
										} condition${
											workflow?.condition_count > 2
												? "s"
												: ""
										}`}
									</p>
								)}
							</div>
						)}
						<div className="d-flex">
							<p className="font-10 font-weight-bold when-rule">
								THEN
							</p>
							<p
								className="font-10 app-trigger-rule"
								style={{
									textIndent: "14px",
								}}
							>
								{then_name}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default WorkflowNameCondition;
