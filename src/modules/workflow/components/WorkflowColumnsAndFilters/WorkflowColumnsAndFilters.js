import React, { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import filterIcon from "../../../../assets/icons/filter-button.svg";
import columnsIcon from "../../../../assets/icons/icon-button.svg";
import { AppliedFiltersModal } from "../AppliedFiltersModal/AppliedFiltersModal";

const WorkflowColumnsAndFilters = ({
	preventScroll,
	isLoadingData,
	setShowFilterModal,
	setShowColumnsModal,
	screenTagKey,
	showViews = true,
	setSearchQuery,
	searchQuery,
	text,
	metaData,
	onResetFilters,
	v2Entity,
}) => {
	return (
		<>
			<div className="flex" style={{ marginLeft: "40px" }}>
				<AppliedFiltersModal
					searchQuery={searchQuery}
					text={text}
					metaData={metaData}
					onResetFilters={onResetFilters}
					setShowFilterModal={setShowFilterModal}
					preventScroll={preventScroll}
					isLoadingData={isLoadingData}
					v2Entity={v2Entity}
				></AppliedFiltersModal>
			</div>
		</>
	);
};

export default WorkflowColumnsAndFilters;
