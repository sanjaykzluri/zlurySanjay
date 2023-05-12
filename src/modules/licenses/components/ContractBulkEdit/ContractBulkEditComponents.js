import React from "react";
import { clearAllV2DataCache } from "../../../v2InfiniteTable/redux/v2infinite-action";
import ContractBulkEdit from "./ContractBulkEdit";

export const ContractBulkEditComponents = (
	checked,
	setChecked,
	dispatch,
	handleRefresh,
	v2Entity,
	fetchLicenseTabCount
) => (
	<>
		<ContractBulkEdit
			checked={checked}
			handleRefresh={() => {
				setChecked([]);
				handleRefresh();
				dispatch(clearAllV2DataCache("licenses"));
			}}
			setChecked={setChecked}
			entity={v2Entity}
		/>
	</>
);
