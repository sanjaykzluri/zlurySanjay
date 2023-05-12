import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Dropdown } from "react-bootstrap";
import { capitalizeFirstLetter, isEmpty } from "../../../../utils/common";
import { INTEGRATION_STATUS } from "../../constants/constant";
import { Button } from "../../../../UIComponents/Button/Button";
import dangerIcon from "../../../../assets/icons/delete-warning.svg";
import authorizedGreen from "../../../../assets/icons/check-circle.svg";
import EllipsisSVG from "../../../../assets/icons/ellipsis-v.svg";
import white_info_icon from "../../../../assets/icons/white_info_icon.png";
import settings_icon from "../../../../assets/integrations/settings-icon.svg";
import "./instance-card.css";
import InstanceOverviewModal from "modules/integrations/containers/Instances/InstanceOverviewModal";
import { PopupWindowPostRequest } from "utils/PopupWindowPostRequest";
import { getValueFromLocalStorage } from "utils/localStorage";
import { getAppKey } from "utils/getAppKey";
import { TriggerIssue } from "utils/sentry";
import { UTCDateFormatter } from "utils/DateUtility";
import { selectFirstNElement } from "modules/integrations/utils/IntegrationUtil";
import ConnectionDetailsModal from "modules/integrations/containers/Instances/ConnectionDetailsModal";
import RemoveInstanceModal from "./RemoveInstanceModal";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

