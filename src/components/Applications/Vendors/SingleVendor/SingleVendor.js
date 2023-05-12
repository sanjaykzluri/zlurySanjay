import React, { Component, useState, useEffect, useContext } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { getVendorInfo } from "../../../../services/api/applications";
import { SingleVendorTabs } from "../SingleVendor/SingleVendorTabs/SingleVendorTabs";
import { Overview } from "../SingleVendor/Overview/Overview";
import { Contracts } from "../SingleVendor/Contracts/Contracts";
import RoleContext from "../../../../services/roleContext/roleContext";
import UnauthorizedToView from "../../../../common/restrictions/UnauthorizedToView";
import { userRoles } from "../../../../constants/userRole";
import HeaderTitleBC from "../../../HeaderTitleAndGlobalSearch/HeaderTitleBC";
export function SingleVendor() {
	const { userRole } = useContext(RoleContext);
	const location = useLocation();
	const history = useHistory();
	const [vendor, setVendor] = useState([]);
	const [loading, setloading] = useState(true);

	const fetchVendorOverview = () => {
		setloading(true);
		const id = location.pathname.split("/")[3];
		getVendorInfo(id)
			.then((res) => {
				setVendor(res);
			})
			.then(() => setloading(false));
	};

	useEffect(() => {
		const hash = location.hash.slice(1);
		if (!hash) history.push("#overview");
	}, [location]);

	useEffect(() => {
		fetchVendorOverview();
	}, []);
	return (
		<>
			{userRole === userRoles.FINANCE_ADMIN ||
			userRole === userRoles.INTEGRATION_ADMIN ||
			userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView />
			) : (
				<>
					<HeaderTitleBC
						title="Vendors"
						inner_screen={true}
						entity_logo={vendor?.logo}
						entity_name={vendor?.name}
						go_back_url="/licenses/vendors"
					/>
					<div style={{ padding: "0px 40px" }}>
						<SingleVendorTabs></SingleVendorTabs>
					</div>
					{location.hash === "#overview" || "" ? (
						<Overview
							vendor={vendor}
							loading={loading}
							fetchVendorOverview={fetchVendorOverview}
						/>
					) : null}
					{location.hash === "#contracts" ? (
						<Contracts vendor={vendor} />
					) : null}
				</>
			)}
		</>
	);
}
