import { kFormatter } from "constants/currency";
import {
	getContractCostPerTerm,
	getTotalLicenses,
} from "modules/licenses/utils/LicensesUtils";
import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function ReviewSetupDiscountTotal({
	data,
	entity,
	overview = false,
}) {
	return (
		<div
			className="d-flex mt-1"
			style={
				overview
					? { flexDirection: "row-reverse" }
					: { flexDirection: "row-reverse", marginRight: "90px" }
			}
		>
			<div className="d-flex flex-column">
				{data.has_base_price && (
					<div
						className="contract-details-fields"
						style={{ width: "380px" }}
					>
						<div className="font-12" style={{ width: "295px" }}>
							Base Price (per term)
						</div>
						<div className="font-12" style={{ width: "75px" }}>
							{overview
								? kFormatter(data?.base_price_org_currency)
								: kFormatter(
										data?.base_price,
										data?.base_currency
								  )}
						</div>
					</div>
				)}
				{Array.isArray(data?.one_time_fee) &&
					data?.one_time_fee.map((field, index) => (
						<div
							className="contract-details-fields"
							style={{ width: "380px" }}
						>
							<OverlayTrigger
								placement="left"
								overlay={
									<Tooltip>
										{data?.one_time_fee[index]?.name}
									</Tooltip>
								}
							>
								<div
									className="font-12"
									style={{
										width: "295px",
										maxWidth: "295px",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										overflow: "hidden",
									}}
								>
									{data?.one_time_fee[index]?.name}
								</div>
							</OverlayTrigger>
							<div
								className="d-flex font-12"
								style={{ width: "75px" }}
							>
								{overview
									? kFormatter(
											data?.one_time_fee[index]
												?.value_org_currency
									  )
									: kFormatter(
											data?.one_time_fee[index]?.value,
											data?.base_currency
									  )}
							</div>
						</div>
					))}
				<div
					className="contract-details-fields"
					style={{ width: "380px" }}
					hidden={!data?.discount_value}
				>
					<div className="font-12" style={{ width: "295px" }}>
						Discount
					</div>
					<div className="d-flex font-12" style={{ width: "75px" }}>
						{data?.discount_type === "percentage"
							? `${data?.discount_value}%`
							: overview
							? kFormatter(data?.discount_value_org_currency)
							: kFormatter(
									data?.discount_value,
									data?.base_currency
							  )}
					</div>
				</div>
				<div
					className="contract-details-fields"
					style={{
						background: "#FFFFFF",
						height: "auto",
						width: "380px",
					}}
				>
					<div className="font-14 grey-1" style={{ width: "115px" }}>
						TOTAL
					</div>
					<div className="grey font-14" style={{ width: "180px" }}>
						{getTotalLicenses(data)} Licenses
					</div>
					<div className="grey font-14" style={{ width: "75px" }}>
						{overview
							? kFormatter(data?.contract_value)
							: getContractCostPerTerm(data, entity)}
					</div>
				</div>
			</div>
		</div>
	);
}
