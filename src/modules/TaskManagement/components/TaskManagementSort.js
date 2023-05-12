import React, { useState } from "react";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import sortIcon from "modules/TaskManagement/assets/sortIcon.svg";
import TaskManagementSortOrderBox from "./TaskManagementSortOrderBox";
import { taskManagementSortOptions } from "../constants/TaskManagement.constants";

export default function TaskManagementSort() {
	const [reRenderDropdown, setReRenderDropdown] = useState(false);
	return (
		<>
			<Dropdown
				key={reRenderDropdown}
				toggler={
					<div className="task_management_sort_box">
						<img
							src={sortIcon}
							height={12}
							width={12}
							alt=""
							className="task_management_sort_icon"
						/>
					</div>
				}
				options={taskManagementSortOptions}
				optionFormatter={(option) => (
					<TaskManagementSortOrderBox
						sort={option}
						reRenderDropdown={reRenderDropdown}
						setReRenderDropdown={setReRenderDropdown}
					/>
				)}
				isParentDropdown={true}
				menuClassName="task_list_sort_menu"
				optionClassName="task_list_sort_option"
			/>
		</>
	);
}
