import InfiniteScroll from "react-infinite-scroll-component";
import { EmptySearch } from "common/EmptySearch";
import { LoaderPage } from "common/Loader/LoaderPage";
import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import AppPlaybookRulesCard from "./appPlaybookRulesCard";
import { Loader } from "common/Loader/Loader";
import { checkSpecialCharacters } from "services/api/search";
import search from "assets/search.svg";
import refresh_icon from "assets/icons/refresh.svg";
import { CreateRule } from "./createRule";
import Button from "react-bootstrap/Button";
import { template } from "underscore";
import emptyState from "assets/appPlaybooks/emptystate.svg";
import {
	sortableContainer,
	sortableElement,
	sortableHandle,
} from "react-sortable-hoc";
import {
	getAppRule,
	resetAppRule,
	updateOrderOfAutomationRules,
} from "../redux/action";
import {
	getAppPlaybookRules,
	updateOrderOfRule,
	updateRule,
	searchAppPlaybookRules,
} from "../service/automation-api";
import ChangeRuleStatusModal from "modules/workflow/components/ChangeRuleStatusModal/ChangeRuleStatusModal";

const SortableContainer = sortableContainer(({ children }) => {
	return <ul style={{ padding: "0px", color: "#fff" }}>{children}</ul>;
});

export default function AppPlaybookRules(props) {
	const { app } = props;
	const timeout = useRef();
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [folderType, setFolderType] = useState("");
	const [entity, setEntity] = useState("application");
	const [showCreatePlaybook, setShowCreatePlaybook] = useState(false);
	const [showEdit, setShowEdit] = useState(false);
	const [saveRule, setSaveRule] = useState(false);
	const [refreshTable, setRefreshTable] = useState(false);
	const [templatesPageNo, setTemplatesPageNo] = useState({});
	const [templates, setTemplates] = useState({});
	const [template, setTemplate] = useState("");
	const [showRuleStatusModal, setShowRuleStatusModal] = useState(false);
	const [selectedRuleData, setSelectedRuleData] = useState(null);
	const [query, setQuery] = useState("");

	const dispatch = useDispatch();
	const edit_rule = useSelector((state) => state.appRule?.updated_rule);

	const folder_type_desc = {
		provision_deprovision: {
			header: "Onboarding/Offboarding Rules",
			subHeader: "",
		},
		app_management: {
			header: "App Management Rules",
			subHeader: ``,
		},
		license_management: {
			header: "License Management Rules",
			subHeader: "",
		},
	};
	const loadMoreData = async (templateKey) => {
		const pageNo = templatesPageNo[templateKey] + 1;
		let res;
		if (query) {
			res = await searchAppPlaybookRules(pageNo, 6, query, templateKey);
		} else {
			res = await getAppPlaybookRules(pageNo, 6, templateKey);
		}
		let currentTemplates = { ...templates };
		currentTemplates[templateKey] = {
			data: [...currentTemplates[templateKey].data, ...res.data],
			meta: res.meta,
		};
		setTemplates(currentTemplates);
		setTemplatesPageNo((prevTemplatesPageNo) => ({
			...prevTemplatesPageNo,
			[templateKey]: pageNo,
		}));
	};

	const closeModal = () => {
		setShowCreatePlaybook(false);
		dispatch(resetAppRule());
		setShowEdit(false);
	};

	const showcreatePlaybookModal = (e, key) => {
		setTemplate("");
		e && e.preventDefault();
		setFolderType(key);
		setShowCreatePlaybook(true);
	};

	const showEditModel = (key, rule_id) => {
		setShowEdit(true);
		setTemplate("");
		setFolderType(key);
		setShowCreatePlaybook(true);
		dispatch(getAppRule(rule_id));
	};

	useEffect(() => {
		setTemplates({});
		fetchData();
	}, []);

	async function fetchData() {
		setIsLoadingData(true);
		let promise_arr = [];
		let current_templates = {
			provision_deprovision: {},
			app_management: {},
			license_management: {},
			//others: [],
		};
		for (let template in current_templates) {
			if (query) {
				promise_arr.push(searchAppPlaybookRules(0, 6, query, template));
			} else {
				promise_arr.push(getAppPlaybookRules(0, 6, template));
			}
		}
		const res = await Promise.all(promise_arr);
		let index = 0;
		for (let template in current_templates) {
			current_templates[template] = res[index];
			index++;
		}

		setTemplates(current_templates);
		setTemplatesPageNo({
			provision_deprovision: 0,
			app_management: 0,
			license_management: 0,
		});
		setIsLoadingData(false);
	}

	useEffect(() => {
		if (edit_rule) {
			fetchData();
		}
	}, [edit_rule]);

	useEffect(() => {
		if (refreshTable) {
			setTemplates(null);
			fetchData();
			setRefreshTable(false);
		}
	}, [refreshTable]);

	const handleRefreshTable = () => {
		setTemplates({});
		setRefreshTable(true);
	};

	const handleDebounceSearch = () => {
		clearTimeout(timeout.current);
		timeout.current = setTimeout(() => {
			fetchData();
		}, 600);
	};

	const handleSearchQuery = (e) => {
		setQuery(e.target.value);
	};

	useEffect(() => {
		handleDebounceSearch();
	}, [query]);

	const handleStatusChange = (status, row) => {
		const data = { ...row, status: status ? "active" : "inactive" };
		setSelectedRuleData(row);
		setShowRuleStatusModal(true);
	};

	const SortableItem = sortableElement(({ template, name, key }) => {
		return (
			<li style={{ color: "#fff" }}>
				<AppPlaybookRulesCard
					key={key}
					template={template}
					name={name}
					showcreatePlaybookModal={showcreatePlaybookModal}
					handleRefreshTable={handleRefreshTable}
					showEditModel={showEditModel}
					handleStatusChange={handleStatusChange}
					application={app}
				/>
			</li>
		);
	});

	return (
		<>
			<div
				style={{
					height: "calc(100vh - 33vh)",
					overflowY: "auto",
					width: "100%",
				}}
				id="scrollableDiv"
				className="hide-scrollbar p-3"
			>
				<div className="d-flex justify-content-end px-3 mr-3">
					<div className="inputWithIconApps">
						<input
							type="text"
							placeholder="Search Rule"
							value={query}
							onChange={handleSearchQuery}
						/>
						<img src={search} aria-hidden="true" />
					</div>
					<button
						className="appsad ml-3"
						onClick={() => handleRefreshTable()}
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
				{isLoadingData ? (
					<LoaderPage />
				) : (
					<>
						{templates && Object.keys(templates).length > 0 ? (
							<>
								{Object.keys(templates).map((key, index) => {
									return (
										<>
											<div
												key={index + key}
												className="d-flex justify-content-between mt-3"
												style={{ width: "100%" }}
											>
												<div className="d-flex flex-column">
													<p className="appplaybook_header">
														{
															folder_type_desc[
																key
															]?.header
														}
													</p>
													<p className="appplaybook_subheader">
														{
															folder_type_desc[
																key
															]?.subHeader
														}
													</p>
												</div>
												<a
													href=""
													onClick={(e) => {
														showcreatePlaybookModal(
															e,
															key
														);
													}}
													style={{
														marginRight: "30px",
													}}
												>
													+ New Rule
												</a>
											</div>
											{templates[key].data.length ===
												0 && (
												<div className="empty_state d-flex flex-column justify-content-center align-items-center">
													<img src={emptyState} />
													You haven't setup any{" "}
													{
														folder_type_desc[key]
															?.header
													}
													<a
														href=""
														onClick={(e) => {
															showcreatePlaybookModal(
																e,
																key
															);
														}}
													>
														+ Create New Rule
													</a>
												</div>
											)}
											{templates[key].data.length > 0 && (
												<div>
													<SortableContainer
														// onSortEnd={onSortEnd}
														onSortEnd={async ({
															oldIndex,
															newIndex,
														}) => {
															setIsLoadingData(
																true
															);
															await updateOrderOfRule(
																{
																	id: templates[
																		key
																	]?.data[
																		oldIndex
																	]?._id,
																	type: key,
																	currentOrder:
																		templates[
																			key
																		]?.data[
																			oldIndex
																		]
																			?.priority_order,
																	newOrder:
																		newIndex +
																		1,
																}
															);
															handleRefreshTable();
														}}
														useDragHandle
														helperClass="draggable-item"
													>
														{templates[
															key
														].data.map(
															(
																template,
																index
															) => {
																return (
																	<SortableItem
																		key={
																			index
																		}
																		index={
																			index
																		}
																		template={
																			template
																		}
																		name={
																			key
																		}
																	/>
																);
															}
														)}
													</SortableContainer>
												</div>
											)}
											<div className="d-flex justify-content-center">
												{templates[key].meta.total -
													templates[key].data.length >
													0 && (
													<Button
														variant="outline-primary"
														onClick={() =>
															loadMoreData(key)
														}
													>
														Show more
													</Button>
												)}
											</div>
										</>
									);
								})}
							</>
						) : (
							<div
								style={{ display: "flex", height: "50vh" }}
							></div>
						)}
					</>
				)}

				{showCreatePlaybook && (
					<CreateRule
						onCloseModal={closeModal}
						openModal={showCreatePlaybook}
						folderType={folderType}
						entity={entity}
						showEdit={showEdit}
						setShowEdit={setShowEdit}
						setSaveRule={setSaveRule}
						handleRefreshTable={handleRefreshTable}
						application={app}
						setIsLoadingData={setIsLoadingData}
					/>
				)}
				{showRuleStatusModal && (
					<ChangeRuleStatusModal
						rule={selectedRuleData}
						type={"#app_rules"}
						rule_id={
							selectedRuleData?.rule_id || selectedRuleData?._id
						}
						rule_name={
							selectedRuleData?.rule_name ||
							selectedRuleData?.name
						}
						setShowRuleStatusModal={setShowRuleStatusModal}
						showRuleStatusModal={showRuleStatusModal}
						refreshTable={handleRefreshTable}
						// upadteAppRuleSerive={updateRule}
					/>
				)}
			</div>
		</>
	);
}
