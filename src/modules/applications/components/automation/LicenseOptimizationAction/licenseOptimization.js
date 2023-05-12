import React, { useEffect, useState, useRef, useReducer } from "react";
import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { Select } from "UIComponents/Select/Select";
import { DowngradeLicense } from "./downgradeLicenseSelect";
import "./licenseOptimization.css";
import { ManualApproval } from "./manualApprovalSelect";
import { RemoveLicense } from "./removeLicenseSelect";
import {
	keepLicenseOptions,
	onNoResponseOptions,
	licenseReturnoptions,
	manualApprovalOptions,
	onApprovalOptions,
	downgradeorremoveLicenseOptions,
} from "./constants";
const allOptions = [
	...keepLicenseOptions,
	...onNoResponseOptions,
	...licenseReturnoptions,
	...manualApprovalOptions,
	...onApprovalOptions,
	...downgradeorremoveLicenseOptions,
];
const allOptionsMap = new Map(allOptions.map((obj) => [obj.value, obj]));
export function LicenseOptimizationAction(props) {
	const initialState = {
		licenseReturn: {},
		keepLicense: {},
		noResponse: {},
	};

	useEffect(() => {
		if (props?.action?.data[0]) {
			for (let [key, value] of Object.entries(
				props?.action?.data[0]?.v
			)) {
				if (Object.keys(value).length > 0) {
					for (let [childKey, childVal] of Object.entries(value)) {
						if (!childKey.includes("playbook")) {
							dispatch({
								type: key,
								payload: {
									key: childKey,
									value: allOptionsMap.get(childVal),
								},
							});
						} else {
							dispatch({
								type: key,
								payload: {
									key: childKey,
									value: childVal,
								},
							});
						}
					}
				}
			}
		}
	}, [props?.action?.data]);

	const reducer = (state, action) => {
		switch (action.type) {
			case "licenseReturn": {
				const tempstate = { ...state };
				const licenseReturn = tempstate.licenseReturn;
				licenseReturn[action.payload.key] = action.payload.value;
				return tempstate;
			}
			case "keepLicense": {
				const tempstate = { ...state };
				const keepLicense = tempstate.keepLicense;
				keepLicense[action.payload.key] = action.payload.value;
				return tempstate;
			}
			case "noResponse": {
				const tempstate = { ...state };
				const noResponse = tempstate.noResponse;
				noResponse[action.payload.key] = action.payload.value;
				return tempstate;
			}
			default:
				return state;
		}
	};
	const [licenseOptimizationState, dispatch] = useReducer(
		reducer,
		initialState
	);
	const handleSelectChange = (e, key) => {
		dispatch({
			type: key,
			payload: {
				key: "action",
				value: e,
			},
		});
	};
	const handleSubSelect = (e, parentKey, key) => {
		dispatch({
			type: parentKey,
			payload: {
				key: key,
				value: e,
			},
		});
	};
	const addAction = () => {
		const action = { ...props.action };
		const data = removeLabelsfromActionData();
		action.data = { k: null, v: data };
		action.isValidated = true;
		props.addAction(action);
	};
	const removeLabelsfromActionData = () => {
		const state = { ...licenseOptimizationState };
		for (let [key, value] of Object.entries(licenseOptimizationState)) {
			for (let [childKey, childVal] of Object.entries(value)) {
				if (!childKey.includes("playbook")) {
					state[key][childKey] = childVal.value;
				}
			}
		}
		return state;
	};
	return (
		<>
			<div
				className="d-flex flex-column licenseoptimization_wrapper"
				style={{ marginTop: "20px" }}
			>
				<p className="text_header">License Return</p>
				<p className="description">
					Events to be triggered if an employee responds “Return
					License” on task email sent to them to forego their license.{" "}
				</p>
				<div className="d-flex  justify-content-around form-row">
					<label htmlFor="select_action">Select Action</label>
					<Select
						className="select_width"
						isOptionsLoading={false}
						value={licenseOptimizationState?.licenseReturn?.action}
						options={licenseReturnoptions}
						fieldNames={{
							label: "label",
							value: "value",
						}}
						placeholder="Select Action"
						onChange={(e) => handleSelectChange(e, "licenseReturn")}
					/>
				</div>
				{licenseOptimizationState?.licenseReturn?.action?.value ===
					"remove_license" && (
					<RemoveLicense
						handleSubSelect={handleSubSelect}
						parentKey="licenseReturn"
						state={licenseOptimizationState?.licenseReturn}
					/>
				)}
				{licenseOptimizationState?.licenseReturn?.action?.value ===
					"downgrade_license" && (
					<DowngradeLicense
						handleSubSelect={handleSubSelect}
						parentKey="licenseReturn"
						state={licenseOptimizationState?.licenseReturn}
					/>
				)}
				<p className="text_header">On Keep License</p>
				<p className="description">
					Events to be triggered if an employee responds “Keep
					License” on task email sent to them to forego their license.
				</p>
				<div className="d-flex  justify-content-around form-row">
					<label htmlFor="select_action">Select Action</label>
					<Select
						className="select_width"
						isOptionsLoading={false}
						value={licenseOptimizationState?.keepLicense?.action}
						options={keepLicenseOptions}
						fieldNames={{
							label: "label",
							value: "value",
						}}
						placeholder="Select Action"
						onChange={(e) => handleSelectChange(e, "keepLicense")}
					/>
				</div>
				{licenseOptimizationState?.keepLicense?.action?.value ===
					"remove_license" && (
					<RemoveLicense
						handleSubSelect={handleSubSelect}
						parentKey="keepLicense"
						state={licenseOptimizationState?.keepLicense}
					/>
				)}
				{licenseOptimizationState?.keepLicense?.action?.value ===
					"downgrade_license" && (
					<DowngradeLicense
						handleSubSelect={handleSubSelect}
						parentKey="keepLicense"
						state={licenseOptimizationState?.keepLicense}
					/>
				)}
				{licenseOptimizationState?.keepLicense?.action?.value ===
					"manual_approval" && (
					<ManualApproval
						handleSubSelect={handleSubSelect}
						parentKey="keepLicense"
						state={licenseOptimizationState?.keepLicense}
					/>
				)}
				<p className="text_header">On No Response</p>
				<p className="description">
					Events to be triggered if an employee does not respond on
					task email sent to them to forego their license within 24
					hours.
				</p>
				<div className="d-flex  justify-content-around form-row">
					<label htmlFor="select_action">Select Action</label>
					<Select
						className="select_width"
						isOptionsLoading={false}
						value={licenseOptimizationState?.noResponse?.action}
						options={onNoResponseOptions}
						fieldNames={{
							label: "label",
							value: "value",
						}}
						placeholder="Select Action"
						onChange={(e) => handleSelectChange(e, "noResponse")}
					/>
				</div>
				<div className="d-flex btn-row">
					<Button className="btn btn-primary" onClick={addAction}>
						Add Action
					</Button>
					<Button className="btn btn-light" onClick={props.onCancel}>
						Cancel
					</Button>
				</div>
			</div>
		</>
	);
}
