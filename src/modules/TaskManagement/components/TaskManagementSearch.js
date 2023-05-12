import React, { useRef, useState } from "react";
import searchClose from "assets/close.svg";
import { useDispatch, useSelector } from "react-redux";
import { useOutsideClickListener } from "utils/clickListenerHook";
import searchGlass from "modules/TaskManagement/assets/searchGlass.svg";
import { changeTaskSearchQuery } from "../redux/TaskManagement.actions";

export default function TaskManagementSearch() {
	const searchRef = useRef();
	const dispatch = useDispatch();
	const { searchQuery } = useSelector((state) => state.tasks);

	const [searchIsActive, setSearchIsActive] = useState(false);

	useOutsideClickListener(searchRef, () => {
		if (searchQuery && searchQuery.length < 1) {
			setSearchIsActive(false);
		}
	});

	return (
		<>
			<div
				ref={searchRef}
				className={`task_management_search_box ${
					searchIsActive
						? "task_management_search_active"
						: "task_management_search_inactive"
				}`}
				onClick={() => setSearchIsActive(true)}
			>
				<img
					src={searchGlass}
					height={12}
					width={12}
					alt=""
					className="task_management_search_glass"
				/>
				<input
					type="text"
					placeholder="Search Tasks"
					value={searchQuery}
					onChange={(e) =>
						dispatch(
							changeTaskSearchQuery(e.target.value?.trimStart())
						)
					}
					className="task_management_search_input"
				/>
				{searchIsActive && (
					<img
						className="task_management_search_close"
						src={searchClose}
						aria-hidden="true"
						height={9}
						width={9}
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							setSearchIsActive(false);
						}}
					/>
				)}
			</div>
		</>
	);
}
