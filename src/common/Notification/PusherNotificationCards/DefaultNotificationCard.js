import React from "react";
import defaultNotification from "../../../assets/defaultNotification.svg";
import JsxParser from "react-jsx-parser";
import CurrencyFormatter from "../../CurrencyFormatter/CurrencyFormatter";
import { Button } from "UIComponents/Button/Button";
import notificationDownloadDoc from "assets/notifications/notificationDownloadDoc.svg";
import DownloadInSamePage from "modules/shared/components/DownloadInSamePage/DownloadInSamePage";
import { getS3LinkForDownload } from "services/api/notifications";

function notifyPushNotificationCard({
	notification,
	jsxReqd,
	icon,
	children = null,
}) {
	const getCSVDownloadUrl = () => {
		return Array.isArray(notification?.data) &&
			notification?.data?.length > 0
			? notification?.data[0]?.url
			: null;
	};

	return (
		<div className="ml-auto mr-auto row">
			<div className="col-md-2 p-0 mt-1" style={{ flexBasis: 0 }}>
				<img
					alt="notification-icon"
					className="notification_icon "
					src={notification?.icon || icon || defaultNotification}
				/>
			</div>
			<div className="col pr-0 pl-3">
				{notification?.title && (
					<div className="notification_title">
						{jsxReqd ? (
							<JsxParser
								components={{ CurrencyFormatter }}
								jsx={notification?.title}
							/>
						) : (
							<>{notification?.title}</>
						)}
					</div>
				)}
				{notification?.description && (
					<div className="notification_description">
						{jsxReqd ? (
							<JsxParser
								components={{ CurrencyFormatter }}
								jsx={notification?.description}
							/>
						) : (
							<>{notification?.description}</>
						)}
					</div>
				)}
				{children}
				{getCSVDownloadUrl() && (
					<DownloadInSamePage
						api={getS3LinkForDownload}
						tokenLink={getCSVDownloadUrl()}
					>
						<div className="d-flex align-items-center">
							<div className="font-13 bold-500 mr-1 primary-color">
								Download CSV
							</div>
							<img
								src={notificationDownloadDoc}
								width={14}
								height={14}
							/>
						</div>
					</DownloadInSamePage>
				)}
				{notification?.retry && (
					<Button
						type="primary"
						className="d-flex align-items-center mt-1"
						style={{ height: "28px" }}
						onClick={() => notification.retry()}
					>
						Retry
					</Button>
				)}
			</div>
		</div>
	);
}

export default notifyPushNotificationCard;
