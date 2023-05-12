import React from "react";
import { Form } from "react-bootstrap";
import { capitalizeFirstLetter } from "utils/common";
import {
	amortizationOptions,
	tooltipTexts,
} from "modules/licenses/constants/LicenseConstants";
import { HeaderFormatter } from "modules/licenses/utils/LicensesUtils";

export default function ContractCostAmortization({ data, updateData }) {
	return (
		<div className="d-flex flex-column w-50">
			<div className="d-flex font-14 bold-600 mt-4 mb-1">
				<HeaderFormatter
					text="Cost Amortization"
					tooltipContent={tooltipTexts.COST_AMORTIZATION}
				/>
			</div>
			<div className="d-flex">
				{amortizationOptions.map((option, index) => (
					<Form.Check
						inline
						key={index}
						type="radio"
						label={capitalizeFirstLetter(
							option.replaceAll("_", " ")
						)}
						name="amortization"
						id={`amortization_${option}`}
						checked={data.cost_amortization === option}
						onClick={() => {
							updateData({
								cost_amortization: option,
							});
						}}
					/>
				))}
			</div>
		</div>
	);
}
