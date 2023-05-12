import React, { useState } from "react";
import close from "assets/close.svg";
import edit from "assets/icons/edit.svg";
import { useHistory } from "react-router-dom";
import greenTick from "assets/green_tick.svg";
import {
	getCostPerLicenseCellContractTooltip,
	getLicenseTermText,
} from "modules/licenses/utils/LicensesUtils";
import { editLicenseCost } from "services/api/licenses";
import AddLicenseToContract from "./AddLicenseToContract";
import calendarCash from "assets/licenses/calendarCash.svg";
import { getOrgCurrency, kFormatter } from "constants/currency";
import { Form, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";

export default function CostPerLicenseCell({
	license,
	cost_per_license,
	handleRefresh,
}) {
	const history = useHistory();
	const [editing, setEditing] = useState(false);
	const [showAddToContract, setShowAddToContract] = useState(false);

	const handleEditButtonClick = () => {
		const editContractUrl = `/${license.contract_type}/edit/${license.contract_id}`;
		if (license.contract_id) {
			history.push(editContractUrl);
		} else {
			if (license.integration_id) {
				if (license?.groups?.length === 1) {
					setEditing(true);
				} else {
					setShowAddToContract(true);
				}
			} else {
				setShowAddToContract(true);
			}
		}
	};

	return (
		<>
			{!editing ? (
				<div className="d-flex">
					<div className="d-flex flex-column justify-content-center">
						<div>
							{kFormatter(cost_per_license?.amount_org_currency)}
						</div>
						<div className="d-flex">
							<div className="grey-1 font-10 d-flex align-items-center">
								{`${getLicenseTermText(
									license,
									cost_per_license,
									true,
									false
								)}`}
							</div>
							{cost_per_license &&
								!isNaN(cost_per_license?.amount_org_currency) &&
								license.contract_id && (
									<CostPerLicenseCellContractTooltip
										license={license}
									/>
								)}
						</div>
					</div>
					<img
						src={edit}
						className="ml-2 cursor-pointer"
						onClick={handleEditButtonClick}
						height={16}
						width={16}
					/>
				</div>
			) : (
				<CostPerLicenseEdit
					license={license}
					cost_per_license={cost_per_license}
					setEditing={setEditing}
					handleRefresh={handleRefresh}
				/>
			)}
			{showAddToContract && (
				<AddLicenseToContract
					show={showAddToContract}
					handleClose={() => setShowAddToContract(false)}
					license={{
						name: license.license_name,
						quantity: license.quantity,
						type: license.type,
						cost_per_item: license.cost_per_license,
						auto_increment: !!license.auto_increment,
						license_included_in_base_price:
							license.license_included_in_base_price || 0,
						_id: license.license_id,
						integration_id: license.integration_id,
						groups: license.groups,
						minimum_duration: license.minimum_duration,
					}}
					row={license}
					app_id={license.app_id}
					app_logo={license.app_logo}
					app_name={license.app_name}
				/>
			)}
		</>
	);
}

function CostPerLicenseCellContractTooltip({ license }) {
	return (
		<OverlayTrigger
			placement={"left"}
			overlay={
				<Tooltip>
					<div className="d-flex align-items-center">
						<img src={calendarCash} width={13} height={13} />
						<div
							style={{
								marginLeft: "2px",
							}}
						>
							{getCostPerLicenseCellContractTooltip(license)}
						</div>
					</div>
				</Tooltip>
			}
		>
			<img
				src={calendarCash}
				width={13}
				height={13}
				style={{
					marginBottom: "2px",
					marginLeft: "3px",
				}}
				className="cursor-pointer"
			/>
		</OverlayTrigger>
	);
}

function CostPerLicenseEdit({
	license,
	cost_per_license,
	setEditing,
	handleRefresh,
}) {
	const [amount, setAmount] = useState(
		cost_per_license?.amount_org_currency
			? cost_per_license.amount_org_currency
			: 0
	);
	const [loading, setLoading] = useState(false);

	const callEditLicenseCost = () => {
		setLoading(true);
		editLicenseCost(license.license_id, amount)
			.then((res) => {
				if (
					res.result &&
					res.result.status === apiResponseTypes.SUCCESS
				) {
					setLoading(false);
					setEditing(false);
					ApiResponseNotification({
						responseType: apiResponseTypes.SUCCESS,
						title: "License cost edited!",
					});
					handleRefresh();
				}
			})
			.catch((err) => {
				ApiResponseNotification({
					responseType: apiResponseTypes.ERROR,
					errorObj: err,
					title: "Error in editing the license cost",
				});
			});
	};

	return (
		<div className="d-flex align-items-center" style={{ width: "210px" }}>
			<div className="mr-1">{getOrgCurrency()}</div>
			<div className="d-flex align-items-center padding_4 border-1 border-radius-4 bg-white">
				<Form.Control
					value={amount}
					onChange={(e) =>
						setAmount(Number.parseFloat(e.target.value))
					}
					type="number"
					style={{ width: "75px !important", paddingTop: "5px" }}
					className="border-0"
				/>
				<div className="" style={{ marginLeft: "2px" }}>
					{`per month`}
				</div>
			</div>
			{loading ? (
				<div className="d-flex">
					<Spinner
						animation="border"
						variant="dark"
						size="sm"
						className="ml-2"
						style={{ borderWidth: 2 }}
					/>
				</div>
			) : (
				<div className="d-flex align-items-center">
					<img
						src={close}
						className="ml-2 cursor-pointer"
						onClick={() => setEditing(false)}
						height={12}
						width={12}
					/>
					<img
						src={greenTick}
						className="ml-2 cursor-pointer"
						onClick={callEditLicenseCost}
						height={16}
						width={16}
					/>
				</div>
			)}
		</div>
	);
}
