import React, { useEffect, useRef, useState } from "react";
import close from "../../assets/close.svg";
import "./Notification.css";
import emptyNotifications from "../../assets/emptyNotifications.svg";
import bellDefault from "../../assets/bellDefault.svg";
import notification from "../../components/Header/notification.svg";
import useOutsideClick from "../OutsideClick/OutsideClick";
import NotificationCard from "./NotificationCards/NotificationCard";
import { useDispatch, useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import {
	fetchAllNotifications,
	updateNotifications,
} from "../../common/Notification/notification-action";
import { Loader } from "../../common/Loader/Loader";
import { kFormatter } from "../../utils/common";
import * as underscore from "underscore";
import { markNotification } from "../../services/api/notifications";
import { TriggerIssue } from "../../utils/sentry";
import _ from "underscore";

function Notification() {
	const notificationsData = useSelector((state) => state.notifications.data);
	const pageNo = useSelector((state) => state.notifications.pageNo);
	const hasMoreData = useSelector((state) => state.notifications.hasMoreData);
	const [showNotifications, setShowNotifications] = useState(false);
	const [no_of_notifications, setNotificationsCount] = useState(0);
	const [unReadNotifications, setUnReadNotificaitons] = useState(0);
	const [markAllRead, setMarkAllRead] = useState(false);
	const ref = useRef();
	const dispatch = useDispatch();

	const closeNotificationsPanel = () => {
		setShowNotifications(false);
	};

	useOutsideClick(ref, () => {
		if (!ref) {
			closeNotificationsPanel();
		}
	});

	useEffect(() => {
		let unReadNotifications = 0;
		let totalNotifications = 0;
		if (
			!_.isEmpty(notificationsData) &&
			typeof notificationsData == "object" &&
			Object.keys(notificationsData)?.length > 0
		) {
			Object.keys(notificationsData).map((key) => {
				totalNotifications += notificationsData[key]?.length;
				if (
					notificationsData[key] &&
					Array.isArray(notificationsData[key]) &&
					notificationsData[key].length > 0
				) {
					notificationsData[key].map((notification) => {
						if (
							notification &&
							underscore.isBoolean(notification.read) &&
							!notification.read
						) {
							unReadNotifications = unReadNotifications + 1;
						}
					});
				}
			});
		}
		setUnReadNotificaitons(unReadNotifications);
		setNotificationsCount(totalNotifications);
	}, [notificationsData]);

	function markAllAsRead_and_UpdateStore() {
		setMarkAllRead(!markAllRead);
		const notificationIds = underscore.pluck(
			[...notificationsData.today, ...notificationsData.older],
			"_id"
		);
		try {
			markNotification(notificationIds, true).then((res) => {
				if (res?.status == 200 && res?.data?.status == "success") {
					dispatch(updateNotifications(pageNo));
				}
			});
		} catch (error) {
			TriggerIssue("ERROR when marking all notifications as read", error);
		}
	}

	function notoficationCount(num) {
		return parseInt(num) > 99 ? `99+` : num;
	}

	return (
		<>
			{!showNotifications ? (
				<div
					className="position-relative cursor-pointer d-flex"
					onClick={() => setShowNotifications((val) => !val)}
				>
					<img
						alt="notification"
						src={!!unReadNotifications ? notification : bellDefault}
						width={unReadNotifications ? "25" : "20"}
						height={unReadNotifications ? "25" : "20"}
						className="d-inline-block align-top position-relative"
					/>
					{unReadNotifications > 0 && (
						<div className="position-absolute notification_number">
							{notoficationCount(unReadNotifications)}
						</div>
					)}
				</div>
			) : (
				<div>
					<div className="modal-backdrop show"></div>
					<div className="modal d-block">
						<div ref={ref} className="notifications">
							<div className="d-flex flex-row align-items-centre mt-4 mb-4">
								<div style={{ marginLeft: "179px" }}>
									<span className="notification_heading">
										Notifications
									</span>
								</div>
								<img
									alt="close notifications"
									onClick={closeNotificationsPanel}
									src={close}
									className="mr-4 ml-auto cursor-pointer"
								/>
							</div>
							<hr className="mb-0"></hr>
							<div
								style={{
									height: "calc(100vh - 75px)",
									overflowY: "auto",
								}}
							>
								<div
									className="notification_body"
									id="scrollableDiv"
								>
									{!no_of_notifications > 0 ? (
										<div className="m-auto">
											<img
												src={emptyNotifications}
												alt="notifications"
											></img>
											<div className="empty-header mt-3">
												You're all caught up!
											</div>
										</div>
									) : (
										<>
											<div className="position-relative">
												<div
													className="mark_all_as_read cursor-pointer"
													onClick={() =>
														markAllAsRead_and_UpdateStore()
													}
												>
													Mark all as read
												</div>
											</div>
											<InfiniteScroll
												dataLength={no_of_notifications}
												next={() => {
													dispatch(
														fetchAllNotifications(
															parseInt(pageNo) +
																1,
															10
														)
													);
												}}
												hasMore={hasMoreData}
												loader={
													<Loader
														width={60}
														height={60}
													/>
												}
												scrollableTarget="scrollableDiv"
												scrollThreshold="200px"
												style={{
													height: "unset",
													overflow: "unset",
													width: "100%",
												}}
												key={markAllRead}
											>
												{Object.keys(notificationsData)
													.length > 0 &&
													Object.keys(
														notificationsData
													)?.map(
														(key, index) =>
															notificationsData[
																key
															]?.length > 0 && (
																<div
																	className="mb-4 w-100"
																	key={index}
																>
																	<div
																		className="mr-auto text-uppercase font-12 grey-1 mb-1"
																		style={{
																			marginLeft:
																				"12px",
																		}}
																	>
																		{key}
																	</div>
																	{notificationsData[
																		key
																	]?.map(
																		(
																			notification,
																			index
																		) => (
																			<NotificationCard
																				notification={
																					notification
																				}
																				refresh={() =>
																					dispatch(
																						updateNotifications(
																							pageNo
																						)
																					)
																				}
																				closeNotifications={
																					closeNotificationsPanel
																				}
																				isRead={
																					notification?.read
																				}
																				key={
																					index
																				}
																			/>
																		)
																	)}
																</div>
															)
													)}
											</InfiniteScroll>
										</>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

export default Notification;
