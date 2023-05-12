import React, { useEffect, useRef, useState } from "react";
import "./TemplateCard.css";
import { useDispatch, useSelector } from "react-redux";
import { MONTH, timeSince } from "utils/DateUtility";
import WorkflowsNameInTable from "../WorkflowName";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import optionsButton from "../../../../assets/optionsButton.svg";
import edit from "../../../../assets/workflow/edit.svg";
import play from "../../../../assets/workflow/blue-play.svg";
import info from "../../../../assets/icons/info-orange.svg";
import playicon from "../../../../assets/workflow/play-white.svg";
import SelectUserModal from "../SelectUserModal/SelectUserModal";
import { createWorkflowFromTemplate } from "modules/workflow/service/api";
import {
	removeTemplateFromStore,
	updateWorkflow,
	removeMostUsedTemplateFromStore,
	clearWorkflow,
	clearWorkflowLogs,
} from "modules/workflow/redux/workflow";
import { WorkflowModel } from "modules/workflow/model/model";
import { TriggerIssue } from "utils/sentry";
import { useHistory } from "react-router-dom";
import DeleteWorkflowModal from "../DeleteWorkflowModal/DeleteWorkflowModal";
import { useOutsideClickListener } from "utils/clickListenerHook";
import ActionModel from "../ActionModal/ActionModal";
import ActionModal from "../ActionModal/ActionModal";
import { ProgressBarLoader } from "common/Loader/ProgressBarLoader";
import BulkUploadUsersModal from "../BulkUploadUsersModal/BulkUploadUsersModal";
import RunPlaybookBulkUserModal from "../RunPlaybookBulkUserModal/RunPlaybookBulkUserModal";
import { Button } from "UIComponents/Button/Button";
import ViewPlaybookModal from "../ViewPlaybookModal/ViewPlaybookModal";
import UnpublishPlaybookModal from "../UnpublishPlaybookModal/UnpublishPlaybookModal";
import DuplicatePlaybookModal from "../DuplicatePlaybookModal/DuplicatePlaybookModal";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";

