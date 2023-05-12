import React, { useCallback, useEffect, useState } from "react";
import search from "../../../../assets/search.svg";
import orange from "../../../../assets/icons/circle-orange.svg";
import green from "../../../../assets/icons/circle-green.svg";
import grey from "../../../../assets/icons/circle-grey.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import { SelectOld } from "../../../../UIComponents/SelectOld/Select";
import { useDispatch, useSelector } from "react-redux";
import "./PendingRequest.css";
import {
	fetchPendingRequestIntegrations,
	refreshPRState,
	remindIntegrationRequest,
	resendIntegrationRequest,
	withdrawIntegrationRequest,
} from "../../redux/integrations";
import { PR_SORT_BY, REQUEST_STATUS } from "../../constants/constant";
import InfiniteScroll from "react-infinite-scroll-component";
import { PRLoader } from "../../components/PRLoader/PRLoader";
import { debounce, truncateText } from "../../../../utils/common";
import { convertObjToBindSelect } from "../../../../utils/convertDataToBindSelect";
import { Spinner } from "react-bootstrap";
import greenTick from "assets/green_tick.svg";
import moment from "moment";
import { BrowseBanner } from "../Integrations/BrowseBanner";
import { fetchPendingRequestIntegrationsService } from "modules/integrations/service/api";
import { PendingRequestIntegration } from "../../model/model";
import { TriggerIssue } from "utils/sentry";

