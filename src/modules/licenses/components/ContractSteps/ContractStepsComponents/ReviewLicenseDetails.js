import React from "react";
import LicenseDetailsHeaders from "./LicenseDetailsHeaders";
import LicenseDetailsInfoSection from "./LicenseDetailsInfoSection";

export default function ReviewLicenseDetails({ data, entity }) {
	return (
		<>
			<LicenseDetailsHeaders entity={entity} reviewStep={true} />
			<LicenseDetailsInfoSection
				data={data}
				licenses={data?.licenses}
				reviewStep={true}
				entity={entity}
			/>
		</>
	);
}
