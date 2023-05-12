import useOutsideClick from "common/OutsideClick/OutsideClick";
import React, { useRef, useState } from "react";
import { Form } from "react-bootstrap";

export default function TaskListFilterBox({
	filter,
	appliedFilters,
	setAppliedFilters,
}) {
	const filterRef = useRef();
	const [showFilterBox, setShowFilterBox] = useState(false);

	useOutsideClick(filterRef, () => {
		if (showFilterBox) setShowFilterBox(false);
	});

	const handleSelectFilterChange = (filter, value) => {
		const tempAppliedFilters = [...appliedFilters];
		const filterIndex = tempAppliedFilters.findIndex(
			(appliedFilter) => appliedFilter.field_id === filter.field_id
		);
		if (filterIndex > -1) {
			const fieldValueIndex = tempAppliedFilters[
				filterIndex
			].field_values.findIndex((field_value) => field_value === value);
			if (fieldValueIndex > -1) {
				tempAppliedFilters[filterIndex].field_values.splice(
					fieldValueIndex,
					1
				);
			} else {
				tempAppliedFilters[filterIndex].field_values.push(value);
			}
		} else {
			const tempFilter = { ...filter, field_values: [value] };
			tempAppliedFilters.push(tempFilter);
		}
		setAppliedFilters([...tempAppliedFilters]);
	};

	const selectFieldValueIsChecked = (filter, value) => {
		const tempAppliedFilters = [...appliedFilters];
		const filterIndex = tempAppliedFilters.findIndex(
			(appliedFilter) => appliedFilter.field_id === filter.field_id
		);
		if (filterIndex > -1) {
			return tempAppliedFilters[filterIndex].field_values.includes(value);
		} else {
			return false;
		}
	};

	const filterBoxContentMap = (filter) => {
		switch (filter.field_type) {
			case "string": // remove after changing BE
			case "select":
				return (
					<>
						<div className="task_list_select_filter">
							{Array.isArray(filter.field_values) &&
								filter.field_values.map((value, index) => (
									<React.Fragment key={index}>
										<Form.Check
											label={
												<div
													className={`text-capitalize font-10 grey${
														selectFieldValueIsChecked(
															filter,
															value
														)
															? " bold-700"
															: ""
													}`}
													style={{ marginTop: "3px" }}
												>
													{value?.replaceAll(
														"_",
														" "
													)}
												</div>
											}
											checked={selectFieldValueIsChecked(
												filter,
												value
											)}
											onClick={() =>
												handleSelectFilterChange(
													filter,
													value
												)
											}
										/>
									</React.Fragment>
								))}
						</div>
					</>
				);
			case "date_range":
				return <>DATE RANGE FILTER</>; // TODO
			default:
				return <></>;
		}
	};

	return (
		<>
			<div
				className="task_list_filter_box_toggler"
				ref={filterRef}
				onClick={() => setShowFilterBox(true)}
			>
				{filter.field_name}
				{showFilterBox && (
					<>
						<div className="task_list_filter_box">
							<div className="font-11 bold-700 grey">
								{filter.field_name}
							</div>
							{filterBoxContentMap(filter)}
						</div>
					</>
				)}
			</div>
		</>
	);
}
