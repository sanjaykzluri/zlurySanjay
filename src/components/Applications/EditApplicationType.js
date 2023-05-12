import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { capitalizeFirstLetter } from "../../utils/common";

export const applicationState = {
	APPLICATION: "application",
	BROWSER: "browser",
	WEBSITE: "website",
	DEVICE: "device",
	OTHERS: "other",
};

export function EditApplicationType(props) {
	let options = Object.values(applicationState).map((type) => (
		<option value={type}>{capitalizeFirstLetter(type)}</option>
	));
	return (
		<Form.Group>
			{!props.hideLabel && <Form.Label>Type</Form.Label>}
			<Form.Control
				className="cursor-pointer"
				value={props.value}
				style={{ textTransform: "capitalize", width: "100%" }}
				as="select"
				name={props.name}
				isInvalid={props.invalid}
				onChange={(e) => props.change(e.target.name, e.target.value)}
			>
				{options}
			</Form.Control>
			<Form.Control.Feedback type="invalid">
				Please select valid application type.
			</Form.Control.Feedback>
		</Form.Group>
	);
}
