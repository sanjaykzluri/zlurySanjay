import React from "react";
import copy from "assets/applications/copy.svg";
import dragDrop from "assets/drag-drop.svg";
import rejected from "assets/employee/rejected.svg";
import greenTick from "assets/green_tick.svg";
import add from "assets/icons/plus-blue-circle-reverse.svg";
import optionsButton from "assets/optionsButton.svg";
import cross from "assets/reports/cross.svg";
import userRoleLogo from "assets/user_role.svg";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import caret from "components/Integrations/caret.svg";
import DefaultNotificationCard from "common/Notification/PusherNotificationCards/DefaultNotificationCard";

import dayjs from "dayjs";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import {
	Accordion,
	Card,
	Overlay,
	OverlayTrigger,
	Tooltip,
} from "react-bootstrap";
import { Button } from "UIComponents/Button/Button";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import { Select } from "UIComponents/Select/Select";
import { client } from "utils/client";

import { getUserRolesSuggestion } from "modules/workflow/service/api";
import {
	sortableContainer,
	sortableElement,
	sortableHandle,
} from "react-sortable-hoc";
import { checkSpecialCharacters, searchUsers } from "services/api/search";
import { sendReminderToApprover } from "services/api/employeeDashboard";
import { toast } from "react-toastify";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";
const userFields = {
	label: "user_name",
	description: "user_email",
	logo: "profile_img",
};
const userRoleFields = {
	label: "title",
	description: "description",
};

const SortableContainer = sortableContainer(({ children }) => {
	return children;
});
const DragHandle = sortableHandle(({ el }) => el);

function array_move(arr, old_index, new_index) {
	while (old_index < 0) {
		old_index += arr.length;
	}
	while (new_index < 0) {
		new_index += arr.length;
	}
	if (new_index >= arr.length) {
		var k = new_index - arr.length + 1;
		while (k--) {
			arr.push(undefined);
		}
	}
	arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
	return [...arr];
}

