import React, { useEffect, useState, useRef } from "react";
import { Select } from "UIComponents/Select/Select";
import { downgradeorremoveLicenseOptions } from "./constants";
import { PlaybookSearchDropdown } from "./playbookSearchDropdown";

export function DowngradeLicense(props) {
	return (
		<>
			<div className="d-flex justify-content-around form-row">
				<label htmlFor="select_downgrade_date">
					Select downgrade date
				</label>
				<Select
					className="select_width"
					isOptionsLoading={false}
					value={props?.state.downgrade_date}
					options={downgradeorremoveLicenseOptions}
					fieldNames={{
						label: "label",
						value: "value",
					}}
					placeholder="Select downgrade date"
					onChange={(e) =>
						props.handleSubSelect(
							e,
							props.parentKey,
							"downgrade_date"
						)
					}
				/>
			</div>
			<div className="d-flex justify-content-around form-row">
				<label htmlFor="select_deprovisioning">
					Select Deprovisioning Playbook
				</label>
				<PlaybookSearchDropdown
					parentKey={props.parentKey}
					handleSubSelect={props.handleSubSelect}
					state={props.state}
					currentKey="playbook"
				/>
			</div>
		</>
	);
}
