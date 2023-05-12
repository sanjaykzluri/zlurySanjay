import React, { useEffect, useRef, useState, useContext } from "react";
import "../../../../workflow/components/TemplateCard/TemplateCard.css";
import { useSelector } from "react-redux";
import { MONTH, timeSince } from "utils/DateUtility";
import ToggleSwitch from "react-switch";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import {
	Accordion,
	Card,
	useAccordionToggle,
	AccordionContext,
} from "react-bootstrap";
import optionsButton from "assets/optionsButton.svg";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import "./appPlaybookRules.css";
import DeleteWorkflowModal from "../../../../workflow/components/DeleteWorkflowModal/DeleteWorkflowModal";
import { useOutsideClickListener } from "utils/clickListenerHook";
import { ProgressBarLoader } from "common/Loader/ProgressBarLoader";
import ruleConditionLineIcon from "assets/appPlaybooks/rule_condition.svg";
import ruleIcon from "assets/appPlaybooks/ruleIcon.svg";
import { updateTriggerTitle } from "../../../utils/applicationutils";
import { sortableHandle } from "react-sortable-hoc";
import RightArrow from "assets/icons/arrow-right.svg";
import DownArrow from "assets/getting_started/down_arrow.svg";

const DragHandle = sortableHandle(() => (
	<img alt="ruleIcon" height={15.5} width={8.5} src={ruleIcon} />
));

function Toggle({ children, eventKey, callback, className, isCompleted }) {
	const currentEventKey = useContext(AccordionContext);

	const decoratedOnClick = useAccordionToggle(
		eventKey,
		() => callback && callback(eventKey)
	);
	const isActive = currentEventKey === eventKey;

	return (
		<div
			className={`${className} cursor-pointer`}
			onClick={!isCompleted ? decoratedOnClick : () => null}
		>
			{children(isActive)}
		</div>
	);
}

