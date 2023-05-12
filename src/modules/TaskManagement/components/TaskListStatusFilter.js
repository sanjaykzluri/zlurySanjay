import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeStatusFilter } from "../redux/TaskManagement.actions";
import { taskManagementStatusFilterOptions } from "../constants/TaskManagement.constants";

export default function TaskListStatusFilter() {
	const dispatch = useDispatch();
	const { includedStatusesInFilter } = useSelector((state) => state.tasks);

	return (
		<>
			<div className="task_management_status_filter">
				{taskManagementStatusFilterOptions.map((filter, index) => (
					<React.Fragment key={index}>
						<div
							className={
								includedStatusesInFilter.includes(filter.status)
									? "task_management_status_filter_pill_active"
									: "task_management_status_filter_pill_inactive"
							}
							onClick={() =>
								dispatch(changeStatusFilter(filter.status))
							}
						>
							{filter.text}
						</div>
					</React.Fragment>
				))}
			</div>
		</>
	);
}
