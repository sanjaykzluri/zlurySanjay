import React, {
	useContext,
	useEffect,
	useRef,
	useState,
	Fragment,
} from "react";
import { getSourceMetaDetails } from "../../../../../services/api/sourcesApi";
import { Popover } from "../../../../../UIComponents/Popover/Popover";
import "./Sources.css";
import lastActivity from "../../../../../assets/lastActivity.svg";
import lastSynced from "../../../../../assets/lastSynced.svg";
import moment from "moment";
import ActivityGraph from "../../../../../UIComponents/ActivityGraph/ActivityGraph";
import {
	DottedRisk,
	getRiskStatus,
} from "../../../../../common/DottedRisk/DottedRisk";
import { Button } from "../../../../../UIComponents/Button/Button";
import SourceDetails from "../../UsageActivity/SourceDetails";
import { SourceContext } from "../TableFormatter/SourcesFormatter";
import UsageActivityTabs from "../../UsageActivity/UsageActivityTabs";
import {
	getUserSourceDetails,
	setAsPrimarySource,
	updateManualUsage,
} from "../../../../../services/api/users";
import ContentLoader from "react-content-loader";
import refershBlue from "../../../../../components/Uploads/refreshBlue.svg";
import warning from "../../../../../components/Onboarding/warning.svg";
import inactivecheck from "../../../../../assets/applications/inactivecheck.svg";
import check from "../../../../../assets/applications/check.svg";
import _ from "underscore";
import { urlifyImage } from "../../../../../utils/common";
import { NameBadge } from "../../../../../common/NameBadge";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { UserSourceList } from "../../../../users/components/UserSourceList";
import { TriggerIssue } from "../../../../../utils/sentry";

