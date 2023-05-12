import React, { Fragment, useContext, useEffect, useState } from "react";
import close from "assets/close.svg";
import { Accordion, Card } from "react-bootstrap";
import { unescape } from "utils/common";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { NameBadge } from "common/NameBadge";
import greenTick from "assets/employee/changelog/greentick.svg";
import task from "assets/employee/changelog/task.svg";
import comment from "assets/employee/changelog/comment.svg";
import overrode from "assets/employee/changelog/overrode.svg";
import rejected from "assets/employee/changelog/rejected.svg";
import request from "assets/employee/changelog/request.svg";
import update from "assets/employee/changelog/update.svg";
import linewitharrow from "assets/employee/changelog/linewitharrow.svg";
import caret from "components/Integrations/caret.svg";
import ActionItem from "./ActionItem";
import { getLicenseRequestChangeLog } from "services/api/employeeDashboard";
import { TriggerIssue } from "utils/sentry";
import { getCostText } from "../containers/RequestOverview";
import {
	getModifiedLicenseCost,
	getModifiedLicenseRequestOverview,
} from "../utils/employeeUtils";
import { Loader } from "common/Loader/Loader";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import dayjs from "dayjs";
import blueTick from "assets/employee/bluetick.svg";
import redexclam from "assets/employee/redexclam.svg";
import pending from "assets/employee/pending.svg";
import { UTCDateFormatter } from "utils/DateUtility";
import { updateKeys } from "../constants/employee";
import { kFormatter } from "constants/currency";

function RenderImageAndName({ image, name, marginLeft, marginRight = "mr-2" }) {
	return (
		<div className="d-flex ">
			{image ? (
				<img
					src={image}
					width={15}
					style={{ height: "auto" }}
					className={`${marginLeft} mr-2`}
				/>
			) : (
				<NameBadge
					name={name}
					width={26}
					borderRadius={50}
					className={`${marginLeft} mr-2 rounded-circle`}
				/>
			)}
			<OverlayTrigger
				placement="bottom"
				overlay={<Tooltip>{name}</Tooltip>}
			>
				<div
					className={`${marginRight} mt-auto mb-auto bold-600 truncate_comment_user_name`}
				>
					{name}
				</div>
			</OverlayTrigger>
		</div>
	);
}

