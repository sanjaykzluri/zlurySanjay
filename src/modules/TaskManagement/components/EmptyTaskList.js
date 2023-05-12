import React from "react";
import { Loader } from "common/Loader/Loader";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import { emptyTaskListTypes } from "../constants/TaskManagement.constants";
import TaskContentLoader from "./TaskContentLoader";

export default function EmptyTaskList({
	error,
	loading,
	searchQuery,
	appliedFilters,
}) {
	const emptyListType = searchQuery
		? emptyTaskListTypes.search.type
		: appliedFilters.length > 0
		? emptyTaskListTypes.filter.type
		: error
		? emptyTaskListTypes.error.type
		: emptyTaskListTypes.empty.type;

	return (
		<>
			{loading ? (
				<TaskContentLoader />
			) : (
				<div className="empty_task_list">
					<NumberPill
						number={
							<img
								src={emptyTaskListTypes[emptyListType].img}
								width={24}
								height={24}
								alt=""
							/>
						}
						pillHeight={50}
						borderRadius={"50%"}
						style={{ width: "50px", marginBottom: "14px" }}
						{...emptyTaskListTypes[emptyListType].pillProps}
					/>
					<div
						className="bold-600 font-17 black text-align-center"
						style={{ width: "400px", wordWrap: "break-word" }}
					>
						{emptyTaskListTypes[emptyListType].title(searchQuery)}
					</div>
					<div className="bold-600 font-11 grey">
						{emptyTaskListTypes[emptyListType].subText}
					</div>
				</div>
			)}
		</>
	);
}
