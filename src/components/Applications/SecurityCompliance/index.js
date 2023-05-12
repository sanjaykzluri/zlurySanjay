import React from "react";
import { Header } from "./Header";
import OverviewField from "./OverviewField";
import "./styles.css";
import { Tabs } from "./Tabs";
export default function SecurityCompliance(props) {
	return (
		<>
			<div className="securityoverview__wrapper">
				<div className="securityoverview__left mr-0">
					<Header application={props.application} />
					<OverviewField />
				</div>
				<div className="securityoverview__right">
					<Tabs application={props.application} />
				</div>
			</div>
		</>
	);
}
