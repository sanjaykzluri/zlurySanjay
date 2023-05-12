import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "../../../../UIComponents/Button/Button";
import { SearchInputArea } from "../../../../components/searchInputArea";
import add from "assets/icons/plus-white.svg";
import search from "assets/search.svg";
import refresh_icon from "assets/icons/refresh.svg";
import WorkflowColumnsAndFilters from "../../../workflow/components/WorkflowColumnsAndFilters/WorkflowColumnsAndFilters";
import { allowScroll, preventScroll } from "../../../../actions/ui-action";

const AutomationTabHeader = (props) => {
	const { setSearchQuery, placeholder, refreshTable, searchQuery } = props;

	return (
		<div
			className="top__Uploads justify-content-between"
			style={{ height: "67px" }}
		>
			<div className="Uploads__right">
				<div className="d-flex inputWithIconApps mr-0 mt-auto mb-auto border-light">
					<SearchInputArea
						placeholder={`Search ${placeholder}`}
						setSearchQuery={setSearchQuery}
						searchQuery={searchQuery}
					/>
					<img src={search} aria-hidden="true" />
				</div>
				<button
					className="appsad ml-3"
					onClick={() => refreshTable()}
					style={{
						width: "50px",
					}}
				>
					<img className="w-100 h-100 m-auto" src={refresh_icon} />
				</button>
			</div>
		</div>
	);
};

export default AutomationTabHeader;
