import React from "react";
import { useDispatch, useSelector } from "react-redux";
import AnimateHeight from "react-animate-height";
import { Card } from "react-bootstrap";
import greenTick from "../../assets/green_tick.svg";

import "./styles.css";
import { updateStep } from "./redux";

export default function Step({ title, index, isActive, children, activeStep }) {
	const dispatch = useDispatch();
	const { stepperCardWidth } = useSelector((state) => state.stepper);
	return (
		<div
			className="stepper__step  justify-content-center"
			onClick={() => index < activeStep && dispatch(updateStep(index))}
		>
			<div
				className={
					isActive
						? "stepper__active__indicator"
						: "stepper__indicator"
				}
			>
				{index}
			</div>
			<div className="line"></div>
			<Card
				className={`stepper__step__card ${isActive ? "active" : ""}`}
				style={{ width: stepperCardWidth }}
			>
				<Card.Header className="">
					<>
						<div
							className={`gettingstarted__item__toggle-left__section d-flex align-items-center ${
								isActive || index < activeStep ? "" : "inactive"
							}`}
						>
							<span>{title}</span>
							{index < activeStep && (
								<img
									src={greenTick}
									width={18}
									height={18}
									className="ml-2"
								/>
							)}
						</div>
					</>
				</Card.Header>
				<AnimateHeight duration={500} height={isActive ? "auto" : 0}>
					<Card.Body
						className={`step__collapse`}
						style={{ height: isActive ? "auto" : 0 }}
					>
						<div className="gettingstarted__item__body__description">
							{children}
						</div>
					</Card.Body>
				</AnimateHeight>
			</Card>
		</div>
	);
}
