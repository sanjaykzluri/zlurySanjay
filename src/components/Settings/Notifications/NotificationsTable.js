import React, { useState, useEffect } from "react";
import { Table } from "../../../common";
import PropTypes from "prop-types";
import { Button, Form } from "react-bootstrap";
import cellEditFactory, { Type } from "react-bootstrap-table2-editor";
import { Link } from "react-router-dom";
import "./Notifications";
import adobe from "../../../assets/transactions/adobe.svg";
import {
	getNotificationSettings,
	updateNotificationSettings,
} from "../../../services/api/settings";
import { TriggerIssue } from "../../../utils/sentry";
import ContentLoader from "react-content-loader";
import greenTick from "../../../assets/green_tick.svg";
const loadingData = [
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
];
const loaderColumns = [
	{
		dataField: "type",
		text: "Type",
		formatter: () => (
			<div className="d-flex flex-row align-items-center">
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
		headerStyle: {
			borderTop: "none",
			width: "440px",
			opacity: 0.7,
		},
	},
	{
		dataField: "",
		text: "Notification",
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
		headerStyle: {
			borderTop: "none",
			opacity: 0.7,
		},
	},
];
export function UpdateNotificationSetting(props) {
	const [updating, setUpdating] = useState(false);
	let booleanCheck = props.data.notification_type === "org";
	return (
		<div className="d-flex flex-row align-items-center">
			<Form.Check
				type="checkbox"
				defaultChecked={props.data.enabled}
				value={props.data.enabled}
				onClick={(e) => {
					props.updateNotifications(
						!props.data.enabled,
						props.index,
						booleanCheck
					);
					updateNotificationSettings(
						props.data.notification_group_id,
						props.data.enabled
					).then((res) => {
						if (res.status === "success") {
							setUpdating(true);
						}
						if (res.error) {
							TriggerIssue(
								"Error in updating the notification settings",
								res.error
							);
						}
					});
					setTimeout(() => {
						setUpdating(false);
					}, 5000);
				}}
			/>
			{updating && (
				<>
					<img
						src={greenTick}
						wdith={18}
						height={18}
						className="mr-1 ml-3"
					/>
					<div className="green" style={{ fontSize: 14 }}>
						Saved
					</div>
				</>
			)}
		</div>
	);
}
export function NotificationsTable(props) {
	const selectRow = {
		hideSelectColumn: true,
		mode: "checkbox",
		clickToSelect: true,
	};
	const [loading, setLoading] = useState(true);
	const [notificationSettings, setNotificationSettings] = useState([]);
	const [notificationData, setNotificationData] = useState([]);
	const [orgNotifsData, setOrgNotifsData] = useState([]);
	const [orgNotifsSettings, setOrgNotifsSettings] = useState([]);
	useEffect(() => {
		if (loading) {
			try {
				getNotificationSettings().then((res) => {
					let tempUserNotif = [];
					let tempOrgNotif = [];
					tempUserNotif = res.data?.filter(
						(el) => el.notification_type === "user"
					);
					tempOrgNotif = res.data?.filter(
						(el) => el.notification_type === "org"
					);
					setNotificationSettings(tempUserNotif);
					setNotificationData(tempUserNotif);
					setOrgNotifsData(tempOrgNotif);
					setOrgNotifsSettings(tempOrgNotif);
					setLoading(false);
				});
			} catch (error) {
				TriggerIssue("Error in fetching notification details", error);
			}
		}
	}, [notificationSettings, orgNotifsSettings]);
	const updateNotifications = (enabled, index, booleanCheck) => {
		var temp = booleanCheck ? [...orgNotifsData] : [...notificationData];
		temp[index].enabled = enabled;
		if (booleanCheck) {
			setOrgNotifsData(temp);
		} else {
			setNotificationData(temp);
		}
	};
	const rowStyle = {
		height: "48px",
	};
	const columns = [
		{
			dataField: "name",
			text: "Type",
			displayName: "Notification",
			headerStyle: {
				borderTop: "none",
				width: "440px",
				opacity: 0.7,
			},
		},
		{
			dataField: "",
			text: "Notification",
			headerStyle: {
				borderTop: "none",
				opacity: 0.7,
			},
			formatter: (row, data, index) => {
				return (
					<div className="flex flex-row center">
						<UpdateNotificationSetting
							index={index}
							data={data}
							updateNotifications={updateNotifications}
						/>
					</div>
				);
			},
		},
	];
	return (
		<>
			{loading ? (
				<Table
					columns={loaderColumns}
					data={loadingData || []}
					hover
					keyField="id"
					selectRow={selectRow}
					remote={false}
					rowStyle={rowStyle}
				/>
			) : (
				<Table
					columns={columns}
					data={notificationData}
					hover
					keyField="id"
					selectRow={selectRow}
					remote={false}
					rowStyle={rowStyle}
				/>
			)}
			<div className="acc__cont__d1">Organization Notifications</div>
			{loading ? (
				<Table
					columns={loaderColumns}
					data={loadingData || []}
					hover
					keyField="id"
					selectRow={selectRow}
					remote={false}
					rowStyle={rowStyle}
				/>
			) : (
				<Table
					columns={columns}
					data={orgNotifsData}
					hover
					keyField="id"
					selectRow={selectRow}
					remote={false}
					rowStyle={rowStyle}
				/>
			)}
		</>
	);
}

NotificationsTable.propTypes = {
	data: PropTypes.array,
};
