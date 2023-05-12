import React, { useState } from "react";
import { Button } from "UIComponents/Button/Button";
import { RequestLicenseModal } from "./requestLicenseModal";

export function BulkEditAppRequests({ screenTagKey }) {
	const [requestLicenseModalOpen, setRequestLicenseModalOpen] =
		useState(false);
	return (
		<>
			{screenTagKey === "requests" && (
				<Button
					type="primary"
					// disabled={loadingData}
					onClick={() => {
						setRequestLicenseModalOpen(true);
					}}
				>
					+ New Request
				</Button>
			)}
			{requestLicenseModalOpen && (
				<RequestLicenseModal
					isOpen={requestLicenseModalOpen}
					handleClose={() => setRequestLicenseModalOpen(false)}
					headerTitle={"Request Access"}
				></RequestLicenseModal>
			)}
		</>
	);
}
