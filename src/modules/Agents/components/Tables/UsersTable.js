import React, { useCallback, useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { NameBadge } from "../../../../common/NameBadge";
import { InfiniteTable } from "../../../../components/Departments/InfiniteTable";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import active from "../../../../assets/agents/active.svg";
import chrome from "../../../../assets/agents/chrome.svg";
import firefox from "../../../../assets/agents/firefox.svg";
import edge from "../../../../assets/agents/edge.svg";
import windows from "../../../../assets/agents/windows.svg";
import macos from "../../../../assets/agents/macos.svg";
import linux from "../../../../assets/agents/linux.svg";
import { useDispatch, useSelector } from "react-redux";
import agenthealth from "../../../../assets/agents/agenthealth.svg";
import subtract from "../../../../assets/agents/subtract.svg";
import green from "../../../../assets/agents/green.svg";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import sendpromptbutton2 from "../../../../assets/agents/sendpromptbutton2.svg";
import lastsynced from "../../../../assets/agents/lastsynced.svg";
import lastactivity from "../../../../assets/agents/lastactivity.svg";
import inactive from "../../../../assets/agents/inactive.svg";
import nullsvg from "../../../../assets/agents/null.svg";
import useOutsideClick from "../../../../common/OutsideClick/OutsideClick";
import sendprompt from "../../../../assets/agents/sendprompt.svg";
import promptSent from "../../../../assets/agents/promptSent.svg";
import { getAgentsUsers } from "../../../../services/api/agents";
import ContentLoader from "react-content-loader";
import { PromptModal } from "../Modals/PromptModal";
import {
	timeSince,
	getNumberOfDaysBtwnTwoDates,
} from "../../../../utils/DateUtility";
import { useDidUpdateEffect } from "../../../../utils/componentUpdateHook";
import { EmptySearch } from "../../../../common/EmptySearch";
import { client } from "../../../../utils/client";
import "./UsersTable.css";
import { object } from "prop-types";
import moment from "moment";
import { Empty } from "../Empty/Empty";
import { checkSpecialCharacters } from "../../../../services/api/search";
import { unescape } from "../../../../utils/common";
import UserInfoTableComponent from "../../../../common/UserInfoTableComponent";
import UserAppMetaInfoCard from "../../../shared/components/UserAppMetaInfo/UserAppMetaInfoCard";
import { trackActionSegment } from "modules/shared/utils/segment";
export function SendPromptButton({ row, data }) {
	const ref = useRef();
	const [clickedOnSendPromptButton, setClickedOnSendPromptButton] =
		useState(false);
	const [showPromptModal, setShowPromptModal] = useState(false);
	const [sendPromptAgentType, setSendPromptAgentType] = useState("");
	const [promptSentSuccessfully, setPromptSentSuccessfully] = useState(false);
	useOutsideClick(ref, () => {
		if (clickedOnSendPromptButton) setClickedOnSendPromptButton(false);
	});
	return (
		<>
			<div className="promptformatter__dropdowncont">
				<img
					onClick={() => {
						setClickedOnSendPromptButton(true);
						trackActionSegment(
							"Clicked on Send Prompt button for a single User",
							{
								currentCategory: "Agents",
								currentPageName: "Agents-Users",
								userId: data.user_id,
								userName: data.user_name,
							},
							true
						);
					}}
					src={promptSentSuccessfully ? promptSent : sendprompt}
					className="cursor-pointer "
				></img>
				{clickedOnSendPromptButton && (
					<div
						className="promptformatter__dd__cont__list"
						ref={(el) => {
							if (el) {
								ref.current = el;
							}
						}}
					>
						<button
							className="promptformatter__dd__cont__list__option"
							onClick={() => {
								trackActionSegment(
									"Clicked on Send Prompt button for Browser Agent of a single User",
									{
										currentCategory: "Agents",
										currentPageName: "Agents-Users",
										userId: data.user_id,
										userName: data.user_name,
									},
									true
								);
								setSendPromptAgentType("browser");
								setShowPromptModal(true);
								setClickedOnSendPromptButton(false);
								setTimeout(() => {
									setPromptSentSuccessfully(false);
								}, 30000);
							}}
						>
							{promptSentSuccessfully
								? "Resend Prompt for Browser Agent"
								: "Send Prompt for Browser Agent"}
						</button>
						<button
							className="promptformatter__dd__cont__list__option"
							onClick={() => {
								trackActionSegment(
									"Clicked on Send Prompt button for Desktop Agent of a single User",
									{
										currentCategory: "Agents",
										currentPageName: "Agents-Users",
										userId: data.user_id,
										userName: data.user_name,
									}
								);
								setSendPromptAgentType("desktop");
								setShowPromptModal(true);
								setClickedOnSendPromptButton(false);
								setTimeout(() => {
									setPromptSentSuccessfully(false);
								}, 30000);
							}}
						>
							{promptSentSuccessfully
								? "Resend Prompt for Desktop Agent"
								: "Send Prompt for Desktop Agent"}
						</button>
					</div>
				)}
			</div>
			{showPromptModal && (
				<PromptModal
					agentType={sendPromptAgentType}
					row={row}
					data={data}
					isOpen={showPromptModal}
					closeModal={() => setShowPromptModal(false)}
					setPromptSentSuccessfully={setPromptSentSuccessfully}
				></PromptModal>
			)}
		</>
	);
}
export function UsePromptFormatter({ row, data, cell }) {
	const ref = useRef();
	const [clickedOnActiveStatus, setClickedOnActiveStatus] = useState(false);
	const [clickedOnInactiveStatus, setClickedOnInactiveStatus] =
		useState(false);
	const [showPromptModal, setShowPromptModal] = useState(false);
	const agentImg = () => {
		switch (row?.name) {
			case "Google Chrome":
				return <img src={chrome} width={30} />;
			case "Mozilla Firefox":
				return <img src={firefox} width={30} />;
			case "Microsoft Edge":
				return <img src={edge} width={30} />;
			case "Windows":
				return <img src={windows} width={30} />;
			case "MacOS":
				return <img src={macos} width={30} />;
			default:
				return <img src={linux} width={30} />;
		}
	};
	const [clickedOnNullStatus, setClickedOnNullStatus] = useState(false);
	var months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	useOutsideClick(ref, () => {
		if (clickedOnActiveStatus) setClickedOnActiveStatus(false);
		if (clickedOnInactiveStatus) setClickedOnInactiveStatus(false);
		if (clickedOnNullStatus) setClickedOnNullStatus(false);
	});

	return (
		<>
			<div className="promptformatter__dropdowncont">
				{row && row.status && row.status !== "" ? (
					row.status === "active" ? (
						<img
							src={
								getNumberOfDaysBtwnTwoDates(
									new Date(row.last_synced_at),
									new Date()
								) > 7
									? inactive
									: active
							}
							className="cursor-pointer "
							onClick={() => {
								row.is_published &&
									setClickedOnActiveStatus(true);
								row.is_published &&
									trackActionSegment(
										"Clicked on Agent Icon",
										{
											currentCategory: "Agents",
											currentPageName: "Agents-Users",
											agentInfo: row,
										}
									);
							}}
						></img>
					) : (
						<img
							src={inactive}
							className="cursor-pointer"
							onClick={() => {
								row.is_published &&
									setClickedOnInactiveStatus(true);
								row.is_published &&
									trackActionSegment(
										"Clicked on Agent Icon",
										{
											currentCategory: "Agents",
											currentPageName: "Agents-Users",
											agentInfo: row,
										}
									);
							}}
						></img>
					)
				) : (
					<img
						src={nullsvg}
						className="cursor-pointer"
						onClick={() => {
							row.is_published && setClickedOnNullStatus(true);
							row.is_published &&
								trackActionSegment("Clicked on Agent Icon", {
									currentCategory: "Agents",
									currentPageName: "Agents-Users",
									agentInfo: row,
								});
						}}
					></img>
				)}
				{clickedOnActiveStatus && (
					<div
						className="promptformatter__dropdown__active"
						ref={(el) => {
							if (el) {
								ref.current = el;
							}
						}}
					>
						<div className="promptformatter__dropdown__active__d1">
							{agentImg()}
							<div className="promptformatter__dropdown__active__d1__d2">
								<div className="promptformatter__dropdown__active__d1__d2__d1">
									{row?.name}
								</div>
								<div className="promptformatter__dropdown__active__d1__d2__d2">
									{row?.type} Agent
								</div>
							</div>
							{getNumberOfDaysBtwnTwoDates(
								new Date(row.last_synced_at),
								new Date()
							) > 7 ? null : (
								<div className="promptformatter__dropdown__active__d1__d3">
									<img src={green}></img>
									<div className="promptformatter__dropdown__active__d1__d3__d1">
										In Use
									</div>
								</div>
							)}
						</div>
						{getNumberOfDaysBtwnTwoDates(
							new Date(row.last_synced_at),
							new Date()
						) > 7 && (
							<div className="promptformatter__dropdown__inactive__d2">
								<img
									src={inactive}
									style={{
										marginRight: "6px",
										marginLeft: "8px",
										maxHeight: "50%",
									}}
								></img>
								Agent Disconnected
							</div>
						)}
						<div className="promptformatter__dropdown__active__d2">
							<div className="promptformatter__dropdown__active__d2__d1">
								<img
									src={lastsynced}
									style={{ marginRight: "4px" }}
								></img>
								<div className="promptformatter__dropdown__active__d2__d1__d2">
									last synced at
								</div>
								<div className="promptformatter__dropdown__active__d2__d1__d3">
									{row.last_synced_at &&
										moment(row.last_synced_at).format(
											"DD MMM HH:mm"
										)}
								</div>
							</div>
							<div className="promptformatter__dropdown__active__d2__d1">
								<img
									src={lastactivity}
									style={{ marginRight: "4px" }}
								></img>
								<div className="promptformatter__dropdown__active__d2__d1__d2">
									last activity
								</div>
								<div className="promptformatter__dropdown__active__d2__d1__d3">
									{row.last_activity &&
										moment(row.last_activity).format(
											"DD MMM HH:mm"
										)}
								</div>
							</div>
							<div className="promptformatter__dropdown__active__d2__d1">
								<div className="promptformatter__dropdown__active__d2__d1__d2">
									In use since
								</div>
								<div className="promptformatter__dropdown__active__d2__d1__d3">
									{moment(row.installed_at).format(
										"DD MMM HH:mm"
									)}
								</div>
							</div>
							<div className="promptformatter__dropdown__active__d2__d1">
								<div className="promptformatter__dropdown__active__d2__d1__d2">
									Installed Version
								</div>
								<div className="promptformatter__dropdown__active__d2__d1__d3">
									{row.version}
								</div>
							</div>
						</div>
						{/* <div className="promptformatter__dropdown__active__d3">
                            <div className="promptformatter__dropdown__active__d3__d1">
                                <div className="promptformatter__dropdown__active__d3__d1__d1">
                                    <div className="promptformatter__dropdown__active__d3__d1__d1__d1">
                                        Agent Health
                                    </div>
                                    <img src={agenthealth}></img>
                                </div>
                                <div className="promptformatter__dropdown__active__d3__d1__d2">
                                    Excellent
                                </div>
                            </div>
                            <div className="promptformatter__dropdown__active__d3__d2">
                                <CircularProgressbar
                                    value={50}
                                    maxValue={100}
                                    text={50}
                                    styles={{
                                        root: {},

										path: {
											stroke: "#40E395",
										},

										text: {
											fill: "#40E395",
											fontSize: "40px",
										},
									}}
								/>
							</div>
						</div> */}
						<button
							className="promptformatter__dropdown__active__d4"
							onClick={() => {
								setShowPromptModal(true);
								setClickedOnActiveStatus(false);
							}}
						>
							Send Prompt
						</button>
					</div>
				)}
				{clickedOnInactiveStatus && (
					<>
						<div
							className="promptformatter__dropdown__active"
							ref={(el) => {
								if (el) {
									ref.current = el;
								}
							}}
						>
							<div className="promptformatter__dropdown__active__d1">
								{agentImg()}
								<div className="promptformatter__dropdown__active__d1__d2">
									<div className="promptformatter__dropdown__active__d1__d2__d1">
										{row?.name}
									</div>
									<div className="promptformatter__dropdown__active__d1__d2__d2">
										{row?.type} Agent
									</div>
								</div>
							</div>
							<div className="promptformatter__dropdown__inactive__d2">
								<img
									src={inactive}
									style={{
										marginRight: "6px",
										marginLeft: "8px",
										maxHeight: "50%",
									}}
								></img>
								Agent Disconnected
							</div>
							<div className="promptformatter__dropdown__active__d2">
								<div className="promptformatter__dropdown__active__d2__d1">
									<img
										src={lastsynced}
										style={{ marginRight: "4px" }}
									></img>
									<div className="promptformatter__dropdown__active__d2__d1__d2">
										last synced at
									</div>
									<div className="promptformatter__dropdown__active__d2__d1__d3">
										{row.last_synced_at &&
											moment(row.last_synced_at).format(
												"DD MMM HH:mm"
											)}
									</div>
								</div>
								<div className="promptformatter__dropdown__active__d2__d1">
									<img
										src={lastactivity}
										style={{ marginRight: "4px" }}
									></img>
									<div className="promptformatter__dropdown__active__d2__d1__d2">
										last activity
									</div>
									<div className="promptformatter__dropdown__active__d2__d1__d3">
										{row.last_activity &&
											moment(row.last_activity).format(
												"DD MMM HH:mm"
											)}
									</div>
								</div>
								<div className="promptformatter__dropdown__active__d2__d1">
									<div className="promptformatter__dropdown__active__d2__d1__d2">
										In use since
									</div>
									<div className="promptformatter__dropdown__active__d2__d1__d3">
										{moment(row.installed_at).format(
											"DD MMM HH:mm"
										)}
									</div>
								</div>
								<div className="promptformatter__dropdown__active__d2__d1">
									<div className="promptformatter__dropdown__active__d2__d1__d2">
										Installed Version
									</div>
									<div className="promptformatter__dropdown__active__d2__d1__d3">
										{row.version}
									</div>
								</div>
							</div>
							<button
								className="promptformatter__dropdown__active__d4"
								onClick={() => {
									setShowPromptModal(true);
									setClickedOnActiveStatus(false);
								}}
							>
								Send Prompt
							</button>
						</div>
					</>
				)}
				{clickedOnNullStatus && (
					<div
						className="promptformatter__dropdown__null"
						ref={(el) => {
							if (el) {
								ref.current = el;
							}
						}}
					>
						<div className="promptformatter__dropdown__active__d1">
							{agentImg()}
							<div className="promptformatter__dropdown__active__d1__d2">
								<div className="promptformatter__dropdown__active__d1__d2__d1">
									{row?.name}
								</div>
								<div className="promptformatter__dropdown__active__d1__d2__d2">
									{row?.type} Agent
								</div>
							</div>
						</div>
						<div className="promptformatter__dropdown__null__d2">
							<img
								src={subtract}
								style={{ marginRight: "6px" }}
							></img>
							<span className="promptformatter__dropdown__null__d2__type">
								{row?.type}
							</span>
							not used by user
						</div>
						<button
							className="promptformatter__dropdown__active__d4"
							onClick={() => {
								setShowPromptModal(true);
								setClickedOnNullStatus(false);
							}}
						>
							Send Prompt
						</button>
					</div>
				)}
				{showPromptModal && (
					<PromptModal
						row={row}
						data={data}
						agentType={row?.type}
						isOpen={showPromptModal}
						closeModal={() => setShowPromptModal(false)}
					></PromptModal>
				)}
			</div>
		</>
	);
}
export const loadingData = [
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
];

export const loaderColumns = [
	{
		dataField: "name",
		text: "Department",
		formatter: () => (
			<div className="d-flex flex-row align-items-center">
				<ContentLoader
					style={{ marginRight: 8 }}
					width={26}
					height={26}
				>
					<circle cx="13" cy="13" r="13" fill="#EBEBEB" />
				</ContentLoader>
				<ContentLoader width={91} height={10}>
					<rect width="91" height="10" rx="2" fill="#EBEBEB" />
				</ContentLoader>
			</div>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "head",
		text: "Head",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "usersCount",
		text: "Users",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "appsCount",
		text: "Apps Used",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "",
		text: "Budget",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "",
		text: "Budget",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "",
		text: "Budget",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "",
		text: "Budget",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "",
		text: "Budget",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
];
export function UsersTable(props) {
	const { refreshTable } = useSelector((state) => state.ui);
	const cancelToken = useRef();
	const columns = [
		{
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
		{
			dataField: "last_activity",
			text: "Last Active",
			formatter: (row, data, rowindex) => (
				<div className="d-flex flex-row align-items-center">
					{row ? `${timeSince(row)} ago` : "-"}
				</div>
			),
		},
		{
			dataField: "chrome",
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
		{
			dataField: "firefox",
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
		{
			dataField: "edge",
			headerImg: () => (
				<img
					className="mr-1 agents_header_image"
					src={edge}
					height={14}
					width={14}
				/>
			),
			text: "Edge",
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
		{
			dataField: "windows",
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
						row={row}
						data={data}
						cell={cell}
					></UsePromptFormatter>
				</div>
			),
		},
		{
			dataField: "macos",
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
		{
			dataField: "linux",
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
		{
			formatter: (row, data) => (
				<SendPromptButton row={row} data={data}></SendPromptButton>
			),
		},
	];

	function fetchDataFn(page, row) {
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		if (props.searchQuery && props.searchQuery.length > 0) {
			if (checkSpecialCharacters(props.searchQuery)) {
				return [];
			}
			cancelToken.current = client.CancelToken.source();
			trackActionSegment(
				`Searching users in Agents Users Table with key "${props.searchQuery}"`,
				{
					currentCategory: "Agents",
					currentPageName: "Agents-Users",
				}
			);
			return getAgentsUsers(
				props.filterApplied,
				props.searchQuery,
				page,
				row,
				cancelToken.current
			);
		}
		cancelToken.current = client.CancelToken.source();
		return getAgentsUsers(
			props.filterApplied,
			props.searchQuery,
			page,
			row,
			cancelToken.current
		);
	}

	return (
		<>
			<div key={props.filterApplied}>
				<InfiniteTable
					perPage={30}
					handleCheckedChange={(ch) => props.onChecked(ch)}
					customText={true}
					loadingData={loadingData}
					loadingColumns={loaderColumns}
					fetchData={fetchDataFn}
					columns={columns}
					apiDataKey={"users"}
					keyField="user_id"
					emptyState={
						props.searchQuery ? (
							<EmptySearch searchQuery={props.searchQuery} />
						) : (
							<Empty />
						)
					}
					componentWithoutRedux
					searchQuery={""}
					setSingleAgentData={props.setSingleAgentData}
				/>
			</div>
		</>
	);
}
