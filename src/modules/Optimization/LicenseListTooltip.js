import { kFormatter } from "constants/currency";
import React from "react";
import { Tooltip } from "react-bootstrap";
import OverlayTooltip from "UIComponents/OverlayToolTip";
import { licenseListTooltipKeyHeaderCSS } from "./constants/OptimizationConstants";

export default function LicenseListTooltip({ children, licenses = [] }) {
	return (
		<div className="position-relative">
			{Array.isArray(licenses) && licenses.length ? (
				<OverlayTooltip
					placement="bottom"
					isStickyTooltip
					overlay={
						<Tooltip bsPrefix="license_list_tooltip_container">
							<LicenseListTooltipContent licenses={licenses} />
						</Tooltip>
					}
				>
					{children}
				</OverlayTooltip>
			) : (
				children
			)}
		</div>
	);
}

function LicenseListTooltipContent({ licenses }) {
	return (
		<div className="license_list_tooltip">
			<div className="d-flex">
				{licenseListTooltipKeyHeaderCSS.map((el) => (
					<div className="bold-400 font-9 grey-1" style={el.style}>
						{el.header}
					</div>
				))}
			</div>
			<hr className="w-100 my-1" />
			<div className="d-flex flex-column">
				{Array.isArray(licenses) &&
					licenses.map((license) => {
						return (
							<div className="d-flex">
								{licenseListTooltipKeyHeaderCSS.map((el) => (
									<div
										className="font-11 bold-400"
										style={el.style}
									>
										{el.key === "quantity"
											? Number(
													(
														license[el.key] || 0
													)?.toFixed(2)
											  )
											: el.key === "cost"
											? kFormatter(license[el.key])
											: license[el.key]}
									</div>
								))}
							</div>
						);
					})}
			</div>
		</div>
	);
}
