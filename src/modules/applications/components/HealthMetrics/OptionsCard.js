import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { patchApplication } from "services/api/applications";
import { Button } from "UIComponents/Button/Button";
import { capitalizeFirstLetter } from "utils/common";
import UpdateCardFooter from "./UpdateCardFooter";
import healthPoints from "assets/applications/card_health_points.svg";
import { useSelector } from "react-redux";

export default function OptionsCard({
	options,
	reset,
	submitting,
	updateStep,
	field,
	app,
}) {
	const [value, setValue] = useState("");
	const [isCustom, setIsCustom] = useState(false);
	const [customValue, setCustomValue] = useState("");
	const { SHOW_HEALTH_POINTS } = useSelector((state) => state.featureFlags);

	const handleSubmit = () => {
		setValue(value);
		updateStep();
	};
	return (
		<>
			<div className="options_card">
				{SHOW_HEALTH_POINTS && (
					<img
						width={43}
						height={19}
						className="card__healthpoints"
						src={healthPoints}
					/>
				)}

				<p className="options_title">Select a reason:</p>
				<Form>
					<div className="mb-1">
						{options.map((option, index) => (
							<Form.Check
								key={index}
								type="radio"
								label={`${capitalizeFirstLetter(option)}`}
								value={option}
								checked={option == value}
								onClick={(e) => {
									setIsCustom(false);
									setValue(e.target.value);
								}}
							/>
						))}
						<Form.Check
							type="radio"
							label="Custom"
							value={value}
							checked={isCustom}
							onClick={(e) => {
								setIsCustom(true);
								setValue("");
							}}
						/>
						{isCustom && (
							<Form.Control
								className="mt-1"
								style={{ width: "100%" }}
								type="text"
								placeholder="Custom value"
								value={customValue}
								onChange={(e) => setCustomValue(e.target.value)}
							/>
						)}
					</div>
				</Form>
				<UpdateCardFooter
					className="health__card__footer__fixed"
					onSubmit={handleSubmit}
					onCancel={reset}
					submitting={submitting}
				/>
			</div>
		</>
	);
}
