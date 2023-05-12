import { kFormatter } from "constants/currency";
import { licenseUtilizationTooltipArray } from "modules/licenses/constants/LicenseConstants";
import React, { useRef } from "react";
import { Tooltip } from "react-bootstrap";
import { capitalizeFirstLetter } from "utils/common";
import OverlayTooltip from "../../../UIComponents/OverlayToolTip";
import { LicenseUtilizationTooltip } from "./LicenseUtilizationTooltip";

export function LicenseUtilization({
	appId,
	licenseId,
	utilization,
	totalLicenses,
}) {
	const tooltipRef = useRef();

	return (
		<OverlayTooltip
			placement="bottom"
			isStickyTooltip
			overlay={
				<Tooltip bsPrefix="license-utilization-tooltip">
					<LicenseUtilizationTooltip
						totalLicenses={totalLicenses}
						utilization={utilization}
						licenseId={licenseId}
						appId={appId}
					/>
				</Tooltip>
			}
		>
			<div
				className="d-flex flex-column justify-content-center"
				ref={tooltipRef}
			>
				<div
					className="d-flex flex-row"
					style={{ width: "162px", height: "11px" }}
				>
					{utilization &&
						licenseUtilizationTooltipArray.map((element, index) => (
							<div
								key={index}
								className="h-100"
								style={{
									width: `${
										(utilization[element.numberKey] /
											totalLicenses) *
										100
									}%`,
									backgroundColor: element.color,
									borderRadius:
										index === 0
											? "30px 0px 0px 30px"
											: index === 4
											? "0px 30px 30px 0px"
											: null,
								}}
							/>
						))}
				</div>
				<div className="d-flex align-items-center">
					<div
						className="pt-2 cursor-default"
						style={{ color: "#82B0E7" }}
					>
						<span className="bold-600">
							{`${kFormatter(
								utilization?.aggregated_annual_potential_savings
							)}/Y Potential Savings`}
						</span>
					</div>
				</div>
			</div>
		</OverlayTooltip>
	);
}
