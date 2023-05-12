import React, { useState } from "react";
import contractOneTimeFee from "assets/licenses/contractOneTimeFee.svg";
import deleteIcon from "assets/deleteIcon.svg";
import contractDiscount from "assets/licenses/contractDiscount.svg";
import { Form } from "react-bootstrap";
import {
	getContractCostPerTerm,
	getTotalLicenses,
} from "modules/licenses/utils/LicensesUtils";

export default function ContractSetupFeeAndDisc({ data, updateData, entity }) {
	const [showDiscountField, setShowDiscountField] = useState(
		data?.discount_value > 0
	);

	const addSetupFeeField = () => {
		let tempSetupFeeArray = [
			...data?.one_time_fee,
			{
				name: "Setup Fee",
				value: null,
			},
		];
		updateData({ one_time_fee: tempSetupFeeArray });
	};

	const handleFeeArrayChange = (key, value, index) => {
		let tempSetupFeeArray = [...data?.one_time_fee];
		tempSetupFeeArray[index][key] = value;
		updateData({ one_time_fee: tempSetupFeeArray });
	};

	const removeOneTimeFee = (index) => {
		let tempSetupFeeArray = data?.one_time_fee?.filter(
			(field, i) => i !== index
		);
		updateData({ one_time_fee: tempSetupFeeArray });
	};

	const addContractDiscount = (value) => {
		if (data?.discount_type === "percentage") {
			if (value > 100) {
				value = 100;
			}
		}
		if (value < 0) {
			value = 0;
		}
		updateData({
			discount_value: value,
		});
	};

	return (
		<div className="d-flex justify-content-between">
			<div className="d-flex">
				<div
					className="license-details-toggle-btns mr-1"
					onClick={() => setShowDiscountField(true)}
					hidden={showDiscountField}
				>
					<img
						src={contractDiscount}
						height={14}
						width={14}
						className="mr-1"
					/>
					<div className="font-12 glow_blue">Add discount</div>
				</div>
				<div
					className="license-details-toggle-btns"
					onClick={addSetupFeeField}
				>
					<img
						src={contractOneTimeFee}
						height={14}
						width={14}
						className="mr-1"
					/>
					<div className="font-12 glow_blue">
						{Array.isArray(data?.one_time_fee) &&
						data?.one_time_fee?.length > 0
							? "Add another one-time fee"
							: "Add a one-time fee"}
					</div>
				</div>
			</div>
			<div className="d-flex flex-column">
				{Array.isArray(data?.one_time_fee) &&
					data?.one_time_fee.map((field, index) => (
						<div className="contract-details-fields">
							<div className="font-14" style={{ width: "295px" }}>
								<Form.Control
									required
									value={data?.one_time_fee[index]?.name}
									placeholder={"Enter Name"}
									onChange={(e) => {
										handleFeeArrayChange(
											"name",
											e.target.value,
											index
										);
									}}
									bsPrefix="contract-details-field-input"
								/>
							</div>
							<div className="d-flex" style={{ width: "120px" }}>
								<Form.Control
									required
									value={data?.one_time_fee[index]?.value}
									placeholder={"Enter Amount"}
									type="number"
									onChange={(e) => {
										handleFeeArrayChange(
											"value",
											Number.parseFloat(e.target.value),
											index
										);
									}}
									bsPrefix="contract-details-field-input"
								/>
							</div>
							<div className="d-flex" style={{ width: "45px" }}>
								<img
									src={deleteIcon}
									className="cursor-pointer"
									onClick={() => removeOneTimeFee(index)}
								/>
							</div>
						</div>
					))}
				<div
					className="contract-details-fields"
					hidden={!showDiscountField}
				>
					<div className="font-12" style={{ width: "115px" }}>
						Discount
					</div>
					<div
						className="d-flex"
						style={{ width: "180px", flexDirection: "row-reverse" }}
					>
						<select
							className="contract-discount-type-select"
							onChange={(e) => {
								updateData({
									discount_type: e.target.value,
									discount_value: null,
								});
							}}
							name="contract_currency_select"
							defaultValue={data?.discount_type}
						>
							<option value="percentage">%</option>
							<option value="value">{data?.base_currency}</option>
						</select>
					</div>
					<div
						className="font-12"
						style={{ width: "75px" }}
						key={showDiscountField}
					>
						<Form.Control
							key={data?.discount_type}
							value={data?.discount_value}
							placeholder={
								data?.discount_type === "value"
									? "Enter Amount"
									: "Add Discount"
							}
							type="number"
							onChange={(e) => {
								addContractDiscount(
									Number.parseFloat(e.target.value)
								);
							}}
							bsPrefix="contract-details-field-input"
						/>
					</div>
					<div
						className="d-flex"
						style={{ width: "90px", paddingLeft: "45px" }}
					>
						<img
							src={deleteIcon}
							className="cursor-pointer"
							onClick={() => {
								setShowDiscountField(false);
								updateData({ discount_value: null });
							}}
						/>
					</div>
				</div>
				<div
					className="contract-details-fields"
					style={{ background: "#FFFFFF", height: "auto" }}
				>
					<div className="font-14 grey-1" style={{ width: "115px" }}>
						TOTAL
					</div>
					<div className="grey font-14" style={{ width: "180px" }}>
						{getTotalLicenses(data)} Licenses
					</div>
					<div className="grey font-14" style={{ width: "165px" }}>
						{getContractCostPerTerm(data, entity)}
					</div>
				</div>
			</div>
		</div>
	);
}
