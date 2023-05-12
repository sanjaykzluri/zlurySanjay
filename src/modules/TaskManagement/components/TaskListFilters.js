import React, { useState } from "react";
import TaskListFilterBox from "./TaskListFilterBox";
import { useDispatch, useSelector } from "react-redux";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import { applyTaskFilters } from "../redux/TaskManagement.actions";
import { removeFiltersWithEmptyFieldValues } from "../util/TaskManagement.utils";

export default function TaskListFilters({}) {
	const dispatch = useDispatch();
	const { taskListFilters, taskListRequestPayload } = useSelector(
		(state) => state.tasks
	);

	const [appliedFilters, setAppliedFilters] = useState([
		...taskListRequestPayload.filter_by,
	]);

	const [reRenderDropdown, setReRenderDropdown] = useState(false);

	return (
		<>
			<Dropdown
				key={reRenderDropdown}
				toggler={
					<div className="task_list_filters_toggler">+ Filter</div>
				}
				options={[...taskListFilters, "apply_and_clear_all_buttons"]}
				isParentDropdown={true}
				optionFormatter={(filter) =>
					filter !== "apply_and_clear_all_buttons" ? (
						<TaskListFilterBox
							filter={filter}
							appliedFilters={appliedFilters}
							setAppliedFilters={setAppliedFilters}
						/>
					) : (
						<div className="task_list_filters_menu_footer">
							<div
								className="task_list_filters_clear_all"
								onClick={() => setAppliedFilters([])}
							>
								Clear All
							</div>
							<div
								className="task_list_filters_apply"
								onClick={() => {
									dispatch(
										applyTaskFilters(
											removeFiltersWithEmptyFieldValues(
												appliedFilters
											)
										)
									);
									setReRenderDropdown(!reRenderDropdown);
								}}
							>
								Apply
							</div>
						</div>
					)
				}
				menuClassName="task_list_filters_menu"
				optionClassName="task_list_filter_option"
				optionIsNotSelectable={(option) =>
					option === "apply_and_clear_all_buttons"
				}
				disabledOptionClassName="task_list_filter_disabled_option"
			/>
		</>
	);
}
