import React from "react";
import { useSelector } from "react-redux";
import TaskListFilters from "./TaskListFilters";
import TaskManagementSort from "./TaskManagementSort";
import TaskActionsBulkEdit from "./TaskActionsBulkEdit";
import TaskListStatusFilter from "./TaskListStatusFilter";
import TaskManagementSearch from "./TaskManagementSearch";
import TaskExpandCollapseAll from "./TaskExpandCollapseAll";
import TaskManagementRefresh from "./TaskManagementRefresh";
import { Beta } from "modules/shared/components/BetaTagAndModal/Beta/beta";

export default function TaskManagementHeader() {
	const { checkedTaskActionIds } = useSelector((state) => state.tasks);

	return (
		<>
			<div className="task_management_header_and_filters">
				<div className="task_management_header">
					<div className="font-17 bold-600">My Tasks</div>
					<Beta style={{ fontSize: "16px", fontWeight: "600" }} />
					<div className="d-flex ml-auto" style={{ gap: "10px" }}>
						<TaskManagementSearch />
						<TaskManagementRefresh />
						<TaskManagementSort />
					</div>
				</div>
				<div className="task_management_filters">
					{Array.isArray(checkedTaskActionIds) &&
					checkedTaskActionIds?.length > 0 ? (
						<TaskActionsBulkEdit />
					) : (
						<>
							<TaskListStatusFilter />
							<TaskListFilters />
							<TaskExpandCollapseAll />
						</>
					)}
				</div>
			</div>
		</>
	);
}
