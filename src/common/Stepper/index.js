import React from "react";

export default function Stepper({ activeStep, children }) {
	return (
		<div className="stepper__wrapper" style={{ width: "100%" }}>
			{React.Children.map(children, (child, index) => {
				return React.cloneElement(child, {
					isActive: activeStep === index + 1,
					index: index + 1,
				});
			})}
		</div>
	);
}