export default function TemplateCard(props) {
	const history = useHistory();
	const dispatch = useDispatch();
	const [openUseTemplateModal, setUseTemplateOpenModal] = useState(false);
	const [createNewWorflow, setCreateNewWorflow] = useState(false);
	const [creatingNewWorflowFromTemplate, setCreatingNewWorflowFromTemplate] =
		useState(false);
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
	const [showUnpublishPlaybookModal, setShowUnpublishPlaybookModal] =
		useState(false);
	const [showDuplicatePlaybookModal, setShowDuplicatePlaybookModal] =
		useState(false);

	useEffect(() => {
		if (pathname) {
			setWorkflowType(pathname.split("/")[2]);
		}
		return () => {
			setShow(false);
			setShowDeleteWorkflowModal(false);
			setUseTemplateOpenModal(false);
			setActionOpenModal(false);
			setShowBulkUserUploadModal(false);
			setShowRunPlaybookModal(false);
			setShowUnpublishPlaybookModal(false);
		};
	}, [pathname]);

	const handleModel = {
		sayOpenToUseTemplateModal: (e, row) => {
			!openUseTemplateModal && setUseTemplateOpenModal(true);
		},
		sayCloseToUseTemplateModal: (e) => {
			openUseTemplateModal && setUseTemplateOpenModal(false);
		},
		sayOpenToDeleteWorkflowModal: (e) => {
			// setShow(false);
			setShowDeleteWorkflowModal(true);
		},
		sayOpenToActionModal: (e, row) => {
			!openActionModal && setActionOpenModal(true);
		},
		sayCloseToActionModal: (e) => {
			history.push(`/workflows/${props?.template?.type}#overview`);
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
		sayOpenToEditPublishedPlaybook: () => {
			!showUnpublishPlaybookModal && setShowUnpublishPlaybookModal(true);
		},
		sayCloseToEditPublishedPlaybook: () => {
			showUnpublishPlaybookModal && setShowUnpublishPlaybookModal(false);
		},
		sayOpenToDuplicatePlaybookModal: () => {
			// setShow(false);
			setShowDuplicatePlaybookModal(true);
		},
		sayCloseToDuplicatePlaybookModal: () => {
			// setShow(false);
			setShowDuplicatePlaybookModal(false);
		},
	};

	const onUserSelected = (selUsers) => {
		if (!createNewWorflow) {
			setCreatingNewWorflowFromTemplate(true);
			const data = {
				user_ids: selUsers.map((user) => user.user_id),
				template_id: props.template?.workflow_id || props.template?._id,
				name: `${workflowType} ${selUsers[0].user_name?.trim()}${
					selUsers.length > 1
						? ` and ${selUsers.length - 1} others `
						: " "
				}on ${new Date().getDate()} ${MONTH[new Date().getMonth()]}`,
			};
			createWorkflowFromTemplate({ workflow: data })
				.then((res) => {
					dispatch(updateWorkflow(new WorkflowModel(res)));

					handleModel.sayCloseToUseTemplateModal();
					history.push(`/workflow/${res._id}#recommended`);
				})
				.catch((err) => {
					TriggerIssue(
						"Error on using playbook to create workflow",
						err
					);
				})
				.finally((res) => {
					setCreatingNewWorflowFromTemplate(false);
				});
		} else {
			history.push({
				pathname: "/creating/workflow",
				state: { users: selUsers, type: workflowType },
			});
		}
	};

	const handleOnClick = () => {
		setShow(false);
		if (props.inProgress) {
			history.push(`/workflow/${props.template.workflow_id}/runs`);
		} else {
			history.push(
				`/workflows/${props?.template?.type}?playbookId=${props?.template?.workflow_id}#overview`
			);
		}
	};

	return (
		<>
			<div
				ref={ref}
				className={`d-flex flex-column workflow-template-card border-radius-4 mb-3 pointer ${
					props.inProgress ? "w-progress" : ""
				}`}
				onClick={(e) => {
					e.stopPropagation();
					handleOnClick();
				}}
			>
				{!props.inProgress ? (
					<div key={Math.random()}>
						<Dropdown
							className="w-auto"
							togglerStyle={{
								position: "absolute",
								right: "2%",
								marginTop: "12px",
							}}
							optionClassName="font-14"
							optionStyle={{}}
							toggler={<img alt="" src={optionsButton} />}
							options={[
								{
									comp: (
										<div
											onClick={(e) => {
												e.stopPropagation();
												handleModel.sayOpenToDuplicatePlaybookModal();
											}}
											className="w-100 h-100 px-4 py-2 font-12"
											style={{
												padding: "0 16px !important",
											}}
										>
											Copy Playbook
										</div>
									),
								},
								{
									comp: (
										<div
											onClick={(e) => {
												e.stopPropagation();
												handleModel.sayOpenToDeleteWorkflowModal();
											}}
											className="w-100 h-100 px-4 py-2 font-12"
											style={{
												padding: "0 16px !important",
												color: "#FF6767",
											}}
										>
											Delete Playbook
										</div>
									),
								},
							]}
							optionFormatter={(option) => option.comp}
							right={0}
						/>
					</div>
				) : (
					<div className="more-options">
						<ProgressBarLoader height={20} width={20} />{" "}
					</div>
				)}
				<div
					style={{ marginTop: "-3px" }}
					className="d-flex align-items-center pl-3 pt-3 pr-3"
				>
					<WorkflowsNameInTable
						hideTitle={true}
						title={
							props.template?.workflow_name ||
							props.template?.name
						}
						id={props.template?.workflow_id || props.template?._id}
						allApps={
							(props.template?.workflow_apps ||
								props.template?.apps) &&
							(props.template?.workflow_apps?.length ||
								props.template?.apps?.length)
								? props.template?.workflow_apps ||
								  props.template?.apps
								: []
						}
						totalActionsCount={
							props.template?.workflow_action_count ||
							props.template?.action_count
								? props.template?.workflow_action_count ||
								  props.template?.action_count
								: 0
						}
						total_apps={
							props.template?.workflow_app_count ||
							props.template?.app_count
						}
						total_actions={
							props.template?.workflow_action_count ||
							props.template?.action_count
						}
					/>
					{!props.inProgress && (
						<div className="d-flex flex-1 justify-content-end mr-4">
							{props?.template?.is_published ? (
								<p className="font-10 grey-1 mb-0">
									<span
										style={{
											color: "#5FCF64",
											fontSize: "10px",
											fontWeight: "600",
										}}
									>
										PUBLISHED
									</span>
								</p>
							) : (
								<OverlayTrigger
									placement="top"
									overlay={
										<Tooltip>
											{
												"Playbook is not published or have incomplete setup"
											}
										</Tooltip>
									}
								>
									<p
										style={{
											backgroundColor:
												"rgba(255, 177, 105, 0.1)",
											borderRadius: "4px",
										}}
										className="font-10 grey-1 mb-0 p-1 px-2"
									>
										<img
											height={"16px"}
											width={"16px"}
											className="mr-1"
											alt=""
											src={info}
										/>
										<span
											style={{
												color: "#ffb169",
												fontSize: "10px",
												fontWeight: "600",
											}}
										>
											Setup Required
										</span>
									</p>
								</OverlayTrigger>
							)}
						</div>
					)}
				</div>
				<OverlayTrigger
					placement="top"
					overlay={
						<Tooltip>
							{props.template?.workflow_name ||
								props.template?.name ||
								""}
						</Tooltip>
					}
				>
					<h3 className="black-1 font-14 mb-0 mt-2 text-capitalize truncate_15vw pl-3">
						{props.template?.workflow_name
							? props.template?.workflow_name
									?.charAt(0)
									.toUpperCase() +
							  props.template?.workflow_name?.slice(1)
							: props.template?.name?.charAt(0).toUpperCase() +
							  props.template?.name?.slice(1)}
					</h3>
				</OverlayTrigger>
				<p className="font-10 grey-1 mb-0 pl-3">
					<span>
						{props.template?.workflow_app_count ||
							props.template?.app_count}{" "}
						{props.template?.workflow_app_count > 1 ||
						props.template?.app_count > 1
							? "apps"
							: "app"}
					</span>
					,
					<span>
						{" "}
						{props.template?.workflow_action_count ||
							props.template?.action_count}{" "}
						{props.template?.workflow_action_count > 1 ||
						props.template?.action_count > 1
							? "actions"
							: "action"}
					</span>
				</p>
				{props.inProgress && (
					<p className="grey-1 mt-2 mb-0 font-8 pl-3">
						Created by {props.template?.created_by_user_name}{" "}
						{`${timeSince(
							new Date(),
							props.inProgress
								? props.template?.created_on
								: props.template?.created_at
						)} ago`}{" "}
					</p>
				)}
				{props.inProgress && (
					<ul
						className="d-flex list-style-none p-0 font-10 mb-0 mt-3 pl-0 pl-3 pt-2 pb-2"
						style={{ borderTop: "1px solid rgb(113 113 113 / 9%)" }}
					>
						<li className="mr-2 authorized_green">
							{props?.template?.completed_actions_count || 0}{" "}
							Completed
						</li>
						<li className="mr-2 grey-1">
							{props?.template?.pending_actions_count || 0}{" "}
							Pending
						</li>
						<li className="mr-2 unauthorized_red">
							{props?.template?.failed_actions_count || 0} Failed
						</li>
					</ul>
				)}
				{!props.inProgress && (
					<div
						className="mt-2 p-3"
						style={{
							borderTop: "1px solid rgb(113 113 113 / 9%)",
							backgroundColor: "#F8F9FB",
						}}
					>
						{/* <div className="flex-1 d-flex">
							<div className="flex-1 d-flex">
								<span
									style={{ fontWeight: "600" }}
									className="grey-1 font-8"
								>
									DEPARTMENTS
								</span>
							</div>
							<div className="flex-1 d-flex">
								<span
									style={{ fontWeight: "600" }}
									className="grey-1 font-8"
								>
									TAGS
								</span>
							</div>
						</div> */}
						{props?.template?.is_published && (
							<Button
								className="font-13 w-100 mt-3 p-2"
								onClick={(e) => {
									e.stopPropagation();
									setShow(false);
									handleModel.sayOpenToUseTemplateModal();
								}}
							>
								<img
									className="mr-2"
									height={10}
									width={10}
									src={playicon}
									alt=""
								/>
								Run Playbook
							</Button>
						)}
						{!props?.template?.is_published && (
							<Button
								type="border"
								className="font-13 w-100 grey-1 mt-3 p-2"
								onClick={(e) => {
									e.stopPropagation();
									setShow(false);
									history.push(
										`/playbook/${
											props.template.workflow_id ||
											props.template._id
										}`
									);
								}}
							>
								Edit Playbook
							</Button>
						)}
					</div>
				)}
			</div>
			{showBulkUserUploadModal && (
				<BulkUploadUsersModal
					workflowType={workflowType}
					data={props.template}
					onCloseModal={handleModel.sayCloseToBulkUserUploadModal}
					onRunPlaybook={handleModel.sayOpenToRunPlaybook}
				/>
			)}
			{showRunPlaybookModal && (
				<RunPlaybookBulkUserModal
					workflowType={workflowType}
					modalClass="workflows-template-modal"
					onCloseModal={handleModel.sayCloseToRunPlaybook}
					openModal={showRunPlaybookModal}
					onContinue={() => {
						history.push(`/workflows/${workflowType}#completed`);
					}}
					buttonTitle="See Recent Runs"
					title={`Running ${props?.template?.workflow_name}`}
					showButton={true}
				/>
			)}
			{openUseTemplateModal && (
				<SelectUserModal
					workflowType={workflowType}
					selectedUsers={[]}
					modalClass="workflows-template-modal"
					onCloseModal={handleModel.sayCloseToUseTemplateModal}
					openModal={openUseTemplateModal}
					onLoading={creatingNewWorflowFromTemplate}
					onContinue={(selectedUsers) => {
						onUserSelected(selectedUsers);
					}}
					buttonTitle="Continue"
					title={`Select users for ${workflowType}`}
					data={props.template}
					showBulkUser={true}
					onSelectBulkUser={handleModel.sayOpenToBulkUserUploadModal}
				/>
			)}
			{showDeleteWorkflowModal && (
				<DeleteWorkflowModal
					type="#playbooks"
					workflow_id={
						props.template?.workflow_id || props.template?._id
					}
					workflow_name={
						props.template?.workflow_name || props.template?.name
					}
					setShowDeleteWorkflowModal={setShowDeleteWorkflowModal}
					showDeleteWorkflowModal={showDeleteWorkflowModal}
					refreshTable={() => {
						if (props.tag) {
							dispatch(
								removeMostUsedTemplateFromStore(
									props.template?.workflow_id ||
										props.template?._id
								)
							);
						} else {
							dispatch(
								removeTemplateFromStore(
									props.template?.workflow_id ||
										props.template?._id
								)
							);
						}
					}}
				/>
			)}
			{openActionModal && (
				<ViewPlaybookModal
					modalClass="workflows-modal"
					onCloseModal={() => {
						handleModel.sayCloseToActionModal();
						dispatch(clearWorkflow());
						dispatch(clearWorkflowLogs());
					}}
					openModal={openActionModal}
					workflowId={
						props.template?.workflow_id || props.template?._id
					}
					onUseTemplate={() => {
						handleModel.sayCloseToActionModal();
						handleModel.sayOpenToUseTemplateModal();
					}}
					buttonTitle="Use Playbook"
					title={
						props.template?.workflow_name || props.template?.name
					}
					data={props.template}
					onEditPublishedPlaybook={() => {
						handleModel.sayCloseToActionModal();
						handleModel.sayOpenToEditPublishedPlaybook();
					}}
				/>
			)}
			{showUnpublishPlaybookModal && (
				<UnpublishPlaybookModal
					show={showUnpublishPlaybookModal}
					onHide={() => {
						handleModel.sayCloseToEditPublishedPlaybook();
					}}
					data={props.template}
				/>
			)}
			{showDuplicatePlaybookModal && (
				<DuplicatePlaybookModal
					modalClass="workflows-template-modal"
					show={showDuplicatePlaybookModal}
					onHide={() => {
						handleModel.sayCloseToDuplicatePlaybookModal();
					}}
					data={props.template}
				/>
			)}
		</>
	);
}
