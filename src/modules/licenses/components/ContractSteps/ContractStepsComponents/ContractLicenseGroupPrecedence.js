import React from "react";
import { Form } from "react-bootstrap";
import { capitalizeFirstLetter } from "utils/common";
import { HeaderFormatter } from "modules/licenses/utils/LicensesUtils";
import {
	licenseGroupPrecedenceOptions,
	tooltipTexts,
} from "modules/licenses/constants/LicenseConstants";

export default function ContractLicenseGroupPrecedence({ data, updateData }) {
	return (
		<div className="d-flex flex-column">
			<div className="d-flex font-14 bold-600 mt-4 mb-1">
				<HeaderFormatter
					text="License Assignment Precedence"
					tooltipContent={tooltipTexts.LICENSE_GROUP_PRECEDENCE}
				/>
			</div>
			<div className="d-flex">
				{licenseGroupPrecedenceOptions.map((option, index) => (
					<Form.Check
						inline
						key={index}
						type="radio"
						label={capitalizeFirstLetter(
							option.replaceAll("_", " ")
						)}
						name="license_group_precedence"
						id={`license_group_precedence_${option}`}
						checked={data.license_group_precedence === option}
						onClick={() => {
							updateData({
								license_group_precedence: option,
							});
						}}
					/>
				))}
			</div>
		</div>
	);
}
