import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import React, { useState } from "react";
import { Accordion, Card, Spinner } from "react-bootstrap";
import ViewPlaybookAction from "./ViewPlaybookAction";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button, BUTTON_TYPE } from "UIComponents/Button/Button";
import { updateWorkflow } from "../../redux/workflow";
import {
	bulkRunAPlaybookForUsers,
	createWorkflowFromTemplate,
} from "modules/workflow/service/api";
import ViewPlaybookRunUI from "./ViewPlaybookRunUI";
import { WorkflowModel } from "modules/workflow/model/model";
import { TriggerIssue } from "utils/sentry";
import { MONTH } from "utils/DateUtility";

const ViewPlaybookApplication = ({
	loading,
	playbookData,
	editPlaybook,
	onEditPublishedPlaybook,
	selectedSection,
	setSelectedSection,
	entity,
	onCloseModal,
	onshowCompileScreen,
}) => {
	const history = useHistory();
	const selectedUsers = useSelector(
		(state) => state.workflows.selected_users || []
	);
	const dispatch = useDispatch();
	const [isAPICalling, setIsAPICalling] = useState(false);

	const onCompileandRun = () => {
		const typeName = playbookData?.type || "";
		const selectedUserName =
			selectedUsers[0].user_name?.trim() || selectedUsers[0].name?.trim();
		const userCount = selectedUsers.length - 1;
		const date = new Date();
		const formattedDate = `${date.getDate()} ${MONTH[date.getMonth()]}`;
		const data = {
			user_ids: selectedUsers.map(
				(user) => user?.org_user_id || user?.user_id
			),
			template_id: playbookData?.id || playbookData?._id,

			name: `${typeName} ${selectedUserName}${
				userCount > 0 ? ` and ${userCount} others` : ""
			} on ${formattedDate}`,
		};
		setIsAPICalling(true);
		createWorkflowFromTemplate({ workflow: data })
			.then((res) => {
				setIsAPICalling(false);
				dispatch(updateWorkflow(new WorkflowModel(res)));
				onshowCompileScreen();
				//history.push(`/workflow/${res._id}#recommended`);
			})
			.catch((err) => {
				TriggerIssue("Error on using playbook to create workflow", err);
			});
	};

	const totalAppAction = (
		<>
			<span
				className="title-text grey-1 p-2 d-flex"
				style={{
					fontSize: "10px",
					fontWeight: "400",
				}}
			>
				{playbookData?.app_count > 1
					? `${playbookData?.app_count + " Applications"}`
					: `${playbookData?.app_count + " Application"}`}{" "}
				|{" "}
				{playbookData?.total_action_count > 1
					? `${playbookData?.total_action_count + " Actions"}`
					: `${playbookData?.total_action_count + " Action"}`}{" "}
				(
				{playbookData?.manual_action_count > 1
					? `${playbookData?.manual_action_count + " Manual tasks"}`
					: `${playbookData?.manual_action_count + " Manual task"}`}
				)
			</span>
		</>
	);
	const usePlaybookBtn = playbookData?.is_published && (
		<div
			style={{
				width: "50%",
			}}
			className="mt-2"
		>
			<Button
				className="p-3 col-12"
				style={{ flex: 1 }}
				// disabled={!lists.length > 0}
				onClick={() => {
					setSelectedSection && setSelectedSection("compileandrun");
				}}
			>
				Use Playbook
			</Button>
		</div>
	);

	const editPlaybookBtn = (
		<div
			style={{
				width: "40%",
			}}
			className="mt-2"
		>
			<Button
				className="p-3 col-12"
				type={BUTTON_TYPE.LINK}
				style={{ flex: 1, border: "1px solid" }}
				// disabled={!lists.length > 0}
				onClick={() => {
					if (playbookData?.is_published) {
						onEditPublishedPlaybook(playbookData);
					} else if (entity === "appPlaybooks") {
						editPlaybook(playbookData);
					} else {
						history.push(`/playbook/${playbookData?.id}`);
					}
				}}
			>
				Edit Playbook
			</Button>
		</div>
	);

	const compilePlaybookBtn = (
		<div
			style={{
				display: "flex",
				justifyContent: "right",
				width: "100%",
			}}
			className="mt-2"
		>
			<Button
				className="p-3"
				style={{
					width: "50%",
					border: "1px solid",
					color: "#FFFFFF",
					fontWeight: "500",
				}}
				disabled={!selectedUsers.length > 0 || isAPICalling}
				onClick={() => {
					onCompileandRun();
				}}
			>
				{isAPICalling && (
					<Spinner
						className="mr-2 blue-spinner action-edit-spinner"
						animation="border"
					/>
				)}
				Validate and Continue
			</Button>
		</div>
	);

	const applications =
		!loading &&
		playbookData.nodes &&
		playbookData.nodes.map((app, index) => {
			return (
				<div key={index}>
					<Accordion
						style={{ backgroundColor: "rgba(250, 251, 252, 0.5)" }}
						className="pr-3 pb-3 m-2"
						defaultActiveKey="0"
					>
						<Card>
							<Card.Header
								className="p-0"
								style={{
									backgroundColor: "transparent",
								}}
							>
								<Accordion.Toggle
									className="border-0"
									as={Card.Header}
									variant="link"
									eventKey="0"
								>
									{app?.apps && app?.apps?.length > 0 ? (
										<>
											<div className="position-relative d-flex mr-3">
												{app.apps
													.map((app, index) => (
														<GetImageOrNameBadge
															key={index}
															name={app.name}
															url={app.logo}
															width={15}
															height={15}
															imageClassName={
																index === 0
																	? " mr-n2 z-index-1  img-circle white-bg"
																	: null +
																	  "border-radius-4 object-contain avatar"
															}
															nameClassName={
																index === 0
																	? " mr-n2 z-index-1  img-circle white-bg"
																	: null +
																	  "img-circle avatar  mr-n2 z-index-1"
															}
														/>
													))
													.slice(0, 2)}
												<p className="bold-600 font-11 m-0 text-capitalize ml-2">
													{app.apps
														.map((res) => res.name)
														.slice(0, 2)
														.join(", ")}
													<span className="text-lowercase">
														{app.apps.length > 2 &&
															` ,+ ${
																app.apps
																	.length - 2
															} more apps`}
													</span>
												</p>
											</div>
										</>
									) : (
										<p className="bold-600 font-11 m-0">
											<img
												height={15}
												width={15}
												src={app?.logo}
												alt=""
												className="mr-2"
											/>
											{app?.name}
										</p>
									)}
								</Accordion.Toggle>
							</Card.Header>
							<Accordion.Collapse eventKey="0">
								<Card.Body className="p-0">
									<ViewPlaybookAction
										loading={loading}
										actions={app?.actions}
										application={app}
									/>
								</Card.Body>
							</Accordion.Collapse>
						</Card>
					</Accordion>
				</div>
			);
		});

	return (
		<div className="d-flex flex-column" style={{ width: "100%" }}>
			{selectedSection === "details" && (
				<div
					style={{
						width: "100%",
						backgroundColor: "#FFFFFF",
						borderRadius: "8px",
						height: "62vh",
					}}
				>
					{totalAppAction}
					<div style={{ overflowY: "auto", height: "55vh" }}>
						{applications}
					</div>
				</div>
			)}
			{selectedSection !== "details" && (
				<div
					style={{
						height: "62vh",
					}}
				>
					<ViewPlaybookRunUI
						entity={entity}
						loading={loading}
						playbookData={playbookData}
						selectedSection={selectedSection}
						onCloseModal={onCloseModal}
					/>
				</div>
			)}
			<div
				className="d-flex justify-content-evenly"
				style={{ marginTop: "10px", marginBottom: "10px" }}
			>
				{selectedSection === "details" && (
					<>
						{usePlaybookBtn}
						{editPlaybookBtn}
					</>
				)}
				{selectedSection === "compileandrun" && compilePlaybookBtn}
			</div>
		</div>
	);
};

export default ViewPlaybookApplication;