function InstanceCard({
	handlerMapUser,
	handlerSettings,
	handleReconnect,
	handlerScope,
	handlerTestConnection,
	instance,
	integration,
	handleRefresh,
	setShowConnectModal,
	selectedInstanceId,
}) {
	const {
		id,
		orgID,
		orgIntegrationID,
		integrationOrgApplicationID,
		name,
		description,
		type,
		status,
		lastSync,
		totalUsers,
		activeUsers,
		totalScope,
		connectedScope,
		connectedBy,
		connectedByEmail,
		connectedOn,
		entities,
		error,
		shouldMapUser,
		scopes,
		unMappedUsers,
	} = { ...instance };

	let isError = INTEGRATION_STATUS.ERROR === status;
	let isInitiated = INTEGRATION_STATUS.INITIATED === status;
	let isNotConnected = INTEGRATION_STATUS.NOT_CONNECTED === status;
	let isConnected = INTEGRATION_STATUS.CONNECTED === status;
	const connectDisconnectUrl = isConnected
		? integration.integration_disconnect_url
		: integration.integration_connect_url;
	const scopeString = `${connectedScope} of ${totalScope} Connected`;
	const result = selectFirstNElement(isEmpty(entities) ? [] : entities, 2);
	const syncDate = `last synced ${lastSync || "NA"} `;
	const [showInstanceOverviewModal, setShowInstanceOverviewModal] =
		useState(false);
	const formRef = useRef();
	const userDetails = getValueFromLocalStorage("userInfo");
	let client = null;
	const controller = new AbortController();
	const [showConnectionDetailsModal, setShowConnectionDetailsModal] =
		useState(false);
	const [showRemoveInstanceModal, setShowRemoveInstanceModal] =
		useState(false);

	const [selectedTab, setSelectedTab] = useState("overview");
	const isFormBased =
		Array.isArray(integration.form) && integration.form.length > 0;
	const dispatch = useDispatch();

	const history = useHistory();
	const { pathname, query } = useSelector((state) => state.router.location);

	useEffect(() => {
		if (query?.instanceId) {
			if (id === query?.instanceId) {
				setShowInstanceOverviewModal(true);
			}
		}
	}, [query]);

	const handleConnect = (type) => {
		client = PopupWindowPostRequest(
			type === "test" ? instance.testUrl : integration?.disconnectURL,
			type === "test"
				? "TestIntegrationApplication"
				: "DisconnectIntegrationApplication",
			{
				Authorization: `Bearer ${getValueFromLocalStorage("token")}`,
				orgIntegrationId: orgIntegrationID,
				userId: userDetails?.user_id,
			}
		);
		const popupTick = setInterval(function () {
			if (client.closed) {
				clearInterval(popupTick);
				controller.abort();
			}
		}, 500);
		window.addEventListener(
			"message",
			(e) => {
				try {
					if (e?.origin === getAppKey("REACT_APP_INTEGRATION_URL")) {
						controller.abort();
						if (
							e?.data?.status === "success" &&
							e?.data?.message === "disconnected"
						) {
							setTimeout(() => {
								handleRefresh();
								setShowInstanceOverviewModal(false);
							}, [1000]);
						}
					}
				} catch (e) {
					TriggerIssue(
						`On ${
							type === "test" ? "Testing" : "Disconnecting"
						} Integration ${integration.name}`,
						e
					);
				}
			},
			{ signal: controller.signal }
		);
	};

	return (
		<div className="card z_i_instance_card">
			<div className="card-body p-0">
				<div className="d-flex z-instance-top-bar p-3">
					<div className="instance-status-icon mr-1">
						<div>
							{isError || isNotConnected ? (
								statusIcon(dangerIcon)
							) : isConnected ? (
								statusIcon(authorizedGreen)
							) : (
								<div />
							)}
						</div>
					</div>
					<div className="d-flex flex-fill justify-content-end instance-status-action-bar">
						<Button
							className="btn-light d-flex justify-content-center align-items-center mr-1 action-btn"
							onClick={(e) => {
								setSelectedTab("settings");
								setShowInstanceOverviewModal(true);
							}}
						>
							<img src={settings_icon} alt="refresh" />
						</Button>
						{isConnected && shouldMapUser ? (
							<Button
								className="btn-primary btn-sm d-flex justify-content-center align-items-center "
								onClick={(e) => {
									handlerMapUser(e);
								}}
							>
								Map users
							</Button>
						) : null}
						{isError || status === "not-connected" ? (
							<Button
								className="btn btn-sm d-flex justify-content-center align-items-center button-warning"
								onClick={(e) => {
									if (isFormBased) {
										setSelectedTab("settings");
										setShowInstanceOverviewModal(true);
									} else {
										handleReconnect(
											scopes,
											instance.id,
											true,
											undefined,
											true
										);
									}
								}}
							>
								<img src={white_info_icon} alt="" />
								<span
									style={{ marginLeft: "9px", color: "#fff" }}
								>
									Reconnect
								</span>
							</Button>
						) : null}
						<Dropdown className="ml-1" size="sm" drop="left">
							<Dropdown.Toggle as={ellipsis} />
							<Dropdown.Menu>
								<Dropdown.Item
									style={{ color: "black" }}
									onClick={(e) => {
										setShowConnectionDetailsModal(true);
									}}
								>
									Edit Instance details
								</Dropdown.Item>
								{/* <Dropdown.Item
									style={{ color: "black" }}
									onClick={(e) => {
										handleConnect("test");
									}}
								>
									Test Connection
								</Dropdown.Item> */}

								{isConnected ? (
									<>
										<Dropdown.Divider />
										<Dropdown.Item
											style={{ color: "black" }}
											onClick={(e) => {
												handleConnect(e);
											}}
										>
											Disconnect
										</Dropdown.Item>
									</>
								) : null}
								{(isNotConnected || isError || isInitiated) && (
									<Dropdown.Item
										style={{ color: "black" }}
										onClick={(e) => {
											setShowRemoveInstanceModal(true);
										}}
									>
										Remove
									</Dropdown.Item>
								)}
							</Dropdown.Menu>
						</Dropdown>
					</div>
				</div>
				<div className="d-flex flex-column instance-info-bar">
					<div
						onClick={() => {
							setSelectedTab("overview");
							setShowInstanceOverviewModal(true);
						}}
						className="instance-details cursor-pointer"
					>
						<p className="name m-0">{name}</p>
						{!isConnected && error ? (
							<p
								className="last-sync m-0 truncate_twoline"
								style={{ color: "#ff6767" }}
							>
								{error}
							</p>
						) : (
							<p className="last-sync m-0">{syncDate}</p>
						)}
					</div>
					<div className="instance-discription">
						<p className="truncate_twoline">{description}</p>
					</div>
				</div>
				<div className="d-flex flex-column instance-meta-data">
					<div className="my-2 vertical-spacing" />
					<InlineRow
						lables={["ENTITIES", "ACTIVE USERS", "SCOPES"]}
					/>
					<div className="row m-0 p-0">
						<div className="col-4 m-0">
							<div
								onClick={() => {
									setSelectedTab("overview");
									setShowInstanceOverviewModal(true);
								}}
								className="d-flex flex-row flex-wrap cursor-pointer"
							>
								{result.shortenedList.map((el, index) => (
									<EntityChip
										name={capitalizeFirstLetter(el)}
										key={index}
									/>
								))}
								{result.remain ? (
									<EntityChip
										disable_icon
										name={`+${result.remain}`}
									/>
								) : null}
							</div>
						</div>
						<div className="col-3 m-0 p-0">
							<MetaInfo
								onClick={(e) => {
									isConnected && handlerMapUser(e);
								}}
								label={activeUsers}
								button_title={
									isConnected &&
									shouldMapUser &&
									unMappedUsers > 0
										? `Map ${unMappedUsers} users`
										: ""
								}
								name="users"
							/>
						</div>
						<div className="col-5 m-0">
							<MetaInfo
								onClick={(e) => {
									handlerScope(e);
									setSelectedTab("scopes");
									setShowInstanceOverviewModal(true);
								}}
								label={scopeString}
								button_title={`${
									connectedScope < totalScope
										? "Connect more"
										: ""
								}`}
								name="scopes"
							/>
						</div>
					</div>
					<div className="my-2 vertical-spacing" />
					<InlineRow
						lables={["CONNECTED BY", "TYPE", "CONNECTED ON"]}
					/>
					<div className="row m-0 p-0">
						<div className="col-4 m-0">
							<MetaInfo label={connectedBy} name="conected_by" />
						</div>
						<div className="col-3 m-0 p-0">
							<MetaInfo label={type} name="type" />
						</div>
						<div className="col-5 m-0">
							<MetaInfo
								label={UTCDateFormatter(
									connectedOn,
									"DD MMM YY"
								)}
								name="conected_on"
							/>
						</div>
					</div>
				</div>
			</div>
			{showInstanceOverviewModal && (
				<InstanceOverviewModal
					closeModal={() => {
						setShowInstanceOverviewModal(false);
						history.push(`${pathname}#instances`);
					}}
					instance={instance}
					integration={integration}
					selectedTab={selectedTab}
					handleDisconnect={handleConnect}
					handleRefresh={handleRefresh}
					handleReconnect={handleReconnect}
				/>
			)}
			{showConnectionDetailsModal && instance ? (
				<ConnectionDetailsModal
					onHide={() => setShowConnectionDetailsModal(false)}
					instance={instance}
					handleRefresh={handleRefresh}
				/>
			) : null}
			{showRemoveInstanceModal && instance ? (
				<RemoveInstanceModal
					onHide={() => setShowRemoveInstanceModal(false)}
					instance={instance}
					handleRefresh={handleRefresh}
				/>
			) : null}
			<form
				method="post"
				action={connectDisconnectUrl}
				target="popupWindow"
				ref={formRef}
			>
				<input type="hidden" name="integrationId" />
				<input type="hidden" name="orgId" />
				<input type="hidden" name="Authorization" />
				<input type="hidden" name="namespace" />
				<input type="hidden" name="userId" />
			</form>
		</div>
	);
}
const ellipsis = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
	>
		<img src={EllipsisSVG} style={{ filter: "opacity(0.5)" }} width="17" />
	</a>
));

