import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "../../../../UIComponents/Button/Button";
import { SearchInputArea } from "../../../../components/searchInputArea";
import add from "../../../../assets/icons/plus-white.svg";
import search from "../../../../assets/search.svg";
import refresh_icon from "../../../../assets/icons/refresh.svg";
import WorkflowColumnsAndFilters from "../WorkflowColumnsAndFilters/WorkflowColumnsAndFilters";
import { allowScroll, preventScroll } from "../../../../actions/ui-action";
import { trackActionSegment } from "modules/shared/utils/segment";

const TableHeader = (props) => {
	const history = useHistory();

	const {
		setSearchQuery,
		hash,
		placeholder,
		refreshTable,
		searchQuery,
		isLoadingData,
		setShowFilterModal,
		setShowColumnsModal,
		metaData,
		disableAddNewRule,
	} = props;

	const addNewWorkflow = (
		<Button
			className="ml-3 d-flex"
			onClick={() => {
				if (hash === "#rules" && props.onClickNewRule) {
					props.onClickNewRule();
				} else if (props.onClickNewWorkflow) {
					props.onClickNewWorkflow(true);
				}
			}}
		>
			<img src={add} width={12} className="mt-auto mb-auto mr-1" />
			{hash === "#drafts" ? "New Workflow" : "New Rule"}
		</Button>
	);
	const addNewTemplate = (
		<Button
			className="ml-3 d-flex"
			onClick={() => {
				if (props.onClickNewTemplate) {
					props.onClickNewTemplate(true);
				}
				trackActionSegment("Clicked on New Playbook button", {});
			}}
		>
			<img src={add} width={12} className="mt-auto mb-auto mr-1" />
			New Playbook
		</Button>
	);
	return (
		<div
			className="top__Uploads justify-content-between"
			style={{ height: "67px" }}
		>
			{(hash === "#completed" ||
				hash === "#playbooks" ||
				hash === "#runs") && (
				<WorkflowColumnsAndFilters
					preventScroll={preventScroll}
					isLoadingData={isLoadingData}
					setShowFilterModal={setShowFilterModal}
					// setShowColumnsModal={setShowColumnsModal}
					metaData={metaData}
				/>
			)}
			<div className="Uploads__right">
				<div className="d-flex inputWithIconApps mr-0 mt-auto mb-auto border-light">
					<SearchInputArea
						placeholder={`Search ${placeholder}`}
						setSearchQuery={setSearchQuery}
						searchQuery={searchQuery}
					/>
					<img alt="" src={search} aria-hidden="true" />
				</div>
				{hash === "#drafts" || hash === "#rules"
					? !disableAddNewRule && addNewWorkflow
					: hash === "#playbooks"
					? addNewTemplate
					: ""}
				<button
					className="appsad ml-3"
					onClick={() => refreshTable()}
					style={{
						width: "50px",
					}}
				>
					<img
						alt=""
						className="w-100 h-100 m-auto"
						src={refresh_icon}
					/>
				</button>
			</div>
		</div>
	);
};

export default TableHeader;
