import { ACTION_TYPE } from "modules/workflow/constants/constant";
import React from "react";
import ScheduleApprovalAction from "../ScheduleApprovalAction/ScheduleApprovalAction";
import ViewPlaybookActionRenderData from "./ViewPlaybookActionRenderData";

const ViewPlaybookAction = ({ loading, actions, application }) => {
	const scheduleApprovalSection = (action) => (
		<>
			{action && (
				<div className="d-flex flex-1">
					<ScheduleApprovalAction
						scheduledData={action?.scheduledData}
						approvalData={action?.approvers}
						action={action}
						isEditable={false}
					/>
				</div>
			)}
		</>
	);

	const action =
		!loading &&
		actions &&
		actions.map((action, index) => {
			return (
				<>
					<div
						key={index}
						style={{
							marginBottom:
								index === actions?.length - 1 ? "10px" : "",
						}}
						className="d-flex justify-content-between p-4"
					>
						<div className="align-self-center">
							<div className="d-flex">
								<span className="position-relative font-10 z-action-index mr-3 text-center p-2">
									<span className="position-center">
										{action.index}
									</span>
								</span>
								<div>
									<h3 className="m-0 font-16 bold-600 grey flex-grow-1 flex-fill mb-1">
										<span
											style={{
												color: !action.isValidated
													? "#FF6767"
													: "#484848",
											}}
										>
											{application.isGrouped
												? `${action.name} from ${
														application.apps?.length
												  } ${
														application.isGrouped ===
														"needs_review"
															? "uncategorized"
															: application.isGrouped
												  } apps `
												: action.name}
										</span>
										{action.type === ACTION_TYPE.MANUAL && (
											<span
												style={{
													backgroundColor: "#5ABAFF",
													bottom: "2px",
												}}
												className="position-relative font-8 p-1 primary-color-bg white bold-700 m-2 border-radius-2 pl-2 pr-2"
											>
												TASK
											</span>
										)}
									</h3>
									<h4 className="grey-1 font-11 mb-1">
										{action.description}
									</h4>
									{action.type === ACTION_TYPE.MANUAL &&
										action?.data[0]?.v?.assignee?.length >
											0 && (
											<p className="grey-1 font-11 mb-1">
												<span className="o-6 mr-2">
													Assignee:
												</span>
												<span className="bold-500">
													{action?.data[0]?.v
														?.assignee[0]
														?.user_name ||
														action?.data[0]?.v
															?.assignee[0]
															?.user_email ||
														action?.data[0]?.v
															?.assignee[0]
															?.title}
												</span>
											</p>
										)}
									{scheduleApprovalSection(action)}
									<div>
										<ViewPlaybookActionRenderData
											action={action}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
					{index !== actions?.length - 1 && (
						<div
							style={{
								borderTop: "1px solid rgb(113 113 113 / 9%)",
								marginTop: "1px",
							}}
						></div>
					)}
				</>
			);
		});

	return <>{action}</>;
};

export default ViewPlaybookAction;
