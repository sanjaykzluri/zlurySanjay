import { Loader } from "common/Loader/Loader";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import onboarding from "assets/icons/onboarding-blue.svg";
import offboarding from "assets/workflow/offboarding.svg";
import { WORFKFLOW_TYPE } from "modules/workflow/constants/constant";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";
import UsersSelector from "./UsersSelector";
import { Modal } from "UIComponents/Modal/Modal";
import WorkflowCompilationDetails from "./workflowCompilationDetails";
import {
	clearWorkflow,
	clearWorkflowLogs,
	compileWorkflow,
} from "modules/workflow/redux/workflow";

const CompileWorkflow = ({
	openModal,
	modalClass,
	onCloseModal,
	entity,
	isTemplate,
}) => {
	const [selectedSection, setSelectedSection] = useState("details");
	const workflow = useSelector((state) => state.workflows.workflow);
	const users = useSelector((state) => state.workflows.workflow.users || []);
	const [currentUser, setCurrentUser] = useState({});
	const [compiling, setCompiling] = useState(false);
	const dispatch = useDispatch();
	const compiledExecDocs = useSelector(
		(state) => state.workflows.compiledExecDocs
	);
	const [playbookData, setPlaybookData] = useState({});

	useEffect(() => {
		if (
			currentUser &&
			Object.keys(currentUser).length &&
			compiledExecDocs?.length > 0
		) {
			const currentPlaybookData = compiledExecDocs.filter(
				(exec_doc) =>
					exec_doc.user_id.toString() ===
					currentUser.user_id?.toString()
			)[0];

			setPlaybookData(currentPlaybookData);
		}
	}, [currentUser, compiledExecDocs]);
	useEffect(() => {
		if (workflow.id) {
			dispatch(compileWorkflow(workflow.id));
		}
	}, [users]);
	useEffect(() => {
		setCompiling(false);
	}, [compiledExecDocs]);
	useEffect(() => {
		setCompiling(true);
	}, [users]);
	useEffect(() => {
		return () => {
			dispatch(clearWorkflow());
			dispatch(clearWorkflowLogs());
		};
	}, []);
	const header = (
		<>
			<div>
				<img
					height={30}
					width={25}
					src={
						workflow?.type === WORFKFLOW_TYPE.ONBOARDING
							? onboarding
							: offboarding
					}
					alt=""
				/>
			</div>
			<div className="d-flex flex-column ml-2">
				<span
					className="title-text grey-1"
					style={{ fontSize: "10px", fontWeight: "600" }}
				>
					{workflow?.type?.toUpperCase()}
				</span>

				<LongTextTooltip
					text={workflow.name}
					maxWidth={"20vw"}
					placement="bottom"
					style={{
						fontSize: "18px",
						fontWeight: "600",
						paddingBottom: "12px",
					}}
				/>
			</div>
			<div
				style={{
					borderTop: "1px solid rgb(113 113 113 / 9%)",
					marginTop: "10px",
					marginBottom: "10px",
				}}
			/>
		</>
	);

	return (
		<>
			<Modal
				contentClassName={modalClass}
				imgClassName="imgClass"
				dialogClassName="view_playbook_modal_dialog align-items-stretch"
				show={openModal}
				titleClass={"flex-1 d-flex pl-0"}
				headerStyle={"p-0"}
				onClose={() => onCloseModal()}
			>
				<div
					style={{
						// maxHeight: "85vh",
						minHeight: "85vh",
						backgroundColor: "#F5F6F9",
					}}
				>
					<div
						style={{
							backgroundColor: "#FFFFFF",
							width: "100%",
						}}
						className="justify-content-start d-flex  px-3 pt-3 pb-1 mt-2 mb-2"
					>
						{header}
					</div>
					{compiling && (
						<div
							className="d-flex flex-column justify-content-center align-items-center"
							style={{ height: "70vh" }}
						>
							<Spinner
								className="mr-2 ml-2"
								style={{ color: "#2266E2" }}
								animation="border"
							/>
							<h6>Validating your workflow ...</h6>
							<p style={{ fontSize: "11px" }}>
								Validating the workflow allows us to look for
								errors and validate your inputs
							</p>
						</div>
					)}
					{!compiling && (
						<div className="d-flex flex-row m-2">
							<div
								style={{
									borderRadius: "8px",
									// height: "70vh",
								}}
								className="d-flex p-2 flex-1 flex-column"
							>
								<UsersSelector
									setCurrentUser={setCurrentUser}
									currentUser={currentUser}
									setCompiling={setCompiling}
								/>
							</div>
							<div className="d-flex flex-2 px-2">
								{playbookData &&
									Object.keys(playbookData).length > 0 && (
										<WorkflowCompilationDetails
											playbookData={playbookData}
											selectedSection={selectedSection}
											setSelectedSection={
												setSelectedSection
											}
											entity={entity}
											onCloseModal={onCloseModal}
											currentUser={currentUser}
											isTemplate={isTemplate}
											// onEditPublishedPlaybook={
											// 	onEditPublishedPlaybook
											// }
											// onCloseModal={onCloseModal}
											// entity={entity}
											// editPlaybook={editPlaybook}
										/>
									)}
							</div>
						</div>
					)}
				</div>
			</Modal>
		</>
	);
};

export default CompileWorkflow;
