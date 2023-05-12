import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import blueaddbutton from "../../../../assets/licenses/blueaddbutton.svg";
import AddLicenseToContract from "./AddLicenseToContract";
import linkArrow from "../../../../assets/linkArrow.svg";
import licenseFromIntegration from "../../../../assets/licenses/licenseFromIntegration.svg";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function LicenseTableCell({ license, generatingPdf = false }) {
	const history = useHistory();
	const [showAddToContract, setShowAddToContract] = useState(false);
	return (
		<div className="d-flex flex-column">
			<div className="d-flex align-items-center">
				<OverlayTrigger
					overlay={<Tooltip>{license.license_name}</Tooltip>}
					placement={"top"}
				>
					<div className={generatingPdf ? "" : "truncate_10vw"}>
						{license.license_name}
					</div>
				</OverlayTrigger>
				{license.integration_id && (
					<img
						src={licenseFromIntegration}
						width={12}
						height={12}
						className="ml-1"
					/>
				)}
			</div>
			{license.contract_id ? (
				<div
					className="cursor-pointer pt-1 d-flex"
					style={{ color: "#5ABAFF" }}
					onClick={() =>
						history.push(
							`/licenses/${license.contract_type}s/${license.contract_id}#overview`
						)
					}
				>
					<OverlayTrigger
						overlay={<Tooltip>{license.contract_name}</Tooltip>}
						placement={"top"}
					>
						<div className={generatingPdf ? "" : "truncate_10vw"}>
							{license.contract_name}
						</div>
					</OverlayTrigger>
					{!generatingPdf && <img src={linkArrow} className="ml-1" />}
				</div>
			) : (
				<div
					className="glow_blue cursor-pointer d-flex align-items-center"
					onClick={() => setShowAddToContract(true)}
				>
					<img src={blueaddbutton} />
					<div className="ml-1">Add to Sub/Contract</div>
				</div>
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
		</div>
	);
}
