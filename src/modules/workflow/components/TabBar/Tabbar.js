import React from "react";
import { Helmet } from "react-helmet";
import { TabNavItemApps } from "../../../../components/Departments/TabsNavItemApps";
import { useSelector } from "react-redux";
import { getValueFromLocalStorage } from "utils/localStorage";

export function changePageTitleIfTabChanged(title) {
	return (
		<Helmet>
			<title>{title}</title>
		</Helmet>
	);
}
export default function Tabbar({ enableBetaFeatures }) {
	const hash = useSelector((state) => state.router.location.hash);
	const userInfo = useSelector((state) => state.userInfo);
	let pageTitle = "";
	if (hash == "#playbooks") {
		pageTitle = `Playbook - ${userInfo?.org_name} - ${
			getValueFromLocalStorage("partner")?.name
		}`;
	} else if (hash == "#drafts") {
		pageTitle = `Drafts - ${userInfo?.org_name} - ${
			getValueFromLocalStorage("partner")?.name
		}`;
	} else if (hash == "#completed") {
		pageTitle = `Completed - ${userInfo?.org_name} - ${
			getValueFromLocalStorage("partner")?.name
		}`;
	} else if (hash == "#overview") {
		pageTitle = `Overview - ${userInfo?.org_name} - ${
			getValueFromLocalStorage("partner")?.name
		}`;
	} else if (hash == "#rules") {
		pageTitle = `Automation Rules - ${userInfo?.org_name} - ${
			getValueFromLocalStorage("partner")?.name
		}`;
	} else if (hash === "#runs") {
		pageTitle = `Scheduled Runs - ${userInfo?.org_name} - ${
			getValueFromLocalStorage("partner")?.name
		}`;
	}
	return (
		<div style={{ padding: "0px 40px" }}>
			<ul className="nav nav-tabs">
				<TabNavItemApps hash="#overview" text="Overview" />
				<TabNavItemApps hash="#drafts" text="Drafts" />
				<TabNavItemApps hash="#playbooks" text="Playbooks" />
				<TabNavItemApps hash="#completed" text="Run logs" />
				<TabNavItemApps hash="#runs" text="Scheduled Runs" />
				<TabNavItemApps hash="#rules" text="Automation Rules" />
			</ul>
			{changePageTitleIfTabChanged(pageTitle)}
		</div>
	);
}
