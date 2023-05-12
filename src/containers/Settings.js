import React from "react";
import Strips from "../common/restrictions/Strips";
import HeaderTitleBC from "../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { Settingsins } from "../components/Settings/Settings";
import { ENTITIES } from "../constants";

export function Settings() {
	return (
		<>
			<Strips entity={ENTITIES.SETTINGS} />
			<HeaderTitleBC title="Settings" />
			<hr style={{ margin: "0px 40px" }}></hr>
			<Settingsins />
		</>
	);
}
