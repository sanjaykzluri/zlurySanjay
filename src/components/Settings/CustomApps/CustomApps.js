import React from "react";
import "./CustomApps.css";
import { CustomAppsTable } from "./CustomAppsTable";
import { Helmet } from "react-helmet";
import { getValueFromLocalStorage } from "utils/localStorage";

export class CustomApps extends React.Component {
	render() {
		return (
			<>
				<Helmet>
					<title>
						{"Custom Apps - " +
							getValueFromLocalStorage("userInfo")?.org_name +
							" - " +
							getValueFromLocalStorage("partner")?.name}
					</title>
				</Helmet>
				<div className="acc__cont">
					<div className="acc__cont__d1">Custom Apps</div>
					<div className="ca__cont__d1">
						Custom Apps are applications either added by you or
						identified by us through our integrations that are not
						present in our database.
					</div>
					<div className="ca__table__cont">
						<CustomAppsTable />
					</div>
				</div>
			</>
		);
	}
}