function EntityChip({ name, disable_icon }) {
	return (
		<div className="d-flex flex-row align-items-center entity-chip">
			{!disable_icon ? <div className="icon"></div> : null}
			<div className="name">{name}</div>
		</div>
	);
}

function MetaInfo({ label, button_title, name, onClick }) {
	return (
		<div className="d-flex flex-fill flex-column">
			<div
				className="truncate_10vw"
				style={{
					fontSize: "10px",
					lineHeight: "15px",
				}}
			>
				{typeof label === "number"
					? label
					: capitalizeFirstLetter(label)}
			</div>
			{button_title ? (
				<button
					className="btn btn-link my-0 p-0 text-decoration-none"
					style={{
						fontSize: "8px",
						lineHeight: "10px",
						color: "#5ABAFF",
						textAlign: "initial",
					}}
					onClick={onClick}
				>
					{button_title}
				</button>
			) : null}
		</div>
	);
}
function InlineRow(props) {
	const { lables } = props;
	return (
		<div className="row m-0 p-0 lbl">
			{lables.map((el, index) => {
				if (index == 1) {
					return (
						<div key={index} className="col-3 my-0 p-0  ">
							<p className="m-label m-0 p-0">{el}</p>
						</div>
					);
				}
				return (
					<div key={index} className="col-4 my-0  ">
						<p className="m-label">{el}</p>
					</div>
				);
			})}
		</div>
	);
}
InstanceCard.propTypes = {
	instance: PropTypes.shape({
		id: PropTypes.string,
		orgID: PropTypes.string,
		orgIntegrationID: PropTypes.string,
		integrationOrgApplicationID: PropTypes.string,
		name: PropTypes.string,
		description: PropTypes.string,
		type: PropTypes.string,
		status: PropTypes.string,
		lastSync: PropTypes.string,
		totalUsers: PropTypes.number,
		activeUsers: PropTypes.number,
		totalScope: PropTypes.number,
		connectedScope: PropTypes.number,
		connectedBy: PropTypes.string,
		connectedByEmail: PropTypes.string,
		connectedOn: PropTypes.string,
		entities: PropTypes.arrayOf(
			PropTypes.shape({
				id: PropTypes.string,
				name: PropTypes.string,
			})
		),
		error: PropTypes.string,
		shouldMapUser: PropTypes.bool,
	}),
	handlerMapUser: PropTypes.func,
	handlerRefresh: PropTypes.func,
	handlerSettings: PropTypes.func,
	handlerReconnect: PropTypes.func,
	handlerScope: PropTypes.func,
	handlerTestConnection: PropTypes.func,
};

export default InstanceCard;

function statusIcon(icon) {
	return (
		<img
			src={icon}
			style={{
				height: "26px",
				width: "26px",
			}}
		/>
	);
}
