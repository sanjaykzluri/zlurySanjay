import React, { useEffect } from "react";
import close from "../../../assets/close.svg";
import { NameBadge } from "../../../common/NameBadge";
import HistoryItem from "./HistoryItem";
import pencilIcon from "../../../assets/pencil.svg";
import discoverLogo from "../../../assets/discover.svg";
import { capitalizeFirstLetter, unescape } from "../../../utils/common";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Loader } from "../../../common/Loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import "./ActionLogHistory.css";
import { getValueFromLocalStorage } from "utils/localStorage";
const historySource = {
	INTEGRATION: "integration",
	MANUAL: "manual",
	AGENT: "agent",
	WORKFLOW: "workflow",
};
const historyTypes = {
	USER: "user",
	USER_APP: "user_app",
	APP: "app",
	MERGE: "merge",
};

const getMetaData = (data) => {
	const { date, note } = data;
	const orgName = getValueFromLocalStorage("userInfo")?.org_name;
	if (
		data.historyType === historyTypes.USER &&
		data?.type == historySource.INTEGRATION
	) {
		const title = `User discovered and added to ${orgName}`;
		const subtitle = `updated automatically via ${data.integration_id?.name}`;
		const logo = discoverLogo;
		return { title, subtitle, logo, date, note };
	}
	if (
		data.historyType === historyTypes.USER &&
		data.type === historyTypes.MERGE
	) {
		const title = `${data?.old_user?.name} merged to ${data?.user_name}`;
		const subtitle = data?.updated_by_user_id
			? `updated manually by ${data?.updated_by_user_id?.name}`
			: data?.integration_id
			? `updated automatically via ${data?.integration_id?.name}`
			: null;
		const logo = discoverLogo;
		return subtitle
			? { title, logo, date, note, subtitle }
			: { title, logo, date, note };
	}
	if (
		data.historyType === historyTypes.APP &&
		data.type === historyTypes.MERGE
	) {
		const title = `${data?.old_app?.name} merged to ${data?.app_name}`;
		const subtitle = data?.updated_by_user_id
			? `updated manually by ${data?.updated_by_user_id?.name}`
			: data?.integration_id
			? `updated automatically via ${data?.integration_id?.name}`
			: null;
		const logo = data?.app_logo;
		return subtitle
			? { title, logo, date, note, subtitle }
			: { title, logo, date, note };
	}
	if (
		data.historyType === historyTypes.USER &&
		data.type === historySource.MANUAL
	) {
		const title = `User marked ${capitalizeFirstLetter(data.status_to)}`;
		const subtitle = `updated manually by ${data?.updated_by_user_id?.name}`;
		const logo = pencilIcon;
		return { title, subtitle, logo, date, note };
	}
	if (
		[historyTypes.APP, historyTypes.USER_APP].includes(data.historyType) &&
		data.type === historySource.INTEGRATION
	) {
		const action = data.status_to === "active" ? "In use" : "Not in use";
		const title = `${data.app_name} marked ${action}`;
		const subtitle = `updated automatically via ${data.integration_id?.name}`;
		const logo = data.app_logo;
		return { title, subtitle, logo, date, note };
	}
	if (
		[historyTypes.APP, historyTypes.USER_APP].includes(data.historyType) &&
		data.type === historySource.AGENT
	) {
		const action = data.status_to === "active" ? "In use" : "Not in use";
		const title = `${data.app_name} marked ${action}`;
		const subtitle = `updated automatically via ${capitalizeFirstLetter(
			data.meta?.identifier
		)}`;
		const logo = data.app_logo;
		return { title, subtitle, logo, date, note };
	}
	if (
		[historyTypes.APP, historyTypes.USER_APP].includes(data.historyType) &&
		data.type === historySource.MANUAL
	) {
		const action =
			data.status_to === "active"
				? "In use"
				: data.status_to === "inactive"
				? "Not in use"
				: capitalizeFirstLetter(data.status_to);
		const title = `${data.app_name} marked ${action}`;
		const subtitle = `updated manually via ${data?.updated_by_user_id?.name}`;
		const logo = data.app_logo;
		return { title, subtitle, logo, date, note };
	}
	if (
		[historyTypes.APP, historyTypes.USER_APP].includes(data.historyType) &&
		data.type === historySource.WORKFLOW
	) {
		const action =
			data.status_to === "active"
				? "In use"
				: data.status_to === "inactive"
				? "Not in use"
				: capitalizeFirstLetter(data.status_to);
		const title = `${data.app_name} marked ${action}`;
		const subtitle = `updated by ${data?.updated_by_user_id?.name} via workflow`;
		const logo = data.app_logo;
		return { title, subtitle, logo, date, note };
	}
};

