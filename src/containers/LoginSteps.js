import React from "react";
import StepsAll from "../components/Onboarding/StepsAll";
import { SidebarLogin } from "../components/Sidebarlogin/SidebarLogin";

export function LoginSteps() {
	return (
		<>
			<SidebarLogin>
				<StepsAll></StepsAll>
			</SidebarLogin>
		</>
	);
}
