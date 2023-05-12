import React from "react";
import { useDispatch } from "react-redux";
import Add from "assets/add.svg";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import { AddUserToDepartmentOptions } from "../constants/DepartmentConstants";

export default function AddUserToDepartmentsDropdown({
	deptId,
	deptName,
	handleRefresh,
	emptyScreen = false,
}) {
	const dispatch = useDispatch();
	return (
		<Dropdown
			toggler={
				emptyScreen ? (
					<div className="btn btn-primary">+ Add Users</div>
				) : (
					<div className="appsad mr-3">
						<img src={Add} />
						<span id="te">Add</span>
					</div>
				)
			}
			options={AddUserToDepartmentOptions}
			onOptionSelect={(option) =>
				option.onClick({ dispatch, deptId, deptName, handleRefresh })
			}
			optionFormatter={(option) => option.label}
			menuStyle={{ zIndex: "60", width: "150px" }}
			right={emptyScreen ? 0 : 15}
		/>
	);
}