export function PendingRequest() {
	const pendingRequestIntegrationsList = useSelector(
		(state) => state.integrations.pendingRequestIntegrations
	);
	const pendingRequestIntegrationsListCount = useSelector(
		(state) => state.integrations.pendingRequestIntegrationsCount
	);
	const [pageNo, setPageNo] = useState(0);
	const dispatch = useDispatch();
	const [integrationSearchQuery, setintegrationSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState();
	const [requestIntegrationSearchList, setRequestIntegrationSearchList] =
		useState(null);
	const [requestIntegrationSearchCount, setRequestIntegrationSearchCount] =
		useState(null);

	const refreshReduxState = () => {
		setPageNo(0);
		dispatch(refreshPRState());
	};

	const setSearchData = useCallback(
		async (query) => {
			try {
				const response = await fetchPendingRequestIntegrationsService(
					pageNo,
					query,
					sortBy
				);
				if (!response.error) {
					if (pageNo > 0) {
						setRequestIntegrationSearchList([
							...requestIntegrationSearchList,
							...(response?.requests?.map(
								(integration) =>
									new PendingRequestIntegration(integration)
							) ?? []),
						]);
						setRequestIntegrationSearchCount(
							response?.count ?? null
						);
					} else {
						setRequestIntegrationSearchList(
							response?.requests?.map(
								(integration) =>
									new PendingRequestIntegration(integration)
							) ?? []
						);
						setRequestIntegrationSearchCount(
							response?.count ?? null
						);
					}
				}
			} catch (err) {
				TriggerIssue(
					"Error in fetching pending request integrations",
					err
				);
				setRequestIntegrationSearchList([]);
			}
		},
		[pageNo, sortBy]
	);

	useEffect(() => {
		if (integrationSearchQuery === "")
			dispatch(
				fetchPendingRequestIntegrations(pageNo, null, sortBy?.value)
			);
		else if (pageNo > 0) setSearchData(integrationSearchQuery);
	}, [
		dispatch,
		setSearchData,
		integrationSearchQuery,
		pageNo,
		sortBy?.value,
	]);

	const fetchData = () => {
		setPageNo(pageNo + 1);
	};

	const onSortBy = (v) => {
		setSortBy(v);
		refreshReduxState();
	};

	const onSearch = useCallback(
		debounce(async (value) => {
			await setSearchData(value);
		}, 500),
		[]
	);

	const onChange = (value) => {
		setPageNo(0);
		setintegrationSearchQuery(value);
		setRequestIntegrationSearchList(null);
		setRequestIntegrationSearchCount(null);
		if (value !== "") {
			onSearch(value);
		} else {
			refreshReduxState();
		}
	};

	const remindInviteRequest = (item) => {
		dispatch(remindIntegrationRequest(item.id, item.invite_id));
	};

	const resendInvitation = (item) => {
		dispatch(resendIntegrationRequest(item.id, item.invite_id));
	};

	const withdrawInvitation = (item) => {
		dispatch(withdrawIntegrationRequest(item.id, item.invite_id));
	};

	const renderSingleRow = (item, index) => (
		<div
			key={index}
			className="d-flex flex-row justify-content-between align-items-center border-1 p-3 border-radius-4 mb-2"
		>
			<div className="flex-fill d-flex" style={{ minWidth: "24%" }}>
				<img
					className="mr-2 mt-auto mb-auto"
					style={{
						borderRadius: "50%",
						marginTop: "-2px",
						objectFit: "contain",
					}}
					width="26"
					src={item.logo}
				/>
				<div className="d-flex flex-column mt-auto mb-auto w-75">
					<p className="bold-400 font-13 black-1 m-0 d-inline-block flex-fill mt-auto mb-auto text-truncate">
						{truncateText(item.name, 25)}
					</p>
					<div className="font-8 grey-1 text-truncate">
						{item.accountName}
					</div>
				</div>
			</div>
			<div className="flex-fill" style={{ minWidth: "15%" }}>
				<p className="bold-400 font-13 black-1 m-0 text-capitalize">
					<img
						className="mr-2"
						src={
							item.requestStatus === REQUEST_STATUS.PENDING
								? orange
								: item.requestStatus ===
								  REQUEST_STATUS.COMPLETED
								? green
								: grey
						}
					/>
					{item.requestStatus}
				</p>
				{item.requestStatus === REQUEST_STATUS.PENDING && (
					<p className="font-9 grey-1 m-0 pl-3">
						{item.expiresOn === 0
							? `Expires in ${item.expiresInHours} hours`
							: `Expires in ${item.expiresOn} days`}
					</p>
				)}
				{item.requestStatus === REQUEST_STATUS.EXPIRED && (
					<p className="font-9 grey-1 m-0 pl-3">
						{" "}
						{item.expiresOn === 0
							? `Expired ${item.expiresInHours} hours ago`
							: `Expired ${item.expiresOn} days ago`}
					</p>
				)}
			</div>
			<div className="flex-fill" style={{ minWidth: "15%" }}>
				<p className="bold-400 font-13 black-1 m-0">{item.requestOn}</p>
			</div>
			<div className="flex-fill" style={{ minWidth: "23%" }}>
				<p className="bold-400 font-13 grey-1 m-0">
					{truncateText(item.sentToUserEmail, 25)}
				</p>
			</div>
			<div className="flex-fill" style={{ minWidth: "23%" }}>
				<ul
					style={{
						justifyContent: "right",
						alignItems: "center",
					}}
					className="list-style-none p-0 m-0 d-flex"
				>
					{item.requestStatus === REQUEST_STATUS.PENDING && (
						<>
							{" "}
							<li>
								<RemindButton
									item={item}
									onRemindClick={(item) =>
										remindInviteRequest(item)
									}
								/>
							</li>
							<li>
								{item.withdrawing ? (
									<Spinner
										className="blue-spinner action-edit-spinner"
										animation="border"
									/>
								) : (
									<Button
										type="link"
										onClick={() => {
											withdrawInvitation(item);
										}}
									>
										Withdraw
									</Button>
								)}
							</li>
						</>
					)}
					{item.requestStatus == REQUEST_STATUS.COMPLETED &&
						item.connectedOn && (
							<li>
								<p className="bold-400 font-11 grey-1 m-0">
									Connected on {item.connectedOn}{" "}
								</p>
							</li>
						)}
					{item.requestStatus == REQUEST_STATUS.EXPIRED && (
						<>
							<li>
								{item.resending ? (
									<Spinner
										className="blue-spinner action-edit-spinner"
										animation="border"
									/>
								) : (
									<Button
										type="link"
										onClick={() => {
											resendInvitation(item);
										}}
									>
										Resend
									</Button>
								)}
							</li>
						</>
					)}
				</ul>
			</div>
		</div>
	);

	const ROWS =
		requestIntegrationSearchList != null
			? requestIntegrationSearchList.map(renderSingleRow)
			: pendingRequestIntegrationsList?.length
			? pendingRequestIntegrationsList.map(renderSingleRow)
			: null;

	return (
		<div style={{ maxWidth: "100%" }} className="z_i_main  p-3 pl-4">
			<div className="z_i_main_header position-relative ">
				<div
					style={{
						justifyContent: "space-between",
						alignItems: "center",
					}}
					className="flex"
				>
					<div>
						<div className="font-18 black-1 text-capitalize">
							Connection Requests
						</div>
					</div>
					<div className="d-flex">
						<div className="z_i_searchbar_integrations position-relative mr-3">
							<img src={search} />
							<input
								placeholder="Search"
								value={integrationSearchQuery}
								type="text"
								className="w-100 black-1"
								onChange={(e) => {
									onChange(e.target.value);
								}}
							/>
						</div>
						<SelectOld
							className="m-0 mr-2"
							value={sortBy}
							placeholder="Sort by"
							options={convertObjToBindSelect(PR_SORT_BY)}
							onSelect={(v) => {
								onSortBy(v);
							}}
						/>
					</div>
				</div>
				{((integrationSearchQuery !== "" &&
					requestIntegrationSearchList?.length > 0) ||
					(integrationSearchQuery === "" &&
						pendingRequestIntegrationsListCount > 0)) && (
					<div>{`${pendingRequestIntegrationsListCount}  Requests`}</div>
				)}
				<BrowseBanner />
			</div>
			<div
				className="mt-9"
				style={{ height: "calc(100vh - 32vh)", overflowY: "auto" }}
				id="scrollableDivRequests"
			>
				{((integrationSearchQuery !== "" &&
					requestIntegrationSearchList?.length > 0) ||
					(integrationSearchQuery === "" &&
						pendingRequestIntegrationsListCount > 0)) && (
					<div>
						{/* header */}
						<div className="d-flex flex-row justify-content-between align-items-center sticky-top">
							<div
								className="flex-fill"
								style={{ minWidth: "24%" }}
							>
								<p className="bold-400 font-13 grey-1 o-7">
									Integration
								</p>
							</div>
							<div
								className="flex-fill"
								style={{ minWidth: "15%" }}
							>
								<p className="bold-400 font-13 grey-1 o-7">
									Status
								</p>
							</div>
							<div
								className="flex-fill"
								style={{ minWidth: "15%" }}
							>
								<p className="bold-400 font-13 grey-1 o-7">
									Requested on
								</p>
							</div>
							<div
								className="flex-fill"
								style={{ minWidth: "23%" }}
							>
								<p className="bold-400 font-13 grey-1 o-7">
									Requested by
								</p>
							</div>
							<div
								className="flex-fill"
								style={{ minWidth: "23%" }}
							>
								<p className="bold-400 font-13 grey-1 o-7"></p>
							</div>
						</div>
						{/* header */}
						<InfiniteScroll
							dataLength={
								requestIntegrationSearchList != null
									? requestIntegrationSearchList.length
									: pendingRequestIntegrationsList.length
							}
							next={fetchData}
							hasMore={
								requestIntegrationSearchList != null
									? requestIntegrationSearchList.length <
									  requestIntegrationSearchCount
									: pendingRequestIntegrationsList.length <
									  pendingRequestIntegrationsListCount
							}
							loader={<PRLoader />}
							scrollableTarget="scrollableDivRequests"
							scrollThreshold="400px"
							style={{
								height: "unset",
								overflow: "unset",
								width: "100%",
							}}
						>
							{ROWS}
						</InfiniteScroll>
					</div>
				)}
				{((integrationSearchQuery !== "" &&
					requestIntegrationSearchList != null &&
					requestIntegrationSearchList.length === 0) ||
					(integrationSearchQuery === "" &&
						pendingRequestIntegrationsListCount === 0)) && (
					<div className="text-center"> No request sent </div>
				)}
				{((integrationSearchQuery !== "" &&
					requestIntegrationSearchCount == null) ||
					(integrationSearchQuery === "" &&
						pendingRequestIntegrationsListCount === null)) && (
					<PRLoader />
				)}
			</div>
		</div>
	);
}

function RemindButton({ item, onRemindClick }) {
	const [clickedOnRemind, setClickedOnRemind] = useState(false);

	useEffect(() => {
		setTimeout(() => setClickedOnRemind(false), 10000);
	}, [clickedOnRemind]);

	const blockRemindButton = () => {
		if (Number(new Date()) - item.updatedAt < 3 * 60 * 60 * 1000) {
			return true;
		}
		return false;
	};

	return (
		<>
			{item.reminding ? (
				<div className="pl-1 pt-1">
					<Spinner
						className="blue-spinner action-edit-spinner"
						animation="border"
					/>
				</div>
			) : (
				<>
					{clickedOnRemind || blockRemindButton() ? (
						<div
							className="d-flex flex-column"
							style={{ marginLeft: "8px" }}
						>
							<div className="green d-flex align-items-center pt-2">
								<img src={greenTick} wdith={12} height={12} />
								<div className="font-13 ml-1">Sent</div>
							</div>
							<div className="font-9">
								Last sent at{" "}
								{moment(item.updatedAt).format("hh:mm")}
							</div>
						</div>
					) : (
						<Button
							type="link"
							onClick={() => {
								setClickedOnRemind(true);
								onRemindClick(item);
							}}
						>
							Remind
						</Button>
					)}
				</>
			)}
		</>
	);
}
