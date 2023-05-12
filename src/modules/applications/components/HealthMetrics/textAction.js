import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { patchApplication } from "services/api/applications";
import UpdateCardFooter from "./UpdateCardFooter";

export default function TextAction({ reset, field, app, updateStep, setValue, submitting }) {
	const [customValue, setCustomValue] = useState("");
	const handleSubmit = () => {
		setValue(customValue);
		updateStep();
	};
	return (
		<>
			<Form.Control
				className="mt-1"
				style={{ width: "100%" }}
				type="text"
				placeholder="Custom value"
				value={customValue}
				onChange={(e) => setCustomValue(e.target.value)}
			/>
			<UpdateCardFooter
				className="mt-2"
				onCancel={reset}
				onSubmit={handleSubmit}
				disableSave={!customValue}
				submitting={submitting}
			/>
		</>
	);
}
