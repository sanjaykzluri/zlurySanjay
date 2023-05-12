import React from "react";
import { CUSTOM_FIELD_ENTITY } from "../../../../../../../modules/custom-fields/constants/constant";
import { CustomFieldSectionInOverview } from "../../../../../../../modules/shared/containers/CustomFieldSectionInOverview/CustomFieldSectionInOverview";
import { patchVendors } from "../../../../../../../services/api/applications";
import "./VendorCustomFields.css";

export default function VendorCustomFields(props) {
	return (
		<div className="vendor_custom_fields_container">
			{!props.loading && (
				<CustomFieldSectionInOverview
					customFieldData={props.vendor?.vendor_field_data || []}
					entityId={props.vendor?._id}
					cfEntitiy={CUSTOM_FIELD_ENTITY.VENDORS}
					patchAPI={patchVendors}
					refresh={props.fetchVendorOverview}
				/>
			)}
		</div>
	);
}
