import InfiniteScroll from "react-infinite-scroll-component";
import { EmptySearch } from "common/EmptySearch";
import { LoaderPage } from "common/Loader/LoaderPage";
import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import AppPlaybookCard from "./appPlaybooksCard";
import { Button } from "UIComponents/Button/Button";
import { Loader } from "common/Loader/Loader";
import search from "assets/search.svg";
import {
	getAppPlaybookData,
	searchPlaybookData,
} from "../service/automation-api";
import { checkSpecialCharacters } from "services/api/search";
import { CreatePlaybook } from "./playbooks/createPlaybook";
import emptyState from "assets/appPlaybooks/emptystate.svg";

export default function AppPlaybooks(props) {
	const { app } = props;
	const timeout = useRef();
	const isCancelled = React.useRef(false);
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [query, setQuery] = useState("");
	const [template, setTemplate] = useState("");
	const [folderType, setFolderType] = useState("");
	const [showCreatePlaybook, setShowCreatePlaybook] = useState(false);
	const [templatesPageNo, setTemplatesPageNo] = useState({});
	const [templates, setTemplates] = useState({});
	const folder_type_desc = {
		provision_deprovision: {
			header: "Provisioning and De-provisioning appPlaybooks",
			subHeader: "Provision, Deprovision, Upgrade and downgrade licenses",
		},
		app_management: {
			header: "App Management appPlaybook",
			subHeader: `Manage ${app?.app_name} parameters`,
		},
		license_management: {
			header: "License Management",
			subHeader: "",
		},
	};
	const loadMoreData = async (templateKey) => {
		const pageNo = templatesPageNo[templateKey] + 1;
		let res;
		if (query) {
			res = await searchPlaybookData(pageNo, 6, query, templateKey);
		} else {
			res = await getAppPlaybookData(pageNo, 6, templateKey);
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
	};
	const openModal = (template) => {
		setFolderType(template.mini_playbook_data.folder_type);
		setTemplate(template);
		setShowCreatePlaybook(true);
	};
	const showcreatePlaybookModal = (e, key) => {
		setTemplate("");
		e.preventDefault();
		setFolderType(key);
		setShowCreatePlaybook(true);
	};

	useEffect(() => {
		fetchData();
		return () => {
			isCancelled.current = true;
		};
	}, []);

	async function fetchData() {
		setIsLoadingData(true);
		let promise_arr = [];
		//to populate the default playbook call the getAppPlaybook api once with any folder type
		await getAppPlaybookData(0, 6, "provision_deprovision");

		let current_templates = {
			provision_deprovision: {},
			app_management: {},
			//license_management: {},
			//others: [],
		};
		for (let template in current_templates) {
			if (query) {
				promise_arr.push(searchPlaybookData(0, 6, query, template));
			} else {
				promise_arr.push(getAppPlaybookData(0, 6, template));
			}
		}
		const res = await Promise.all(promise_arr);
		let index = 0;
		for (let template in current_templates) {
			current_templates[template] = res[index];
			index++;
		}
		if (!isCancelled.current) {
			setTemplates(current_templates);
			setTemplatesPageNo({
				provision_deprovision: 0,
				app_management: 0,
				//license_management: 0,
			});
			setIsLoadingData(false);
		}
	}

	const handleDebounceSearch = () => {
		clearTimeout(timeout.current);
		timeout.current = setTimeout(() => {
			fetchData();
		}, 600);
	};
	useEffect(() => {
		if (!showCreatePlaybook) {
			fetchData();
		}
	}, [showCreatePlaybook]);

	const handleSearchQuery = (e) => {
		setQuery(e.target.value);
	};
	useEffect(() => {
		handleDebounceSearch();
	}, [query]);

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
				<div className="d-flex justify-content-end p-3">
					<div className="inputWithIconApps">
						<input
							type="text"
							placeholder="Search"
							value={query}
							onChange={handleSearchQuery}
						/>
						<img src={search} aria-hidden="true" />
					</div>
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
												className="d-flex justify-content-between"
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
												<Button
													type="link"
													onClick={(e) =>
														showcreatePlaybookModal(
															e,
															key
														)
													}
												>
													+ New appPlaybook
												</Button>
											</div>
											{templates[key].data.length ===
												0 && (
												<div className="empty_state d-flex flex-column justify-content-center align-items-center">
													<img src={emptyState} />
													There are no playbooks Setup
													<Button
														type="link"
														onClick={(e) =>
															showcreatePlaybookModal(
																e,
																key
															)
														}
													>
														+ Create New appPlaybook
													</Button>
												</div>
											)}
											{templates[key].data.length > 0 && (
												<div className="d-flex flex-wrap">
													{templates[key].data.map(
														(template, index) => {
															return (
																<>
																	<AppPlaybookCard
																		key={
																			index +
																			"_" +
																			key
																		}
																		template={
																			template
																		}
																		name={
																			key
																		}
																		app={
																			app
																		}
																		fetchData={
																			fetchData
																		}
																		openModal={(
																			e
																		) =>
																			openModal(
																				template
																			)
																		}
																	/>
																</>
															);
														}
													)}
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
							<div style={{ display: "flex", height: "50vh" }}>
								No playbooks found
							</div>
						)}
					</>
				)}

				{showCreatePlaybook && (
					<CreatePlaybook
						folderType={folderType}
						onCloseModal={closeModal}
						openModal={showCreatePlaybook}
						template={template}
					/>
				)}
			</div>
		</>
	);
}
