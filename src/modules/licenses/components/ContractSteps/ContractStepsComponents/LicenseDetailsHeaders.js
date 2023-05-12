import React from "react";
import {
	LicenseDetailsCSS,
	screenEntity,
	tooltipTexts,
} from "modules/licenses/constants/LicenseConstants";
import { HeaderFormatter } from "modules/licenses/utils/LicensesUtils";

export default function LicenseDetailsHeaders({
	entity,
	reviewStep = false,
	overview = false,
}) {
	return (
		<div className="license_details_section_headers">
			{[
				"License Type",
				"License Name",
				entity === screenEntity.CONTRACT
					? "License Term"
					: "Start Date",
				"Cost/License",
				"Discount",
				"Quantity",
				entity === screenEntity.SUBSCRIPTION
					? "Auto Adjust"
					: "Auto Increment",
				"Cost/Term",
				!reviewStep && !overview && "Edit",
				!reviewStep && !overview && "Remove",
			].map(
				(header, index) =>
					header && (
						<div
							className="d-flex bold-500 font-10 o-5"
							key={index}
							style={LicenseDetailsCSS[header]}
						>
							{!["Remove", "Edit"].includes(header) ? (
								header.includes("Auto") ? (
									<HeaderFormatter
										text={header}
										tooltipContent={
											tooltipTexts[
												header
													?.toUpperCase()
													?.replaceAll(" ", "_")
											]
										}
									/>
								) : (
									header
								)
							) : (
								""
							)}
						</div>
					)
			)}
		</div>
	);
}
