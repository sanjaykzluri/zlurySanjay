import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import defaultNotification from "../../../assets/defaultNotification.svg";
import defaultNotificationTag from "../../../assets/defaultNotificationTag.svg";
import arrowCornerRight from "../../../assets/arrowCornerRight.svg";
import {
	getS3LinkForDownload,
	markNotification,
} from "../../../services/api/notifications";
import { TriggerIssue } from "../../../utils/sentry";
import * as moment from "moment";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import _ from "underscore";
import { client } from "../../../utils/client";
import JsxParser from "react-jsx-parser";
import CurrencyFormatter from "../../CurrencyFormatter/CurrencyFormatter";
import { kFormatter, unescape, urlifyImage } from "../../../utils/common";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import notificationDownloadDoc from "assets/notifications/notificationDownloadDoc.svg";
import DownloadInSamePage from "modules/shared/components/DownloadInSamePage/DownloadInSamePage";

function NotificationCard(props) {
	const [read, setRead] = useState(props.isRead);
	const cancelToken = useRef();
	const dispatch = useDispatch();
	const router = useSelector((state) => state.router);
	const { hash } = router.location;
	const { userInfo } = useSelector((state) => state);

	useEffect(() => {
		setRead(props.isRead);
	}, [props.isRead]);

	function handleNotificationStatus() {
		setRead(!read);
		try {
			if (cancelToken.current) {
				cancelToken.current.cancel();
			}
			cancelToken.current = client.CancelToken.source();
			markNotification(
				[props.notification?._id],
				!read,
				cancelToken.current
			).then((res) => {
				if (
					!(res.status === 200) &&
					!(res.data?.status !== "success")
				) {
					setRead(read);
					TriggerIssue(
						"UnExpected response notification markAsRead",
						res
					);
				}
				props.refresh && props.refresh();
			});
		} catch (error) {
			TriggerIssue("ERROR in marking notification as Read", error);
		}
	}

	let urlGenerator = function (entityType, ids, fieldOrder = "contains") {
		let pathName, hashName;
		const pathNameMap = {
			applications: "applications",
			contracts: "licenses",
			licenses: "licenses",
			subscriptions: "licenses",
			perpetuals: "licenses",
			vendors: "licenses/vendors",
			users: "users",
		};
		pathName = pathNameMap[entityType];
		hashName = hash;

		let defaultAppTab = userInfo?.application_tabs?.find(
			(el) => el.isDefault === true
		)?.name;

		let defaultUserTab = userInfo?.user_tabs?.find(
			(el) => el.isDefault === true
		)?.name;

		const hashtagMap = {
			applications: `#${defaultAppTab}`,
			contracts: "#allContracts",
			licenses: "#allLicenses",
			subscriptions: "#allSubscriptions",
			perpetuals: "#allPerpetualContracts",
			users: `#${defaultUserTab}`,
		};

		hashName = hashtagMap[entityType];
		const filterObj = {
			field_order: fieldOrder,
			filter_type: "objectId",
			field_values: ids,
			negative: false,
			is_custom: false,
		};

		let filterIdMap = {
			applications: "app_id",
			departments: "dept_id",
			users: "user_id",
		};

		let filterNameMap = {
			applications: "Application Id",
			departments: "Department Id",
			users: "User Id",
		};

		filterObj.field_id = filterIdMap[entityType];
		filterObj.field_name = filterNameMap[entityType];

		const metaData = {
			filter_by: [filterObj],
		};

		dispatch(
			push(`/${pathName}?metaData=${JSON.stringify(metaData)}${hashName}`)
		);

		props.closeNotifications();
		return;
	};

	function handleCardClick(e, entityType) {
		const entityList = props?.notification?.entity_list;
		if (!(entityList && entityType)) return;
		urlGenerator(entityType, entityList && entityList[entityType]);
	}

	function handleSingleItemClick(e, entityType, id) {
		e.stopPropagation();
		if (!entityType) {
			return;
		}
		const hashtagMap = {
			application: `/applications/${id}#overview`,
			application_renewal: `/applications/${id}#overview`,
			user: `/users/${id}#overview`,
			department: `/departments/${id}#overviewdep`,
			contract: `/licenses/contracts/${id}`,
			vendor: `/applications/vendors/${id}#overview`,
		};

		dispatch(push(hashtagMap[entityType]));
		props.closeNotifications();
		return;
	}

	return (
		<div
			onClick={(e) => {
				handleCardClick(e, props?.notification?.entity_type);
				!read && handleNotificationStatus();
			}}
			className="card_container mt-2 cursor-pointer "
		>
			<div className="row ml-auto mr-auto" key={props.key}>
				<div className="col-md-1 p-0" style={{ flexBasis: 0 }}>
					<img
						className="ml-auto mr-auto mt-1 notification_card_icon"
						src={props.notification?.icon || defaultNotification}
						alt="notification icon"
					></img>
				</div>
				<div className="col d-flex flex-column pr-0 pl-3">
					<div className="d-flex flex-row">
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip>
									<JsxParser
										components={{ CurrencyFormatter }}
										jsx={props.notification?.title}
									/>
								</Tooltip>
							}
						>
							<div className="card_heading">
								<JsxParser
									components={{ CurrencyFormatter }}
									className="text-truncate-large"
									jsx={props.notification?.title}
								/>
							</div>
						</OverlayTrigger>
						<div className="d-flex ml-auto mr-0">
							<div
								className={
									"mark_button m-auto cursor-pointer " +
									(read ? "" : "active")
								}
								onClick={(e) => {
									e.stopPropagation();
									handleNotificationStatus();
								}}
							></div>
						</div>
					</div>
					<JsxParser
						className="card_description"
						components={{ CurrencyFormatter }}
						jsx={props.notification?.description}
					/>
				</div>
			</div>
			<div className="row ml-auto mr-auto">
				<div className="col-md-1 p-0"></div>
				<div className="col-md-11">
					<div className="d-flex flex-wrap">
						{props.notification?.data?.length > 0 &&
							Array.isArray(props.notification?.data) &&
							props.notification?.data?.map((tagObject, index) =>
								tagObject?.has_more_data?.length === 0 &&
								_.isBoolean(tagObject?.has_extra_count) &&
								tagObject?.has_extra_count &&
								!_.isEmpty(tagObject?.count) &&
								tagObject?.count !== 0 ? (
									<div
										onClick={(e) => {
											handleCardClick(
												e,
												tagObject.entity_type,
												true
											);
											!read && handleNotificationStatus();
										}}
										className="notification_card_tag pl-2 pr-2 cursor-pointer"
									>
										<div className="m-auto text-decoration-none grey">
											+{kFormatter(tagObject?.count)}
										</div>
									</div>
								) : tagObject?.has_more_data?.length !== 0 &&
								  tagObject?.name &&
								  tagObject?._id ? (
									<div
										key={index}
										onClick={(e) =>
											handleSingleItemClick(
												e,
												tagObject.entity_type,
												tagObject._id
											)
										}
										className="notification_card_tag"
									>
										<div className="d-flex flex-row pt-1 pb-1">
											{tagObject?.image ? (
												<div
													className="rounded-circle bg_repeat_contain mt-auto mb-auto notification_card_tag_icon"
													style={{
														backgroundImage: `url(${urlifyImage(
															unescape(
																tagObject?.image
															)
														)})`,
													}}
												></div>
											) : (
												<img
													className="notification_card_tag_icon"
													src={defaultNotification}
													alt=""
												/>
											)}
											<OverlayTrigger
												placement="top"
												overlay={
													<Tooltip>
														{tagObject?.name}
													</Tooltip>
												}
											>
												<div className="mt-auto mb-auto ml-1 text-capitalize notification_card_tag_name">
													{tagObject?.name}
												</div>
											</OverlayTrigger>
											<img
												src={arrowCornerRight}
												alt="redirect"
												className="more_data mt-auto ml-1 mr-auto mb-auto"
											/>
										</div>
										<div className="d-flex flex-row pb-1">
											{tagObject?.has_more_data?.length >
												0 &&
												Array.isArray(
													tagObject?.has_more_data
												) &&
												tagObject?.has_more_data?.map(
													(subInfo, index) => (
														<div
															className={`tag_extra_info d-flex flex-row ${
																index === 1
																	? "ml-auto"
																	: "mr-2"
															}`}
															key={index}
														>
															{subInfo.icon ? (
																<img
																	className="tag_extra_info_icon"
																	src={
																		subInfo.icon
																	}
																	alt=""
																/>
															) : (
																<img
																	className="tag_extra_info_icon"
																	src={
																		defaultNotificationTag
																	}
																	alt=""
																/>
															)}
															<div className="tag_extra_info_value">
																<JsxParser
																	components={{
																		CurrencyFormatter,
																	}}
																	jsx={
																		subInfo.value
																	}
																/>
															</div>
														</div>
													)
												)}
										</div>
									</div>
								) : tagObject?.url &&
								  tagObject?.entity_type === "reports" ? (
									<DownloadInSamePage
										api={getS3LinkForDownload}
										tokenLink={tagObject?.url}
									>
										<div className="notification_download_report_btn mt-1">
											<img
												src={notificationDownloadDoc}
												width={14}
												height={14}
											/>
											<div className="font-12 grey">
												Download CSV
											</div>
										</div>
									</DownloadInSamePage>
								) : null
							)}
					</div>
					{props.notification?.createdAt &&
						new Date(props.notification?.createdAt) !=
							"Invalid Date" && (
							<div className="mr-auto grey-1 card_time mt-2">
								{moment(
									new Date(props.notification?.createdAt)
								).fromNow()}
							</div>
						)}
				</div>
			</div>
		</div>
	);
}

export default NotificationCard;
