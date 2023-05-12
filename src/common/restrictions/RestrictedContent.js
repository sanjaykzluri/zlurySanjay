import React from "react";
import "./styles.css";
import { planSelector } from ".";
import RestrictedMessage from "./RestrctedMessage";
import { useSelector } from "react-redux";
const restrictedPlans = ["basic"];


function RestrictedContent({ entity, children }) {
	const plan = useSelector(planSelector);
	return (
		<>
			{restrictedPlans.includes(plan) ? (
				<RestrictedMessage entity={entity} />
			) : (
				children
			)}
		</>
	);
}

export default RestrictedContent;
