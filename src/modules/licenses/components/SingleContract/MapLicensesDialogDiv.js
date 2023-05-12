import React from "react";
import { Button } from "../../../../UIComponents/Button/Button";
import { useHistory, useLocation } from "react-router";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";

export default function MapLicensesDialogDiv(props) {
	const history = useHistory();
	const { partner } = useContext(RoleContext);
	return (
		<div className="d-flex flex-column" style={{ margin: "20px" }}>
			<div className="map-licenses-dialog-div">
				<div className="map-licenses-dialog-div-left h-100">
					<div
						className="font-11 bold-600"
						style={{ color: "#FFB169" }}
					>
						JUST ONE MORE STEP PENDING
					</div>
					<div className="font-16 bold-600">
						Map licenses to get accurate data on license
						provisioning!
					</div>
					<div className="font-12">
						License mapping allows you to get accurate spend
						forecast and optimization data from {partner?.name}. Map
						licenses to users now!
					</div>
					<Button
						className="map-license-now-btn"
						onClick={() =>
							history.push({
								pathname: `/licenses/mapping/${props.contractId}`,
								state: {
									data: props.data,
									id: props.contractId,
									unmappedLicenseData:
										props.unmappedLicenseData,
								},
							})
						}
					>
						Map Licenses Now
					</Button>
				</div>
				<div className="map-licenses-dialog-div-right" />
			</div>
		</div>
	);
}
