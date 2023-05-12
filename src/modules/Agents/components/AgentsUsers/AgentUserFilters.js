import React, { useEffect, useRef, useState } from "react";
import useOutsideClick from "../../../../common/OutsideClick/OutsideClick";
import arrowdropdown from "../../../../components/Transactions/Unrecognised/arrowdropdown.svg";
import search from "../../../../assets/search.svg";
import refresh_icon from "../../../../assets/icons/refresh.svg";
import { PromptModal } from "../Modals/PromptModal";
import {
	agentConstants,
	agentConstantsFilters,
	agentFilterConstants,
} from "../../../../constants/agents";
import { trackActionSegment } from "modules/shared/utils/segment";
export function AgentUserFilters(props) {
	const ref = useRef();
	const [showQuickFilters, setShowQuickFilters] = useState(false);
	const [showBulkPromptDD, setShowBulkPromptDD] = useState(false);
	const [sendPromptAgentType, setSendPromptAgentType] = useState("");
	const [showPromptModal, setShowPromptModal] = useState(false);

	useOutsideClick(ref, () => {
		if (showQuickFilters) setShowQuickFilters(false);
		if (showBulkPromptDD) setShowBulkPromptDD(false);
	});
	function clickedOnSendBulkPropmt(type) {
		setSendPromptAgentType(type);
		setShowBulkPromptDD(false);
		setShowPromptModal(true);
	}
	const clickedOnQuickFilter = (filterName) => {
		props.handleFilterChange && props.handleFilterChange(filterName);
		setShowQuickFilters(false);
	};

	return (
		<>
			<div className="top__Uploads justify-content-between">
				<div className="Uploads__left">
					<button
						className="autho__dd__cont mr-3 mt-auto mb-auto"
						onClick={() => {
							setShowQuickFilters(!showQuickFilters);
							trackActionSegment(
								"Clicked on Quick Filters in Agent Users Table",
								{
									currentCategory: "Agents",
									currentPageName: "Agents-Users",
								}
							);
						}}
						style={{ width: "fit-content" }}
					>
						{props.filterApplied.length === 0
							? "Quick Filters"
							: `Filtered by : ${
									agentFilterConstants[props.filterApplied]
							  }`}
						<img
							src={arrowdropdown}
							style={{ marginLeft: "8px" }}
						></img>
						{showQuickFilters && (
							<div
								className="quick__filters__dd__cont__list"
								ref={(element) => {
									if (element) {
										ref.current = element;
									}
								}}
							>
								<button
									className="quick__filters__dd__cont__list__option"
									onClick={() => {
										clickedOnQuickFilter("");
									}}
								>
									All Users
								</button>
								{Object.keys(agentConstants).map(
									(key, index) => {
										return (
											<button
												className="quick__filters__dd__cont__list__option"
												onClick={() => {
													clickedOnQuickFilter(
														agentConstants[key]
													);
												}}
											>
												{agentConstantsFilters[key]}
											</button>
										);
									}
								)}
							</div>
						)}
					</button>
				</div>
				<div className="Uploads__right">
					{props.selectedIds &&
						Array.isArray(props.selectedIds) &&
						props.selectedIds.length > 0 && (
							<button
								className="autho__dd__cont mr-3 mt-auto mb-auto"
								onClick={() =>
									setShowBulkPromptDD(!showBulkPromptDD)
								}
								style={{ width: "fit-content" }}
							>
								Send Prompt
								<img
									src={arrowdropdown}
									style={{ marginLeft: "8px" }}
								></img>
								{showBulkPromptDD && (
									<div
										className="quick__filters__dd__cont__list"
										ref={(element) => {
											if (element) {
												ref.current = element;
											}
										}}
									>
										<button
											className="quick__filters__dd__cont__list__option"
											onClick={() => {
												clickedOnSendBulkPropmt(
													"browser"
												);
											}}
										>
											Send Prompt for Browser Agent
										</button>
										<button
											className="quick__filters__dd__cont__list__option"
											onClick={() => {
												clickedOnSendBulkPropmt(
													"desktop"
												);
											}}
										>
											Send Prompt for Desktop Agent
										</button>
									</div>
								)}
							</button>
						)}

					<div
						className="inputWithIconApps"
						style={{ marginRight: "15px" }}
					>
						{props && props.setSearchQuery && (
							<input
								placeholder="Search Users"
								type="text"
								onChange={(e) => {
									props.setSearchQuery(e.target.value);
								}}
							/>
						)}
						<img src={search} aria-hidden="true" />
					</div>
					<button
						className="appsad"
						onClick={() => {
							props.refreshTable();
							trackActionSegment(
								"Clicked on Refresh Button in Agent Users Table",
								{
									currentCategory: "Agents",
									currentPageName: "Agents-Users",
								}
							);
						}}
						style={{
							width: "50px",
						}}
					>
						<img
							className="w-100 h-100 m-auto"
							src={refresh_icon}
						/>
					</button>
				</div>
			</div>
			{showPromptModal && (
				<PromptModal
					setPromptSentSuccessfully={props.setPromptSentSuccessfully}
					agentType={sendPromptAgentType}
					selectedIds={props.selectedIds}
					isOpen={showPromptModal}
					closeModal={() => setShowPromptModal(false)}
				></PromptModal>
			)}
		</>
	);
}
