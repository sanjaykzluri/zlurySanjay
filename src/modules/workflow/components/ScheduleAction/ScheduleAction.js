import { TIME_UNIT } from "modules/workflow/constants/constant";
import React, { useState } from "react";
import { Button } from "UIComponents/Button/Button";
import { Select } from "UIComponents/Select/Select";

const ScheduleAction = ({
	scheduledData,
	approvalData,
	action,
	handleScheduleApprovalChange,
}) => {
	const [scheduledAction, setScheduledAction] = useState(
		scheduledData || { time: "", unit: "", duration: "" }
	);
	const [error, setError] = useState(null);

	const handleChange = (e) => {
		const { name, value, selectedUnit } = e.target;
		const data = { ...scheduledAction };
		if (name === "time") {
			data.time = value;
			data.duration = `${value} ${data?.unit ? data?.unit : ""}`;
		} else if (name === "unit") {
			data.unit = value;
			data.selectedUnit = selectedUnit;
			data.duration = `${data?.time ? data?.time : ""} ${data?.unit}`;
		}
		setError(null);
		setScheduledAction(data);
	};

	const validation = () => {
		const obj = { ...scheduledAction };
		const err = { ...error };
		let isError = false;
		for (let key in obj) {
			let isValidated = true;
			if (
				(key === "time" && !obj[key]) ||
				(key === "unit" && !obj[key])
			) {
				isValidated = false;
				isError = true;
				Object.assign(err, {
					[key]: {
						error: true,
						message: "Field is required",
					},
				});
			}
			if (key === "time" && parseInt(obj[key]) > 99) {
				isValidated = false;
				isError = true;
				Object.assign(err, {
					[key]: {
						error: true,
						message: "Time should be below 99",
					},
				});
			}
			if (isValidated) {
				Object.assign(err, {
					[key]: {
						error: false,
						message: "",
					},
				});
			}
		}
		setError(err);
		return !isError;
	};

	const handleSave = () => {
		if (validation()) {
			handleScheduleApprovalChange(scheduledAction, "ScheduleAction");
		}
	};

	return (
		<div
			style={{
				backgroundColor: "#F6F7FC",
				borderTopRightRadius: "4px",
				borderBottomLeftRadius: "4px",
				borderBottomRightRadius: "4px",
			}}
			className={`d-flex p-3 flex-column align-items-start`}
		>
			<span className="bold-400 font-10" style={{ color: "#919AB6" }}>
				Schedule this action to be run on a specified time after
				initiating the workflow
			</span>
			<div className="flex-1 d-flex flex-row py-2">
				<input
					className="p-2 mr-2"
					type="text"
					name="time"
					id="time"
					placeholder="Delay"
					onPaste={(e) => {
						e.preventDefault();
						return false;
					}}
					onCopy={(e) => {
						e.preventDefault();
						return false;
					}}
					autoComplete="new-password"
					value={scheduledAction?.time || ""}
					onKeyPress={(event) => {
						if (!/[0-9]/.test(event.key)) {
							event.preventDefault();
						}
					}}
					onChange={(e) => {
						handleChange(e);
					}}
				/>
				<Select
					className="flex-fill black-1 w-auto mr-3 grey-bg attribute-operators-select"
					options={TIME_UNIT}
					fieldNames={{
						label: "unit",
					}}
					placeholder="Select"
					value={scheduledAction?.selectedUnit || null}
					onChange={(obj) => {
						handleChange({
							target: {
								name: "unit",
								value: obj.unit,
								selectedUnit: obj,
							},
						});
					}}
				/>
			</div>
			{(error?.time?.error || error?.unit?.error) && (
				<span className="bold-400 font-10" style={{ color: "#FF6767" }}>
					{error?.time?.message || ""}
				</span>
			)}
			<Button
				className="text-captalize font-12 p-0 my-2"
				type="link"
				onClick={() => {
					handleSave();
				}}
			>
				SCHEDULE ACTION
			</Button>
		</div>
	);
};

export default ScheduleAction;
