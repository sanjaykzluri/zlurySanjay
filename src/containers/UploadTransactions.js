import React, { useContext, useEffect } from "react";
import { TabsUploads } from "../components";
import { useLocation } from "react-router-dom";
import RoleContext from "../services/roleContext/roleContext";
import UnauthorizedToView from "../common/restrictions/UnauthorizedToView";
import { userRoles } from "../constants/userRole";
import RecognisedUploadsTable from "../components/Uploads/Recognised/RecognisedUploadsTable";
import UnrecognisedUploadsTable from "../components/Uploads/Unrecognised/UnrecognisedUploadsTable";
import ArchivedUploadsTable from "../components/Uploads/Archived/ArchivedUploadsTable";
import HeaderTitleBC from "../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { trackPageSegment } from "modules/shared/utils/segment";

export function UploadTransactions() {
	const location = useLocation();
	const { userRole } = useContext(RoleContext);
	useEffect(() => {
		trackPageSegment(
			`${location.hash.substring(1)} Transactions `,
			"Uploads",
			{ uploadId: window.location.pathname.split("/")[3] }
		);
	}, [location]);
	return (
		<>
			{userRole === userRoles.IT_ADMIN ||
			userRole === userRoles.INTEGRATION_ADMIN ||
			userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView />
			) : (
				<>
					<HeaderTitleBC
						title="Uploads"
						inner_screen={true}
						entity_name="Data"
						go_back_url="/transactions#uploads"
					/>
					<div style={{ padding: "0px 40px" }}>
						<TabsUploads />
					</div>
					{location.hash === "#recognised" || "" ? (
						<RecognisedUploadsTable />
					) : null}
					{location.hash === "#unrecognised" ? (
						<UnrecognisedUploadsTable />
					) : null}
					{location.hash === "#archived" ? (
						<ArchivedUploadsTable />
					) : null}
				</>
			)}
		</>
	);
}
