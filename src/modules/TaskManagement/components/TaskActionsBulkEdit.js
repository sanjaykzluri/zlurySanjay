import React from "react";
import { useDispatch } from "react-redux";
import { uncheckAllTaskActions } from "../redux/TaskManagement.actions";

export default function TaskActionsBulkEdit({}) {
	const dispatch = useDispatch();
	return (
		<>
			<div className="d-flex w-100" style={{ gap: "10px" }}>
				<div className="task_management_filter_pill_inactive">
					Mark all as complete
				</div>
				<div className="task_management_filter_pill_inactive">
					Approve all
				</div>
				<div className="task_management_filter_pill_inactive">
					Reject all
				</div>
				<div
					className="task_management_filter_pill_inactive ml-auto"
					onClick={() => dispatch(uncheckAllTaskActions())}
				>
					Reset
				</div>
			</div>
		</>
	);
}
