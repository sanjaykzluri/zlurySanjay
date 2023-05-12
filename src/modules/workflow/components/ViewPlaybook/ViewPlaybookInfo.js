import React from "react";
import ViewPlaybookDetails from "./ViewPlaybookDetails";

const ViewPlaybookInfo = ({
	loading,
	playbookData,
	entity,
	editPlaybook,
	onEditPublishedPlaybook,
	onCloseModal,
	selectedSection,
}) => {
	return (
		<div
			className="action-list d-flex flex-column mt-2 m-2 justify-content-start flex-1"
			style={{ overflow: "auto" }}
		>
			<ViewPlaybookDetails
				loading={loading}
				playbookData={playbookData}
				entity={entity}
				onCloseModal={onCloseModal}
			/>
		</div>
	);
};

export default ViewPlaybookInfo;
