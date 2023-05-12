import dayjs from "dayjs";
import { SUMMARISED_RUN_LOG_TABS } from "modules/workflow/constants/constant";
import React, { useState } from "react";
import { Card, Tab, Tabs } from "react-bootstrap";
import RunLogsConfiguredParameters from "./RunLogsConfiguredParameters";
import {
	ActionAbortedCard,
	ActionCancelledCard,
	ActionErrorCard,
	ActionInfoCard,
	ActionStaticPendingCard,
} from "./SummarisedRunLog";

const SummarisedRunLogTabs = ({
	node,
	handleRunAction,
	retryFailedAction,
	showRetryFailedButtonLoading,
	retryFailedObject,
}) => {
	const [selectedTab, setSelectedTab] = useState(SUMMARISED_RUN_LOG_TABS.log);

	const logs = (
		<Card.Body
			style={{
				backgroundColor: "#F8F9FB",
			}}
			className="ml-4"
		>
			{Array.isArray(node?.action?.action_log) &&
				node?.action?.action_log.length > 0 &&
				node?.action?.action_log?.map((logData) => (
					<div
						style={{
							flexDirection: "column",
						}}
						className="d-flex"
						key={node.action._id}
					>
						<div
							style={{
								justifyContent: "space-between",
								borderLeft: "1px solid #EBEBEB",
							}}
							className="d-flex"
						>
							{node.action.action_status === "pending" ||
							node.action.action_status === "cancelled" ||
							node.action.action_status === "completed" ||
							node.action.action_status === "aborted" ||
							node.action.action_status === "scheduled" ||
							node.action.action_status === "set_for_approval" ||
							node.action.action_status === "rejected" ? (
								<div
									style={{
										backgroundColor: "#F8F9FB",
										width: "auto",
										marginRight: "20px",
									}}
								>
									<div
										style={{
											justifyContent: "space-between",
										}}
										className="flex"
									>
										{logData?.type === "aborted" ? (
											<ActionAbortedCard
												title={logData.title}
												description={
													logData.description
												}
												scheduleTimestamp={
													logData?.schedule_timestamp
												}
											/>
										) : logData?.type === "error" ? (
											<ActionErrorCard
												title={logData.title}
												description={
													logData.description
												}
												logData={node.action}
												handleRunAction={
													handleRunAction
												}
												scheduleTimestamp={
													logData?.schedule_timestamp
												}
											/>
										) : logData?.type === "info" ? (
											<ActionInfoCard
												title={logData.title}
												description={
													logData.description
												}
												handleRunAction={
													handleRunAction
												}
												scheduleTimestamp={
													logData?.schedule_timestamp
												}
											/>
										) : logData?.type === "pending" ? (
											<ActionStaticPendingCard
												title={logData.title}
												description={
													logData.description
												}
												logData={node.action}
												handleRunAction={
													handleRunAction
												}
												scheduleTimestamp={
													logData?.schedule_timestamp
												}
											/>
										) : logData?.type === "cancelled" ? (
											<ActionCancelledCard
												title={logData.title}
												description={
													logData.description
												}
												scheduleTimestamp={
													logData?.schedule_timestamp
												}
											/>
										) : (
											""
										)}
									</div>
								</div>
							) : node.action.action_status === "failed" ? (
								<div
									style={{
										backgroundColor: "#F8F9FB",
										width: "auto",
										marginRight: "20px",
									}}
								>
									<div
										style={{
											justifyContent: "space-between",
										}}
										className="flex"
									>
										<div>
											{logData.type === "error" ? (
												<ActionErrorCard
													title={
														typeof logData.title ===
														"object"
															? logData?.title
																	?.code
															: logData?.title
													}
													description={
														logData.description
													}
													logData={node.action}
													handleRunAction={
														handleRunAction
													}
													retryFailedAction={
														retryFailedAction
													}
													showRetryFailedButtonLoading={
														showRetryFailedButtonLoading
													}
													retryFailedObject={
														retryFailedObject
													}
													scheduleTimestamp={
														logData?.schedule_timestamp
													}
												/>
											) : logData?.type === "info" ? (
												<ActionInfoCard
													title={logData.title}
													description={
														logData.description
													}
													handleRunAction={
														handleRunAction
													}
													scheduleTimestamp={
														logData?.schedule_timestamp
													}
												/>
											) : logData?.type === "aborted" ? (
												<ActionAbortedCard
													title={logData.title}
													description={
														logData.description
													}
													scheduleTimestamp={
														logData?.schedule_timestamp
													}
												/>
											) : (
												""
											)}
										</div>
									</div>
								</div>
							) : (
								<>
									<ActionCancelledCard
										title={logData.title}
										description={logData.description}
										scheduleTimestamp={
											logData?.schedule_timestamp
										}
									/>
								</>
							)}
							{logData?.type === "pending" ? (
								<div
									style={{
										color: "rgba(113, 113, 113, 1)",
									}}
									className="font-13"
								>
									{"Pending"}
								</div>
							) : (
								<div
									style={{
										color: "rgba(113, 113, 113, 1)",
									}}
									className="font-13"
								>
									{dayjs(logData?.timestamp).format(
										"D MMM, HH:mm:ss "
									)}
								</div>
							)}
						</div>
					</div>
				))}
		</Card.Body>
	);

	const appResponse = (
		<div
			className="p-3 ml-1"
			style={{
				border: "0px",
				backgroundColor: "#F8F9FB",
				overflowY: "auto",
				maxHeight: "200px",
			}}
		>
			<pre
				style={{
					whiteSpace: "break-spaces",
					fontSize: "10px",
					lineHeight: "13px",
				}}
			>
				{node?.action?.log_meta ? (
					node?.action?.log_meta?.apiResponse ? (
						JSON.stringify(
							node?.action?.log_meta?.apiResponse,
							null,
							2
						)
					) : (
						<span style={{ color: "gray" }}>N/A</span>
					)
				) : (
					JSON.stringify(node?.action, null, 2)
				)}
			</pre>
		</div>
	);

	const tabs = (
		<Tabs
			id="sidebar_tabs"
			activeKey={selectedTab}
			onSelect={(tab) => {
				setSelectedTab(tab);
			}}
			className="h-auto w-auto ml-4 mb-1"
		>
			<Tab
				eventKey={SUMMARISED_RUN_LOG_TABS.log}
				title={SUMMARISED_RUN_LOG_TABS.log}
			>
				{logs}
			</Tab>

			<Tab
				eventKey={SUMMARISED_RUN_LOG_TABS.configured_parameters}
				title={SUMMARISED_RUN_LOG_TABS.configured_parameters}
			>
				<RunLogsConfiguredParameters action={node?.action} />
			</Tab>

			<Tab
				eventKey={SUMMARISED_RUN_LOG_TABS.app_response}
				title={SUMMARISED_RUN_LOG_TABS.app_response}
			>
				{appResponse}
			</Tab>
		</Tabs>
	);

	return <>{tabs}</>;
};

export default SummarisedRunLogTabs;
