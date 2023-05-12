import React, { useContext, useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { LicensesTabs } from "../components/LicensesTabs";
import AllLicensesTable from "../components/AllLicensesTable/AllLicensesTable";
import { Contracts } from "../../../components/Applications/Contracts/Contracts";
import AllSubsTable from "../components/AllSubsTable/AllSubsTable";
import AllPerpetualTable from "../components/AllPerpetualTable/AllPerpetualTable";
import HeaderTitleBC from "../../../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { getLicenseTabCount } from "services/api/licenses";
import { TriggerIssue } from "utils/sentry";
import UnauthorizedToView from "common/restrictions/UnauthorizedToView";
import { userRoles } from "constants/userRole";
import RoleContext from "services/roleContext/roleContext";

export function Licenses() {
	const location = useLocation();
	const history = useHistory();
	const { userRole } = useContext(RoleContext);

	const [licenseTabCount, setLicenseTabCount] = useState();

	useEffect(() => {
		if (!location.hash.slice(1)) history.push("#allLicenses");
		if (!licenseTabCount) fetchLicenseTabCount();
	}, [history, licenseTabCount, location]);

	const fetchLicenseTabCount = () => {
		getLicenseTabCount()
			.then((res) => setLicenseTabCount(res))
			.catch((err) => TriggerIssue("License Tab Count Error", err));
	};

	return (
		<>
			{userRole === userRoles.FINANCE_ADMIN ||
			userRole === userRoles.INTEGRATION_ADMIN ||
			userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView />
			) : (
				<>
					<HeaderTitleBC title="Licenses" />
					<div style={{ padding: "0px 40px" }}>
						<LicensesTabs licenseTabCount={licenseTabCount} />
					</div>
					{location.hash === "#allLicenses" ? (
						<>
							<AllLicensesTable
								fetchLicenseTabCount={fetchLicenseTabCount}
							/>
						</>
					) : null}
					{location.hash === "#allContracts" ? (
						<>
							<Contracts
								fetchLicenseTabCount={fetchLicenseTabCount}
							/>
						</>
					) : null}
					{location.hash === "#allSubscriptions" ? (
						<>
							<AllSubsTable
								fetchLicenseTabCount={fetchLicenseTabCount}
							/>
						</>
					) : null}
					{location.hash === "#allPerpetualContracts" ? (
						<>
							<AllPerpetualTable
								fetchLicenseTabCount={fetchLicenseTabCount}
							/>
						</>
					) : null}
				</>
			)}
		</>
	);
}
