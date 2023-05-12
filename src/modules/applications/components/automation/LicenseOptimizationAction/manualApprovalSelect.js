import React, { useEffect, useState, useRef } from "react";
import { Select } from "UIComponents/Select/Select";
import { manualApprovalOptions, onApprovalOptions } from "./constants";
import { PlaybookSearchDropdown } from "./playbookSearchDropdown";

export function ManualApproval(props) {
	return (
		<>
			<div className="d-flex justify-content-around form-row">
				<label htmlFor="manual_approval">Approver</label>
				<Select
					className="select_width"
					isOptionsLoading={false}
					value={props?.state?.manual_approval}
					options={manualApprovalOptions}
					fieldNames={{
						label: "label",
						value: "value",
					}}
					placeholder="Select Approver"
					onChange={(e) =>
						props.handleSubSelect(
							e,
							props.parentKey,
							"manual_approval"
						)
					}
				/>
			</div>
			<div className="d-flex justify-content-around form-row">
				<label htmlFor="on_approval">On Approval</label>
				<Select
					className="select_width"
					isOptionsLoading={false}
					value={props?.state?.on_approval}
					options={onApprovalOptions}
					fieldNames={{
						label: "label",
						value: "value",
					}}
					placeholder="Select on approval"
					onChange={(e) =>
						props.handleSubSelect(e, props.parentKey, "on_approval")
					}
				/>
			</div>
			{props.state?.on_approval?.value === "select_playbook" && (
				<div className="d-flex justify-content-around form-row">
					<label htmlFor="select_deprovisioning">
						Select Deprovisioning Playbook
					</label>
					<PlaybookSearchDropdown
						parentKey={props.parentKey}
						handleSubSelect={props.handleSubSelect}
						currentKey="on_approval_playbook"
						state={props.state}
					/>
				</div>
			)}
			<div className="d-flex justify-content-around form-row">
				<label htmlFor="on_rejection">On Rejection</label>
				<Select
					className="select_width"
					isOptionsLoading={false}
					value={props?.state.on_rejection}
					options={onApprovalOptions}
					fieldNames={{
						label: "label",
						value: "value",
					}}
					placeholder="Select on Rejection"
					onChange={(e) =>
						props.handleSubSelect(
							e,
							props.parentKey,
							"on_rejection"
						)
					}
				/>
			</div>
			{props.state?.on_rejection?.value === "select_playbook" && (
				<div className="d-flex justify-content-around form-row">
					<label htmlFor="select_deprovisioning">
						Select Deprovisioning Playbook
					</label>
					<PlaybookSearchDropdown
						parentKey={props.parentKey}
						handleSubSelect={props.handleSubSelect}
						currentKey="on_rejection_playbook"
						state={props.state}
					/>
				</div>
			)}
		</>
	);
}
