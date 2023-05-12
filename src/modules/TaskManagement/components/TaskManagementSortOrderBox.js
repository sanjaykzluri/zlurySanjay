import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useOutsideClick from "common/OutsideClick/OutsideClick";
import { applyTaskSort } from "../redux/TaskManagement.actions";
import { taskManagementSortOrderOptions } from "../constants/TaskManagement.constants";

export default function TaskManagementSortOrderBox({
	sort,
	reRenderDropdown,
	setReRenderDropdown,
}) {
	const sortRef = useRef();
	const dispatch = useDispatch();
	const [showSortBox, setShowSortBox] = useState(false);

	const { taskListRequestPayload } = useSelector((state) => state.tasks);

	useOutsideClick(sortRef, () => {
		if (showSortBox) setShowSortBox(false);
	});

	const sortOrderIsActive = (sort, order) => {
		const { sort_by } = taskListRequestPayload;
		const sortObj = sort_by?.[0] || {};
		return (
			Object.keys(sortObj)?.[0] === sort.key &&
			Object.values(sortObj)?.[0] === order.value
		);
	};

	return (
		<>
			<div
				className="task_list_sort_box_toggler"
				ref={sortRef}
				onClick={() => setShowSortBox(true)}
			>
				{sort.text}
				{showSortBox && (
					<>
						<div className="task_list_sort_box">
							{taskManagementSortOrderOptions.map(
								(order, index) => (
									<React.Fragment key={index}>
										<div
											className={
												"task_list_sort_order_option"
											}
											style={
												sortOrderIsActive(sort, order)
													? { background: "#E8F0FC" }
													: {}
											}
											onClick={() => {
												dispatch(
													applyTaskSort(
														sort.key,
														order.value
													)
												);
												setReRenderDropdown(
													!reRenderDropdown
												);
											}}
										>
											{order.text}
										</div>
									</React.Fragment>
								)
							)}
						</div>
					</>
				)}
			</div>
		</>
	);
}
