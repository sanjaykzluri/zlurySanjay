import React, { useEffect, useRef, useState } from "react";
import "../../../../workflow/components/TemplateCard/TemplateCard.css";
import { useDispatch, useSelector } from "react-redux";
import { timeSince } from "utils/DateUtility";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import optionsButton from "assets/optionsButton.svg";
import GetImageOrNameBadge from "../../../../../common/GetImageOrNameBadge";
import warning from "assets/licenses/orangeExclamation.svg";
import "./appPlaybooks.css";
import DeleteWorkflowModal from "../../../../workflow/components/DeleteWorkflowModal/DeleteWorkflowModal";
import { useOutsideClickListener } from "utils/clickListenerHook";
import { ProgressBarLoader } from "common/Loader/ProgressBarLoader";
import ViewPlaybookModal from "modules/workflow/components/ViewPlaybookModal/ViewPlaybookModal";
import { clearWorkflow } from "../redux/appPlaybook";
import UnpublishPlaybookModal from "modules/workflow/components/UnpublishPlaybookModal/UnpublishPlaybookModal";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";
import { capitalizeFirstLetter } from "utils/common";
import { clearWorkflowLogs } from "modules/workflow/redux/workflow";
export default function AppPlaybookCard(props) {
	const dispatch = useDispatch();
	const [openUseTemplateModal, setUseTemplateOpenModal] = useState(false);
	const { app, name } = props;
	const { tags, org_department_tags } =
		props.template?.mini_playbook_data || [];
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
	useEffect(() => {
		if (pathname) {
			setWorkflowType(pathname.split("/")[2]);
		}
	}, [pathname]);
	useEffect(() => {}, [name]);
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
		sayOpenToEditPublishedPlaybook: () => {
			!showUnpublishPlaybookModal && setShowUnpublishPlaybookModal(true);
		},
		sayCloseToEditPublishedPlaybook: () => {
			showUnpublishPlaybookModal && setShowUnpublishPlaybookModal(false);
		},
	};

	return (
		<>
			<div
				ref={ref}
				className={`d-flex flex-column workflow-template-card border-radius-4  mb-3 pointer ${
					props.inProgress ? "w-progress" : ""
				}`}
				onClick={(e) => {
					e.stopPropagation();
					dispatch(clearWorkflow());
					setShow(false);
					setActionOpenModal(true);
				}}
			>
				<div className="d-flex flex-row justify-content-between  p-3">
					<GetImageOrNameBadge
						url={app.app_logo}
						name={app?.app_name}
						height={26}
					/>
					<div className="d-flex" style={{ gap: "5px" }}>
						<div className="font-10 bold-600">
							{props?.template?.is_published && (
								<p className="grey-1 mb-0 mt-2">
									<span className="publish_tag">
										PUBLISHED
									</span>
								</p>
							)}
							{!props?.template?.is_published && (
								<p className="grey-1 mb-0 mt-2">
									<span className="unpublish_tag">
										<img
											src={warning}
											style={{
												width: "10px",
												marginRight: "5px",
											}}
										/>
										Setup Required
									</span>
								</p>
							)}
						</div>
						<p className="font-10 grey-1 mb-0 mt-2">
							<span>
								{" "}
								{props.template?.workflow_action_count}{" "}
								{props.template?.workflow_action_count > 1
									? "actions"
									: "action"}
							</span>
						</p>
						{!props.inProgress ? (
							<OverlayTrigger
								trigger="click"
								placement="bottom-start"
								show={show}
								overlay={
									<div className="w-t-options">
										<ul className="list-style-none p-0 m-0 font-14">
											<li
												style={{ color: "#FF6767" }}
												className="pointer p-2"
												onClick={(e) => {
													e.stopPropagation();
													setShow(false);
													handleModel.sayOpenToDeleteWorkflowModal();
												}}
											>
												Delete Playbook
											</li>
										</ul>
									</div>
								}
							>
								<div
									className="pointer"
									onClick={(e) => {
										e.stopPropagation();
										setShow(true);
									}}
								>
									<img src={optionsButton} />
								</div>
							</OverlayTrigger>
						) : (
							<div className="more-options">
								<ProgressBarLoader height={20} width={20} />{" "}
							</div>
						)}
					</div>
				</div>
				<LongTextTooltip
					placement="top"
					maxWidth={"100%"}
					style={{ padding: "0px 10px 0px 10px", marginTop: "10px" }}
					text={capitalizeFirstLetter(props.template?.workflow_name)}
				/>

				<div
					className="d-flex mt-1 tags justify-content-between p-3"
					style={{ background: "rgb(250 250 250)", flexWrap: "wrap" }}
				>
					<div
						className="d-flex flex-column align-items-flex-start"
						style={{ width: "50%" }}
					>
						<p>DEPARTMENTS</p>
						<div className="d-flex">
							<span className=" cursor-pointer grey-1 tags text-wrap">
								{Array.isArray(org_department_tags) &&
									org_department_tags
										?.map((org) => org.department_name)
										.slice(0, 1)}
							</span>
							<a className="cursor-pointer">
								{org_department_tags.length == 0 && (
									<div>+ Add Department</div>
								)}
							</a>
							<OverlayTrigger
								placement="bottom"
								overlay={
									<Tooltip className="userMetaInfoCard z-index-10005">
										<div
											style={{
												padding: "10px",
											}}
										>
											{Array.isArray(
												org_department_tags
											) &&
												org_department_tags
													.map(
														(dept) =>
															dept.department_name
													)
													.join(", ")}
										</div>
									</Tooltip>
								}
							>
								<span className="cursor-pointer ml-1 tags">
									{org_department_tags.length > 1 &&
										"+" +
											(
												org_department_tags?.length - 1
											).toString()}
								</span>
							</OverlayTrigger>
						</div>
					</div>
					<div
						className="d-flex flex-column align-items-flex-start"
						style={{ width: "50%" }}
					>
						<p>TAGS</p>
						<div className="d-flex">
							<span className="cursor-pointer grey-1 tags text-wrap">
								{Array.isArray(tags) && tags.slice(0, 1)}
							</span>
							<a className="cursor-pointer">
								{tags.length == 0 && <div>+ Add Tag</div>}
							</a>
							<OverlayTrigger
								placement="bottom"
								overlay={
									<Tooltip className="userMetaInfoCard z-index-10005">
										<div
											style={{
												padding: "10px",
											}}
										>
											{Array.isArray(tags) &&
												tags.join(", ")}
										</div>
									</Tooltip>
								}
							>
								<span className="cursor-pointer ml-1 tags">
									{tags.length > 1 &&
										"+" + (tags?.length - 1).toString()}
								</span>
							</OverlayTrigger>
						</div>
					</div>
					<div className="d-flex" style={{ width: "50%" }}>
						<p className="grey-1 mt-2 mb-0 font-8">
							Created by {props.template?.created_by_user_name}{" "}
							{`${timeSince(
								new Date(),
								props.inProgress
									? props.template?.created_on
									: props.template?.created_at
							)} ago`}{" "}
						</p>
					</div>
				</div>
				{props.inProgress && (
					<ul
						className="d-flex list-style-none p-0 font-10 mb-0 mt-4  pl-0 pt-2"
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
			</div>
			{showDeleteWorkflowModal && (
				<DeleteWorkflowModal
					type="#playbooks"
					workflow_id={props.template?.workflow_id}
					workflow_name={props.template?.workflow_name}
					setShowDeleteWorkflowModal={setShowDeleteWorkflowModal}
					showDeleteWorkflowModal={showDeleteWorkflowModal}
					refreshTable={props.fetchData}
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
					workflowId={props.template?.workflow_id}
					onUseTemplate={() => {
						handleModel.sayCloseToActionModal();
						handleModel.sayOpenToUseTemplateModal();
					}}
					buttonTitle="Use Playbook"
					title={props.template?.workflow_name}
					data={props.template}
					entity="appPlaybooks"
					onEditPublishedPlaybook={() => {
						handleModel.sayCloseToActionModal();
						handleModel.sayOpenToEditPublishedPlaybook();
					}}
					editPlaybook={(e) => {
						handleModel.sayCloseToActionModal();
						props.openModal(props.template);
					}}
				/>
			)}
			{showUnpublishPlaybookModal && (
				<UnpublishPlaybookModal
					show={showUnpublishPlaybookModal}
					entity="appPlaybooks"
					onClose={() => {
						handleModel.sayCloseToEditPublishedPlaybook();
						props.openModal(props.template);
					}}
					onHide={() => {
						handleModel.sayCloseToEditPublishedPlaybook();
					}}
					data={props.template}
				/>
			)}
		</>
	);
}
