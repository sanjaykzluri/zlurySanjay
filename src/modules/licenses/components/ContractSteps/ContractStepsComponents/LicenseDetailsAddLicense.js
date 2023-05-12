import React, { useState } from "react";
import LicenseForm from "./LicenseForm";

export default function LicenseDetailsAddLicense({
	data,
	licenses,
	entity,
	updateData,
	onSaveLicense,
}) {
	const [showForm, setShowForm] = useState(false);

	return (
		<>
			<div
				className="add_license_button"
				onClick={() => setShowForm(true)}
			>
				{Array.isArray(licenses) && licenses.length
					? "+ Add another license"
					: "+ Add license"}
			</div>
			{showForm && (
				<LicenseForm
					show={showForm}
					handleClose={() => setShowForm(false)}
					data={data}
					entity={entity}
					updateData={updateData}
					onSave={(license) => {
						setShowForm(false);
						onSaveLicense(license);
					}}
				/>
			)}
		</>
	);
}