const userOptionRenderer = (option, props) => {
	return (
		<div className="text-capitalize">
			<div className="d-flex object-contain img-circle align-items-center">
				{props.fieldNames.logo && (
					<GetImageOrNameBadge
						name={option[props.fieldNames.label]}
						url={option[props.fieldNames.logo]}
						width={26}
						height={26}
						imageClassName={"border-radius-4 mr-2 object-contain"}
						nameClassName={"mr-2 border-radius-4 d-inline-block"}
					/>
				)}
				<div>
					<p className="font-14 grey mb-1">
						{option[props.fieldNames.label]}
					</p>
					{option[props.fieldNames.description] && (
						<p className="font-9 grey-1 mb-0">
							{option[props.fieldNames.description]}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

const userRolesRenderer = (option, props) => {
	return (
		<div className={`text-capitalize ${option.disabled ? "o-4" : ""}`}>
			<div className="d-flex object-contain img-circle">
				<div>
					<p className="font-14 grey mb-1">{option.title}</p>
					<p className="font-9 grey-1 mb-0">{option.description}</p>
				</div>
			</div>
		</div>
	);
};

export const Approver = ({
	el,
	idx: index,
	nonDragable,
	showStatus,
	allFixed,
	hideStatusSection,
	pendingUser,
	showOverride,
	isImmutable,
	isStatic,
	setApprovers,
	setShowApproveModal,
	setAcceptType,
	rejectedIndex,
	finalStatus,
	requestId,
}) => {
	const [toggleState, setToggleState] = useState({});
	const [copyText, setcopyText] = useState("Copy Email");
	const [show, setShow] = useState(false);
	const target = useRef(null);
	const getActionTypeText = (data) => {
		if (data.action_type === "actiononbehalfof") {
			return (
				<div className="grey-1">
					<span className="bold-600">{`${data.user_name}`}</span> has{" "}
					{data.status} on behalf of{" "}
					<span className="bold-600">
						{data.meta_info.previous_approver_name}
					</span>
				</div>
			);
		}
		if (data.action_type === "override") {
			return (
				<div className="grey-1">
					<span className="bold-600">{`${data.user_name}`}</span> has
					overriden{" "}
					<span className="bold-600 ">
						{data.meta_info.previous_approver_name}
					</span>{" "}
					rejection
				</div>
			);
		}
	};

	function handleChange(toggle_id) {
		let tempObj = { ...toggleState };
		if (tempObj[toggle_id]) {
			tempObj[toggle_id] = !tempObj[toggle_id];
		} else {
			tempObj[toggle_id] = true;
		}
		setToggleState(tempObj);
	}

	const warningAccordionCSS = {
		backgroundColor: "#FBEFEB",
		border: "0.5px solid #FEBCA6 ",
	};
	const isDisabled = allFixed && !el.user_id && !el.isLocal;
	return (
		<>
			<div className={`d-flex ${isDisabled ? "o-4" : ""}`}>
				<div className="d-flex align-items-center mx-2 mb-2 w-100">
					{((allFixed && nonDragable) || !allFixed) && (
						<NumberPill
							number={index + 1}
							fontColor={"#2266E2"}
							className="cursor-pointer d-flex align-items-center justify-content-center"
							fontSize={12}
							fontWeight={700}
							pillBackGround={"rgba(90, 186, 255, 0.1)"}
							borderRadius={"50%"}
							pillHeight={24}
							pillWidth={10}
							style={{
								width: "24px",
								marginTop: "2px",
								marginRight: "4px",
							}}
						/>
					)}
					{!nonDragable && !isDisabled && (
						<DragHandle
							el={
								<div className="">
									<div
										style={{
											cursor: "pointer",
											marginRight: 10,
										}}
									>
										<img
											alt="dragDrop"
											height={15}
											width={15}
											onClick={() => {}}
											src={dragDrop}
										/>
									</div>
								</div>
							}
						/>
					)}
					<div
						className="d-flex flex-column border-radius-4 d w-100"
						style={{
							background: "#F5F6F9",
							height: "fit-content",
							padding: "9px 12px",
						}}
					>
						<div className="w-100 d-flex justify-content-between align-items-center ml-2">
							<div className="d-flex">
								<GetImageOrNameBadge
									name={el.user_name}
									url={
										!el.user_id
											? userRoleLogo
											: el.profile_img || el.user_logo
									}
									width={21}
									height={21}
									borderRadius="50%"
								/>
								<div className="d-flex flex-column ml-2">
									<div
										style={{
											position: "relative",
										}}
										className="grey font-14 d-flex align-items-center"
									>
										<OverlayTrigger
											placement="top"
											overlay={
												<Tooltip>
													{el.user_name || el.title}
												</Tooltip>
											}
										>
											<div
												className="text-truncate "
												style={{ width: "fit-content" }}
											>
												{el.user_name || el.title}
											</div>
										</OverlayTrigger>

										{el.user_email && (
											<OverlayTrigger
												placement="top"
												overlay={
													<Tooltip>
														{copyText}
													</Tooltip>
												}
											>
												<div
													className={`grey-1 ml-2 o-5 font-8 cursor-pointer`}
													onClick={() => {
														navigator.clipboard.writeText(
															el.user_email
														);
														setcopyText("Copied");
														setTimeout(() => {
															setcopyText(
																"Copy Email"
															);
														}, 1000);
													}}
												>
													<img
														src={copy}
														alt="Copy Email"
													/>
												</div>
											</OverlayTrigger>
										)}
									</div>
									<div className="o-5 grey-1 font-12">
										{el.user_name
											? el.user_designation ||
											  el.designation
											: el.description}
									</div>
								</div>
							</div>
							<>
								{el.status && !hideStatusSection && el.user_id && (
									<div className="ml-auto d-flex flex-column mr-1">
										<div className="d-flex align-items-center">
											<div
												className="font-10 bold-600 ml-auto"
												style={{
													color:
														el.status === "pending"
															? "#717171"
															: el.status ===
																	"rejected" ||
															  el.status ===
																	"procure-cancelled"
															? "#FF6767"
															: "#5FCF64",
												}}
											>
												{showStatus
													? el.status ===
													  "procure-cancelled"
														? "CANCELLED"
														: el.status?.toUpperCase()
													: ""}
											</div>
											{((pendingUser &&
												pendingUser.user_id &&
												pendingUser.user_id ===
													el.user_id) ||
												(showOverride &&
													finalStatus !==
														"auto-rejected" &&
													index ===
														rejectedIndex)) && (
												<>
													<div
														ref={target}
														onClick={() =>
															setShow(!show)
														}
														style={{
															cursor: "pointer",
														}}
													>
														<img
															src={optionsButton}
														/>
													</div>
													<Overlay
														target={target.current}
														show={show}
														placement="bottom"
														rootClose
														onHide={() =>
															setShow(false)
														}
													>
														{(props) => (
															<Tooltip
																bsPrefix="request-page-dropdown-options"
																{...props}
															>
																{showOverride ? (
																	<>
																		<div
																			style={{
																				width: "200px",
																			}}
																		>
																			<div
																				className="request-page-option font-11 pb-2 d-flex align-items-center"
																				onClick={() => {
																					setShowApproveModal(
																						true
																					);

																					setShow(
																						false
																					);
																				}}
																			>
																				<img
																					src={
																						greenTick
																					}
																					width={
																						11
																					}
																					className={
																						"mr-1"
																					}
																				></img>
																				<div>
																					Override
																					and
																					Approve
																					Request
																				</div>
																			</div>
																		</div>
																	</>
																) : (
																	<div
																		style={{
																			width: "200px",
																		}}
																	>
																		<div
																			className="request-page-option font-11 pb-2 d-flex align-items-center"
																			onClick={() => {
																				setShowApproveModal(
																					true
																				);
																				setAcceptType(
																					"approve"
																				);
																				setShow(
																					false
																				);
																			}}
																		>
																			<img
																				src={
																					greenTick
																				}
																				width={
																					11
																				}
																				className={
																					"mr-1"
																				}
																			></img>
																			<div>
																				Approve
																				Request
																			</div>
																		</div>

																		<div
																			className="request-page-option font-11  pb-2 d-flex align-items-center"
																			onClick={() => {
																				setShowApproveModal(
																					true
																				);
																				setAcceptType(
																					"reject"
																				);
																				setShow(
																					false
																				);
																			}}
																		>
																			<img
																				src={
																					rejected
																				}
																				width={
																					11
																				}
																				className={
																					"mr-1"
																				}
																			></img>
																			<div>
																				Reject
																				Request
																			</div>
																		</div>

																		<div
																			className="request-page-option font-11  "
																			onClick={() => {
																				sendReminderToApprover(
																					requestId,
																					{
																						approverId:
																							el.user_id,
																					}
																				)
																					.then(
																						(
																							res
																						) => {
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
																						}
																					)
																					.catch(
																						(
																							err
																						) => {
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
																			}}
																		>
																			Send
																			Reminder
																			to
																			Approver
																		</div>
																	</div>
																)}
															</Tooltip>
														)}
													</Overlay>
												</>
											)}
										</div>
										{el.updated_at && (
											<>
												<div className="font-8 grey-1 o-5 mt-1">
													{dayjs(
														el.updated_at
													).format(
														"D MMM YYYY, HH:mm"
													)}
												</div>
											</>
										)}
									</div>
								)}
							</>
							{((el.isLocal && isImmutable) || !isImmutable) &&
								!isStatic && (
									<img
										src={cross}
										className="cursor-pointer mx-1"
										width={7.5}
										onClick={() => {
											setApprovers((items) =>
												items.filter(
													(_, idx) => idx !== index
												)
											);
										}}
									/>
								)}
						</div>
						{el.action_type && (
							<>
								<div
									className="ml-auto mr-auto p-1 font-8"
									style={{
										background: " #ECF0F9",
										borderRadius: "4px",
									}}
								>
									{getActionTypeText(el)}
								</div>
							</>
						)}
						{el.notes && el.notes.length > 0 && (
							<div style={{ marginTop: "14px" }}>
								<Accordion className="w-100 border-0 m-auto">
									<Card
										className="p-0 w-100 ml-auto mr-auto  ml-2 mr-2"
										style={warningAccordionCSS}
									>
										<Accordion.Toggle
											as={Card.Header}
											onClick={() => {
												handleChange(index);
											}}
											className="p-1 d-flex border-0 bg-none"
											variant="link"
											eventKey={"" + index}
										>
											<div className="grey1  mr-auto mt-auto mb-auto ml-1 font-11">
												Note
											</div>
											<div className="mr-1">
												<img
													className="m-1"
													style={
														toggleState[index]
															? {
																	transform:
																		"rotate(180deg)",
															  }
															: null
													}
													src={caret}
													id={index}
												></img>
											</div>
										</Accordion.Toggle>
										<Accordion.Collapse
											eventKey={"" + index}
											className="border-top"
										>
											<Card.Body className="p-2 font-11 m-0 pl-0 pr-0 pb-3">
												{el.notes}
											</Card.Body>
										</Accordion.Collapse>
									</Card>
								</Accordion>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
};
const RequestApprovers = forwardRef(
	(
		{
			previousApprovers,
			updateApprovers,
			isImmutable,
			allFixed,
			appId,
			userId,
			isStatic,
			showStatus,
			hideStatusSection,
			pendingUser,
			setShowApproveModal,
			setAcceptType,
			showOverride,
			rejectedIndex,
			finalStatus,
			fetchOverviewData,
			data,
		},
		ref
	) => {
		const [showAddApprover, setShowAddApprover] = useState(false);
		const [copyText, setcopyText] = useState("Copy Email");
		const [searchQuery, setSearchQuery] = useState("");
		const [approvers, setApprovers] = useState(null);
		const [userRoles, setUserRoles] = useState([]);
		const [users, setUsers] = useState([]);
		const [loading, setIsLoading] = useState(true);
		const [nonDragableApprovers, setNonDragableApprovers] = useState(0);
		const target = useRef(null);

		const cancelToken = useRef();
		// useEffect(() => {
		// 	if (previousApprovers) {
		// 		setApprovers(previousApprovers);
		// 	}

		useEffect(() => {
			getUserRolesSuggestion({ appId, userId })
				.then((data) => {
					setIsLoading(false);
					const roles = Object.keys(data).map((key) => ({
						user_role: key,
						...data[key],
						type: "role",
						disabled:
							(allFixed || data[key].isFixed) &&
							!data[key]?.assignee?.length > 0,
					}));
					setUserRoles(roles);
					const updatedApprovers = previousApprovers
						.filter((approver) => !!approver)
						.map((item) => {
							if (item.type === "role") {
								const role = roles.find(
									(role) => role.user_role === item.user_role
								);
								return {
									...item,
									...role,
									disabled: !item.user_id && role.disabled,
								};
							}
							return item;
						});

					setApprovers(updatedApprovers);
				})
				.catch(() => {
					setIsLoading(false);
				});
		}, []);

		const clearLocalApprovers = () =>
			setApprovers((approvers) =>
				approvers.filter((approver) => !approver.isLocal)
			);

		useImperativeHandle(ref, () => {
			return {
				clearLocalApprovers,
			};
		});

		useEffect(() => {
			if (cancelToken.current) {
				cancelToken.current.cancel(
					"Operation cancelled in favor of a new request"
				);
			}
			// setUsersLoader(true);
			if (searchQuery) {
				cancelToken.current = client.CancelToken.source();
				if (checkSpecialCharacters(searchQuery, true)) {
					// setUsersLoader(false);
				} else {
					searchUsers(searchQuery, cancelToken.current, true).then(
						(res) => {
							if (res?.results) {
								if (searchQuery) {
									const suggestions = res.results.filter(
										(result) =>
											!approvers.find(
												(approver) =>
													approver.user_id ===
													result.user_id
											)
									);
									setUsers(suggestions);
								}
								// setUsersLoader(false);
							}
						}
					);
				}
			}
		}, [searchQuery]);
		useEffect(() => {
			if (approvers) {
				const updatedApprovers = approvers.map((item) => {
					if (!item.isFixed && !allFixed && item.type === "role") {
						return { user_role: item.user_role, type: item.type };
					}
					return item;
				});
				updateApprovers(updatedApprovers);
			}
		}, [approvers]);

		useEffect(() => {
			if (
				Array.isArray(previousApprovers) &&
				previousApprovers.length > 0 &&
				!isStatic
			) {
				setShowAddApprover(true);
			}
		}, [isStatic]);

		useEffect(() => {
			if (allFixed) {
				const pendingApprovers = [...previousApprovers]
					.reverse()
					.findIndex((el) => el.status !== "pending");
				if (pendingApprovers !== -1) {
					setNonDragableApprovers(
						previousApprovers.length - pendingApprovers
					);
				} else {
					setNonDragableApprovers(0);
				}
			}
		}, [allFixed, previousApprovers]);

		const getUserRoleOptions = () => {
			return userRoles.filter(
				(role) =>
					(!role.assignee?.[0]?.user_id &&
						!approvers?.find(
							(approver) => approver.user_role === role.user_role
						)) ||
					(role.assignee?.[0]?.user_id &&
						!approvers?.find(
							(approver) =>
								approver.user_id === role.assignee?.[0]?.user_id
						))
			);
		};
		const getUserOptions = useCallback(
			() =>
				users.filter(
					(user) =>
						!approvers.find(
							(approver) => approver.user_id === user.user_id
						)
				),
			[users, approvers]
		);

		const isDragable = (el, index) => {
			if (index >= nonDragableApprovers) return true;
			return false;
		};

		const SortableApprover = sortableElement((props) => (
			<Approver {...props} />
		));

		return (
			<>
				{!showAddApprover &&
					!isStatic &&
					Array.isArray(approvers) &&
					approvers.length === 0 && (
						<Button
							className="d-block bold-600 mt-3"
							onClick={() => {
								setShowAddApprover(true);
							}}
							type="dashed"
						>
							<img alt="" src={add} height="14" />
							<span className="ml-2">Add approver or role</span>
						</Button>
					)}
				{
					<div>
						{Array.isArray(approvers) &&
							approvers.length > 0 &&
							approvers
								.slice(
									0,
									isStatic
										? approvers.length
										: nonDragableApprovers
								)
								.map((el, index) => (
									<Approver
										nonDragable
										el={el}
										idx={index}
										index={index}
										key={el._id || el.user_role}
										showStatus={showStatus}
										allFixed={allFixed}
										hideStatusSection={hideStatusSection}
										pendingUser={pendingUser}
										showOverride={showOverride}
										isImmutable={isImmutable}
										isStatic={isStatic}
										setApprovers={setApprovers}
										setShowApproveModal={
											setShowApproveModal
										}
										setAcceptType={setAcceptType}
										rejectedIndex={rejectedIndex}
										finalStatus={finalStatus}
										requestId={data?._id}
									/>
								))}
					</div>
				}
				{!isStatic && (
					<SortableContainer
						onSortEnd={({ oldIndex, newIndex }) => {
							setApprovers((oldApprovers) =>
								array_move(
									oldApprovers,
									nonDragableApprovers + oldIndex,
									nonDragableApprovers + newIndex
								)
							);
						}}
						helperClass="draggable-item"
						distance={1}
					>
						<div>
							{Array.isArray(approvers) &&
								approvers.length > 0 &&
								approvers
									.slice(nonDragableApprovers)
									.map((el, index) => {
										const isDisabled =
											allFixed &&
											!el.user_id &&
											!el.isLocal;
										if (isDisabled) {
											return (
												<Approver
													el={el}
													idx={index}
													index={index}
													key={index}
													showStatus={showStatus}
													allFixed={allFixed}
													hideStatusSection={
														hideStatusSection
													}
													pendingUser={pendingUser}
													showOverride={showOverride}
													isImmutable={isImmutable}
													isStatic={isStatic}
													setApprovers={setApprovers}
													setShowApproveModal={
														setShowApproveModal
													}
													setAcceptType={
														setAcceptType
													}
													rejectedIndex={
														rejectedIndex
													}
													finalStatus={finalStatus}
													requestId={data?._id}
												/>
											);
										} else {
											return (
												<SortableApprover
													el={el}
													idx={index}
													index={index}
													key={index}
													showStatus={showStatus}
													allFixed={allFixed}
													hideStatusSection={
														hideStatusSection
													}
													pendingUser={pendingUser}
													showOverride={showOverride}
													isImmutable={isImmutable}
													isStatic={isStatic}
													setApprovers={setApprovers}
													setShowApproveModal={
														setShowApproveModal
													}
													setAcceptType={
														setAcceptType
													}
													rejectedIndex={
														rejectedIndex
													}
													finalStatus={finalStatus}
												/>
											);
										}
									})}
						</div>
					</SortableContainer>
				)}
				{showAddApprover && !isStatic && (
					<div className="d-flex align-items-center ml-2">
						<NumberPill
							number={approvers ? approvers.length + 1 : 1}
							fontColor={"#2266E2"}
							fontSize={12}
							fontWeight={700}
							pillBackGround={"rgba(90, 186, 255, 0.1)"}
							borderRadius={"50%"}
							pillHeight={24}
							pillWidth={10}
							style={{
								width: "24px",
								marginTop: "2px",
								marginRight: "4px",
							}}
						/>
						<Select
							key={approvers?.length}
							search
							value={searchQuery}
							onSearch={(query) => {
								// setUsersLoader(true);
								setUsers([]);
								// debounce(setSearchQuery(query), 300);
								setSearchQuery(query);
							}}
							// isOptionsLoading={usersLoader || false}
							options={
								searchQuery?.length === 0
									? getUserRoleOptions()
									: getUserOptions() || []
							}
							// onBlur={() => updateRule()}
							fieldNames={
								searchQuery.length === 0
									? userRoleFields
									: userFields
							}
							optionRender={
								searchQuery.length > 0
									? userOptionRenderer
									: userRolesRenderer
							}
							placeholder={"Add people"}
							onChange={(item) => {
								console.log("here", item);
								const approver = item?.assignee?.[0]
									? {
											...item.assignee[0],
											type: "user",
											user_role: item.user_role,
											status: "pending",
											notes: "",
									  }
									: { ...item, status: "pending" };
								setApprovers([
									...approvers,
									{ ...approver, isLocal: true },
								]);
								setSearchQuery("");
								setUsers([]);
							}}
							mode="single"
						/>
					</div>
				)}
			</>
		);
	}
);

RequestApprovers.displayName = "RequestApprovers";

export default RequestApprovers;
