import React from "react";
import { useHistory } from "react-router-dom";
import { kFormatter } from "constants/currency";
import linkArrow from "../../../assets/linkArrow.svg";
import { licenseUtilizationTooltipArray } from "modules/licenses/constants/LicenseConstants";
import { optimizationDefaultFilter } from "modules/Optimization/constants/OptimizationConstants";
import { optimizationAmountType } from "modules/Optimization/constants/OptimizationConstants";
import { useContext } from "react";
import RoleContext from "services/roleContext/roleContext";
export function LicenseUtilizationTooltip({
	appId,
	licenseId,
	utilization = {},
}) {
	const { partner } = useContext(RoleContext);
	const history = useHistory();
	return (
		<div className="license_utilization_tooltip_content">
			<div className="d-flex flex-column justify-content-between h-100">
				<div className="d-flex font-8 grey-1 o-6">
					<div style={{ width: "140px" }}>Type</div>
					<div style={{ width: "100px" }}>No. of licenses</div>
					<div
						className="d-flex flex-column"
						style={{ width: "100px" }}
					>
						<div>Potential Savings</div>
						<div>{`(per month)`}</div>
					</div>
					<div
						className="d-flex flex-column"
						style={{ width: "100px" }}
					>
						<div>Potential Savings</div>
						<div>{`(per year)`}</div>
					</div>
				</div>
				<hr className="w-100 m-0" />
				{licenseUtilizationTooltipArray.map((element, index) => (
					<div className="d-flex font-12" key={index}>
						<div
							className="d-flex align-items-center"
							style={{ width: "140px" }}
						>
							<div
								className="mr-1"
								style={{
									background: element.color,
									borderRadius: "50%",
									width: "8px",
									height: "8px",
								}}
							/>
							<div>{element.typeLabel}</div>
						</div>
						<div
							className={`bold-600${
								element.navigateTo ? " cursor-pointer" : ""
							}`}
							style={{ width: "100px" }}
							onClick={() =>
								element.navigateTo &&
								element.navigateTo(
									history,
									appId,
									optimizationDefaultFilter,
									licenseId
								)
							}
						>
							{utilization[element.numberKey]}
						</div>
						<div
							className="bold-600"
							style={{ width: "100px", color: "#82B0E7" }}
						>
							{`${kFormatter(
								utilization[element.monthlySavingsKey] || 0
							)}`}
						</div>
						<div
							className="bold-600"
							style={{ width: "100px", color: "#82B0E7" }}
						>
							{`${kFormatter(
								utilization[element.yearlySavingsKey] || 0
							)}`}
						</div>
					</div>
				))}
				<hr className="w-100 m-0" />
				<div className="d-flex flex-column">
					<div
						className="d-flex flex-row align-items-center cursor-pointer pt-1 font-10"
						style={{ color: "#5ABAFF" }}
						onClick={() =>
							window.open(
								"https://help.zluri.com/en/articles/5700105-how-does-zluri-calculate-potential-savings"
							)
						}
					>
						{`How does ${partner?.name} calculate potential savings?`}
						<img
							src={linkArrow}
							className="ml-1"
							height={8}
							width={8}
						/>
					</div>
					<div className="grey-1 o-6 font-9">
						{`${partner?.name} estimates the potential savings by calculating the
						cost that could be avoided by eliminating the
						unassigned, underprovisioned, underused, unused licenses
						for the current financial year.`}
					</div>
				</div>
			</div>
		</div>
	);
}
