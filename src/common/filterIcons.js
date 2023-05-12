import { AppliedFiltersModal } from "modules/AppliedFiltersModal/AppliedFiltersModal";
import React, { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import filterIcon from "../assets/icons/filter-button.svg";
import columnsIcon from "../assets/icons/icon-button.svg";

import TableView from "./tableView";

const FilterIcons = ({
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
	hideColumnsButton = false,
}) => {
	return (
		<>
			<div className="flex" style={{ marginLeft: "40px" }}>
				{showViews && (
					<TableView
						screenTagKey={screenTagKey}
						setSearchQuery={setSearchQuery}
						responseMetaData={metaData}
					/>
				)}

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
				{!hideColumnsButton && (
					<>
						<OverlayTrigger
							placement="top"
							overlay={<Tooltip>{"Select Columns"}</Tooltip>}
						>
							<div
								onClick={() => {
									preventScroll();
									!isLoadingData && setShowColumnsModal(true);
								}}
								style={{
									marginRight: "10px",
									cursor: "pointer",
								}}
							>
								<img src={columnsIcon} />
							</div>
						</OverlayTrigger>
					</>
				)}
			</div>
		</>
	);
};

export default FilterIcons;
