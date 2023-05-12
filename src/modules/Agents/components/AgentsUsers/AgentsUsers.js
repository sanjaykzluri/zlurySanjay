import React, { useCallback, useEffect, useState } from "react";
import "./AgentsUsers.css";
import { UsersTable } from "../Tables/UsersTable";
import { debounce } from "../../../../utils/common";
import { AgentUserFilters } from "./AgentUserFilters";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { PromptModal } from "../Modals/PromptModal";
import { useSelector } from "react-redux";
import { useDidUpdateEffect } from "../../../../utils/componentUpdateHook";
import { agentConstants } from "../../../../constants/agents";
import {
	trackActionSegment,
	trackPageSegment,
} from "modules/shared/utils/segment";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";
export function AgentsUsers(props) {
	const { partner } = useContext(RoleContext);

	const [selectedIds, setSelectedIds] = useState([]);
	const onRowSelect = (rows) => {
		setSelectedIds(rows);
	};
	const [promptSentSuccessfully, setPromptSentSuccessfully] = useState(false);
	const [filterApplied, setFilterApplied] = useState(
		agentConstants.ATLEAST_ONE_AGENT
	);
	const handleFilterChange = (filter) => {
		setFilterApplied(filter);
	};
	const [searchQuery, setSearchQuery] = useState("");
	const [singleAgentData, setSingleAgentData] = useState();
	const [showPromptModal, setShowPromptModal] = useState(false);
	let value =
		Number(
			(
				(singleAgentData &&
					Object.keys(singleAgentData).length > 0 &&
					singleAgentData?.value) ||
				0
			).toFixed(1)
		) || 0;
	const { refreshTable } = useSelector((state) => state.ui);
	useEffect(() => {
		trackPageSegment("Agent", "Users");
	}, []);
	useDidUpdateEffect(() => {
		refreshTable();
	}, [searchQuery]);
	useDidUpdateEffect(() => {
		if (promptSentSuccessfully) {
			refreshTable();
			setPromptSentSuccessfully(false);
		}
	}, [promptSentSuccessfully]);
	return (
		<>
			<div style={{ padding: "0px 0px 0px 40px" }}>
				<AgentUserFilters
					filterApplied={filterApplied}
					setSearchQuery={debounce(setSearchQuery, 300)}
					selectedIds={selectedIds}
					handleFilterChange={handleFilterChange}
					setPromptSentSuccessfully={setPromptSentSuccessfully}
					refreshTable={refreshTable}
				/>

				{singleAgentData &&
					Object.keys(singleAgentData).length > 0 &&
					value !== 100 && (
						<div style={{ padding: "0px 40px 0px 0px" }}>
							<div className="agents__users__progressbar__cont">
								<div className="agents__users__progressbar__cont__left">
									<CircularProgressbar
										value={value}
										maxValue={100}
										text={`${value}%`}
										styles={{
											root: {},

											path: {
												stroke: "#5ABAFF",
											},

											text: {
												fill: "#222222",
												fontSize: "22px",
												lineHeight: "26px",
											},
										}}
									/>
								</div>
								<div className="agents__users__progressbar__cont__right">
									<div className="font-14 black">
										Only {value}% of the users have
										installed {partner?.name} agents. Send a
										prompt now.
									</div>
									<button
										className="agents__users__progressbar__cont__button"
										onClick={() => {
											setShowPromptModal(true);
											trackActionSegment(
												"Clicked on Send Prompt Message below the quick filter",
												{
													currentCategory: "Agents",
													currentPageName:
														"Agents-Users",
												}
											);
										}}
									>
										Send Prompt to{" "}
										{singleAgentData &&
											singleAgentData?.total_users}{" "}
										users
									</button>
								</div>
							</div>
						</div>
					)}

				<div style={{ padding: "0px 40px 0px 0px" }}>
					<UsersTable
						promptSentSuccessfully={promptSentSuccessfully}
						setPromptSentSuccessfully={setPromptSentSuccessfully}
						searchQuery={searchQuery}
						onChecked={onRowSelect}
						filterApplied={filterApplied}
						setSingleAgentData={setSingleAgentData}
					></UsersTable>
				</div>
			</div>
			{showPromptModal && (
				<PromptModal
					isProgressSection={true}
					isOpen={showPromptModal}
					closeModal={() => setShowPromptModal(false)}
					setPromptSentSuccessfully={setPromptSentSuccessfully}
				></PromptModal>
			)}
		</>
	);
}
