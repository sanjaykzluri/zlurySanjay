import React from "react";
import { useHistory } from "react-router-dom";
import greenTick from "assets/green_tick.svg";
import { Button } from "UIComponents/Button/Button";
import handWave from "assets/optimization/handWave.svg";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import { OptimizationGetStartedSteps } from "./constants/OptimizationConstants";

export default function OptimizationGetStarted({
	contractCount = 0,
	licenseCount = 0,
	userAppLicenseCount = 0,
	entityId,
	entityType,
}) {
	const history = useHistory();
	const activeStep =
		!contractCount || !licenseCount ? 0 : !userAppLicenseCount ? 1 : 2;
	return (
		<div className="d-flex flex-column" style={{ padding: "55px 80px" }}>
			<div className="optimization_getting_started_box">
				<div className="d-flex lightGreyBg" style={{ padding: "20px" }}>
					<img src={handWave} alt="" height={36} width={36} />
					<div className="d-flex flex-column ml-2">
						<div className="font-16">Getting Started</div>
						<div className="font-13 grey-1">
							Complete these steps before you optimize your
							licenses
						</div>
					</div>
				</div>
				<div
					className="d-flex align-items-center justify-content-between h-100"
					style={{ padding: "14px 20px" }}
				>
					<div
						className="d-flex flex-column justify-content-between"
						style={{ height: "144px" }}
					>
						{OptimizationGetStartedSteps.map((step, index) => (
							<div
								className={`d-flex align-items-center border-radius-4 ${
									index === activeStep ? "lightGreyBg" : ""
								}`}
								key={index}
								style={{ padding: "8px 12px" }}
							>
								{index < activeStep ? (
									<img
										src={greenTick}
										alt=""
										height={24}
										width={24}
									/>
								) : (
									<NumberPill number={index + 1} />
								)}
								<div className="font-14 ml-2">{step.title}</div>
							</div>
						))}
					</div>
					<div className="optimization_get_started_step_box">
						<div className="mr-1">
							<div className="font-16 bold-600 grey-1">
								{OptimizationGetStartedSteps[activeStep].title}
							</div>
							<div className="font-14 grey-1 mt-1 mb-2">
								{
									OptimizationGetStartedSteps[activeStep]
										.description
								}
							</div>
							<Button
								type="primary"
								onClick={() =>
									OptimizationGetStartedSteps[
										activeStep
									].buttonClick(history, entityId, entityType)
								}
							>
								{OptimizationGetStartedSteps[
									activeStep
								].buttonText(entityType)}
							</Button>
						</div>
						<img
							src={OptimizationGetStartedSteps[activeStep].image}
							alt=""
							height={184}
							width={264}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
