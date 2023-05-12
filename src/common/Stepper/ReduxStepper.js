import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Stepper from ".";
import Step from "./Step";
import { setInititalStepperState, updateStep } from "./redux";

import "./styles.css";

export default function ReduxStepper({ steps = [] }) {
	const activeStep = useSelector(
		(state) => state.stepper.stepConfig.activeStep
	);
	const screen = useSelector((state) => state.stepper.screen);

	useEffect(() => {
		return function cleanup() {
			if (screen === "OVERVIEW" || screen === "STEPPER")
				dispatch(setInititalStepperState());
		};
	}, []);

	const dispatch = useDispatch();

	return (
		<div className="plan__stepper">
			<Stepper activeStep={activeStep}>
				{Array.isArray(steps) &&
					steps.map((step, index) => (
						<Step
							key={index}
							title={step.title}
							index={index}
							activeStep={activeStep}
						>
							{React.cloneElement(step.component, {
								updateStep: () =>
									dispatch(updateStep(index + 2)),
								index,
							})}
						</Step>
					))}
			</Stepper>
		</div>
	);
}