function ChangeLogModal(props) {
	const [data, setData] = useState();
	const [loading, setLoading] = useState(true);
	console.log(props);
	useEffect(() => {
		if (loading) {
			getLicenseRequestChangeLog(props.id)
				.then((res) => {
					setData(res);
					setLoading(false);
				})
				.catch((err) => {
					TriggerIssue(
						"Error in fetching license request change log",
						err
					);
					setLoading(false);
				});
		}
	}, []);

	const warningAccordionCSS = {
		backgroundColor: "#FBEFEB",
		border: "0.5px solid #FEBCA6 ",
	};

	const [toggleState, setToggleState] = useState({});

	function handleChange(toggle_id) {
		let tempObj = { ...toggleState };
		if (tempObj[toggle_id]) {
			tempObj[toggle_id] = !tempObj[toggle_id];
		} else {
			tempObj[toggle_id] = true;
		}
		setToggleState(tempObj);
	}

	const notesAccordion = (el, index) => {
		return (
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
						eventKey="0"
					>
						<div className="grey1  mr-auto mt-auto mb-auto ml-1 font-11">
							Note
						</div>
						<div className="mr-1">
							<img
								className="m-1 height-5"
								style={
									toggleState[index]
										? {
												transform: "rotate(180deg)",
										  }
										: null
								}
								src={caret}
								id={index}
							></img>
						</div>
					</Accordion.Toggle>
					<Accordion.Collapse eventKey="0" className="border-top">
						<Card.Body className="p-2 font-11 m-0 pl-0 pr-0 pb-3">
							{el.notes}
						</Card.Body>
					</Accordion.Collapse>
				</Card>
			</Accordion>
		);
	};
	const getCostText = (data) => {
		return `${kFormatter(
			data?.amount || data?.license_cost || 0,
			data?.currency || "USD"
		)} per ${data?.period?.slice(0, -1)}`;
	};

	const getSubText = (data) => {
		return `${data?.frequency || 1} ${data.period} `;
	};

	const getUsers = (data) => {
		return (
			<div
				className="d-flex flex-column w-100"
				style={{
					maxHeight: "60px",
					overflowY: "auto",
					minHeight: "60px",
				}}
			>
				{data.map((el) => (
					<div className="d-flex align-items-center">
						<RenderImageAndName
							image={el.user_logo}
							name={el.user_name}
						/>
					</div>
				))}
			</div>
		);
	};
	const getUpdateValue = (data, dataKey, context) => {
		switch (dataKey) {
			case "quantity":
				return data?.[context];
			case "cost_per_item":
				return getCostText(data?.[context]);
			case "subscription_duration":
				return getSubText(data?.[context]);
			case "need_more_licenses":
				return data?.[context] ? "Yes" : "No";
			case "users":
				return getUsers(data?.[context]);
			default:
				return data?.[context];
		}
	};
	const updateUI = (data) => {
		return (
			Array.isArray(Object.keys(data?.updated_fields)) &&
			Object.keys(data?.updated_fields)?.map((el) => (
				<div className="d-flex align-items-center mb-1">
					<div
						className="d-flex flex-column border-radius-4 "
						style={{
							padding: "8px",
							background: "rgba(235, 235, 235, 0.2)",
							border: "0.5px solid #EBEBEB",
							width: "170px",
							minHeight: "50px",
							maxHeight: "150px",
						}}
					>
						<div className="grey-1 font-8">{updateKeys[el]}</div>
						<div className="font-11 black-1 mt-2 d-flex w-100">
							{getUpdateValue(
								data?.updated_fields?.[el],
								el,
								"previous"
							)}
						</div>
					</div>
					<img src={linewitharrow} width={70}></img>
					<div
						className="d-flex flex-column border-radius-4 "
						style={{
							padding: "8px",
							background: "rgba(235, 235, 235, 0.2)",
							border: "0.5px solid #EBEBEB",
							width: "170px",
							minHeight: "50px",
							maxHeight: "150px",
						}}
					>
						<div className="grey-1 font-8">{updateKeys[el]}</div>
						<div className="font-11 black-1 mt-2 d-flex w-100">
							{getUpdateValue(
								data?.updated_fields?.[el],
								el,
								"current"
							)}
						</div>
					</div>
				</div>
			))
		);
	};
	const commentUI = (data) => {
		return (
			Array.isArray(data?.comments) &&
			data?.comments.map((el) => (
				<div
					className="d-flex  mb-1 border-radius-4 flex-column"
					style={{
						background: "#F9FAFB",
						height: "fit-content",
						padding: "10px 12px",
					}}
				>
					<div className="d-flex align-items-start">
						<div className="d-flex align-items-center">
							<RenderImageAndName
								image={el?.user_profile_image}
								name={el?.user_name}
							></RenderImageAndName>
						</div>

						<div
							className="font-10 grey-1 ml-auto"
							style={{ whiteSpace: "nowrap" }}
						>
							{dayjs(el.createdAt).format("D MMM YYYY, HH:mm")}
						</div>
					</div>
					<div className="font-11 black-1 mt-2  w-100">
						{el.comment}
					</div>
				</div>
			))
		);
	};
	const viewMoreAccordion = (el, index, key) => {
		return (
			<Accordion className="w-100 border-0 m-auto">
				<Card className="p-0 w-100 ml-auto mr-auto  ml-2 mr-2 border-0">
					<Accordion.Collapse eventKey="0" className="">
						<Card.Body className="p-2 font-11 m-0 pl-0 pr-0 pb-3">
							{key === "updated" ? (
								<>{updateUI(el)}</>
							) : key === "comment" ? (
								<>{commentUI(el)}</>
							) : null}
						</Card.Body>
					</Accordion.Collapse>
					<Accordion.Toggle
						as={Card.Header}
						onClick={() => {
							handleChange(index);
						}}
						className="p-1 d-flex border-0 bg-none"
						variant="link"
						eventKey="0"
					>
						<div className="mr-1 primary-color font-11 border-0">
							{toggleState[index] ? "View Less" : "View More"}
						</div>
					</Accordion.Toggle>
				</Card>
			</Accordion>
		);
	};

	const renderRequestInfo = (data) => {
		return (
			<div className="d-flex align-items-center  mt-2">
				<div
					className="d-flex flex-column border-radius-4 "
					style={{
						padding: "8px",
						background: "rgba(235, 235, 235, 0.2)",
						border: "0.5px solid #EBEBEB",
						maxWidth: "160px",
						height: "50px",
						minWidth: "140px",
					}}
				>
					<div className="grey-1 font-8">REQUESTEE</div>
					<div className="font-11 black-1 mt-1 d-flex w-100">
						<RenderImageAndName
							image={data?.action_by_logo}
							name={data?.action_by}
							marginRight={"mr-0 "}
						>
							{" "}
						</RenderImageAndName>
					</div>
				</div>
				{data.request_lecense_details.license_name && (
					<>
						<div
							className="d-flex flex-column border-radius-4 ml-3"
							style={{
								padding: "8px",
								background: "rgba(235, 235, 235, 0.2)",
								border: "0.5px solid #EBEBEB",
								height: "50px",
								minWidth: "140px",
							}}
						>
							<div className="grey-1 font-8">LICENSE NAME</div>
							<div className="font-11 black-1 mt-2 d-flex w-100">
								{data.request_lecense_details.license_name}
							</div>
						</div>
					</>
				)}

				{/* <div
					className="d-flex flex-column border-radius-4 "
					style={{
						padding: "8px",
						background: "rgba(235, 235, 235, 0.2)",
						border: "0.5px solid #EBEBEB",
						height: "50px",
						minWidth: "140px",
					}}
				>
					<div className="grey-1 font-8">COST/LICENSE</div>
					<div className="font-11 black-1 mt-2 d-flex w-100">
						{getCostText(getModifiedLicenseCost(data))}
					</div>
				</div> */}
			</div>
		);
	};
	const getMetaData = (data, index) => {
		if (data.status === "rejected") {
			let logo = rejected;
			let subtitle;
			let renderTitle;
			let renderSubComponent = (
				<div>{data.notes && notesAccordion(data, index)}</div>
			);
			let note = "";
			if (data.action_type) {
				renderTitle = (
					<div
						className="d-flex align-items-center font-14 mb-1"
						style={{ flexWrap: "wrap" }}
					>
						<RenderImageAndName
							image={data.action_by_logo}
							name={data.action_by}
							marginLeft={"ml-2"}
						/>{" "}
						rejected the request on behalf of
						<RenderImageAndName
							image={data.meta_info?.previous_approver_logo}
							name={data.meta_info?.previous_approver_name}
							marginLeft={"ml-2"}
						/>{" "}
					</div>
				);
			} else {
				subtitle = `${
					data.designation || data.action_by
				} rejected the license request.`;
				renderTitle = (
					<div className="d-flex align-items-center font-14">
						Rejected by
						<RenderImageAndName
							image={data.action_by_logo}
							name={data.action_by}
							marginLeft={"ml-2"}
						/>
					</div>
				);
			}
			return { renderTitle, subtitle, logo, note, renderSubComponent };
		}
		if (data.status === "approved") {
			let logo;
			let subtitle;
			let renderTitle;
			let renderSubComponent = (
				<div>{data.notes && notesAccordion(data, index)}</div>
			);
			let note = "";
			if (data.action_type) {
				if (data.action_type === "override") {
					logo = overrode;
					subtitle = `${
						data.designation || data.action_by
					} has approved the license request by overriding this rejection.`;
					renderTitle = (
						<div
							className="d-flex align-items-center font-14"
							style={{ flexWrap: "wrap" }}
						>
							<RenderImageAndName
								image={data.action_by_logo}
								name={data.action_by}
								marginLeft={"ml-2"}
							/>{" "}
							has overriden{" "}
							<RenderImageAndName
								image={data.meta_info?.previous_approver_logo}
								name={data.meta_info?.previous_approver_name}
								marginLeft={"ml-2"}
							/>{" "}
							rejection
						</div>
					);
				}
				if (data.action_type === "actiononbehalfof") {
					logo = blueTick;
					renderTitle = (
						<div
							className="d-flex align-items-center font-14 mb-1"
							style={{ flexWrap: "wrap" }}
						>
							<RenderImageAndName
								image={data.action_by_logo}
								name={data.action_by}
								marginLeft={"ml-2"}
							/>{" "}
							approved the request on behalf of
							<RenderImageAndName
								image={data.meta_info?.previous_approver_logo}
								name={data.meta_info?.previous_approver_name}
								marginLeft={"ml-2"}
							/>{" "}
						</div>
					);
				}
			} else {
				logo = blueTick;
				subtitle = `${
					data.designation || data.action_by
				} approved the license request.`;
				renderTitle = (
					<div className="d-flex align-items-center font-14">
						Approved by
						<RenderImageAndName
							image={data.action_by_logo}
							name={data.action_by}
							marginLeft={"ml-2"}
						/>
					</div>
				);
			}

			return { renderTitle, subtitle, logo, note, renderSubComponent };
		}
		if (data.status === "pending") {
			const logo = request;
			const subtitle = "";
			const renderTitle = (
				<div className="d-flex align-items-center font-14 bold-600">
					License Requested
				</div>
			);
			const renderSubComponent = <>{renderRequestInfo(data)}</>;
			const note = "";
			return { renderTitle, subtitle, logo, note, renderSubComponent };
		}
		if (data.status === "cancelled") {
			const logo = redexclam;
			const renderTitle = (
				<div className="d-flex align-items-center font-14 bold-600">
					Request Withdrawn
				</div>
			);
			return { renderTitle, logo };
		}
		if (data.status === "assign") {
			const logo = task;
			const subtitle = (
				<div>
					{data.procure_user.user_name} was assigned a task to
					{
						<span
							className="grey-1 ml-1 "
							style={{ fontSize: "11px", fontWeight: "600" }}
						>
							procure the license
						</span>
					}{" "}
					for this request due on{" "}
					{
						<span
							className="grey-1 ml-1"
							style={{ fontSize: "11px", fontWeight: "600" }}
						>
							{UTCDateFormatter(data.procure_user.due_date)}
						</span>
					}
				</div>
			);
			const renderTitle = (
				<div className="d-flex align-items-center font-14">
					A task was Assigned to
					<RenderImageAndName
						image={data.procure_user.user_logo}
						name={data.procure_user.user_name}
						marginLeft={"ml-2"}
					/>
				</div>
			);

			return { renderTitle, subtitle, logo, subtitle };
		}
		if (data.status === "procure-cancelled") {
			const logo = redexclam;
			const subtitle = (
				<div>
					License Procurement was cancelled by
					{
						<span
							className="grey-1 ml-1 "
							style={{ fontSize: "11px", fontWeight: "600" }}
						>
							{data?.action_by}
						</span>
					}{" "}
					on{" "}
					{
						<span
							className="grey-1 ml-1"
							style={{ fontSize: "11px", fontWeight: "600" }}
						>
							{UTCDateFormatter(data?.created_at)}
						</span>
					}
				</div>
			);
			const renderTitle = (
				<div
					className="d-flex align-items-center font-14"
					style={{ flexWrap: "wrap" }}
				>
					Procurement was{" "}
					<span
						className="grey-1 ml-1 mr-1"
						style={{ fontWeight: "600" }}
					>
						Cancelled
					</span>{" "}
					by
					<RenderImageAndName
						image={data?.action_by_logo}
						name={data?.action_by}
						marginLeft={"ml-2"}
					/>
				</div>
			);
			let renderSubComponent = (
				<div>{data.notes && notesAccordion(data, index)}</div>
			);
			return {
				renderTitle,
				logo,
				subtitle,
				renderSubComponent,
			};
		}
		if (data.status === "undo-procure-cancelled") {
			const logo = overrode;
			const renderTitle = (
				<div
					className="d-flex align-items-center font-14"
					style={{ flexWrap: "wrap" }}
				>
					Procurement Cancellation was
					<span
						className="grey-1 ml-1 mr-1"
						style={{ fontWeight: "600" }}
					>
						Overturned
					</span>{" "}
					by
					<RenderImageAndName
						image={data?.action_by_logo}
						name={data?.action_by}
						marginLeft={"ml-2"}
					/>
				</div>
			);
			let renderSubComponent = (
				<div>{data.notes && notesAccordion(data, index)}</div>
			);
			return {
				renderTitle,
				logo,
				renderSubComponent,
			};
		}
		if (data.status === "completed") {
			const logo = greenTick;
			const subtitle = (
				<div>
					License was procured for this request by
					{
						<span
							className="grey-1 ml-1 mr-1"
							style={{ fontSize: "11px", fontWeight: "600" }}
						>
							{data?.action_by}
						</span>
					}
					on
					{
						<span
							className="grey-1 ml-1"
							style={{ fontSize: "11px", fontWeight: "600" }}
						>
							{UTCDateFormatter(data?.created_at)}
						</span>
					}
				</div>
			);
			const renderTitle = (
				<div className="d-flex align-items-center font-14">
					Request has been
					<span
						className=" grey-1 ml-1"
						style={{ fontWeight: "600" }}
					>
						Completed
					</span>
				</div>
			);
			let renderSubComponent = (
				<div>{data.notes && notesAccordion(data, index)}</div>
			);
			return { renderTitle, subtitle, logo, renderSubComponent };
		}
		if (data.status === "auto-rejected") {
			const logo = rejected;
			const subtitle = (
				<div>
					An email has been sent to the Requestee about the rejection.
				</div>
			);
			const renderTitle = (
				<div className="d-flex align-items-center font-14">
					Auto-Rejected by Rule
				</div>
			);

			return { renderTitle, subtitle, logo, subtitle };
		}
		if (data.status === "comment") {
			const logo = comment;
			const subtitle = "";
			const title = "";
			const renderTitle = (
				<div className="d-flex align-items-center font-14 ">
					New Comments from
					<div className="d-flex align-items-center">
						{Array.isArray(data.action_by) &&
							data.action_by.length > 0 &&
							data.action_by
								.slice(0, 1)
								.map((el) => (
									<RenderImageAndName
										image={el.action_by_logo}
										name={el.action_by}
										marginLeft={"ml-2"}
									/>
								))}
						{Array.isArray(data.action_by) &&
							data.action_by.length > 1 && (
								<div>
									<OverlayTrigger
										placement="top"
										overlay={
											<Tooltip>
												<div
													className="d-flex flex-column mr-1"
													style={{
														marginTop: "9px",
														maxHeight: "210px",
														width: "150px",
														overflowY: "auto",
														overflowX: "none",
													}}
												>
													{data.action_by.map(
														(el, index) => {
															if (index > 0) {
																return (
																	<div className="d-flex align-items-center">
																		<RenderImageAndName
																			image={
																				el.action_by_logo
																			}
																			name={
																				el.action_by
																			}
																		/>
																	</div>
																);
															}
														}
													)}
												</div>
											</Tooltip>
										}
									>
										<div>
											<NumberPill
												number={`+ ${
													data.action_by.length - 1
												}`}
												fontColor={"#222222"}
												fontSize={8}
												fontWeight={700}
												pillBackGround={
													"rgb(246, 247, 252)"
												}
												borderRadius={"50%"}
												pillHeight={20}
												pillWidth={20}
												style={{
													width: "20px",
													marginRight: "4px",
													cursor: "pointer",
												}}
											></NumberPill>
										</div>
									</OverlayTrigger>
								</div>
							)}
					</div>
				</div>
			);
			const renderSubComponent = (
				<div>{viewMoreAccordion(data, index, "comment")}</div>
			);
			return { title, subtitle, logo, renderTitle, renderSubComponent };
		}
		if (data.status === "updated") {
			const logo = update;
			const subtitle = "";
			const renderTitle = (
				<div
					className=" font-14 d-flex flex-column"
					style={{ whiteSpace: "nowrap" }}
				>
					<div
						className=" font-14 d-flex align-items-center"
						style={{ whiteSpace: "nowrap" }}
					>
						Request details were updated by
					</div>
					<div className="d-flex">
						<RenderImageAndName
							image={data.action_by_logo}
							name={data.action_by}
							marginLeft={"ml-2"}
						/>
					</div>
				</div>
			);

			const renderSubComponent = (
				<div>
					{data?.updated_fields
						? viewMoreAccordion(data, index, "updated")
						: null}
				</div>
			);
			const note = "";
			return { renderTitle, subtitle, logo, note, renderSubComponent };
		}
	};

	return (
		<>
			<div className="modal-backdrop show"></div>
			<div className="change-log-modal" style={{ height: "100%" }}>
				<div className="d-flex border-bottom-0 py-4">
					<div
						className="mx-auto d-flex align-items-center"
						style={{ width: "90%" }}
					>
						<div className="font-18 grey-1 mr-1">Changelog For</div>
						<RenderImageAndName
							name={props?.app_name}
							image={props?.app_image}
							marginLeft={"ml-1"}
						/>
					</div>
					<img
						alt="Close"
						src={close}
						className="cursor-pointer mr-3"
						onClick={() => {
							props.closeModal && props.closeModal();
						}}
					/>
				</div>
				<hr
					style={{
						marginTop: "0px",
						marginBottom: "0px",
						marginLeft: "6px",
						marginRight: "6px",
					}}
				/>
				{loading ? (
					<>
						<Loader width={60} height={60}></Loader>
					</>
				) : (
					<>
						<div
							style={{
								padding: 20,
								overflowY: "auto",
								height: "90vh",
							}}
						>
							{Array.isArray(data) &&
								data?.map((actionData, index) => {
									return (
										<ActionItem
											{...getMetaData(
												{
													...actionData,
												},
												index
											)}
											logoStyle={{}}
											date={actionData.created_at}
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

export default ChangeLogModal;
