import React from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import HeaderTitleBC from "../components/HeaderTitleAndGlobalSearch/HeaderTitleBC.js";
import { Overviewins } from "../components/Overview/Overviewins";
import { getValueFromLocalStorage } from "../utils/localStorage";

export function Overview(props) {
	const location = useLocation();
	return (
		<>
			<Helmet>
				<title>
					{`Overview -
					${
						getValueFromLocalStorage("userInfo")?.org_name
							? getValueFromLocalStorage("userInfo")?.org_name +
							  " -"
							: ""
					}
					${getValueFromLocalStorage("partner")?.name}`}
				</title>
			</Helmet>
			<HeaderTitleBC title="Overview" />
			<Overviewins />
		</>
	);
}
