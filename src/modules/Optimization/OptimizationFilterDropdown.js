import React, { useState } from "react";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import { optimizationFilters } from "./constants/OptimizationConstants";
import bluearrowdropdown from "assets/licenses/bluearrowsdropdown.svg";
import { useDispatch, useSelector } from "react-redux";
import { setOptimizationFilter } from "./redux/Optimization-action";

export default function OptimizationFilterDropdown({
	filterType,
	filterIndex,
	generatingPdf,
}) {
	const dispatch = useDispatch();
	const { selected_filter: selectedFilter } = useSelector(
		(state) => state.optimization
	);
	let filterStringArr = selectedFilter.split("_");
	const options = optimizationFilters[filterType];

	const [selectedOption, setSelectedOption] = useState(
		Array.isArray(options) &&
			options.find(
				(option) => option.value == filterStringArr[filterIndex]
			)
	);

	const handleFilterOptionChange = (option) => {
		setSelectedOption(option);
		filterStringArr[filterIndex] = option.value?.toString();
		dispatch(setOptimizationFilter(filterStringArr?.join("_")));
	};

	return (
		<Dropdown
			options={optimizationFilters[filterType]}
			toggler={
				<div className="d-flex">
					<div className="primary-color font-16 mr-1">
						{selectedOption.label}
					</div>
					{!generatingPdf && <img src={bluearrowdropdown} />}
				</div>
			}
			optionFormatter={(option) => option.label}
			onOptionSelect={(option) => handleFilterOptionChange(option)}
			menuStyle={{ width: "max-content" }}
		/>
	);
}
