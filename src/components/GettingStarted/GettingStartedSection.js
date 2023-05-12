import React from "react";
import GettingStartedItem from "./GettingStartedItem";
import stepDot from "../../assets/stepDot.svg";

export default function GettingStartedSection({
	title,
	items,
	gettingStartedStatuses,
}) {


	return (
		<div className="step">
			<div className="getting__started-stepper ml-5 w-100">
				<div className="getting__started-title mb-4">{title}</div>
				<div>
					{items.map((item) =>
						<GettingStartedItem
							key={item.title}
							{...item}
							isCompleted={gettingStartedStatuses[item.key]}
						/>
					)}
				</div>
			</div>
			<img className="step-dot" src={stepDot} />
			<div className="line"></div>
		</div>
	);
}
