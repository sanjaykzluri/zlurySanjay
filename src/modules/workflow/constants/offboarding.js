import React from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { EmptySearch } from "../../../common/EmptySearch";
import { Empty } from "../components/Empty/Empty";
import DraftUsersDisplay from "../../../common/DraftUsersDisplay";
import CreatedAt from "../components/CreatedAt";
import Status from "../components/Status";
import { NameBadge } from "../../../common/NameBadge";
import { Button } from "../../../UIComponents/Button/Button";
import website from "../../../assets/icons/website.svg";

export const offboardingDeclarationColumns = [
	{
		column_name: "app_name",
		field_ids: ["app_name"],
	},
	{
		column_name: "task",
		field_ids: ["task"],
	},
	{
		column_name: "recent_activity",
		field_ids: ["recent_activity"],
	},
	{
		column_name: "role",
		field_ids: ["role"],
	},
	{
		column_name: "app_link",
		field_ids: ["app_link"],
	},
	{
		column_name: "action",
		field_id: ["action"],
	},
];

const AppNameAndLogoDisplay = ({ appList }) => (
	<>
		<div className="d-flex flex-row align-items-center">
			{appList.appLogo ? (
				<img
					src={unescape(appList?.appLogo)}
					style={{
						height: "26px",
						width: "26px",
						borderRadius: "50%",
					}}
				/>
			) : (
				<NameBadge
					name={appList?.appName || "NA"}
					width={26}
					height={26}
					borderRadius={"50%"}
				/>
			)}
			<OverlayTrigger
				placement="top"
				overlay={
					<Tooltip>
						{appList?.appName?.charAt(0).toUpperCase() +
							appList?.appName?.slice(1)}
					</Tooltip>
				}
			>
				<div
					className=" d-flex flex-column align-items-start"
					style={{
						marginLeft: "8px",
						color: "#222222",
					}}
				>
					<div className="text-capitalize">
						{appList?.appName || ""}
					</div>
				</div>
			</OverlayTrigger>
		</div>
	</>
);

const DisplayDateAndTime = ({ recentActivity }) => (
	<>
		<div className="flex flex-row align-items-center created-at-component">
			<div className="d-flex flex-column created-at-container">
				<OverlayTrigger
					placement="top"
					overlay={
						<Tooltip>
							{moment(recentActivity).format(
								"HH:MM, DD MMM 'YY"
							) == "Invalid date"
								? "N/A"
								: moment(recentActivity).format(
										"HH:MM, DD MMM 'YY"
								  )}
						</Tooltip>
					}
				>
					<div className="created-at-date">
						{moment(recentActivity).format("HH:MM, DD MMM 'YY") ==
						"Invalid date"
							? "N/A"
							: moment(recentActivity).format(
									"HH:MM, DD MMM 'YY"
							  )}
					</div>
				</OverlayTrigger>
			</div>
		</div>
	</>
);

const AppLink = (props) => {
	const { link } = props;

	const openTab = (link) => {
		if (link) {
			window.open(`${link}`, "_blank");
		}
	};

	return (
		<>
			{link && (
				<div className="flex flex-row align-items-center workflow-action-component">
					<div className="d-flex flex-column workflow-action-container">
						<Link
							onClick={() => openTab(link)}
							target="_blank"
							rel="noopener noreferrer"
							to={{
								pathname: `${link}`,
							}}
							className="custom__app__name__css text-decoration-none"
						>
							<span
								style={{ color: "#5ABAFF" }}
								className="text-decoration-none font-13"
							>
								{link}
								<img
									src={website}
									style={{
										height: "12px",
										width: "12px",
										marginLeft: "5px",
									}}
								/>
							</span>
						</Link>
					</div>
				</div>
			)}
		</>
	);
};

export const offboardingColumnsMapper = {
	app_name: {
		dataField: "app_name",
		text: "App Name",
		formatter: (data, row) => {
			return (
				<div
				// className="workflows-workflow-name"
				>
					<AppNameAndLogoDisplay appList={row} />
				</div>
			);
		},
	},
	task: {
		dataField: "task",
		text: "Task",
		formatter: (data, row) => {
			return (
				<div>
					<Status text={row?.actionName || "N/A"} />
				</div>
			);
		},
	},
	recent_activity: {
		dataField: "recent_activity",
		text: "Recent Activity",
		formatter: (data, row) => (
			<div className="workflows-user-info">
				<DisplayDateAndTime
					recentActivity={row?.recentActivity || new Date()}
				/>
			</div>
		),
	},
	role: {
		dataField: "role",
		text: "Role",
		formatter: (data, row) => (
			<div className="workflows-workflow-run-details">
				<Status text={row?.userRole || ""} />
			</div>
		),
	},
	app_link: {
		dataField: "",
		text: "",
		formatter: (data, row) => (
			<>
				<div className="workflows-workflow-action">
					<AppLink link={row?.appUrl || ""} />
				</div>
			</>
		),
	},
};