export default function AppPlaybookRulesCard(props) {
	const { name } = props.template;
	let { tags, org_department_tags } = props.template?.mini_playbook_data;
	tags = tags || [];
	org_department_tags = org_department_tags || [];

	const when_name =
		updateTriggerTitle(
			props.template?.global_event?.trigger?.title,
			props.application
		) || "N/A";
	let then_name =
		props.template?.events && props.template?.events.length > 0
			? props.template?.events
					.map((event) => event?.workflowTemplateName)
					.join(" AND ")
			: "N/A";
	then_name =
		props.name === "provision_deprovision" &&
		props.template?.events &&
		props.template?.events.length > 0
			? "Run " + then_name
			: then_name;
	const condition_count = props.template?.condition_count || 0;
	const [openUseTemplateModal, setUseTemplateOpenModal] = useState(false);
	const [workflowType, setWorkflowType] = useState(null);
	const pathname = useSelector((state) => state.router.location.pathname);
	const [show, setShow] = useState(false);
	const [showDeleteWorkflowModal, setShowDeleteWorkflowModal] =
		useState(false);
	const [openActionModal, setActionOpenModal] = useState(false);
	const ref = useRef(null);
	useOutsideClickListener(ref, () => setShow(false));

	const [showBulkUserUploadModal, setShowBulkUserUploadModal] =
		useState(false);
	const [showRunPlaybookModal, setShowRunPlaybookModal] = useState(false);
	const [showStatusLoader, setShowStatusLoader] = useState(false);

	useEffect(() => {
		if (pathname) {
			setWorkflowType(pathname.split("/")[2]);
		}
	}, [pathname]);

	const handleModel = {
		sayOpenToUseTemplateModal: (e, row) => {
			!openUseTemplateModal && setUseTemplateOpenModal(true);
		},
		sayCloseToUseTemplateModal: (e) => {
			openUseTemplateModal && setUseTemplateOpenModal(false);
		},
		sayOpenToDeleteWorkflowModal: (e) => {
			!showDeleteWorkflowModal && setShowDeleteWorkflowModal(true);
		},
		sayOpenToActionModal: (e, row) => {
			!openActionModal && setActionOpenModal(true);
		},
		sayCloseToActionModal: (e) => {
			openActionModal && setActionOpenModal(false);
		},
		sayOpenToBulkUserUploadModal: (e) => {
			handleModel.sayCloseToUseTemplateModal();
			!showBulkUserUploadModal && setShowBulkUserUploadModal(true);
		},
		sayCloseToBulkUserUploadModal: (e) => {
			showBulkUserUploadModal && setShowBulkUserUploadModal(false);
		},
		sayOpenToRunPlaybook: () => {
			handleModel.sayCloseToBulkUserUploadModal();
			!showRunPlaybookModal && setShowRunPlaybookModal(true);
		},
		sayCloseToRunPlaybook: () => {
			showRunPlaybookModal && setShowRunPlaybookModal(false);
		},
	};

	const statusFormatter = (row) => {
		let status = row?.status === "active" ? true : false;
		return (
			<div className="workflows-workflow-status">
				<div className="flex flex-row align-items-center workflow-status-component">
					<div className="d-flex flex-column workflow-status-container">
						<div
							className="truncate_10vw workflow-status-user"
							style={{ margin: "auto" }}
						>
							<div
								style={{
									display: "flex",
									width: "auto",
								}}
							>
								<div
									className="align-self-centermt-1"
									style={{
										minWidth: "126px",
									}}
								>
									<h4 className="grey-1 font-12 m-0">
										<ToggleSwitch
											height={18}
											width={31}
											checked={status}
											onChange={(v) => {
												if (!showStatusLoader) {
													props.handleStatusChange(
														v,
														row
													);
												}
											}}
											checkedIcon={false}
											uncheckedIcon={false}
											onColor={"#2266E2"}
											offColor={"#EBEBEB"}
										/>
										<span
											className="ml-2 position-relative"
											style={{
												bottom: "5px",
											}}
										>
											{row?.status
												?.charAt(0)
												.toUpperCase() +
												row?.status?.slice(1)}
										</span>
									</h4>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	return (
		<>
			<div
				ref={ref}
				className={`d-flex flex-column app-rule-card border-radius-4`}
				onClick={(e) => {
					e.stopPropagation();
					// handleOnClick();
				}}
			>
				<div className="d-flex flex-row justify-content-between p-3">
					<div className="d-flex">
						<>
							<div
								style={{
									marginTop: "-4px",
									marginRight: "16px",
								}}
							>
								<DragHandle />
							</div>
							{!props.template?.is_default && (
								<span
									style={{
										backgroundColor: "#717171",
										color: "#FAFBFC",
										display: "flex",
										width: "16px",
										height: "16px",
										justifyContent: "center",
										borderRadius: "3px",
										fontSize: "10px",
									}}
								>
									{props.template?.priority_order || ""}
								</span>
							)}
						</>
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip>{props.template?.name || ""}</Tooltip>
							}
						>
							<h3 className="black-1 font-14 mb-0 text-capitalize pl-2 pr-3">
								{props.template?.name?.charAt(0).toUpperCase() +
									props.template?.name?.slice(1)}
							</h3>
						</OverlayTrigger>
					</div>
					<div className="d-flex flex-row">
						<div className="font-10 grey-1 mb-0">
							{props.template && statusFormatter(props.template)}
						</div>
						{!props.inProgress ? (
							<Dropdown
								toggler={<img src={optionsButton} />}
								togglerStyle={{
									marginTop: "-4px",
									marginLeft: "12px",
								}}
								options={[
									{
										label: "Edit Rule",
										onClick: () => {
											setShow(false);
											props.showEditModel(
												props.name,
												props.template._id
											);
										},
									},
									{
										label: "Delete Rule",
										onClick: () => {
											setShow(false);
											handleModel.sayOpenToDeleteWorkflowModal();
										},
									},
								]}
								optionFormatter={(option) => option.label}
								onOptionSelect={(option) => option.onClick()}
								right={0}
								menuStyle={{ minWidth: "96px" }}
							/>
						) : (
							<div className="more-options">
								<ProgressBarLoader height={20} width={20} />{" "}
							</div>
						)}
					</div>
				</div>
				<div
					className="d-flex font-12"
					style={{
						lineHeight: "15px",
						color: "#484848",
						paddingInline: "35px",
					}}
				>
					<div>
						<img
							alt="ruleConditionLine"
							height={48}
							width={28}
							onClick={() => {}}
							src={ruleConditionLineIcon}
						/>
					</div>

					<div className="d-flex flex-column align-items-flex-start">
						<div className="d-flex">
							<p className="font-12 font-weight-bold when-rule">
								WHEN
							</p>
							<p
								className="font-12 app-trigger-rule"
								style={{ textIndent: "8px" }}
							>
								{" "}
								{` ${when_name} `}
							</p>
							{condition_count > 0 && (
								<p className="font-8 rule-condition-count">
									{" "}
									{` +${condition_count}`} conditions
								</p>
							)}
						</div>
						<div className="d-flex">
							<p className="font-12 font-weight-bold when-rule">
								THEN
							</p>
							<p
								className="font-12 app-trigger-rule"
								style={{ textIndent: "14px" }}
							>
								{" "}
								{` ${then_name} `}
							</p>
						</div>
					</div>
				</div>

				<div
					style={{
						background: "rgb(235 235 235 / 20%)",
						display: "flex",
						justifyContent: "space-between",
					}}
				>
					<div className="d-flex tags" style={{ background: "none" }}>
						<Accordion>
							<Card
								style={{
									background: "#FAFBFF",
									border: "none",
									flexDirection: "row",
								}}
							>
								<Card.Header
									className="additional-setting-name"
									style={{
										paddingLeft: "16px",
										fontWeight: "400",
									}}
								>
									<Toggle
										eventKey="0"
										className="gettingstarted__item__toggle"
									>
										{(isActive) => (
											<div className="gettingstarted__item__toggle-right__section d-flex">
												<div>{"ADDITIONAL INFO"}</div>
												<img
													className={
														isActive
															? "additional-rule-active-info"
															: "additional-rule-inactive-info"
													}
													src={
														isActive
															? DownArrow
															: RightArrow
													}
													style={{
														marginLeft: "12px",
														marginTop: "-1px",
													}}
												/>
											</div>
										)}
									</Toggle>
								</Card.Header>
								<Accordion.Collapse eventKey="0">
									<Card.Body
										style={{
											display: "flex",
											padding: "12px",
										}}
									>
										<div
											className="d-flex flex-column align-items-flex-start"
											// style={{ minWidth: "14%" }}
											style={{ minWidth: "200px" }}
										>
											<p>DEPARTMENTS</p>
											<div className="d-flex">
												<span className=" cursor-pointer grey-1 tags">
													{Array.isArray(
														org_department_tags
													) &&
														org_department_tags
															?.map(
																(org) =>
																	org.name
															)
															.slice(0, 1)}
												</span>
												<span>
													{org_department_tags?.length ===
														0 && (
														<div
															className="px-1"
															style={{
																background:
																	"aliceblue",
															}}
														>
															N/A
														</div>
													)}
												</span>
												<OverlayTrigger
													placement="bottom"
													overlay={
														<Tooltip className="userMetaInfoCard z-index-10005">
															<div
																style={{
																	padding:
																		"10px",
																}}
															>
																{Array.isArray(
																	org_department_tags
																) &&
																	org_department_tags
																		?.map(
																			(
																				org
																			) =>
																				org.name
																		)
																		.join(
																			", "
																		)}
															</div>
														</Tooltip>
													}
												>
													<span className="cursor-pointer ml-1 tags">
														{org_department_tags?.length >
															1 &&
															"+" +
																(
																	org_department_tags?.length -
																	1
																).toString()}
													</span>
												</OverlayTrigger>
											</div>
										</div>
										<div className="d-flex flex-column align-items-flex-start">
											<p>TAGS</p>
											<div className="d-flex">
												<span className="cursor-pointer grey-1 tags">
													{Array.isArray(tags) &&
														tags.slice(0, 1)}
												</span>
												<span>
													{tags?.length === 0 && (
														<div
															className="px-1"
															style={{
																background:
																	"aliceblue",
															}}
														>
															N/A
														</div>
													)}
												</span>
												<OverlayTrigger
													placement="bottom"
													overlay={
														<Tooltip className="userMetaInfoCard z-index-10005">
															<div
																style={{
																	padding:
																		"10px",
																}}
															>
																{Array.isArray(
																	tags
																) &&
																	tags.join(
																		", "
																	)}
															</div>
														</Tooltip>
													}
												>
													<span className="cursor-pointer ml-1 tags">
														{tags.length > 1 &&
															"+" +
																(
																	tags?.length -
																	1
																).toString()}
													</span>
												</OverlayTrigger>
											</div>
										</div>
									</Card.Body>
								</Accordion.Collapse>
							</Card>
						</Accordion>
					</div>
					<div
						className="px-3 pt-2 font-10"
						style={{ color: "#717171" }}
					>
						{props.template?.last_applied ? (
							<>
								{`Last used ${timeSince(
									new Date(),
									props.template?.last_applied
								)} ago`}
							</>
						) : (
							"Not used yet"
						)}
					</div>
				</div>
			</div>
			{showDeleteWorkflowModal && (
				<DeleteWorkflowModal
					type="#app_rules"
					workflow_id={props.template?._id}
					workflow_name={props.template?.name}
					setShowDeleteWorkflowModal={setShowDeleteWorkflowModal}
					showDeleteWorkflowModal={showDeleteWorkflowModal}
					refreshTable={() => {
						props.handleRefreshTable();
					}}
					workflow={props.template}
				/>
			)}
		</>
	);
}
