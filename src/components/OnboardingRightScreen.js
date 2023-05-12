import React from "react";
import carouselimage2 from "./Onboarding/carouselimage2.svg";
import carouselimage1 from "./Onboarding/carouselimage1.svg";
export default function OnboardingRightScreen() {
	return (
		<div className="verify-right-sidebar text-center">
			<div className="">
				<img src={carouselimage1} />
				<img src={carouselimage2} />
			</div>
			<div>
				<h3 className="font-22">Get timely recommendations </h3>
				<p className="o-8 bold-400">
					Get recommendations that’ll help your team optimize SaaS
					spendings and stick to the annual budget
				</p>
			</div>
		</div>
	);
}
