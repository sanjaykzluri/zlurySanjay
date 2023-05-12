import React, { useCallback, useEffect, useRef, useState } from "react";
import "./AgentsUsers.css";
import {
	SendPromptButton,
	UsePromptFormatter,
	UsersTable,
} from "../Tables/UsersTable";
import { debounce, isEmpty } from "../../../../utils/common";
import { AgentUserFilters } from "./AgentUserFilters";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { PromptModal } from "../Modals/PromptModal";
import { useDispatch, useSelector } from "react-redux";
import { useDidUpdateEffect } from "../../../../utils/componentUpdateHook";
import { agentConstants } from "../../../../constants/agents";
import {
	trackActionSegment,
	trackPageSegment,
} from "modules/shared/utils/segment";
import active from "assets/agents/active.svg";
import chrome from "assets/agents/chrome.svg";
import firefox from "assets/agents/firefox.svg";
import edge from "assets/agents/edge.svg";
import windows from "assets/agents/windows.svg";
import macos from "assets/agents/macos.svg";
import linux from "assets/agents/linux.svg";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";
import { TriggerIssue } from "utils/sentry";
import { getAgentUsersV2, searchAgentsUsers } from "services/api/agents";
import { getSearchReqObj } from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";
import OldInfiniteTable from "common/oldInfiniteTable";
import { EmptySearch } from "common/EmptySearch";
import { ErrorComponent } from "common/ErrorComponnet";
import { Empty } from "components/Uploads/Empty";
import {
	addArchiveFilter,
	defaultReqBody,
	filtersRequestBodyGenerator,
} from "common/infiniteTableUtil";
import { isBasicSubscriptionSelector } from "common/restrictions";
import UserInfoTableComponent from "common/UserInfoTableComponent";
import UserAppMetaInfoCard from "modules/shared/components/UserAppMetaInfo/UserAppMetaInfoCard";
import { defaults } from "constants";
import { checkSpecialCharacters, searchUserSource } from "services/api/search";
import { client } from "utils/client";
import { timeSince } from "utils/DateUtility";
import { AgentUserFiltersV2 } from "./AgentUserFiltersV2";
import { push } from "connected-react-router";
import { agentsList } from "modules/Agents/constants/AgentConstants";
import { checkAndFetchV2SourceListForFilter } from "modules/v2InfiniteTable/redux/v2infinite-action";

