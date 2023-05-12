import React from "react";
import { currencyOptions, getOrgCurrency } from "constants/currency";
import { Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import infocircle from "assets/licenses/infocircle.svg";
import { screenEntity } from "modules/licenses/constants/LicenseConstants";

export default function BasePriceAndCurrency({ entity, data, updateData }) {
	return (
		<div className="d-flex flex-column w-100">
			<div className="d-flex justify-content-between">
				<div>
					{entity !== screenEntity.PERPETUAL && (
						<div className="d-flex flex-row align-items-center">
							<Form.Check
								className=""
								checked={data.has_base_price}
								onChange={() => {
									updateData({
										has_base_price: !data.has_base_price,
										complete_term: true,
										base_price: null,
									});
								}}
							/>
							<div className="font-14 mr-2">
								I’m charged a base price for this {entity}
							</div>
							<OverlayTrigger
								placement="right"
								overlay={
									<Tooltip>
										{`Please select this box if your ${entity} has a base price`}
									</Tooltip>
								}
							>
								<img src={infocircle} />
							</OverlayTrigger>
						</div>
					)}
					{data.has_base_price && (
						<>
							<div
								className="d-flex align-items-center"
								style={{ marginBottom: "6px" }}
							>
								<div style={{ width: "120px" }}>
									<Form.Control
										required
										placeholder="Add Base Price"
										type="number"
										onChange={(e) => {
											updateData({
												base_price: Number.parseFloat(
													e.target.value
												),
											});
										}}
										className="o-5"
										bsPrefix="singlelicense-custom-input-area"
										value={data?.base_price}
									/>
								</div>
								<div
									style={{
										width: "90px",
										marginLeft: "15px",
										fontSize: "13px",
									}}
								>
									per term
								</div>
							</div>
						</>
					)}
				</div>
				<div className="d-flex">
					<div className="font-14">Select Currency:</div>
					<select
						className="contract-currency-select"
						onChange={(e) => {
							updateData({ base_currency: e.target.value });
						}}
						name="contract_currency_select"
						defaultValue={data?.base_currency || getOrgCurrency()}
					>
						{currencyOptions}
					</select>
				</div>
			</div>
		</div>
	);
}
