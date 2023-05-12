import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, Spinner, Accordion, Tooltip, Form } from "react-bootstrap";
import backarrow from "assets/licenses/backarrow.svg";
import { useHistory } from "react-router-dom";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import { capitalizeFirstLetter, unescape } from "utils/common";
import { OverlayTrigger, Tooltip as BootstrapTooltip } from "react-bootstrap";
import { UTCDateFormatter } from "utils/DateUtility";
import linewitharrow from "assets/employee/line_with_arrow.svg";
import { kFormatter } from "constants/currency";
import { ChangeLogContainer } from "../components/ChangeLogContainer";
import ChangeLogModal from "../components/changeLogModal";
import { Button } from "UIComponents/Button/Button";
import { Modal } from "UIComponents/Modal/Modal";
import rejectrequest from "assets/employee/reject_request.svg";
import approverequest from "assets/employee/approve_request.svg";
import edit from "components/Applications/Overview/edit.svg";
import { useDispatch, useSelector } from "react-redux";
import { CommentsSection } from "../components/CommentsSection";
import { LicenseCostEditComponent } from "../components/licenseCostEditComponent";
import {
	changeStatusOfLicenseRequest,
	getAppOverview,
	getRequestLicenseOverview,
	overrideAutoReject,
	performActionOnBehalfOfAdmin,
	performStatusChangeFromAdminBoard,
	sendReminderToApprover,
	updateRequestLicense,
	updateRequestLicenseApprovers,
} from "services/api/employeeDashboard";
import { TriggerIssue } from "utils/sentry";
import { getModifiedLicenseRequestOverview } from "../utils/employeeUtils";
import { Loader } from "common/Loader/Loader";
import { LoaderPage } from "common/Loader/LoaderPage";

import { AdditionalInfoContainer } from "../components/additionalInfoContainer";
import dayjs from "dayjs";

import RequestContractDetails from "../components/requestContractDetails";
import { AlternateLicenseTypes } from "../components/alternateLicenseTypes";
import { SimilarAppsRequestOverview } from "../components/SimilarAppsRequestOverview";
import yellowexclamation from "assets/employee/yellowexclamation.svg";
import { SUPPORTED_FILE_FORMATS } from "constants/upload";
import _ from "underscore";
import csv from "components/Onboarding/csv.svg";
import pdf from "assets/licenses/pdf.svg";
import addUser from "assets/add_user.svg";
import cross from "assets/reports/cross.svg";
import tick from "../../../assets/check_solid.svg";

import documentIcon from "assets/documentIcon.svg";
import discoverLogo from "assets/employee/discover.svg";
import hourglass from "assets/employee/hourglass.svg";
import sendreminder from "assets/employee/send_reminder.svg";
import action_step_zero from "assets/employee/action_step_zero.svg";
import action_step_one from "assets/employee/action_step_one.svg";
import action_step_three from "assets/employee/action_step_three.svg";
import { checkSpecialCharacters, searchUsers } from "services/api/search";
import orangeExclamation from "assets/licenses/orangeExclamation.svg";
import redexclam from "assets/employee/redexclam.svg";
import { preventScroll } from "actions/ui-action";
import { AsyncTypeahead } from "common/Typeahead/AsyncTypeahead";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import {
	getMostUsedTemplatesService,
	searchTemplatesService,
} from "modules/workflow/service/api";
import { WorkflowTemplateSearchModel } from "modules/workflow/model/model";
import { BulkRunAPlaybookOptionFormatter } from "modules/workflow/components/BulkRunAPlaybook/BulkRunAPlaybook";
import arrowdropdown from "components/Transactions/Unrecognised/arrowdropdown.svg";
import { clearAllV2DataCache } from "modules/v2InfiniteTable/redux/v2infinite-action";
import {
	trackActionSegment,
	trackPageSegment,
} from "modules/shared/utils/segment";

import { toast } from "react-toastify";
import DefaultNotificationCard from "common/Notification/PusherNotificationCards/DefaultNotificationCard";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";

export const getCostText = (data) => {
	return "-";

	return `${kFormatter(
		data?.license_cost || 0,
		data?.currency || "USD"
	)} per ${data?.per_license_term?.slice(0, -1) || "months"}`;
};

export const period = {
	month: "pm",
	week: "pw",
	daily: "pd",
	year: "py",
};

const term = {
	years: "Year",
	months: "Month",
};
export function getImageWithName(name, logo) {
	return (
		<div className="d-flex flex-row align-items-center">
			<GetImageOrNameBadge
				url={logo}
				name={name}
				width={12}
				height={12}
			></GetImageOrNameBadge>
			<OverlayTrigger
				placement="top"
				overlay={<BootstrapTooltip>{name}</BootstrapTooltip>}
			>
				<div className="ml-2  ">{capitalizeFirstLetter(name)}</div>
			</OverlayTrigger>
		</div>
	);
}

export function getListOfPeople(quantity, data, userInfo) {
	return (
		<>
			<div className="d-flex align-items-center">
				<div>{quantity}</div>
				{Array.isArray(data) && data.length > 0 && (
					<>
						<OverlayTrigger
							placement="top"
							overlay={
								<BootstrapTooltip>
									<div className="d-flex flex-column">
										{data?.map((el) => (
											<div className="d-flex align-items-center">
												<GetImageOrNameBadge
													url={el.user_image}
													name={el.user_name}
													width={12}
													height={12}
												></GetImageOrNameBadge>
												<div className="ml-2">
													{capitalizeFirstLetter(
														el.user_name
													)}
												</div>
											</div>
										))}
									</div>
								</BootstrapTooltip>
							}
						>
							<div
								className="d-flex align-items-center glow_blue font-9 ml-1"
								style={{
									background: "rgba(90, 186, 255, 0.1)",
									borderRadius: "2px",

									padding: "5px ",
								}}
							>
								Included Users
							</div>
						</OverlayTrigger>
					</>
				)}
			</div>
		</>
	);
}

