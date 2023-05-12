import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import {
	Dropdown,
	OverlayTrigger,
	Tooltip as BootstrapTooltip,
	Tooltip,
} from "react-bootstrap";
import { capitalizeFirstLetter, isEmpty } from "utils/common";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import greenTick from "assets/green_tick.svg";
import blueTick from "assets/employee/bluetick.svg";
import redexclam from "assets/employee/redexclam.svg";
import pending from "assets/employee/pending.svg";
import rejected from "assets/employee/rejected.svg";
import { Button } from "UIComponents/Button/Button";
import { RequestLicenseModal } from "./requestLicenseModal";
import optionsButton from "assets/optionsButton.svg";
import "./styles.css";
import { cancelRequest } from "services/api/employeeDashboard";
import dayjs from "dayjs";
import InfiniteTableContainer from "modules/v2InfiniteTable/InfiniteTableContainer";
import { BulkEditAppRequests } from "./BulkEditAppRequests";
import "components/Uploads/Uploads.css";
import "components/Applications/AllApps/AllApps.css";
import "components/Applications/AllApps/Contracts/Contracts.css";
import {
	trackActionSegment,
	trackPageSegment,
} from "modules/shared/utils/segment";
export function AppRequests({
	screenTagKey,
	api,
	isAdmin,
	searchAPI,
	propertiesListAPI,
}) {
	useEffect(() => {
		trackPageSegment(
			window.location.pathname.includes("user")
				? "Employee View"
				: "Admin View - Workflows",
			`${
				screenTagKey === "requests" || screenTagKey === "approvals"
					? "App Requisition"
					: screenTagKey === "pending"
					? "Pending Requests"
					: "Completed"
			} `,
			{
				notes: `${
					screenTagKey === "requests"
						? "All application requests viewed"
						: screenTagKey === "approvals"
						? "All pending approvals viewed"
						: screenTagKey === "pending"
						? "All pending approvals viewed"
						: "All completed approvals viewwed"
				} `,
			}
		);
	}, []);
	const [showErrorModal, setShowErrorModal] = useState(false);
	const history = useHistory();
	const getColumnsMapper = (handleRefresh) => {
		const columnsMapper = {
			app: {
				dataField: "app_name",
				text: "APPLICATION",
				formatter: (row, data) => {
					return (
						<div
							onClick={() => {
								history.push({
									pathname: isAdmin
										? `/license/request/overview/${data?._id}`
										: `/user/license/request/overview/${data?._id}`,
									state: {
										data: data,
									},
								});
							}}
						>
							<div className="d-flex flex-row align-items-center">
								<GetImageOrNameBadge
									url={data?.app_image}
									name={data.app_name}
									width={24}
									height={24}
								/>
								<OverlayTrigger
									placement="top"
									overlay={
										<BootstrapTooltip>
											{data.app_name}
										</BootstrapTooltip>
									}
								>
									<div className="ml-2 cursor-pointer">
										{capitalizeFirstLetter(data.app_name)}
									</div>
								</OverlayTrigger>
							</div>
						</div>
					);
				},
			},
			"license name": {
				dataField: "license_name",
				text: "LICENSE NAME",
				formatter: (row, data) => {
					return data.license_name;
				},
			},
			"requested on": {
				dataField: "requested_at",
				text: "REQUESTED ON",
				sortKey: "requested_at",
				formatter: (row, data) => {
					if (!data?.requested_at) {
						return "-";
					}
					return dayjs(data?.requested_at).format(
						"D MMM YYYY, HH:mm"
					);
				},
			},
			status: {
				dataField: "status",
				text: "STATUS",
				formatter: (row, data) => {
					let status = null;
					if (data.final_status === "approved") {
						status = (
							<div className="d-flex flex-column">
								<div className="d-flex align-items-center">
									<img src={blueTick} width={10.5}></img>{" "}
									<div className="font-13 ml-1">Approved</div>
								</div>{" "}
								<div className="grey-1 font-10 o-8">{`assigned to ${
									data?.procure_user?.user_name || "user"
								} to procure a license`}</div>
							</div>
						);
					}
					if (data.final_status === "pending") {
						status = (
							<div className="d-flex flex-column">
								<div className="d-flex align-items-center">
									<img src={pending}></img>
									<div className="d-flex flex-column ml-1">
										{data.pending_from?.designation ? (
											<>
												<div className="font-13">{`Awaiting ${data.pending_from?.designation} Approval`}</div>
											</>
										) : (
											<div className="font-13">{`Awaiting Approval by ${data.pending_from?.user_name}`}</div>
										)}
									</div>
								</div>
								<div className="mt-1 d-flex align-items-center grey-1 o-8">
									<div>{`${
										data.apporvars_taken_action_count
									}/${
										data.total_approvers ||
										data.total_approvars
									}`}</div>
								</div>
							</div>
						);
					}
					if (data.final_status === "rejected") {
						status = (
							<div className="d-flex align-items-center">
								<img src={rejected}></img>
								<div className="font-13 ml-1">
									Rejected{" "}
									{`by ${data.rejected_from?.user_name}`}
								</div>
							</div>
						);
					}
					if (data.final_status === "cancelled") {
						status = (
							<div className="d-flex align-items-center">
								<img src={redexclam}></img>
								<div className="font-13 ml-1">
									Request Withdrawn
								</div>
							</div>
						);
					}
					if (data.final_status === "completed") {
						status = (
							<div className="d-flex align-items-center">
								<img src={greenTick} width={12}></img>
								<div className="d-flex flex-column ml-1 ">
									<div className="font-13">Completed</div>
									<div className="mt-1 grey-1 font-10 o-8">
										License was procured for this Request
									</div>
								</div>
							</div>
						);
					}
					if (data.final_status === "procure-cancelled") {
						status = (
							<div className="d-flex align-items-center">
								<img src={redexclam}></img>
								<div className="ml-1 font-13">
									Procurement Cancelled
								</div>
							</div>
						);
					}
					if (data.final_status === "auto-rejected") {
						status = (
							<div className="d-flex align-items-center">
								<img src={rejected}></img>
								<div className="font-13 ml-1">
									Auto Rejected
								</div>
							</div>
						);
					}
					return (
						<>
							<OverlayTrigger
								placement="top"
								overlay={
									<Tooltip>
										<div className="request__log__tooltip">
											<div className="request__log__tooltip-header">
												License Request
											</div>
											<div className="request__log__tooltip-description">
												Requested on 13:25, 12 June 2022
											</div>
										</div>
										{data?.approvers.map((approver) => (
											<div className="request__log__tooltip">
												<div className="request__log__tooltip-header">
													{approver.designation}
												</div>
												<div className="request__log__tooltip-description">
													{approver.status ===
													"pending"
														? "pending"
														: "Requested on 13:25, 12 June 2022"}
												</div>
											</div>
										))}
									</Tooltip>
								}
							>
								<>{status}</>
							</OverlayTrigger>
						</>
					);
				},
			},
			ellipsis: {
				dataField: "",
				text: "",
				formatter: (row, data) => (
					<OverlayTrigger
						trigger="click"
						rootClose
						placement="bottom"
						overlay={
							<div
								style={{ padding: "16px", width: "200px" }}
								className="request-page-dropdown-options"
							>
								<div
									style={{ paddingBottom: "12px" }}
									className="request-page-option"
									onClick={() => {
										history.push({
											pathname: isAdmin
												? `/license/request/overview/${data?._id}`
												: `/user/license/request/overview/${data?._id}`,
											state: {
												data: data,
											},
										});
									}}
								>
									View Request
								</div>
								{screenTagKey === "requests" &&
									data.final_status !== "cancelled" &&
									data.final_status !== "completed" &&
									data.final_status !== "rejected" &&
									data.final_status !== "procure-cancelled" &&
									data.final_status !== "auto-rejected" && (
										<>
											<div
												className="request-page-option"
												onClick={() => {
													cancelRequest(
														data?._id
													).then((res) => {
														handleRefresh();
													});
												}}
											>
												Cancel Request
											</div>
										</>
									)}
							</div>
						}
					>
						<div style={{ cursor: "pointer" }}>
							<img src={optionsButton} />
						</div>
					</OverlayTrigger>
				),
			},
		};
		return columnsMapper;
	};
	const columns = [
		{
			dataField: "license_name",
			text: "License name",
		},
		{
			dataField: "requested_at",
			text: "REQUESTED ON",
			formatter: (row, data) => {
				if (!data?.requested_at) {
					return "-";
				}
				return dayjs(data?.requested_at).format("D MMM YYYY, HH:mm");
			},
		},
		{
			dataField: "status",
			text: "STATUS",
			formatter: (row, data) => {
				let status = null;
				if (data.final_status === "approved") {
					status = (
						<div className="d-flex flex-column">
							<div className="d-flex align-items-center">
								<img src={blueTick} width={10.5}></img>{" "}
								<div className="font-13 ml-1">Approved</div>
							</div>{" "}
							<div className="grey-1 font-10 o-8">{`assigned to ${
								data?.procure_user?.user_name || "user"
							} to procure a license`}</div>
						</div>
					);
				}
				if (data.final_status === "pending") {
					status = (
						<div className="d-flex flex-column">
							<div className="d-flex align-items-center">
								<img src={pending}></img>
								<div className="d-flex flex-column ml-1">
									{data.pending_from?.designation ? (
										<>
											<div className="font-13">{`Awaiting ${data.pending_from?.designation} Approval`}</div>
										</>
									) : (
										<div className="font-13">{`Awaiting Approval by ${data.pending_from?.user_name}`}</div>
									)}
								</div>
							</div>
							<div className="mt-1 d-flex align-items-center grey-1 o-8">
								<div>{`${data.apporvars_taken_action_count}/${
									data.total_approvers || data.total_approvars
								}`}</div>
							</div>
						</div>
					);
				}
				if (data.final_status === "rejected") {
					status = (
						<div className="d-flex align-items-center">
							<img src={rejected}></img>
							<div className="font-13 ml-1">
								Rejected {`by ${data.rejected_from?.user_name}`}
							</div>
						</div>
					);
				}
				if (data.final_status === "cancelled") {
					status = (
						<div className="d-flex align-items-center">
							<img src={redexclam}></img>
							<div className="font-13 ml-1">
								Request Withdrawn
							</div>
						</div>
					);
				}
				if (data.final_status === "completed") {
					status = (
						<div className="d-flex align-items-center">
							<img src={greenTick} width={12}></img>
							<div className="d-flex flex-column ml-1 ">
								<div className="font-13">Completed</div>
								<div className="mt-1 grey-1 font-10 o-8">
									License was procured for this Request
								</div>
							</div>
						</div>
					);
				}
				if (data.final_status === "procure-cancelled") {
					status = (
						<div className="d-flex align-items-center">
							<img src={redexclam}></img>
							<div className="ml-1 font-13">
								Procurement Cancelled
							</div>
						</div>
					);
				}
				if (data.final_status === "auto-rejected") {
					status = (
						<div className="d-flex align-items-center">
							<img src={rejected}></img>
							<div className="font-13 ml-1">Auto Rejected</div>
						</div>
					);
				}
				return (
					<>
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip>
									<div className="request__log__tooltip">
										<div className="request__log__tooltip-header">
											License Request
										</div>
										<div className="request__log__tooltip-description">
											Requested on 13:25, 12 June 2022
										</div>
									</div>
									{data?.approvers.map((approver) => (
										<div className="request__log__tooltip">
											<div className="request__log__tooltip-header">
												{approver.designation}
											</div>
											<div className="request__log__tooltip-description">
												{approver.status === "pending"
													? "pending"
													: "Requested on 13:25, 12 June 2022"}
											</div>
										</div>
									))}
								</Tooltip>
							}
						>
							<>{status}</>
						</OverlayTrigger>
					</>
				);
			},
		},
		{
			dataField: "",
			text: "",
			formatter: (row, data) => (
				<OverlayTrigger
					trigger="click"
					rootClose
					placement="bottom"
					overlay={
						<div
							style={{ padding: "16px", width: "200px" }}
							className="request-page-dropdown-options"
						>
							<div
								style={{ paddingBottom: "12px" }}
								className="request-page-option"
								onClick={() => {
									history.push({
										pathname: isAdmin
											? `/license/request/overview/${data?._id}`
											: `/user/license/request/overview/${data?._id}`,
										state: {
											data: data,
										},
									});
								}}
							>
								View Request
							</div>
							{screenTagKey === "requests" &&
								data.final_status !== "cancelled" &&
								data.final_status !== "completed" &&
								data.final_status !== "rejected" &&
								data.final_status !== "procure-cancelled" &&
								data.final_status !== "auto-rejected" && (
									<>
										<div
											className="request-page-option"
											onClick={() => {
												cancelRequest(data?._id).then(
													(res) => {
														trackActionSegment(
															`Application request - cancel request`,
															{
																currentCategory:
																	"Employee View",
																currentPageName:
																	"App requisition",
															}
														);
														refreshTable();
													}
												);
											}}
										>
											Cancel Request
										</div>
									</>
								)}
						</div>
					}
				>
					<div style={{ cursor: "pointer" }}>
						<img src={optionsButton} />
					</div>
				</OverlayTrigger>
			),
		},
	];
	const customProps = {
		columnsMapper: getColumnsMapper,
		v2TableEntity: screenTagKey,
		v2SearchFieldId: "app_name",
		v2SearchFieldName: "Application Name",
		getAPI: api,
		searchAPI: searchAPI,
		propertyListAPI: propertiesListAPI,
		keyField: "_id",
		chipText: "Requests",
		hasBulkEdit: false,
		set_all_present: false,
		forceShowBulkEditComponents: true,
		bulkEditComponents: () => {
			return (
				<BulkEditAppRequests
					screenTagKey={screenTagKey}
				></BulkEditAppRequests>
			);
		},
		hideColumnsButton: true,
	};

	return (
		<>
			<InfiniteTableContainer {...customProps} />
		</>
	);
}
