import React, { useRef, useState, Fragment } from "react";
import { Popover } from "../../../UIComponents/Popover/Popover";
import lastActivity from "../../../assets/lastActivity.svg";
import lastSynced from "../../../assets/lastSynced.svg";
import moment from "moment";
import ActivityGraph from "../../../UIComponents/ActivityGraph/ActivityGraph";
import {
	getUserSourceDetails,
	setAsPrimarySource,
} from "../../../services/api/users";
import ContentLoader from "react-content-loader";
import inactivecheck from "../../../assets/applications/inactivecheck.svg";
import check from "../../../assets/applications/check.svg";
import _ from "underscore";
import { urlifyImage } from "../../../utils/common";
import { NameBadge } from "../../../common/NameBadge";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { UserSourceList } from "./UserSourceList";
import { TriggerIssue } from "../../../utils/sentry";

export default function UserSourceIconAndCard({
	user,
	source,
	userId,
	isUser = true,
	refresh,
	style,
	sources = [],
	isApp,
	isDept,
	...props
}) {
	const logo = source.logo;

	const [showSourceCard, setShowSourceCard] = useState(false);
	const [sourceDetails, setSourceDetails] = useState(source);
	const [showSourceDetails, setShowSourceDetails] = useState(false);
	const [loading, setLoading] = useState(false);
	const [showUsageActivity, setShowUsageActivity] = useState(false);
	const sourceCardRef = useRef();
	const [error, setError] = useState();
	const [openUserSourceList, setOpenUserSourceList] = useState(false);

	const viewAllSource = () => {
		setSourceDetails(false);
		setShowUsageActivity(true);
	};

	const handleSourceIconClicked = (e) => {
		if (isApp || isDept) {
			return;
		}
		e.stopPropagation();
		e.preventDefault();
		setShowSourceCard((val) => !val);
		requestEndPoint();
	};

	const setSourceAsPrimary = () => {
		setLoading(true);
		setAsPrimarySource(userId, {
			keyword: sourceDetails.keyword,
			org_integration_id: sourceDetails.org_integration_id,
			integration_id: sourceDetails.integration_id,
		})
			.then((res) => {
				if (res.status === "success") {
					setLoading(false);
					refresh && refresh();
				}
			})
			.catch((err) => {
				TriggerIssue("Error while setting source as primary", err);
				setLoading(false);
			});
	};

	const requestEndPoint = () => {
		if (source.keyword !== "manual") {
			setLoading(true);
			getUserSourceDetails(userId, source.org_integration_id)
				.then((response) => {
					source.account_name = response.account_name;
					setLoading(false);
				})
				.catch((error) => {
					TriggerIssue(
						"Error when fetching user source details",
						error
					);
					setLoading(false);
				});
		}
	};

	const openUserSourceListModal = () => {
		setOpenUserSourceList(true);
	};

	return (
		<div
			onClick={(e) => e.stopPropagation()}
			style={{ position: "relative" }}
			className="d-flex"
		>
			<OverlayTrigger
				placement="top"
				overlay={<Tooltip>{source.name || "Manual"}</Tooltip>}
			>
				{logo ? (
					<div
						style={{
							backgroundImage: `url(${urlifyImage(
								unescape(logo)
							)})`,
							width: "19px",
							height: "19px",
						}}
						className={`background-contain background-no-repeat background-position-center cursor-pointer mt-auto mb-auto mr-1`}
						ref={sourceCardRef}
						onClick={(e) => handleSourceIconClicked(e)}
					></div>
				) : (
					<div
						className={`cursor-pointer mt-auto mb-auto mr-1`}
						ref={sourceCardRef}
						onClick={(e) => handleSourceIconClicked(e)}
					>
						<NameBadge
							className="rounded-circle"
							name={
								source.keyword === "agent"
									? source?.identifier
									: source.keyword
							}
							width={19}
						/>
					</div>
				)}
			</OverlayTrigger>
			<Popover
				className="user-app-sources-popover"
				align="center"
				show={showSourceCard}
				refs={[sourceCardRef]}
				onClose={() => setShowSourceCard(false)}
				style={style}
			>
				<>
					<div className="d-flex flex-column sourceCardHeader">
						<div className="d-flex flex-row">
							{loading ? (
								<ContentLoader height={45} width={45}>
									<circle
										r="15"
										cy={20}
										cx={20}
										fill="#EBEBEB"
									/>
								</ContentLoader>
							) : (
								<>
									{logo ? (
										<div
											style={{
												backgroundImage: `url(${urlifyImage(
													unescape(logo)
												)})`,
												width: isUser ? "24px" : "19px",
												height: isUser
													? "24px"
													: "19px",
											}}
											className={`background-contain background-no-repeat background-position-center cursor-pointer mr-2 mt-auto mb-auto`}
											ref={sourceCardRef}
											onClick={(e) =>
												handleSourceIconClicked(e)
											}
										></div>
									) : (
										<div
											className={`cursor-pointer mr-2 mt-auto mb-auto`}
											ref={sourceCardRef}
											onClick={(e) =>
												handleSourceIconClicked(e)
											}
										>
											<NameBadge
												className="rounded-circle"
												name={
													source.keyword === "agent"
														? source?.identifier
														: source.keyword
												}
												width={isUser ? 24 : 19}
											/>
										</div>
									)}
								</>
							)}
							<div className="d-flex flex-column w-100">
								<div className="d-flex flex-row">
									<p
										className={`z__header-secondary flex-fill m-0 ${
											isUser ? "cursor-pointer" : ""
										}`}
										style={{
											fontSize: 12,
											fontWeight: 400,
										}}
										onClick={() =>
											isUser && openUserSourceListModal()
										}
									>
										{loading ? (
											<ContentLoader
												width={91}
												height={10}
											>
												<rect
													width="91"
													height="10"
													rx="2"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										) : (
											source.name || "Manual"
										)}
									</p>
									{!loading &&
										sourceDetails?.status &&
										isUser && (
											<div className="center ml-auto mt-auto mb-auto d-flex">
												{sourceDetails?.status ===
												"inactive" ? (
													<>
														<img
															src={inactivecheck}
														></img>
														<div className="grey-1 bold-normal font-9 text-right ml-1">
															Not in Use
														</div>
													</>
												) : (
													<>
														<img
															src={check}
															alt=""
														/>
														<div className="grey-1 bold-normal font-9 text-right ml-1">
															In use
														</div>
													</>
												)}
											</div>
										)}
								</div>
								<div className="d-flex flex-row">
									<div className="font-9 grey">
										{source.account_name}
									</div>
								</div>
							</div>
						</div>
						<div className="d-flex flex-row row mt-2 justify-content-evenly">
							<div className="d-flex">
								{loading ? (
									<ContentLoader width={91} height={10}>
										<rect
											width="91"
											height="10"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								) : sourceDetails?.source_last_sync_date ||
								  sourceDetails?.last_sync ? (
									<Fragment>
										<img
											src={lastSynced}
											alt="last synced"
											className="sourceCardIcon"
										/>
										<div className="sourceCardTime">
											last synced at
											<span className="ml-1 time">
												{sourceDetails?.source_last_sync_date ||
												sourceDetails?.last_sync
													? moment(
															sourceDetails?.source_last_sync_date ||
																sourceDetails?.last_sync
													  ).format("DD MMM HH:mm")
													: "NA"}
											</span>
										</div>
									</Fragment>
								) : null}
							</div>
							<div className="d-flex">
								{loading ? (
									<ContentLoader width={91} height={10}>
										<rect
											width="91"
											height="10"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								) : sourceDetails?.source_last_activity_date ||
								  sourceDetails?.last_used ? (
									<Fragment>
										<img
											src={lastActivity}
											alt="last activity"
											className="sourceCardIcon"
										/>
										<div className="sourceCardTime">
											last activity
											<span className="ml-1 time">
												{sourceDetails?.source_last_activity_date ||
												sourceDetails?.last_used
													? moment(
															sourceDetails?.source_last_activity_date ||
																sourceDetails?.last_used
													  ).format("DD MMM HH:mm")
													: "NA"}
											</span>
										</div>
									</Fragment>
								) : null}
							</div>
						</div>
						{isUser && (
							<div className="d-flex justify-content-center mt-2">
								<div
									onClick={() =>
										!sourceDetails?.is_primary &&
										setSourceAsPrimary()
									}
									className="primary-source-button"
								>
									{loading ? (
										<ContentLoader width={91} height={10}>
											<rect
												width="91"
												height="10"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									) : (
										<>
											{sourceDetails?.is_primary
												? "Primary Source"
												: "Set as Primary Source"}
										</>
									)}
								</div>
							</div>
						)}
					</div>
					{loading ? (
						<div className="row mt-2 mb-2">
							<div className="col-md-6 pr-0 justify-content-center d-flex flex-column">
								<ContentLoader width={91} height={30}>
									<rect
										width="91"
										height="10"
										rx="2"
										fill="#EBEBEB"
									/>
									<rect
										width="91"
										height="10"
										rx="2"
										y={20}
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<div className="col-md-6 justify-content-center d-flex flex-column mt-2">
								<ContentLoader width={95} height={50}>
									<rect
										width="95"
										height="40"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
						</div>
					) : sourceDetails?.source_last_active_hours ||
					  (Array.isArray(sourceDetails?.source_activity_trend) &&
							sourceDetails?.source_activity_trend?.length >
								0) ? (
						<div className="row mt-2 mb-2">
							<div className="col-md-6 pr-0">
								<div className="font-13 grey">
									Recent Activity Trend
								</div>
								<div className="font-10 grey-1 o-5">
									last active{" "}
									{sourceDetails?.source_last_active_hours
										? `${moment
												.duration(
													sourceDetails?.source_last_active_hours,
													"hours"
												)
												.humanize()}`
										: "is unknown"}
								</div>
							</div>
							<div className="col-md-6 d-flex">
								{Array.isArray(
									sourceDetails?.source_activity_trend
								) &&
								sourceDetails?.source_activity_trend?.length >
									0 ? (
									<ActivityGraph
										data={
											sourceDetails?.source_activity_trend
										}
									/>
								) : (
									<div className="font-10 grey-1 bold-normal m-auto">
										No Data Available
									</div>
								)}
							</div>
						</div>
					) : null}
				</>
			</Popover>
			{openUserSourceList && (
				<UserSourceList
					sources={sources}
					user={user}
					userId={userId}
					refresh={refresh}
					setOpenUserSourceList={setOpenUserSourceList}
				/>
			)}
		</div>
	);
}