export function AgentsUsersV2(props) {
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

	const id = window.location.pathname.split("/")[2];
	const cancelToken = useRef();
	const [checked, setChecked] = useState([]);
	const [data, setData] = useState([]);
	const [metaData, setMetaData] = useState();
	const [hasMoreData, setHasMoreData] = useState(true);
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [pageNo, setPageNo] = useState(0);
	const [reqBody, setReqBody] = useState({ ...defaultReqBody });
	const [shouldConcat, setShouldConcat] = useState(false);

	const dispatch = useDispatch();
	const query = useSelector((state) => state.router.location.query);
	const router = useSelector((state) => state.router);
	const { hash } = router.location;
	const [showErrorModal, setShowErrorModal] = useState(false);
	const isBasicSubscription = useSelector(isBasicSubscriptionSelector);
	const [selectedData, setSelectedData] = useState([]);
	const [refreshTable, setRefreshTable] = useState(false);
	const [v2Entity, setV2Entity] = useState("users");

	const { source_list_for_filter_loaded, source_list_for_filter } =
		useSelector((state) => state.v2Data[v2Entity]?.source_list || {});

	useEffect(() => {
		if (!source_list_for_filter_loaded) {
			dispatch(
				checkAndFetchV2SourceListForFilter(v2Entity, searchUserSource)
			);
		}
	}, []);

	useEffect(() => {
		let reqObj = { ...reqBody };
		if (query.metaData) {
			try {
				reqObj = filtersRequestBodyGenerator(query, reqBody);
			} catch {
				dispatch(push(`?metaData=${JSON.stringify(reqBody)}${hash}`));
			}
			setReqBody({ ...reqObj });
		} else if (!query.metaData) {
			// dispatch({ type: ACTION_TYPE.RESET_FILTERS });
			setReqBody({ ...defaultReqBody });
		}
		handleRefresh();
	}, [query]);

	useEffect(() => {
		let reqObj = { ...reqBody };
		if (query.metaData) {
			try {
				reqObj = filtersRequestBodyGenerator(query, reqBody);
			} catch {
				dispatch(push(`?metaData=${JSON.stringify(reqBody)}${hash}`));
			}
		}
		!isLoadingData && loadData(reqObj);
	}, [pageNo, refreshTable]);

	useEffect(() => {
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
			setIsLoadingData(false);
		}
		if (searchQuery) {
			fetchDataFn();
			reqBody.filter_by = [];
			query.metaData &&
				dispatch(push(`?metaData=${JSON.stringify(reqBody)}${hash}`));
		} else if (searchQuery === "") {
			reqBody.filter_by = [];
			handleRefresh();
			setReqBody(reqBody);
			reqBody.filter_by = [];
			query.metaData &&
				dispatch(push(`?metaData=${JSON.stringify(reqBody)}${hash}`));
		}
	}, [searchQuery]);

	function handleLoadMore() {
		setShouldConcat(true);
		if (isLoadingData) return;
		setShouldConcat(true);
		setPageNo((pageNo) => {
			return pageNo + 1;
		});
	}

	function handleRefresh() {
		setData([]);
		setPageNo(0);
		setMetaData();
		setRefreshTable(!refreshTable);
		setHasMoreData(true);
		setShowErrorModal(false);
	}

	async function loadData(reqBody) {
		if (isEmpty(reqBody.filter_by) && searchQuery) {
			const searchObj = getSearchReqObj(
				searchQuery,
				"user_name",
				"User Name"
			);
			reqBody.filter_by = [searchObj];
		}
		let urlMetaData;
		let urlReqBody = reqBody;

		if (query.metaData) {
			urlMetaData = JSON.parse(JSON.stringify(query));
			urlReqBody = JSON.parse(decodeURIComponent(urlMetaData.metaData));
			reqBody.sort_by = urlReqBody.sort_by || [];
			reqBody.filter_by = urlReqBody.filter_by || [];
			reqBody.group_filter_by = urlReqBody.group_filter_by || [];
			reqBody.columns = urlReqBody.columns || [];
			if (urlReqBody.reset_filter) {
				reqBody.reset_filter = urlReqBody.reset_filter;
			} else {
				delete reqBody.reset_filter;
			}
		}
		if (urlReqBody?.filter_by?.length && !searchQuery) {
			reqBody.filter_by = addArchiveFilter(
				urlReqBody,
				reqBody,
				"user_archive"
			);
		}

		setIsLoadingData(true);
		try {
			const response = await getAgentUsersV2(
				reqBody,
				pageNo,
				defaults.RECOGNISED_TABLE_ROW
			);
			const totalLoadedRecords = data.length + response.data.length;
			if (totalLoadedRecords === response.meta.total_count) {
				setHasMoreData(false);
			} else if (response.data.length === 30) {
				!hasMoreData && setHasMoreData(true);
			}
			let newData = shouldConcat
				? [...data, ...response.data]
				: response.data;
			let singleAgentDataObj = response.atleast_1_agent;
			setSingleAgentData(singleAgentDataObj);
			setIsLoadingData(false);
			setData(newData);
			setMetaData(response.meta);
		} catch (error) {
			setIsLoadingData(false);
			setHasMoreData(false);
			setMetaData(reqBody);
			setShowErrorModal(true);
		}
	}

	const fetchDataFn = () => {
		setData([]);
		setMetaData();
		if (checkSpecialCharacters(searchQuery, true)) {
			setHasMoreData(false);
		} else {
			setIsLoadingData(true);
			cancelToken.current = client.CancelToken.source();
			const searchObj = getSearchReqObj(
				searchQuery,
				"user_name",
				"User Name"
			);
			reqBody.filter_by = [searchObj];
			searchAgentsUsers(
				reqBody,
				pageNo,
				defaults.RECOGNISED_TABLE_ROW,
				cancelToken.current
			)
				.then((response) => {
					if (response.data.length < defaults.MINIMUM_ROW) {
						setHasMoreData(false);
					}
					setReqBody(reqBody);
					setData(response.data);
					setMetaData(response.meta);
					setIsLoadingData(false);
					window.analytics.track(
						"Search Agent Users Results Displayed",
						{
							searchQuery: searchQuery,
							currentCategory: "Agents",
							orgId: orgId || "",
							orgName: orgName || "",
						}
					);
				})
				.catch((error) => {
					if (!client.isCancel(error)) {
						TriggerIssue("Error in searching Agent users", error);
						setIsLoadingData(false);
						setHasMoreData(false);
					}
				});
		}
	};

	let value =
		Number(
			(
				(singleAgentData &&
					Object.keys(singleAgentData).length > 0 &&
					singleAgentData?.value) ||
				0
			).toFixed(1)
		) || 0;

	useEffect(() => {
		trackPageSegment("Agent", "Users");
	}, []);

	useDidUpdateEffect(() => {
		if (promptSentSuccessfully) {
			handleRefresh();
			setPromptSentSuccessfully(false);
		}
	}, [promptSentSuccessfully]);

	const columnsMapper = {
		user: {
			text: "User",
			sortKey: "user",
			dataField: "user_name",
			text: "User",
			formatter: (data, row, rowindex) => {
				return (
					<UserInfoTableComponent
						user_account_type={row.user_account_type}
						profile_img={row.profile_img}
						user_profile={row.user_profile}
						user_email={row.user_email}
						user_status={row.user_status}
						row={row}
						user_id={row.user_id}
						user_name={row.user_name}
						tooltipClassName={"userMetaInfoCard"}
						customTooltip={
							<UserAppMetaInfoCard
								title={row?.user_name}
								description={row?.user_email}
								isActive={row.user_status === "active"}
								isUser={true}
								row={row}
								user_status={row.user_status}
							/>
						}
						tracking={true}
						pageInfo={{ category: "Agents", page: "Agents-Users" }}
					></UserInfoTableComponent>
				);
			},
		},
		last_active: {
			dataField: "last_activity",
			text: "Last Active",
			formatter: (row, data, rowindex) => (
				<div className="d-flex flex-row align-items-center">
					{data.user_agent_last_activity
						? `${timeSince(data.user_agent_last_activity)} ago`
						: "-"}
				</div>
			),
		},
		chrome: {
			dataField: "user_chrome_agent_data",
			headerImg: () => (
				<img
					className="mr-1 agents_header_image"
					src={chrome}
					height={14}
					width={14}
				/>
			),
			text: "Chrome",
			formatter: (row, data, cell) => (
				<div className="flex flex-row align-items-center justify-content-center">
					<UsePromptFormatter
						row={row}
						data={data}
						cell={cell}
					></UsePromptFormatter>
				</div>
			),
		},
		firefox: {
			dataField: "user_firefox_agent_data",
			headerImg: () => (
				<img
					className="mr-1 agents_header_image"
					src={firefox}
					height={14}
					width={14}
				/>
			),
			text: "Firefox",
			formatter: (row, data, cell) => (
				<div className="flex flex-row align-items-center justify-content-center">
					<UsePromptFormatter
						row={row}
						data={data}
						cell={cell}
					></UsePromptFormatter>
				</div>
			),
		},
		edge: {
			dataField: "user_edge_agent_data",
			headerImg: () => (
				<img
					className="mr-1 agents_header_image"
					src={edge}
					height={14}
					width={14}
				/>
			),
			text: "Edge",
			formatter: (row, data, cell) => {
				return (
					<div className="flex flex-row align-items-center justify-content-center">
						<UsePromptFormatter
							row={row}
							data={data}
							cell={cell}
						></UsePromptFormatter>
					</div>
				);
			},
		},
		windows: {
			dataField: "user_windows_agent_data",
			headerImg: () => (
				<img
					className="mr-1 agents_header_image"
					src={windows}
					height={14}
					width={14}
				/>
			),
			text: "Windows",
			formatter: (row, data, cell) => (
				<div className="flex flex-row align-items-center justify-content-center">
					<UsePromptFormatter
						row={data}
						data={data}
						cell={cell}
					></UsePromptFormatter>
				</div>
			),
		},
		macos: {
			dataField: "user_macos_agent_data",
			headerImg: () => (
				<img
					className="mr-1 agents_header_image"
					src={macos}
					height={14}
					width={14}
				/>
			),

			text: "MacOS",
			formatter: (row, data, cell) => (
				<div className="flex flex-row align-items-center justify-content-center">
					<UsePromptFormatter
						row={row}
						data={data}
						cell={cell}
					></UsePromptFormatter>
				</div>
			),
		},
		linux: {
			dataField: "user_linux_agent_data",
			headerImg: () => (
				<img
					className="mr-1 agents_header_image"
					src={linux}
					height={14}
					width={14}
				/>
			),
			text: "Linux",
			formatter: (row, data, cell) => (
				<div className="flex flex-row align-items-center justify-content-center">
					<UsePromptFormatter
						row={row}
						data={data}
						cell={cell}
					></UsePromptFormatter>
				</div>
			),
		},
		linux: {
			text: "",
			formatter: (row, data) => (
				<SendPromptButton row={row} data={data}></SendPromptButton>
			),
		},
	};

	return (
		<>
			<div>
				<AgentUserFiltersV2
					checked={checked}
					data={data}
					setChecked={setChecked}
					searchQuery={searchQuery}
					setSearchQuery={debounce(setSearchQuery, 200)}
					metaData={metaData}
					columnsMapper={columnsMapper}
					usedColumns={metaData?.columns}
					sourceList={source_list_for_filter}
					handleRefresh={handleRefresh}
					isLoadingData={isLoadingData}
					v2TableEntity="users"
				/>

				{singleAgentData &&
					Object.keys(singleAgentData).length > 0 &&
					value !== 100 && (
						<div style={{ padding: "0px 40px 0px 40px" }}>
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
												},
												true
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
					<OldInfiniteTable
						checked={checked}
						setChecked={setChecked}
						selectedData={selectedData}
						setSelectedData={setSelectedData}
						data={data}
						metaData={metaData}
						handleLoadMore={handleLoadMore}
						columnsMapper={columnsMapper}
						keyField="_id"
						emptyState={
							searchQuery ? (
								<EmptySearch
									searchQuery={searchQuery}
									metaData={metaData}
									onReset={() => {
										setSearchQuery();
										setReqBody({ ...defaultReqBody });
										handleRefresh();
									}}
								/>
							) : showErrorModal ? (
								<ErrorComponent />
							) : (
								<Empty
									title={"No users"}
									refresh={handleRefresh}
								/>
							)
						}
						searchQuery={searchQuery}
						isLoadingData={isLoadingData}
						hasMoreData={hasMoreData}
						allowFewSpecialCharacters={true}
					/>
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
