import { ACTION_TYPE } from "modules/workflow/constants/constant";
import React from "react";
import ScheduleApprovalAction from "../ScheduleApprovalAction/ScheduleApprovalAction";
import CompileWorkflowActionRenderData from "./compileActionRenderData";
import green_tick_nocircle from "assets/green_tick_nocircle.svg";
import error_nocircle from "assets/error_nocircle.svg";
import action_error from "assets/workflow/action_error.svg";
const CompileworkflowAction = ({ loading, actions, application }) => {
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
						className="d-flex justify-content-between p-3"
					>
						<div
							className="d-flex flex-column"
							style={{ width: "100%" }}
						>
							<div className="d-flex justify-content-space-between">
								<span className="position-relative font-10 z-action-index mr-3 text-center p-2">
									<span className="position-center">
										{action.index}
									</span>
								</span>
								<h3 className="m-0 font-16 bold-600 grey flex-grow-1 flex-fill mb-1">
									<span
										style={{
											color: !action.isSchemaValid
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
											: action.action_name}
									</span>
									{action.action_type ===
										ACTION_TYPE.MANUAL && (
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
								<span>
									<img
										src={
											action.isSchemaValid &&
											action.ieValidation
												? green_tick_nocircle
												: error_nocircle
										}
										width="20px"
										height="20px"
									/>
									<label
										style={{
											color:
												action.isSchemaValid &&
												action.ieValidation
													? "#5FCF64"
													: "#FE6955",
											height: "12px",
										}}
									>
										{action.isSchemaValid &&
										action.ieValidation
											? "Validated"
											: "Errors"}
									</label>
								</span>
							</div>

							{scheduleApprovalSection(action)}
							<div>
								<CompileWorkflowActionRenderData
									action={action}
								/>
							</div>
							{action.schemaValidationError &&
								Object.keys(action.schemaValidationError)
									.length > 0 &&
								action.schemaValidationError.message && (
									<div
										style={{
											backgroundColor: "#FFE9E5",
											borderRadius: "8px",
											fontSize: "11px",
											padding: "8px",
										}}
									>
										<img
											src={action_error}
											style={{ marginRight: "10px" }}
										/>
										{action.schemaValidationError.message}
									</div>
								)}
							{action.ieValidationError &&
								Object.keys(action.ieValidationError).length >
									0 &&
								action.ieValidationError.message && (
									<div
										style={{
											backgroundColor: "#FFE9E5",
											borderRadius: "8px",
											fontSize: "11px",
											padding: "8px",
										}}
										className="mt-2"
									>
										<img
											src={action_error}
											style={{ marginRight: "10px" }}
										/>
										{action.ieValidationError.message}
									</div>
								)}
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

export default CompileworkflowAction;
