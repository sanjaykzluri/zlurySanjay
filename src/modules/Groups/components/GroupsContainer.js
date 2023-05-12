import React from "react";
import GroupsTable from "./GroupsTable";
import HeaderTitleBC from "components/HeaderTitleAndGlobalSearch/HeaderTitleBC";

export default function GroupsContainer({}) {
	return (
		<>
			<HeaderTitleBC title={"Groups"} isBeta={true} />
			<GroupsTable />
		</>
	);
}