export function RequestOverview({ isAdmin }) {
	const dispatch = useDispatch();
	const { scroll } = useSelector((state) => state.ui);

	const id =
		window.location.pathname.split("/")[
			window.location.pathname.split("/").length - 1
		];
	const userInfo = useSelector((state) => state.userInfo);
	const history = useHistory();
	const [data, setData] = useState();
	const [loading, setLoading] = useState(true);
	const [approversSaving, setApproversSaving] = useState(false);
	const [dataset, setDataset] = useState();
	const location = useLocation();
	const [showApproveModal, setShowApproveModal] = useState(false);
	const [note, setNote] = useState();
	const [isAcceptPresent, setIsAcceptPresent] = useState(false);
	const [acceptType, setAcceptType] = useState();
	const [approverResult, setApproverResult] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [toggleState, setToggleState] = useState(false);
	const [expandUserCard, setExpandUserCard] = useState(false);
	const [editState, setEditState] = useState({});
	const [logs, setLogs] = useState([]);
	const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
	const [loadingChangeStatus, setLoadingChangeStatus] = useState(false);
	const [approverUserDetails, setApproverUserDetails] = useState({});
	const [isSuperior, setIsSuperior] = useState(false);
	const [superiorDataset, setSuperiorDataset] = useState();
	const [editPresent, setEditPresent] = useState(false);
	const [approvers, setApprovers] = useState([]);
	const [showAddApprovers, setShowAddApprovers] = useState(false);
	const approversRef = useRef(null);
	const [pendingUser, setPendingUser] = useState();
	const [rejectedUser, setRejectedUser] = useState();
	const [showOverride, setShowOverride] = useState(false);
	const [rejectedIndex, setRejectedIndex] = useState();
	const [procureStatus, setProcureStatus] = useState();
	const [showActionModal, setShowActionModal] = useState(false);
	const [stepAction, setStepAction] = useState("zero");
	const [action, setAction] = useState("assign_task");
	const [onboardingworkflows, setOnboardingWorkflows] = useState([]);
	const [offboardingworkflows, setOffboardingWorkflows] = useState([]);
	const [presentApproverIndex, setPresentApproverIndex] = useState();
	const [sendingReminder, setSendingReminder] = useState(false);

	const [actionReqData, setActionReqData] = useState();
	const cancelToken = useRef();

	useEffect(() => {
		getMostUsedTemplatesService("onboarding", 0, 10)
			.then((res) => {
				setOnboardingWorkflows(
					res.data.map(
						(item) => new WorkflowTemplateSearchModel(item)
					)
				);
			})
			.catch((err) => {
				console.log("err", err);
			});
		getMostUsedTemplatesService("offboarding", 0, 10)
			.then((res) => {
				setOffboardingWorkflows(
					res.data.map(
						(item) => new WorkflowTemplateSearchModel(item)
					)
				);
			})
			.catch((err) => {
				console.log("err", err);
			});
	}, []);

	useEffect(() => {
		if (loading) {
			fetchOverviewData();
		}
	}, []);

	const fetchApprovers = () => {
		return getRequestLicenseOverview(id).then((res) => {
			setLogs([...res.approvers]);
			fetchAdminActions(res);
			findIfAcceptPresent(res);
		});
	};

	const findIfAcceptPresent = (res) => {
		setIsAcceptPresent(false);
		let currentUserIndex = res.approvers.findIndex(
			(el) =>
				el.user_id === userInfo.user_id &&
				!el?.approved_rejected_by_admin &&
				!el?.updated_at
		);
		let userPresent =
			currentUserIndex === 0 ||
			(currentUserIndex - 1 >= 0 &&
				res.approvers[currentUserIndex - 1].status === "approved") ||
			(currentUserIndex - 1 >= 0 &&
				res.approvers[currentUserIndex - 1].status === "pending" &&
				!res.approvers[currentUserIndex - 1].user_id);
		if (res.user_type === "approver") {
			if (
				currentUserIndex >= 0 &&
				res.approvers[currentUserIndex].status === "pending"
			) {
				if (userPresent) {
					setIsAcceptPresent(true);
				}
			}
		}
		if (res.user_type === "requestee") {
			if (res.status === "pending") {
				if (currentUserIndex > -1) {
					if (res.approvers[currentUserIndex].status === "pending") {
						if (userPresent) {
							setIsAcceptPresent(true);
						}
					}
				}
			}
		}
	};

	const fetchOverviewData = () => {
		setLoading(true);
		setShowOverride(false);
		getRequestLicenseOverview(id).then((res) => {
			setEditPresent(false);
			res = getModifiedLicenseRequestOverview(res);
			setData(res);
			trackPageSegment(
				window.location.pathname.includes("user")
					? "Employee View"
					: "Admin View",
				`Request Summary `,
				{
					notes: `summary viewed by ${
						isAdmin
							? "admin"
							: res.user_type === "approver"
							? "approver"
							: "employee"
					}`,
				}
			);
			let currentUserIndex = res.approvers.findIndex(
				(el) =>
					el.user_id === userInfo.user_id &&
					!el?.approved_rejected_by_admin &&
					!el?.updated_at
			);
			if (currentUserIndex > -1) {
				setPresentApproverIndex(currentUserIndex);
			}
			let isSuperior;
			if (
				res.user_type === "approver" ||
				res.user_type === "admin" ||
				isAdmin ||
				(res.user_type === "requestee" && currentUserIndex >= 0)
			) {
				isSuperior = true;
			}
			if (res.user_type === "approver") {
				if (
					currentUserIndex >= 0 &&
					res.approvers[currentUserIndex].status === "pending"
				) {
					if (
						currentUserIndex === 0 ||
						(currentUserIndex - 1 >= 0 &&
							res.approvers[currentUserIndex - 1].status ===
								"approved") ||
						(currentUserIndex - 1 >= 0 &&
							res.approvers[currentUserIndex - 1].status ===
								"pending" &&
							!res.approvers[currentUserIndex - 1].user_id)
					) {
						setIsAcceptPresent(true);
						isSuperior = true;
					}
				} else if (!isAdmin) {
					setDataForApproverResult(
						res,
						res.approvers.findIndex(
							(el) => el.user_id === userInfo.user_id
						)
					);
				}
			}
			if (res.user_type === "requestee") {
				if (res.status === "rejected") {
					let index = res.approvers.findIndex(
						(el) => el.status === "rejected"
					);
					if (index > -1) {
						setApproverUserDetails(res.approvers[index]);
						setApproverResult(!isAdmin);
						setAcceptType("reject");
					}
				}
				if (res.status === "approved") {
					setApproverUserDetails(
						res.approvers[res.approvers.length - 1]
					);
					setApproverResult(!isAdmin);
					setAcceptType("approve");
				}
				if (res.status === "pending") {
					if (currentUserIndex > -1) {
						if (
							res.approvers[currentUserIndex].status === "pending"
						) {
							if (
								currentUserIndex === 0 ||
								(currentUserIndex - 1 >= 0 &&
									res.approvers[currentUserIndex - 1]
										.status === "approved") ||
								(currentUserIndex - 1 >= 0 &&
									res.approvers[currentUserIndex - 1]
										.status === "pending" &&
									!res.approvers[currentUserIndex - 1]
										.user_id)
							) {
								setIsAcceptPresent(true);
								isSuperior = true;
							}
						} else {
							setDataForApproverResult(
								res,
								res.approvers.findIndex(
									(el) => el.user_id === userInfo.user_id
								)
							);
						}
					}
				}
			}
			if (isSuperior) {
				setIsSuperior(true);
				setShowAdditionalInfo(true);

				setSuperiorDataset([
					{
						text: "REQUESTED BY",
						value: getImageWithName(
							res?.user_name,
							res?.user_image
						),
						noMargin: true,
					},
					{
						text: "DESIGNATION",
						value: (
							<OverlayTrigger
								placement="top"
								overlay={
									<BootstrapTooltip>
										{res?.user_designation}
									</BootstrapTooltip>
								}
							>
								<div className="truncate_request_overview_data ">
									{capitalizeFirstLetter(
										res?.user_designation
									)}
								</div>
							</OverlayTrigger>
						),
						noMargin: true,
					},
					{
						text: "DEPARTMENT",
						value: (
							<OverlayTrigger
								placement="top"
								overlay={
									<BootstrapTooltip>
										{res?.user_department}
									</BootstrapTooltip>
								}
							>
								<div className="truncate_request_overview_data ">
									{capitalizeFirstLetter(
										res?.user_department
									)}
								</div>
							</OverlayTrigger>
						),
						noMargin: true,
					},
					{
						text: "REQUESTED ON",
						value: dayjs(res?.requested_on).format("D MMM YYYY"),
						noMargin: true,
					},
					{
						text: "No of Licenses",
						value: getListOfPeople(
							res?.quantity,
							res?.users,
							userInfo
						),
						noMargin: true,
					},
					{
						text: "Application Role",
						value: res?.request_role || "-",
						noMargin: true,
					},
					{
						text: " Duration",
						value: res?.subscription_duration_value
							? `${res?.subscription_duration_value} ${res?.subscription_duration_term}`
							: "-",
						noMargin: true,
					},
				]);
			} else {
				setShowAdditionalInfo(false);
			}
			let isEdit;
			if (
				currentUserIndex >= 0 &&
				!isAdmin &&
				res.approvers[currentUserIndex].status === "pending"
			) {
				if (
					currentUserIndex === 0 ||
					(currentUserIndex - 1 >= 0 &&
						res.approvers[currentUserIndex - 1].status ===
							"approved") ||
					(currentUserIndex - 1 >= 0 &&
						res.approvers[currentUserIndex - 1].status ===
							"pending" &&
						!res.approvers[currentUserIndex - 1].user_id)
				) {
					isEdit = true;
					setEditPresent(true);
				}
			}
			if (res.final_status === "cancelled") {
				setEditPresent(false);
				setIsAcceptPresent(false);
			}

			handleDataSet(res, isEdit, isSuperior);
			setLogs([...res.approvers]);
			setLoading(false);
			fetchAdminActions(res);
		});
		// .catch((err) => {
		// 	setLoading(false);
		// 	TriggerIssue("Error in getting license request overview", err);
		// });
	};

	const fetchAdminActions = (res) => {
		let tempPendingUser;

		if (isAdmin && res.final_status !== "auto-rejected") {
			tempPendingUser = findPendingUser(res.approvers);
			setPendingUser(tempPendingUser);
		}
		let tempRejectedUser;
		if (isAdmin) {
			if (res.final_status === "rejected") {
				tempRejectedUser = findRejectedUser(res.approvers);
				if (tempRejectedUser?.user_id) {
					setShowOverride(true);
					setApproverUserDetails(tempRejectedUser);
					setApproverResult(true);
					setAcceptType("reject");
					setRejectedUser(tempRejectedUser);
				}
			}
			if (res.final_status === "auto-rejected") {
				setShowOverride(true);
				setApproverResult(true);
			}
		}
	};

	const findPendingUser = (data) => {
		let index = data.findIndex(
			(el) =>
				el.status === "pending" &&
				!el?.approved_rejected_by_admin &&
				el.user_id
		);
		if (index > -1 && data[index].user_id !== userInfo.user_id) {
			return data[index];
		}
		return {};
	};

	const findRejectedUser = (data) => {
		let index = data.findIndex(
			(el) => el.status === "rejected" && !el?.approved_rejected_by_admin
		);
		if (index > -1) {
			setRejectedIndex(index);
			return data[index];
		}
		return {};
	};

	const handleDataSet = (res, editPresent, isSuperior) => {
		setDataset([
			{
				text: "Application",
				value: getImageWithName(res?.app_name, res?.app_logo),
				noMargin: true,
			},
			{
				text: "License Name",
				value: res?.license_name || "-",
				noMargin: true,
				editPresent: editPresent,
				editComponent: (index) => {
					return (
						<LicenseCostEditComponent
							setData={setData}
							data={res}
							handleEditState={() => handleEditState(index)}
							index={index}
							updateFunc={updateRequestLicense}
							comp={"name"}
							handleDataSet={(res) =>
								handleDataSet(
									res,
									editPresent,
									isSuperior,
									adminArr
								)
							}
						></LicenseCostEditComponent>
					);
				},
			},
			{
				text: "Cost / License",
				value: getCostText(res),
				noMargin: true,
				editPresent: editPresent,
				editComponent: (index) => {
					return (
						<LicenseCostEditComponent
							setData={setData}
							data={res}
							handleEditState={() => handleEditState(index)}
							index={index}
							updateFunc={updateRequestLicense}
							comp={"cost"}
							handleDataSet={(res) =>
								handleDataSet(
									res,
									editPresent,
									isSuperior,
									adminArr
								)
							}
						></LicenseCostEditComponent>
					);
				},
			},
			{
				text: "Subscription Duration",
				value: res?.subscription_duration_value
					? `${res?.subscription_duration_value} ${res?.subscription_duration_term}`
					: "-",
				editPresent: editPresent,
				noMargin: true,
				editURL: true,
			},
			{
				text: "Requested On",
				value: dayjs(res?.requested_on).format("D MMM YYYY, HH:mm"),
				noMargin: true,
			},
			{
				text: "No of Licenses",
				value: getListOfPeople(res?.quantity, res?.users, userInfo),
				editPresent: editPresent,
				editURL: true,
				noMargin: true,
			},
			{
				text: "Application Role",
				value: res?.request_role || "-",
				noMargin: true,
			},
		]);
	};

	const hasUnsavedApprovers = useCallback(
		() => !!approvers.find((item) => item.isLocal),
		[approvers]
	);
	const setDataForApproverResult = (res, index, status) => {
		setApproverUserDetails({
			...res.approvers[index],
			youPresent: true,
		});
		setAcceptType(
			status
				? status
				: res.approvers[index].status === "approved"
				? "approve"
				: "reject"
		);
		setApproverResult(true);
	};
	const getCost = (data) => {
		let costpermonth = data?.license_cost || 0;
		if (data?.per_license_term === "years") {
			costpermonth = data?.license_cost * (1 / 12);
		}
		let value =
			(data?.quantity || 1) *
			costpermonth *
			data?.subscription_duration_value;
		if (data?.subscription_duration_term === "years") {
			value = value * 12;
		}
		return value;
	};

	const viewMoreAccordion = (el) => {
		return (
			<Accordion className="w-100 border-0 m-auto">
				<Card
					className={`p-0 w-100 ml-auto mr-auto ml-2 mr-2 border-0 ${
						acceptType === "approve"
							? "background_glow_green"
							: "background_orange"
					}  `}
				>
					<Accordion.Collapse eventKey="0" className="">
						<Card.Body className="p-2 font-11 m-0 pl-0 pr-0 pb-3">
							<div>{el}</div>
						</Card.Body>
					</Accordion.Collapse>
					<Accordion.Toggle
						as={Card.Header}
						onClick={() => {
							setToggleState(!toggleState);
						}}
						className={`p-1 d-flex border-0  cursor-pointer`}
						variant="link"
						eventKey="0"
					>
						<div className="mr-1 grey-1 font-11 border-0">
							{toggleState ? "View Less" : "Know More"}
						</div>
					</Accordion.Toggle>
				</Card>
			</Accordion>
		);
	};

	const handleEditState = (key) => {
		setEditState((el) => {
			return { ...el, [key]: !el[key] };
		});
	};

	const handleFinalStateAfterChangeStatus = () => {
		setLoadingChangeStatus(false);
		setShowApproveModal(false);
		setIsAcceptPresent(false);
		setNote();
		setShowOverride(false);
		setPendingUser();
		setRejectedUser();
		setProcureStatus();
		fetchOverviewData();
		dispatch(clearAllV2DataCache("requests"));
		dispatch(clearAllV2DataCache("approvals"));
		dispatch(clearAllV2DataCache("pending"));
		dispatch(clearAllV2DataCache("completed"));
	};

	const handleChangeStatus = (status) => {
		let tempObj = {
			request_license_id: id,
			status: status === "approve" ? "approved" : "rejected",
			notes: note,
		};
		setLoadingChangeStatus(true);
		changeStatusOfLicenseRequest(tempObj)
			.then((res) => {
				if (res.status === "success") {
					trackActionSegment(
						`Approval request - ${
							status === "approve" ? "approved" : "rejected"
						}`,
						{
							currentCategory: window.location.pathname.includes(
								"user"
							)
								? "Employee View"
								: "Admin View",
							currentPageName: "Request Summary",
						}
					);
					setDataForApproverResult(
						data,
						presentApproverIndex,
						status
					);

					handleFinalStateAfterChangeStatus();
				}
			})
			.catch((err) => {
				setLoadingChangeStatus(false);
			});
	};

	const handleChangeApprovedStatus = (status) => {
		let tempObj = {
			request_license_id: id,
			status: status,
			notes: note,
		};
		setLoadingChangeStatus(true);

		performStatusChangeFromAdminBoard(id, tempObj).then((res) => {
			trackActionSegment(
				`Approval request - admin ${
					status === "completed"
						? "procurement completed"
						: status === "procure-cancelled"
						? "procurement cancelled"
						: "undo procurement cancelled"
				} `,
				{
					currentCategory: "Admin View",
					currentPageName: "Request Summary",
				}
			);
			handleFinalStateAfterChangeStatus();
		});
	};
	const handleOnBehalfAction = (status, type, user_id) => {
		let tempObj = {
			approver_id: user_id,
			notes: note,
			status: status === "approve" ? "approved" : "rejected",
			action_type: type,
		};
		setLoadingChangeStatus(true);
		performActionOnBehalfOfAdmin(id, tempObj)
			.then((res) => {
				if (res) {
					trackActionSegment(
						`Approval request - admin ${
							status === "approve" ? "approved" : "rejected"
						} on behalf`,
						{
							currentCategory: "Admin View",
							currentPageName: "Request Summary",
						}
					);
					setApproverResult(false);
					handleFinalStateAfterChangeStatus();
				}
			})
			.catch((err) => {
				setLoadingChangeStatus(false);
			});
	};

	const handleCostChange = (license) => {
		let payload = {};
		let tempPeriod = license.tier_is_per_month
			? "months"
			: license.tier_is_billed_annual
			? "years"
			: license.period
			? license.period
			: "months";
		payload["license_name"] = license.tier_name;
		if (license._id) {
			payload["license_id"] = license._id;
		}
		payload["type"] = "license";
		payload["cost_per_item"] = {
			currency: license.tier_currency,
			amount: license.tier_pricing_value,
			complete_term: false,
			frequency: 1,
			period: tempPeriod,
		};
		updateRequestLicense(payload, id)
			.then((res) => {
				fetchOverviewData();
			})
			.catch((err) => {
				TriggerIssue(
					"error updating license details of a request",
					err
				);
			});
	};

	const hitActionAPI = () => {
		let tempReq = {};
		setStepAction("three");
		// overrideAutoReject(id, { ...actionReqData, notes: note }).then(
		// 	(res) => {
		// 		console.log(res);
		// 		setStepAction("three");
		// 	}
		// );
	};

	return (
		<>
			{loading ? (
				<>
					<LoaderPage></LoaderPage>
				</>
			) : (
				<>
					<div
						className="d-flex flex-column"
						style={{
							overflow: scroll ? "auto" : "hidden",
						}}
					>
						<Card className="request-license-header-wrapper">
							<div
								className="d-flex align-items-center"
								style={{ width: "100%" }}
							>
								<div className="ml-2">
									<img
										className="cursor-pointer"
										width={16}
										src={backarrow}
										onClick={() => {
											if (isAdmin) {
												history.push(
													"/workflows/apprequisition#pending"
												);
											} else {
												history.push(
													"/user/app/requests#requests"
												);
											}
										}}
									/>
								</div>
								<div
									className="ml-2"
									style={{ minWidth: "180px" }}
								>
									{`Request For ${data?.app_name}`}
								</div>
								<Button
									type="link"
									style={{
										border: "1px solid #2266E2",
										width: "fit-content",
									}}
									className="cursor-pointer ml-auto"
									onClick={(e) => {
										// dispatch(preventScroll());
										setShowModal(true);
										trackActionSegment(
											"Application request - changelog viewed",
											{
												currentCategory:
													window.location.pathname.includes(
														"user"
													)
														? "Employee View"
														: "Admin View",
												currentPageName:
													"Request Summary",
											}
										);
									}}
								>
									View Changelog
								</Button>
							</div>
						</Card>
						<div className="screen_wrapper_request_license d-flex">
							<div
								className="d-flex flex-column"
								style={{
									width: "calc(100% - 468px)",
								}}
							>
								{approverResult && (
									<>
										<div
											className="w-100 d-flex mb-3"
											style={{
												padding: "13px 20px",
												backgroundColor:
													acceptType === "approve"
														? "rgba(95, 207, 100, 0.12)"
														: "#FBEFEB",
												height: "fit-content",
												alignItems: "flex-start",
											}}
										>
											<img
												src={
													acceptType === "approve"
														? approverequest
														: rejectrequest
												}
											></img>
											<div className="d-flex flex-column justify-content-start ml-2 w-100">
												<div className="d-flex align-items-center font-14 black-1 w-100">
													{data?.final_status ===
													"auto-rejected" ? (
														<div className="d-flex flex-column">
															This request has
															been auto rejected
															by rule
															<div className="font-10 grey-1">{`Rule Name - ${data?.rule_name}`}</div>
														</div>
													) : (
														<>
															<div className="">{`This request has been ${
																acceptType ===
																"approve"
																	? "approved"
																	: "rejected"
															} by `}</div>
															<div className="bold-600 ml-1">
																{`${
																	approverUserDetails?.designation
																		? approverUserDetails?.designation
																		: ""
																} ${
																	approverUserDetails?.user_name
																}`}
															</div>
														</>
													)}

													{approverUserDetails?.youPresent && (
														<div className="ml-1 bold-600">
															(You)
														</div>
													)}
													{/* {showOverride && (
														<>
															<div className="ml-auto">
																<Button
																	onClick={() => {
																		setShowApproveModal(
																			true
																		);
																	}}
																	style={{
																		border: "1px solid #EE8F6E",
																		background:
																			"#FFFFFF",
																		height: "40px",
																		color: " #FE6955",
																		marginLeft:
																			"10px",
																	}}
																	type={
																		"link"
																	}
																>
																	Override
																	Rejection
																</Button>
															</div>
														</>
													)} */}
												</div>
												{approverUserDetails?.notes &&
													viewMoreAccordion(
														approverUserDetails?.notes
													)}
											</div>
										</div>
									</>
								)}
								{pendingUser?.user_id && (
									<>
										<div
											className="w-100 d-flex mb-3"
											style={{
												padding: "13px 20px",
												backgroundColor:
													"rgba(133, 155, 169, 0.1)",
												height: "fit-content",
												alignItems: "flex-start",
											}}
										>
											<img src={hourglass}></img>
											<div className="d-flex flex-column ml-2">
												<div className="font-14">
													Awaiting approval by{" "}
													<span className="bold-600">
														{pendingUser?.user_name}
													</span>
												</div>
												<div className="mt-1 font-8 grey-1">{`You can take action on behalf of ${pendingUser.user_name}`}</div>
											</div>
											<div className="d-flex ml-auto align-items-center">
												<Button
													type="primary"
													onClick={() => {
														setShowApproveModal(
															true
														);
														setAcceptType(
															"approve"
														);
													}}
												>
													Approve Request
												</Button>
												<Button
													onClick={() => {
														setShowApproveModal(
															true
														);
														setAcceptType("reject");
													}}
													style={{
														border: "0px",
														background: "#FFFFFF",
														height: "40px",
														color: " #FE6955",
														marginLeft: "10px",
													}}
													type={"link"}
												>
													Reject Request
												</Button>
												<img
													onClick={() => {
														if (sendingReminder) {
														} else {
															setSendingReminder(
																true
															);
															sendReminderToApprover(
																data._id,
																{
																	approverId:
																		pendingUser.user_id,
																}
															)
																.then((res) => {
																	setSendingReminder(
																		false
																	);
																	toast(
																		<DefaultNotificationCard
																			notification={{
																				title: "Reminder Sent",
																				description:
																					"Email successfully sent to the approver.",
																			}}
																		/>
																	);
																	setShow(
																		false
																	);
																})
																.catch(
																	(err) => {
																		setShow(
																			false
																		);
																		ApiResponseNotification(
																			{
																				title: "Error in sending email to the approver",
																				responseType:
																					apiResponseTypes.ERROR,
																				errorObj:
																					err,
																			}
																		);
																	}
																);
														}
													}}
													src={sendreminder}
													className="ml-2 cursor-pointer"
												></img>
											</div>
										</div>
									</>
								)}
								{isAdmin &&
									(data.final_status === "approved" ||
										data.final_status ===
											"procure-cancelled") && (
										<>
											<div
												className="w-100 d-flex mb-3"
												style={{
													padding: "13px 20px",
													backgroundColor:
														data.final_status ===
														"approved"
															? "rgba(90, 186, 255, 0.12)"
															: "rgba(254, 105, 85, 0.1)",
													height: "fit-content",
													alignItems: "flex-start",
												}}
											>
												<img
													src={
														data.final_status ===
														"procure-cancelled"
															? rejectrequest
															: hourglass
													}
												></img>
												{data.final_status ===
												"approved" ? (
													<div className="d-flex flex-column ml-2">
														<div className="font-14">
															This request has
															been
															<span className="bold-600 ml-1">
																Approved
															</span>
														</div>
														<div className="mt-1 font-8 grey-1">{`A procurement task has beek assigned to ${
															data?.procure_user
																?.user_name
														} due on ${dayjs(
															data?.procure_user
																?.due_date
														).format(
															"D MMM YYYY"
														)}. `}</div>
													</div>
												) : (
													<>
														<div className="d-flex flex-column ml-2">
															<div className="font-14 ">
																<span className="bold-600">
																	Procurement
																	was
																	cancelled
																</span>

																<span className=" ml-1">
																	for this
																	request.
																</span>
															</div>
															<div className="mt-1 font-8 grey-1">{`License procurement was cancelled on ${dayjs(
																data
																	?.procure_user
																	?.due_date
															).format(
																"D MMM YYYY"
															)}. `}</div>
														</div>
													</>
												)}

												<div className="d-flex ml-auto align-items-center">
													{data.final_status ===
													"approved" ? (
														<>
															<Button
																type="primary"
																onClick={() => {
																	setShowApproveModal(
																		true
																	);
																	setProcureStatus(
																		"completed"
																	);
																}}
															>
																Mark as
																completed
															</Button>
															<Button
																onClick={() => {
																	setShowApproveModal(
																		true
																	);
																	setProcureStatus(
																		"procure-cancelled"
																	);
																}}
																style={{
																	border: "0px",
																	background:
																		"#FFFFFF",
																	height: "40px",
																	color: " #FE6955",
																	marginLeft:
																		"10px",
																}}
																type={"link"}
															>
																Cancel
															</Button>
															{/* <img
																src={
																	sendreminder
																}
																className="ml-2 cursor-pointer"
															></img> */}
														</>
													) : (
														<>
															<Button
																onClick={() => {
																	handleChangeApprovedStatus(
																		"undo-procure-cancelled"
																	);
																}}
																style={{
																	border: "0px",
																	background:
																		"#FFFFFF",
																	height: "40px",
																	color: "#717171",
																	marginLeft:
																		"10px",
																	width: "170px",
																}}
																type={"link"}
															>
																{loadingChangeStatus ? (
																	<Spinner
																		animation="border"
																		role="status"
																		variant="primary"
																		size="sm"
																		className="ml-2"
																		style={{
																			borderWidth: 2,
																		}}
																	>
																		<span className="sr-only">
																			Loading...
																		</span>
																	</Spinner>
																) : (
																	"Undo Cancellation"
																)}
															</Button>
														</>
													)}
												</div>
											</div>
										</>
									)}
								{showAdditionalInfo && (
									<>
										<AdditionalInfoContainer
											data={data}
										></AdditionalInfoContainer>
									</>
								)}
								{isSuperior && (
									<>
										<div
											style={{
												height: "fit-content",
												padding: "33px 30px",
											}}
											className="d-flex flex-column background-color-white border-radius-4 w-100 mb-2"
										>
											<div className=" d-flex align-items-center">
												<div
													className="font-14 bold-700 black-1 o-7"
													style={{
														alignSelf: "flex-start",
													}}
												>
													REQUEST DETAILS
												</div>
												{editPresent && (
													<div
														className="ml-auto primary-color font-12 bold-600 cursor-pointer"
														onClick={() => {
															history.push({
																pathname: `/user/license/request/edit/${id}`,
																state: {
																	data: data,
																},
															});
														}}
													>
														Edit Request
													</div>
												)}
											</div>
											<hr
												style={{
													margin: "10px 0px 20px",
												}}
											></hr>
											<div className="request-overview-superior-grid">
												{superiorDataset?.map(
													(item, index) => (
														<div
															key={index}
															className="d-flex flex-column justify-content-between"
															style={{
																height: "55px",
															}}
														>
															<div className="d-flex align-items-center">
																<div className="grey-1 o-5 font-11">
																	{item.text}
																</div>
															</div>
															<div className="d-flex align-items-center">
																<img
																	src={
																		item.src
																	}
																></img>
																<div
																	className={`font-16 bold-500 black-1  ${
																		item.noMargin
																			? " "
																			: "ml-2"
																	}`}
																	style={{
																		...item.style,
																	}}
																>
																	{item.value}
																</div>
															</div>
														</div>
													)
												)}
											</div>
											{data?.requirement_text && (
												<>
													<div className="grey-1 o-5 font-11 mt-3">
														REASON FOR REQUEST
													</div>
													<div className="font-14 black-1 mt-2">
														{data?.requirement_text}
													</div>
												</>
											)}
											{Array.isArray(data?.documents) &&
											data?.documents?.length ? (
												<>
													<div className="grey-1 o-5 font-11 mt-3">
														SUPPORTING DOCUMENTS
													</div>
												</>
											) : null}
											<div className="d-flex flex-wrap align-items-center mt-1">
												{Array.isArray(
													data?.documents
												) && data?.documents?.length
													? data?.documents?.map(
															(doc) => {
																const extension =
																	SUPPORTED_FILE_FORMATS.includes(
																		"." +
																			_.last(
																				doc?.type?.split(
																					"/"
																				)
																			)
																	)
																		? _.last(
																				doc?.type?.split(
																					"/"
																				)
																		  )
																		: _.last(
																				doc?.name?.split(
																					"."
																				)
																		  );
																return (
																	<>
																		<div
																			className="overview_request_doc_pill mr-1 mb-1 cursor-pointer"
																			onClick={() => {
																				window.open(
																					unescape(
																						doc.source_url
																					)
																				);
																			}}
																		>
																			<img
																				className="mr-2"
																				src={
																					extension ===
																					"csv"
																						? csv
																						: extension ===
																						  "pdf"
																						? pdf
																						: documentIcon
																				}
																				height={
																					16
																				}
																				width={
																					14
																				}
																			/>
																			<OverlayTrigger
																				overlay={
																					<Tooltip>
																						{
																							doc.name
																						}
																					</Tooltip>
																				}
																			>
																				<div className="font-12 bold-600 truncate_request_license_name">
																					{
																						doc.name
																					}
																				</div>
																			</OverlayTrigger>
																		</div>
																	</>
																);
															}
													  )
													: null}
											</div>

											{Array.isArray(
												data?.other_subscription_users
											) &&
												data?.other_subscription_users
													?.length && (
													<Accordion className="w-100 border-0 m-auto">
														<Card
															className={`p-0 w-100 mt-2 ml-auto mr-auto ml-2 mr-2 border-0`}
														>
															<Accordion.Toggle
																as={Card.Header}
																onClick={() => {
																	setExpandUserCard(
																		!expandUserCard
																	);
																}}
																className={`p-1 d-flex border-0 cursor-pointer`}
																variant="link"
																eventKey="0"
															>
																<div className="d-flex">
																	<div className="p-1 mr-1 grey-1 font-12 border-0">
																		USERS
																		INCLUDED
																		IN THIS
																		REQUEST
																	</div>
																	<div></div>
																</div>
															</Accordion.Toggle>

															<Accordion.Collapse
																eventKey="0"
																className=""
															>
																<Card.Body
																	className="p-2 font-11 m-0 pl-0 pr-0 pb-3"
																	style={{
																		background:
																			"#f5f6f9",
																	}}
																>
																	<div className="d-flex flex-wrap align-items-center">
																		{data?.other_subscription_users?.map(
																			(
																				user
																			) => (
																				<div className="mr-3 mb-2 d-flex align-items-center">
																					<GetImageOrNameBadge
																						url={
																							user.profile_img
																						}
																						name={
																							user.name
																						}
																						height={
																							16
																						}
																						width={
																							16
																						}
																					/>
																					<OverlayTrigger
																						placement="top"
																						overlay={
																							<Tooltip>
																								{
																									user.name
																								}
																							</Tooltip>
																						}
																					>
																						<div className="font-12 text-truncate ml-1">
																							{
																								user.name
																							}
																						</div>
																					</OverlayTrigger>
																				</div>
																			)
																		)}
																	</div>
																</Card.Body>
															</Accordion.Collapse>
														</Card>
													</Accordion>
												)}
										</div>
									</>
								)}
								{!isSuperior && (
									<>
										<div
											style={{
												height: "fit-content",
												padding: "33px 30px",
											}}
											className="d-flex flex-column background-color-white border-radius-4 w-100"
										>
											<div className="d-flex ">
												<div
													className={`${
														location?.state?.isAdmin
															? "request-overview-admin-grid"
															: "request-overview-grid"
													} w-100`}
												>
													{dataset?.map(
														(item, index) => (
															<div
																key={index}
																className="d-flex flex-column justify-content-between"
																style={{
																	height: "55px",
																}}
															>
																<div className="d-flex align-items-center">
																	<div className="grey-1 o-5 font-11">
																		{
																			item.text
																		}
																	</div>
																</div>
																<>
																	<div className="d-flex align-items-center">
																		<img
																			src={
																				item.src
																			}
																		></img>
																		<div
																			className={`font-16 bold-600 black-1  ${
																				item.noMargin
																					? " "
																					: "ml-2"
																			}`}
																			style={{
																				...item.style,
																			}}
																		>
																			{
																				item.value
																			}
																		</div>
																	</div>
																</>
															</div>
														)
													)}
												</div>
											</div>
											{data?.requirement_text && (
												<>
													<div className="grey-1 o-5 font-11 mt-3">
														Description
													</div>
													<div className="font-14 black-1 mt-2">
														{data?.requirement_text}
													</div>
												</>
											)}
										</div>
									</>
								)}
								{!data?.license_name && isAdmin && (
									<>
										<div
											style={{
												height: "fit-content",
												padding: "33px 30px",
											}}
											className="d-flex flex-column background-color-white border-radius-4 mt-3 w-100 "
										>
											<div className=" d-flex align-items-center">
												<div
													className="font-14 bold-700 black-1 o-7"
													style={{
														alignSelf: "flex-start",
													}}
												>
													REQUESTED LICENSE
												</div>
											</div>
											<div className="ml-2 mt-2 font-12 grey-1 o-7">
												No License Added
											</div>
										</div>
									</>
								)}
								{data?.license_name && (
									<div
										style={{
											height: "fit-content",
											padding: "33px 30px",
										}}
										className="d-flex flex-column background-color-white border-radius-4 mt-3 w-100 "
									>
										<div className=" d-flex align-items-center">
											<div
												className="font-14 bold-700 black-1 o-7"
												style={{
													alignSelf: "flex-start",
												}}
											>
												{data.license_name
													? "REQUESTED LICENSE"
													: "REQUESTED APP"}
											</div>

											{editPresent && (
												<div
													className="ml-auto primary-color font-12 bold-600 cursor-pointer"
													onClick={() => {
														history.push({
															pathname: `/user/license/request/edit/${id}`,
															state: {
																data: data,
															},
														});
													}}
												>
													Edit Request
												</div>
											)}
										</div>
										<hr
											style={{ margin: "15px 10px " }}
											className="w-100"
										></hr>
										<div className="d-flex align-items-center">
											<div
												className="d-flex align-items-center justify-content-center"
												style={{
													height: "75px",
													width: "75px",
													borderRadius: "7px",
													background: "#F6F7FC",
												}}
											>
												<GetImageOrNameBadge
													name={data?.app_name}
													url={data?.app_logo}
													width={45}
													height={"auto"}
												></GetImageOrNameBadge>
											</div>
											<div className="d-flex flex-column ml-3">
												<div className="bold-600 font-16">
													{data?.license_name ||
														data?.app_name}
												</div>
												<div className="d-flex align-items-center mt-1">
													<div className="font-10 grey-1 mr-2">
														DURATION
													</div>
													<div className=" font-12 grey-1 bold-600">{`${
														data?.subscription_duration_value ||
														1
													} ${
														term[
															data
																?.subscription_duration_term
														]
													} `}</div>
												</div>
												{isSuperior ? (
													data?.license_in_org ? (
														<>
															<div className="d-flex align-items-center mt-1">
																<img
																	src={
																		discoverLogo
																	}
																></img>
																<div className="glow_blue font-11 bold-500 ">
																	License Type
																	is already
																	used in your
																	Organization
																</div>
															</div>
														</>
													) : (
														<div className="d-flex align-items-center mt-1">
															<img
																src={
																	yellowexclamation
																}
															></img>
															<div className=" font-11 bold-500 text_orange ">
																License Type is
																not used in your
																Organization
															</div>
														</div>
													)
												) : null}
											</div>
											{/* <div className="ml-auto d-flex flex-column justify-content-center">
												<div className="font-16 bold-500">
													{getCostText(data)}
												</div>
												<div className="mt-2 grey-1 font-10">
													PER LICENSE
												</div>
											</div> */}
										</div>
										<hr
											style={{ margin: "15px 10px " }}
											className="w-100"
										></hr>
										<div
											className="d-flex align-items-center"
											style={{ paddingLeft: "50%" }}
										>
											<div className="font-14 grey">
												No. of Licenses Requested
											</div>
											<div className="ml-auto">
												{data?.need_more_licenses
													? data?.quantity || 1
													: 1}
											</div>
										</div>
										<hr
											style={{ margin: "15px 10px " }}
											className="w-100 o-5"
										></hr>
										{/* <div
											className="d-flex align-items-center"
											style={{ paddingLeft: "50%" }}
										>
											<div className="font-14 grey">
												TOTAL COST FOR REQUEST
											</div>
											<div className="ml-auto">
												<div className="d-flex flex-column">
													<div
														className="font-17 bold-600 black-1"
														style={{
															textAlign: "right",
														}}
													>
														{kFormatter(
															getCost(data),
															data?.currency
														)}
													</div>
													<div className=" font-12 grey-1 o-5">{`${
														data?.subscription_duration_value ||
														1
													} ${
														term[
															data
																?.subscription_duration_term
														]
													} `}</div>
												</div>
											</div>
										</div> */}
									</div>
								)}
								{/* {data?.is_license_included_in &&
									data?.license_name &&
									isSuperior && (
										<>
											<hr style={{ margin: "0px" }}></hr>
											<div
												style={{
													height: "fit-content",
													padding: "23px 30px",
												}}
												className="d-flex flex-column background-color-white border-radius-4 w-100 "
											>
												<div
													className="font-14 bold-700 black-1 o-7"
													style={{
														alignSelf: "flex-start",
													}}
												>
													LICENSE IS INCLUDED IN
												</div>
												<hr
													style={{
														margin: "15px 10px ",
													}}
													className="w-100 "
												></hr>
												<div
													className="d-flex flex-column"
													style={{
														background: "#FAFBFC",
														borderRadius: "4px",
														padding: "17px 10px",
													}}
												>
													<div className="d-flex align-items-center">
														<GetImageOrNameBadge
															name={
																data?.app_name
															}
															url={data?.app_logo}
															width={26}
															height={"auto"}
														></GetImageOrNameBadge>
														<div className="font-16 bold-600 ml-2">
															{data
																?.included_license_data
																?.contract_name ||
																"Contract Name"}
														</div>
														<div
															className="d-flex align-items-center glow_blue font-9 ml-2 bold-600"
															style={{
																background:
																	"rgba(90, 186, 255, 0.1)",
																borderRadius:
																	"2px",

																padding: "5px ",
															}}
														>
															{capitalizeFirstLetter(
																data
																	.included_license_data
																	?.type
															)}
														</div>
													</div>
													<hr
														style={{
															margin: "15px 0px ",
														}}
														className="w-100"
													></hr>
													<RequestContractDetails
														loading={loading}
														entity={
															data
																?.included_license_data
																?.type
														}
														data={
															data?.included_license_data
														}
													></RequestContractDetails>
												</div>
											</div>
										</>
									)} */}
								{/* {isSuperior &&
									!loading &&
									Array.isArray(data?.alternate_licenses) &&
									data?.alternate_licenses.length > 0 &&
									data?.license_name && (
										<>
											<AlternateLicenseTypes
												data={data}
												loading={loading}
												editPresent={editPresent}
												onButtonClick={handleCostChange}
												inOrg={data?.license_in_org}
											></AlternateLicenseTypes>
										</>
									)} */}
								{isSuperior &&
									!loading &&
									Array.isArray(data?.org_app_license) &&
									data?.org_app_license.length > 0 && (
										<>
											<div
												style={{
													height: "fit-content",
													padding: "33px 30px",
												}}
												className="d-flex flex-column background-color-white border-radius-4 mt-3 w-100 "
											>
												<div
													className="font-14 bold-700 black-1 o-7"
													style={{
														alignSelf: "flex-start",
													}}
												>
													LICENSES IN ORG
												</div>
												<hr
													style={{
														margin: "15px 10px ",
													}}
													className="w-100 "
												></hr>
												<div
													className="d-flex flex-row align-items-center"
													style={{
														overflowX: "auto",
														paddingBottom: "10px",
													}}
												>
													{data.org_app_license.map(
														(el) => (
															<div
																className="d-flex flex-column mr-2"
																style={{
																	minWidth:
																		"380px",
																	maxWidth:
																		"380px",
																	height: "130px",
																	background:
																		"rgba(246, 247, 252, 0.75)",
																	border: "1px solid #EBEBEB",
																	padding:
																		"20px 27px",
																}}
															>
																<div className="d-flex align-items-center">
																	<GetImageOrNameBadge
																		name={
																			data?.app_name
																		}
																		url={
																			data?.app_logo
																		}
																		width={
																			26
																		}
																		height={
																			"auto"
																		}
																	></GetImageOrNameBadge>
																	<div className="d-flex flex-column ml-1">
																		<OverlayTrigger
																			placement="top"
																			overlay={
																				<Tooltip>
																					{
																						el.license_name
																					}
																				</Tooltip>
																			}
																		>
																			<div className="font-16 bold-600 truncate_request_contract_name">
																				{
																					el.license_name
																				}
																			</div>
																		</OverlayTrigger>
																	</div>
																</div>

																<hr
																	style={{
																		border: "1px dashed #DDDDDD",
																		marginRight:
																			"0px",
																		marginLeft:
																			"0px",
																		margingTop:
																			"30px",
																		marginBottom:
																			"15px",
																	}}
																></hr>
																{el.contract_name && (
																	<>
																		<div className="d-flex align-items-center">
																			<OverlayTrigger
																				placement="top"
																				overlay={
																					<Tooltip>
																						{el?.contract_name ||
																							"Contract Name"}
																					</Tooltip>
																				}
																			>
																				<div className="font-16 bold-600 truncate_request_contract_name">
																					{el?.contract_name ||
																						"Contract Name"}
																				</div>
																			</OverlayTrigger>
																			<div
																				className="d-flex align-items-center glow_blue font-9 ml-2 bold-600"
																				style={{
																					background:
																						"rgba(90, 186, 255, 0.1)",
																					borderRadius:
																						"2px",

																					padding:
																						"5px ",
																				}}
																			>
																				{capitalizeFirstLetter(
																					el?.type
																				)}
																			</div>
																		</div>
																		<div className="d-flex align-items-center mt-1">
																			<div className="d-flex align-items-center">
																				<div className="grey-1 font-11">
																					Unassigned
																					:
																				</div>
																				<div className="grey-1 font-12 bold-600">
																					{el?.quantity -
																						el?.assigned_count >
																					0
																						? el?.quantity -
																						  el?.assigned_count
																						: "0"}
																				</div>
																			</div>
																			<div className="d-flex align-items-center ml-1">
																				<div className="grey-1 font-11">
																					Total
																					:
																				</div>
																				<div className="grey-1 font-12 bold-600">
																					{
																						el?.quantity
																					}
																				</div>
																			</div>
																		</div>
																	</>
																)}
															</div>
														)
													)}
												</div>
											</div>
										</>
									)}
								{isSuperior && (
									<>
										<SimilarAppsRequestOverview
											data={data}
										></SimilarAppsRequestOverview>
									</>
								)}
							</div>
							<div
								style={{
									width: "445px",

									height: "fit-content",
								}}
								className="ml-auto background-color-white border-radius-4 d-flex flex-column"
							>
								<div style={{ padding: "21px 26px 0px" }}>
									{isAcceptPresent && (
										<>
											<div className="d-flex flex-column">
												<div className="bold-600 font-16">
													Awaiting your approval
												</div>
												<hr
													style={{
														margin: "13px 0px 18px",
													}}
												></hr>
												<Button
													style={{ height: "40px" }}
													onClick={() => {
														setShowApproveModal(
															true
														);
														setAcceptType(
															"approve"
														);
													}}
												>
													Approve Request
												</Button>
												<Button
													onClick={() => {
														setShowApproveModal(
															true
														);
														setAcceptType("reject");
													}}
													style={{
														border: "0px",
														background:
															"rgba(255, 103, 103, 0.1)",
														height: "40px",
														color: " #FF6767",
														marginTop: "10px",
													}}
													type={"link"}
												>
													Reject Request
												</Button>
											</div>
										</>
									)}
									<div className="w-100 justify-content-between d-flex align-items-center mt-4">
										<div className="font-16 bold-600 black-1">
											Approvers
										</div>
										{isAdmin && (
											<>
												{data?.final_status ===
													"pending" &&
												!showAddApprovers ? (
													<div className="cursor-pointer">
														<img
															src={addUser}
															onClick={() =>
																setShowAddApprovers(
																	true
																)
															}
														/>
													</div>
												) : (
													<div>
														<span>
															<img
																src={cross}
																className="cursor-pointer"
																onClick={() => {
																	approversRef.current.clearLocalApprovers();
																	setShowAddApprovers(
																		false
																	);
																}}
															/>
														</span>
														{hasUnsavedApprovers() && (
															<>
																{approversSaving ? (
																	<Spinner
																		animation="border"
																		role="status"
																		variant="primary"
																		size="sm"
																		className="ml-2"
																		style={{
																			borderWidth: 2,
																		}}
																	/>
																) : (
																	<span className="ml-3">
																		<img
																			src={
																				tick
																			}
																			className="cursor-pointer"
																			onClick={() => {
																				setApproversSaving(
																					true
																				);
																				updateRequestLicenseApprovers(
																					{
																						approvers,
																					},
																					id
																				)
																					.then(
																						() => {
																							trackActionSegment(
																								`Approval request - add new approvers`,
																								{
																									currentCategory:
																										"Admin View",
																									currentPageName:
																										"Request Summary",
																								}
																							);
																							setApproversSaving(
																								false
																							);
																							fetchApprovers().then(
																								() => {
																									setShowAddApprovers(
																										false
																									);
																								}
																							);
																						}
																					)
																					.catch(
																						() => {
																							setApproversSaving(
																								false
																							);
																						}
																					);
																			}}
																		/>
																	</span>
																)}
															</>
														)}
													</div>
												)}
											</>
										)}
									</div>
									<hr style={{ margin: "13px 0px 9px" }}></hr>
									<ChangeLogContainer
										approversRef={approversRef}
										logs={logs}
										approvers={approvers}
										showStatus={
											data?.final_status !==
												"auto-rejected" &&
											data?.final_status !== "cancelled"
										}
										appId={data.app_id}
										userId={userInfo.user_id}
										isAddPresent={showAddApprovers}
										setApprovers={setApprovers}
										pendingUser={pendingUser}
										setShowApproveModal={
											setShowApproveModal
										}
										setAcceptType={setAcceptType}
										showOverride={showOverride}
										rejectedIndex={rejectedIndex}
										finalStatus={data?.final_status}
										data={data}
										fetchOverviewData={fetchOverviewData}
									></ChangeLogContainer>
								</div>

								<CommentsSection
									id={id}
									isSuperior={isSuperior}
								></CommentsSection>
							</div>
						</div>
					</div>
				</>
			)}

			{showModal && (
				<ChangeLogModal
					id={id}
					closeModal={() => setShowModal(false)}
					app_name={data?.app_name}
					app_image={data?.app_logo}
				></ChangeLogModal>
			)}
			{showApproveModal && (
				<Modal
					show={showApproveModal}
					onClose={() => {
						setShowApproveModal(false);
					}}
					footer={true}
					onOk={() => {
						if (pendingUser?.user_id) {
							handleOnBehalfAction(
								acceptType,
								"actiononbehalfof",
								pendingUser.user_id
							);
						} else if (showOverride) {
							if (data?.final_status === "auto-rejected") {
								setShowActionModal(true);
								setShowApproveModal(false);
							} else {
								handleOnBehalfAction(
									"approve",
									"override",
									rejectedUser.user_id
								);
							}
						} else if (data?.final_status === "approved") {
							handleChangeApprovedStatus(procureStatus);
						} else {
							handleChangeStatus(acceptType);
						}
					}}
					ok={`${
						data?.final_status === "approved"
							? "Continue"
							: `${capitalizeFirstLetter(
									showOverride ? "override" : acceptType
							  )} Request`
					}`}
					cancel={"Cancel"}
					submitInProgress={loadingChangeStatus}
					disableOkButton={loadingChangeStatus || !note}
					dialogClassName="modal-602w"
				>
					<div className="d-flex flex-column">
						<img
							className="ml-auto mr-auto"
							src={
								showOverride || acceptType === "approve"
									? orangeExclamation
									: redexclam
							}
							width={42}
							style={{ marginTop: "40px" }}
						></img>
						<div className="d-flex flex-column">
							<div
								style={{
									padding: "26px 30px 0px",
									color: "#222222",
									fontSize: "18px",
									fontWeight: "600",
								}}
								className="text-center"
							>
								{data.final_status === "approved"
									? procureStatus === "completed"
										? "You are about to mark this request as completed"
										: "You are about to cancel procurement for this request"
									: data.final_status === "auto-rejected"
									? "You are about to override this rejection "
									: showOverride
									? `You are about to override ${
											rejectedUser.user_name
									  } rejection for ${capitalizeFirstLetter(
											data?.app_name
									  )} license request `
									: `You are about to ${acceptType} the ${capitalizeFirstLetter(
											data?.app_name
									  )}  license request ${
											pendingUser?.user_id
												? `on behalf of ${pendingUser.user_name}`
												: ""
									  }`}
							</div>
							<div className="font-14 mb-3 black-1 text-center">
								Are you sure you want to continue?
							</div>
							<textarea
								className="sendprompt__customtextarea mb-2"
								style={{ alignSelf: "center", resize: "none" }}
								rows={4}
								maxLength={150}
								onChange={(e) => setNote(e.target.value)}
								value={note}
								placeholder="Please add a message"
							/>
						</div>
						<hr style={{ margin: "0px 10px" }}></hr>
					</div>
				</Modal>
			)}
			{showActionModal && (
				<Modal
					show={showActionModal}
					onHide={() => {
						setStepAction("zero");
						setShowActionModal(false);
						setNote("");
						setActionReqData({
							...actionReqData,
							playbook: null,
							on_approval_date: null,
							procure_user: null,
						});
					}}
					footer={true}
					hideCloseImage={true}
					onClose={() => {
						if (stepAction === "zero") {
							setStepAction("one");
							setActionReqData({
								...actionReqData,
								status: "approved",
							});
						}
						if (stepAction === "one") {
							setStepAction("zero");
							setActionReqData({
								...actionReqData,
								status: null,
							});
							setAction("assign_task");
						}
						if (stepAction === "two") {
							setStepAction("one");
						}
						if (stepAction === "three") {
							setNote("");
							setShowActionModal(false);
						}
						if (stepAction === "four") {
							setStepAction("three");
						}
						if (stepAction === "five") {
							setStepAction("four");
							setActionReqData({
								...actionReqData,
								playbook: null,
								procure_user: null,
							});
						}
					}}
					onOk={() => {
						if (stepAction === "zero") {
							setStepAction("one");
						}
						if (stepAction === "one") {
							setStepAction("two");
						}
						if (stepAction === "two") {
							hitActionAPI();
						}
						if (stepAction === "three") {
							setActionReqData({
								...actionReqData,
								on_approval_date: null,
								procure_user: null,
							});
							setStepAction("four");
						}
						if (stepAction === "four") {
							setStepAction("five");
						}
					}}
					ok={
						stepAction === "zero"
							? "Add Approvers"
							: stepAction === "two"
							? "Confirm"
							: stepAction === "three"
							? "Proceed"
							: "Continue"
					}
					cancel={
						stepAction === "zero"
							? "Mark as Approved"
							: stepAction === "three"
							? "No, Thanks"
							: "Go Back"
					}
					disableOkButton={stepAction === "one" && !action}
					dialogClassName="modal-602w"
				>
					{stepAction === "zero" && (
						<>
							<div className="d-flex flex-column align-items-center">
								<img
									src={action_step_zero}
									width={50}
									style={{ marginTop: "45px" }}
								></img>
								<div
									style={{
										color: "#222222",
										fontSize: "18px",
										fontWeight: "600",
									}}
									className="mt-2"
								>
									Do you want to initiate approval process for
									this request?
								</div>
								<div className="font-14 grey-1 mt-2">
									You can add approvers to the request or
									proceed to procurement
								</div>
							</div>
							<hr style={{ margin: "45px 0px 15px" }}></hr>
						</>
					)}
					{(stepAction === "one" ||
						stepAction === "two" ||
						stepAction === "four" ||
						stepAction === "five") && (
						<>
							<div
								className="d-flex flex-column align-items-center"
								style={{
									padding: "27px 0px",
									backgroundColor: "#F6F7FA",
								}}
							>
								<img
									src={
										stepAction === "four"
											? action_step_three
											: action_step_one
									}
									width={50}
									className="mb-1"
								></img>
								<div
									style={{
										color: "#222222",
										fontSize: "18px",
										fontWeight: "600",
									}}
								>
									{stepAction === "four" ||
									stepAction === "five"
										? "Select Offboarding Action"
										: "Select Approval Action"}
								</div>
							</div>
						</>
					)}
					{(stepAction === "one" || stepAction === "four") && (
						<div style={{ padding: "25px 66px" }}>
							<div className="grey-1 font-11 mb-1">
								{stepAction === "one"
									? "ON APPROVAL"
									: "OFFBOARDING ACTION"}
							</div>
							<select
								className="form-control  text-capitalize "
								as="select"
								onChange={(e) => setAction(e.target.value)}
								value={action}
							>
								<option value="assign_task">
									{stepAction === "one"
										? "Assign task to manually provision license"
										: "Assign task to manually de-provision license"}
								</option>
								<option value="run_playbook">
									{stepAction === "one"
										? "Run an Onboarding Playbook"
										: "Run an Offboarding Playbook"}
								</option>
							</select>
						</div>
					)}
					{stepAction === "two" || stepAction === "five" ? (
						<>
							{action === "assign_task" ? (
								<>
									<div style={{ padding: "25px 66px" }}>
										<div>
											{" "}
											<span className="assign_task_description mb-1">
												{stepAction === "two"
													? "ASSIGN TASK TO MANUALLY PROVISION LICENSE"
													: "ASSIGN TASK TO MANUALLY DE-PROVISION LICENSE"}
											</span>{" "}
											<AsyncTypeahead
												placeholder="Select User"
												fetchFn={searchUsers}
												onSelect={(selection) => {
													setActionReqData({
														...actionReqData,
														procure_user: selection,
													});
												}}
												requiredValidation={false}
												keyFields={{
													id: "user_id",
													image: "profile_img",
													value: "user_name",
													email: "user_email",
												}}
												allowFewSpecialCharacters={true}
												labelClassName="font-14 bold-600"
												onChange={(val) =>
													setActionReqData({
														...actionReqData,
														procure_user: null,
													})
												}
												defaultValue={
													actionReqData?.procure_user
												}
												className="mb-0"
											/>
										</div>
										<div className="d-flex">
											<span className="due_within_text">
												Due Within
											</span>
											<div className="d-flex align-items-center">
												<div className="w-50">
													<Form.Control
														className="w-50 m-2"
														type="number"
														value={
															actionReqData?.on_approval_date
														}
														onChange={(e) => {
															setActionReqData({
																...actionReqData,
																on_approval_date:
																	e.target
																		.value,
															});
														}}
													/>
												</div>{" "}
												<span className="ml-3">
													{" "}
													days
												</span>
											</div>
										</div>
									</div>
								</>
							) : (
								<>
									<div className="flex-fill border-radius-4 font-14 d-flex white-bg align-items-center justify-content-between mb-2  mt-2 pl-3 pr-3 pt-1 pb-1">
										<div className=" w-100 align-items-center">
											<div className=" d-flex align-items-between font-14 black-1">
												<div className="d-flex align-items-center run-playbook__title">
													{`Run A ${
														stepAction === "two"
															? "Onboarding"
															: "Offboarding"
													} Playbook`}
												</div>
											</div>
											<Dropdown
												dropdownWidth="100%"
												className="run-playbook__dropdown my-2"
												toggler={
													<div
														className="d-flex align-items-center justify-content-between border-1 border-radius-4"
														style={{
															height: "36px",
															padding: "4px",
														}}
													>
														<div>
															{actionReqData
																?.playbook
																?.workflowTemplateName ||
																"Select a playbook"}
														</div>
														<img
															src={arrowdropdown}
															style={{
																marginLeft:
																	"8px",
															}}
														/>
													</div>
												}
												options={offboardingworkflows}
												apiSearch={true}
												apiSearchCall={(
													query,
													cancelToken
												) =>
													searchTemplatesService(
														stepAction === "two"
															? "onboarding"
															: "offboarding",
														query,
														cancelToken
													)
												}
												apiSearchDataKey="data"
												optionFormatter={(option) =>
													BulkRunAPlaybookOptionFormatter(
														{
															playbook: option,
														}
													)
												}
												onOptionSelect={(option) => {
													option =
														new WorkflowTemplateSearchModel(
															option
														);
													setActionReqData({
														...actionReqData,
														playbook: option,
													});
													// dispatch(
													// 	setEditAutomationRule(
													// 		{
													// 			offboarding_playbook:
													// 				option,
													// 			has_offboarding_playbook: true,
													// 		}
													// 	)
													// );
												}}
												optionStyle={{
													padding: "0px !important",
													flexDirection: "column",
													width: "285px",
													minHeight: "60px",
													alignItems: "flex-start",
													paddingTop: "6px",
													paddingBottom: "6px",
												}}
												menuStyle={{
													width: "295px",
												}}
												searchBoxStyle={{
													width: "260px",
												}}
											/>
										</div>
									</div>
								</>
							)}
						</>
					) : null}
					{stepAction === "three" && (
						<>
							<div className="d-flex flex-column align-items-center">
								<img
									src={action_step_three}
									width={50}
									style={{ marginTop: "45px" }}
								></img>
								<div
									style={{
										color: "#222222",
										fontSize: "18px",
										fontWeight: "600",
									}}
									className="mt-2"
								>
									Do you want to configure offboarding
									actions?
								</div>
								<div className="font-14 grey-1 mt-2">
									You can select offboarding action to be run
									after approved license duration
								</div>
							</div>
							<hr style={{ margin: "45px 0px 15px" }}></hr>
						</>
					)}
				</Modal>
			)}
		</>
	);
}
