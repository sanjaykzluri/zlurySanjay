import React, { useContext, useEffect } from "react";
import { Payment, Tabs } from "../components";
import { useLocation, useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";
import RoleContext from "../services/roleContext/roleContext";
import UnauthorizedToView from "../common/restrictions/UnauthorizedToView";
import { userRoles } from "../constants/userRole";
import RecognisedTransactionsTable from "../components/Transactions/Recognised/RecognisedTransactionsTable";
import UnrecognisedTransactionsTable from "../components/Transactions/Unrecognised/UnrecognisedTransactionsTable";
import UploadsTable from "../components/Uploads/UploadsTable";
import ArchivedTransactionsTable from "../components/Transactions/Archived/ArchivedTransactionsTable";
import HeaderTitleBC from "../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import "../components/Transactions/Archived/Archived.css";
import { trackPageSegment } from "modules/shared/utils/segment";
import RecognisedTable from "modules/transactions/recognised/Recognised";
import UnRecognizedTable from "modules/transactions/unrecognised/Unrecognized";
import { getValueFromLocalStorage } from "utils/localStorage";

export function Transactions() {
	const location = useLocation();
	const history = useHistory();
	const orgName = getValueFromLocalStorage("userInfo")?.org_name;
	const { userRole } = useContext(RoleContext);

	useEffect(() => {
		if (!location.hash.slice(1)) history.push("#recognised");
		trackPageSegment(`${location.hash.substring(1)} `, "Transactions");
	}, [location]);

	return (
		<>
			{userRole === userRoles.IT_ADMIN ||
			userRole === userRoles.INTEGRATION_ADMIN ||
			userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView />
			) : (
				<>
					<HeaderTitleBC title="Transactions" />
					<div style={{ padding: "0px 40px" }}>
						<Tabs />
					</div>
					{location.hash === "#recognised" ? (
						<>
							<RecognisedTable />
							<Helmet>
								<title>
									{"Recognised Transactions - " +
										orgName +
										" - " +
										getValueFromLocalStorage("partner")
											?.name}
								</title>
							</Helmet>
						</>
					) : null}
					{location.hash === "#unrecognised" ? (
						<>
							<UnRecognizedTable />
							<Helmet>
								<title>
									{"Unrecognised Transactions - " +
										orgName +
										" - " +
										getValueFromLocalStorage("partner")
											?.name}
								</title>
							</Helmet>
						</>
					) : null}
					{location.hash === "#archived" ? (
						<>
							<ArchivedTransactionsTable />
							<Helmet>
								<title>
									{"Archived Transactions - " +
										orgName +
										" - " +
										getValueFromLocalStorage("partner")
											?.name}
								</title>
							</Helmet>
						</>
					) : null}
					{location.hash === "#payment-methods" ? (
						<>
							<Payment />
							<Helmet>
								<title>
									{"Payment Methods - " +
										orgName +
										" - " +
										getValueFromLocalStorage("partner")
											?.name}
								</title>
							</Helmet>
						</>
					) : null}
					{location.hash === "#uploads" ? (
						<>
							<UploadsTable />
							<Helmet>
								<title>
									{"Transaction Uploads - " +
										orgName +
										" - " +
										getValueFromLocalStorage("partner")
											?.name}
								</title>
							</Helmet>
						</>
					) : null}
				</>
			)}
		</>
	);
}
