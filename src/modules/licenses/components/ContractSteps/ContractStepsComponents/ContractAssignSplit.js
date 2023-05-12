import { assignSplitOptions } from "modules/licenses/constants/LicenseConstants";
import React from "react";
import { Form } from "react-bootstrap";
import { capitalizeFirstLetter } from "utils/common";

export default function ContractAssignSplit({ data, updateData }) {
	return (
		<div className="d-flex flex-column ml-4">
			<div className="font-14 bold-600 mt-4 mb-1">
				Assign Split Based On
			</div>
			<div className="d-flex">
				{assignSplitOptions.map((option, index) => (
					<Form.Check
						inline
						key={index}
						type="radio"
						label={capitalizeFirstLetter(
							option.replaceAll("_", " ")
						)}
						name="cost_split_period"
						id={`cost_split_period_${option}`}
						checked={data.cost_split_period === option}
						onClick={() => {
							updateData({
								cost_split_period: option,
							});
						}}
					/>
				))}
			</div>
		</div>
	);
}