const SourceIcon = (props) => {
	const logo = props.source.logo;

	const [showSourceCard, setShowSourceCard] = useState(false);
	const [sourceDetails, setSourceDetails] = useState({});
	const [showSourceDetails, setShowSourceDetails] = useState(false);
	const [loading, setLoading] = useState(true);
	const [showUsageActivity, setShowUsageActivity] = useState(false);
	const [openUserSourceList, setOpenUserSourceList] = useState(false);
	const sourceCardRef = useRef();
	const {
		user_app_id,
		app_name,
		app_logo,
		user_name,
		user_profile,
		userId,
		isUser,
		isUserSource,
		isUserAppActive,
		completeRow,
		isApp,
		isDept,
	} = useContext(SourceContext);
	const rowDetails = useContext(SourceContext);
	const [error, setError] = useState();

	const requestEndPoint = () => {
		setLoading(true);
		user_app_id &&
			getSourceMetaDetails(
				user_app_id,
				props.source.keyword === "agent"
					? props.source.identifier
					: props.source.org_integration_id,
				props.source.keyword === "agent" ? "agent" : "integration"
			)
				.then((response) => {
					if (response?.error) {
						setError(response);
					} else {
						setSourceDetails(response?.data);
						setLoading(false);
						setError();
					}
				})
				.catch((error) => {
					TriggerIssue(
						"Error when fetching user-app compact details to render popUp card",
						error
					);
					setLoading(false);
				});
		if (!isUser) {
			if (isUserSource && props.source.keyword !== "manual") {
				getUserSourceDetails(userId, props.source.org_integration_id)
					.then((response) => {
						props.source.account_name = response.account_name;
						setSourceDetails(props.source);
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
			if (props.source.keyword === "manual") {
				setSourceDetails(props.source);
				setLoading(false);
			}
		}
	};

	useEffect(() => {
		if (showSourceCard) {
			requestEndPoint();
		}
	}, [showSourceCard]);

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
					props.refresh && props.refresh();
				}
			})
			.catch((err) => {
				TriggerIssue("Error while setting source as primary", err);
				setLoading(false);
			});
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
				overlay={<Tooltip>{props.source.name || "Manual"}</Tooltip>}
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
						className={`background-contain background-no-repeat background-position-center cursor-pointer mt-auto mb-auto mr-1 ${
							isUserAppActive ? "" : "o-6"
						}`}
						ref={sourceCardRef}
						onClick={(e) => handleSourceIconClicked(e)}
					></div>
				) : (
					<div
						className={`cursor-pointer mt-auto mb-auto mr-1 ${
							isUserAppActive ? "" : "o-6"
						}`}
						ref={sourceCardRef}
						onClick={(e) => handleSourceIconClicked(e)}
					>
						<NameBadge
							className="rounded-circle"
							name={
								props.source.keyword === "agent"
									? props.source?.identifier
									: props.source.keyword
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
				style={props.style}
			>
				{error ? (
					<div
						className="d-flex flex-column justify-content-center"
						style={{ height: "220px" }}
					>
						<img
							src={warning}
							style={{ width: "45px" }}
							className="ml-auto mr-auto"
						/>
						<div className="grey-1 font-12 bold-normal w-75 text-center ml-auto mr-auto mt-2">
							An error occured. Please try again
						</div>
						<div className="ml-auto mr-auto mt-2">
							<Button
								className="primary-color-border d-flex"
								type="link"
								onClick={() => requestEndPoint()}
							>
								<img
									src={refershBlue}
									className="mr-2"
									style={{ width: "15px" }}
								/>
								Retry
							</Button>
						</div>
					</div>
				) : (
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
													width: isUserSource
														? "24px"
														: "19px",
													height: isUserSource
														? "24px"
														: "19px",
												}}
												className={`background-contain background-no-repeat background-position-center cursor-pointer mr-2 mt-auto mb-auto ${
													isUserAppActive ? "" : "o-6"
												}`}
												ref={sourceCardRef}
												onClick={(e) =>
													handleSourceIconClicked(e)
												}
											></div>
										) : (
											<div
												className={`cursor-pointer mr-2 mt-auto mb-auto ${
													isUserAppActive ? "" : "o-6"
												}`}
												ref={sourceCardRef}
												onClick={(e) =>
													handleSourceIconClicked(e)
												}
											>
												<NameBadge
													className="rounded-circle"
													name={
														props.source.keyword ===
														"agent"
															? props.source
																	?.identifier
															: props.source
																	.keyword
													}
													width={
														isUserSource ? 24 : 19
													}
												/>
											</div>
										)}
									</>
								)}
								<div className="d-flex flex-column w-100">
									<div className="d-flex flex-row">
										<p
											className={`z__header-secondary flex-fill m-0 ${
												isUserSource
													? "cursor-pointer"
													: ""
											}`}
											style={{
												fontSize: 12,
												fontWeight: 400,
											}}
											onClick={() =>
												isUserSource &&
												openUserSourceListModal()
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
												props.source.name || "Manual"
											)}
										</p>
										{!loading &&
											sourceDetails?.status &&
											isUserSource && (
												<div className="center ml-auto mt-auto mb-auto d-flex">
													{sourceDetails?.status ===
													"inactive" ? (
														<>
															<img
																src={
																	inactivecheck
																}
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
										{_.isBoolean(
											sourceDetails?.is_primary
										) &&
											!loading &&
											user_app_id && (
												<div className="ml-auto bold-600 grey-1 font-11 mt-auto mb-auto">
													{sourceDetails?.is_primary ? (
														<>Primary Source</>
													) : (
														<>Alternate Source</>
													)}
												</div>
											)}
									</div>
									{!loading &&
										(sourceDetails.account_name ||
											sourceDetails.source_integration_account_name) && (
											<div className="d-flex flex-row">
												<div className="font-9 grey">
													{sourceDetails.account_name ||
														sourceDetails.source_integration_account_name}
												</div>
											</div>
										)}
									<div className="d-flex flex-row">
										{!loading && (
											<div className="font-9 grey-1 o-8">
												{sourceDetails?.source_category_name
													? `${sourceDetails?.source_category_name} Integration`
													: null}
											</div>
										)}
										{!loading &&
											sourceDetails?.source_status && (
												<div className="center ml-auto mt-auto mb-auto d-flex">
													{sourceDetails?.source_status ===
													"inactive" ? (
														<>
															<img
																src={
																	inactivecheck
																}
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
														  ).format(
																"DD MMM HH:mm"
														  )
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
														  ).format(
																"DD MMM HH:mm"
														  )
														: "NA"}
												</span>
											</div>
										</Fragment>
									) : null}
								</div>
							</div>
							{isUserSource && (
								<div className="d-flex justify-content-center mt-2">
									<div
										onClick={() =>
											!sourceDetails?.is_primary &&
											setSourceAsPrimary()
										}
										className="primary-source-button"
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
						  (Array.isArray(
								sourceDetails?.source_activity_trend
						  ) &&
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
									sourceDetails?.source_activity_trend
										?.length > 0 ? (
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
						{!isUserSource && (
							<>
								<div className="row sourceCardRiskLevel mt-3 mb-3 ml-0 mr-0 pt-2 pb-2 mb-2">
									<div className="col-md-6 pr-0">
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
											<div className="font-12 grey">
												RISK LEVEL
											</div>
										)}
										<div className="font-10 grey-1 mt-1">
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
												<>
													{sourceDetails?.authorized_scope_count ||
														0}{" "}
													authorized scopes
												</>
											)}
										</div>
									</div>
									<div className="col-md-6 pl-0">
										<DottedRisk
											size="large"
											value={
												sourceDetails?.risk_level || 0
											}
											loading={loading}
										/>
										{!loading && (
											<div className="text-capitalize o-5 font-10 mt-2 text-right">
												{sourceDetails?.risk_level ? (
													<>
														{getRiskStatus(
															sourceDetails?.risk_level ||
																0
														)}{" "}
														Risk
													</>
												) : (
													<>Risk unknown</>
												)}
											</div>
										)}
									</div>
								</div>
								<hr style={{ margin: "auto -15px" }}></hr>
								<div className="d-flex">
									{!loading && (
										<Button
											type="link"
											style={{ height: "45px" }}
											className="m-auto"
											onClick={() =>
												setShowSourceDetails(true)
											}
										>
											View more
										</Button>
									)}
								</div>
							</>
						)}
					</>
				)}
			</Popover>
			{showSourceDetails && (
				<SourceDetails
					closeSourceDetails={() => setShowSourceDetails(false)}
					sourceName={props.source.name}
					sourceLogo={props.source.logo}
					user_app_id={user_app_id}
					sourceId={props.source.keyword}
					identifier={props.source.identifier}
					app_name={app_name}
					app_logo={app_logo}
					user_name={user_name}
					user_profile={user_profile}
					isUser={isUser}
					handleViewAll={viewAllSource}
					refresh={() => {
						rowDetails.refresh && rowDetails.refresh();
					}}
				/>
			)}
			{showUsageActivity && (
				<UsageActivityTabs
					closeUsageAcivity={() => setShowUsageActivity(false)}
					isUser={isUser}
					showActivity={showUsageActivity}
					rowDetails={{ ...rowDetails, ...{ row: completeRow } }}
					refresh={() => {
						rowDetails.refresh && rowDetails.refresh();
						setShowUsageActivity(false);
					}}
					updateManualUsage={updateManualUsage}
					user_name={rowDetails?.user_name}
					user_image={rowDetails?.user_image}
					app_name={rowDetails.app_name}
					app_image={rowDetails?.app_image || rowDetails?.app_logo}
					user_id={userId}
				/>
			)}
			{openUserSourceList && (
				<UserSourceList
					sources={completeRow.source_array}
					user={completeRow}
					userId={userId}
					refresh={props.refresh}
					setOpenUserSourceList={setOpenUserSourceList}
				/>
			)}
		</div>
	);
};

export default SourceIcon;