const actionHistoryKeys = {
	[historyTypes.USER]: "user_status_change_log",
	[historyTypes.USER_APP]: "user_app_status_change_log",
	[historyTypes.APP]: "app_status_change_log",
};

export default function ActionLogHistory(props) {
	const actionHistoryKey = actionHistoryKeys[props.historyType];
	const data = props.actionHistory[actionHistoryKey];
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const {
		user_status_change_log,
		user_app_status_change_log,
		loading,
		...metadata
	} = props.actionHistory;
	const nameLogo =
		props.historyType === historyTypes.USER
			? metadata.user_profile_img
			: metadata.app_logo;

	const appLogo = (
		<div className="d-flex mr-2">
			{metadata.app_logo ? (
				<img
					src={unescape(metadata.app_logo)}
					className="mr-2"
					width={26}
					style={{ objectFit: "contain" }}
				/>
			) : (
				<NameBadge
					width={28}
					name={metadata.app_name}
					className="mr-2"
				/>
			)}{" "}
			<OverlayTrigger
				placement="bottom"
				overlay={
					<Tooltip>
						{metadata && metadata?.app_name
							? metadata?.app_name
							: ""}
					</Tooltip>
				}
			>
				<div
					style={{
						maxWidth: 250,
						display: "flex",
						alignItems: "center",
					}}
				>
					<span
						className={
							metadata?.app_name?.length > 20
								? "text-truncate"
								: null
						}
						style={{ whiteSpace: "nowrap" }}
					>
						{metadata && metadata?.app_name
							? metadata?.app_name
							: ""}
					</span>
				</div>
			</OverlayTrigger>
		</div>
	);

	const userLogoUrl = metadata.user_profile_img || metadata.user_image;
	const userLogo = (
		<div className="d-flex mr-2">
			{userLogoUrl ? (
				<img src={unescape(userLogoUrl)} className="mr-2" width={26} />
			) : (
				<NameBadge
					width={28}
					name={metadata.user_name}
					borderRadius={"50%"}
				/>
			)}{" "}
			<OverlayTrigger
				placement="bottom"
				overlay={
					<Tooltip>
						{metadata && metadata?.user_name
							? metadata?.user_name
							: ""}
					</Tooltip>
				}
			>
				<div
					className="ml-2"
					style={{
						maxWidth: 250,
						display: "flex",
						alignItems: "center",
					}}
				>
					<span className="text-truncate">
						{metadata && metadata?.user_name
							? metadata?.user_name
							: ""}
					</span>
				</div>
			</OverlayTrigger>
		</div>
	);

	return (
		<>
			<div className="modal-backdrop show"></div>

			<div className="addContractModal__TOP" style={{ height: "100%" }}>
				{loading ? (
					<Loader width={100} height={100} />
				) : (
					<>
						<div
							className="flex-center"
							style={{
								marginTop: "24px",
								display: "flex",
								justifyContent: "space-between",
								padding: "0 20px",
								width: "fit-content",
							}}
						>
							<div
								className="row"
								style={{ marginLeft: "15px", width: "400px" }}
							>
								<div
									style={{
										paddingRight: "5px",
										paddingTop: "2.5px",
										display: "flex",
									}}
								>
									{props.historyType !==
									historyTypes.USER_APP ? (
										<div
											className="mr-2"
											style={{
												display: "flex",
												alignItems: "center",
											}}
										>
											History
										</div>
									) : (
										appLogo
									)}{" "}
									<div
										className="mr-2"
										style={{
											display: "flex",
											alignItems: "center",
										}}
									>
										<span>for</span>
									</div>{" "}
									{props.historyType === historyTypes.APP
										? appLogo
										: userLogo}
								</div>
							</div>
							<div>
								<img
									alt="Close"
									onClick={props.onHide}
									src={close}
									style={{
										marginLeft: "75px",
										cursor: "pointer",
									}}
								/>
							</div>
						</div>
						<hr
							style={{
								marginBottom: "0px",
								marginLeft: "6px",
								marginRight: "6px",
							}}
						/>
						<div
							style={{
								padding: 20,
								overflowY: "auto",
								height: "90vh",
							}}
						>
							{Array.isArray(data) &&
								data?.reverse()?.map((actionData) => {
									return (
										<HistoryItem
											{...getMetaData({
												...actionData,
												...metadata,
												historyType: props.historyType,
											})}
											name={
												metadata?.app_name ||
												metadata?.user_name
											}
										/>
									);
								})}
						</div>
					</>
				)}
			</div>
		</>
	);
}
