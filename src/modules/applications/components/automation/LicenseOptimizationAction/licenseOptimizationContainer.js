import React, { useEffect, useState, useRef, useReducer } from "react";
import { DowngradeLicense } from "./downgradeLicenseSelect";
import { LicenseOptimizationAction } from "./licenseOptimization";
import { RemoveLicense } from "./removeLicenseSelect";
import { Button } from "react-bootstrap";
import { downgradeorremoveLicenseOptions } from "./constants";
const allOptions = [...downgradeorremoveLicenseOptions];
const allOptionsMap = new Map(allOptions.map((obj) => [obj.value, obj]));
export function LicenseOptimizationContainer(props) {
	const [removeLicense, setRemoveLicense] = useState({
		removal_date: "",
		playbook: "",
	});
	const [downgradeLicense, setDowngradeLicense] = useState({
		downgrade_date: "",
		playbook: "",
	});
	const handleSelect = (e, parentKey, currKey) => {
		if (parentKey === "removeLicense") {
			setRemoveLicense((prevState) => ({ ...prevState, [currKey]: e }));
		} else {
			setDowngradeLicense((prevState) => ({
				...prevState,
				[currKey]: e,
			}));
		}
	};
	useEffect(() => {
		if (
			props?.action?.data[0] &&
			props.action.name !== "Request to Forgo License"
		) {
			for (let [key, value] of Object.entries(
				props?.action?.data[0]?.v
			)) {
				if (Object.keys(value).length > 0) {
					if (!key.includes("playbook")) {
						if (props.action.name === "Remove License") {
							setRemoveLicense((prevState) => ({
								...prevState,
								[key]: allOptionsMap.get(value),
							}));
						} else {
							setDowngradeLicense((prevState) => ({
								...prevState,
								[key]: allOptionsMap.get(value),
							}));
						}
					} else {
						if (props.action.name === "Remove License") {
							setRemoveLicense((prevState) => ({
								...prevState,
								[key]: value,
							}));
						} else {
							setDowngradeLicense((prevState) => ({
								...prevState,
								[key]: value,
							}));
						}
					}
				}
			}
		}
	}, [props?.action?.data]);
	useEffect(() => {}, [removeLicense]);
	const addAction = (key) => {
		const action = { ...props.action };
		const data = removeLabelsfromActionData(
			key === "downgradeLicense" ? downgradeLicense : removeLicense
		);
		action.data = { k: null, v: data };
		action.isValidated = true;
		props.addAction(action);
	};
	const removeLabelsfromActionData = (currentState) => {
		const state = { ...currentState };
		for (let [key, value] of Object.entries(currentState)) {
			if (!key.includes("playbook")) {
				state[key] = value.value;
			}
		}
		return state;
	};
	return (
		<>
			{props.action.name === "Request to Forgo License" && (
				<LicenseOptimizationAction
					addAction={props.addAction}
					action={props.action}
					onCancel={props.onCancel}
					setEditActionWorkflow={props.setEditActionWorkflow}
				/>
			)}
			{props.action.name === "Remove License" && (
				<>
					<RemoveLicense
						handleSubSelect={handleSelect}
						parentKey="removeLicense"
						state={removeLicense}
					/>
					<div className="d-flex btn-row">
						<Button
							className="btn btn-primary"
							onClick={() => addAction("removeLicense")}
						>
							Add Action
						</Button>
						<Button
							className="btn btn-light"
							onClick={props.onCancel}
						>
							Cancel
						</Button>
					</div>
				</>
			)}
			{props.action.name === "Downgrade License" && (
				<>
					<DowngradeLicense
						handleSubSelect={handleSelect}
						parentKey="downgradeLicense"
						state={downgradeLicense}
					/>
					<div className="d-flex btn-row">
						<Button
							className="btn btn-primary"
							onClick={() => addAction("downgradeLicense")}
						>
							Add Action
						</Button>
						<Button
							className="btn btn-light"
							onClick={props.onCancel}
						>
							Cancel
						</Button>
					</div>
				</>
			)}
		</>
	);
}
