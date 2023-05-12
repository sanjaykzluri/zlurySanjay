import React from "react";
import "./ViewPlaybook.css";
import { useHistory } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Button, BUTTON_TYPE } from "UIComponents/Button/Button";
import dayjs from "dayjs";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";
import ViewRun from "modules/applications/components/automation/ViewRun";
import {
	getWorkflowsPlaybookIdFilterMetaData,
	getWorkflowsRuleIdFilterMetaData,
} from "modules/workflow/containers/Workflows/utils/workflows.utils";
import { getAutomationsRuleIdFilterMetaData } from "modules/applications/components/automation/utils/automation.util";

const ViewPlaybookDetails = ({
	loading,
	playbookData,
	entity,
	onCloseModal,
}) => {
	const history = useHistory();

	const showRuns = () => {
		onCloseModal();
		if (entity === "appPlaybooks") {
			history.push(
				`/applications/${
					playbookData.mini_playbook_data?.app_id
				}/?metaData=${getWorkflowsPlaybookIdFilterMetaData(
					playbookData?._id
				)}&selectedTab=runs#automation`
			);
		} else {
			history.push(
				`/workflows/${
					playbookData?.type
				}/?metaData=${getWorkflowsPlaybookIdFilterMetaData(
					playbookData?._id
				)}#completed`
			);
		}
	};
	const showRuleRuns = () => {
		onCloseModal();
		if (entity === "appPlaybooks") {
			history.push(
				`/applications/${
					playbookData.mini_playbook_data?.app_id
				}/?metaData=${getAutomationsRuleIdFilterMetaData(
					playbookData?._id
				)}&selectedTab=runs#automation`
			);
		} else {
			history.push(
				`/workflows/${
					playbookData?.type
				}/?metaData=${getWorkflowsRuleIdFilterMetaData(
					playbookData?._id
				)}#completed`
			);
		}
	};
	const playbookInfo = (
		<>
			<LongTextTooltip
				text={playbookData.name}
				maxWidth={"20vw"}
				placement="bottom"
				style={{
					fontSize: "18px",
					fontWeight: "600",
				}}
			/>
			<div
				style={{
					borderTop: "1px dashed rgb(113 113 113 / 9%)",
					marginTop: "10px",
					marginBottom: "10px",
				}}
			/>
			{playbookData?.createdOn && (
				<div className="d-flex justify-content-between">
					<span
						style={{ fontWeight: "600", fontSize: "10px" }}
						className="grey-1"
					>
						CREATED BY
					</span>
					<p
						className="black"
						style={{ fontSize: "10px", width: "60%" }}
					>
						{playbookData?.createdByUserName}
					</p>
				</div>
			)}
			{playbookData?.publishedByUserName && playbookData?.publishedAt && (
				<div className="d-flex justify-content-between">
					<span
						style={{ fontWeight: "600", fontSize: "10px" }}
						className="grey-1"
					>
						PUBLISHED BY
					</span>
					<p
						className="black"
						style={{ fontSize: "10px", width: "60%" }}
					>
						{playbookData?.publishedByUserName} on{" "}
						{dayjs(playbookData?.publishedAt).format(
							"D MMM, HH:mm"
						)}
					</p>
				</div>
			)}
			<div style={{ border: "1px dashed #EBEBEB" }}></div>
			{entity === "appPlaybooks" && (
				<>
					{Array.isArray(
						playbookData.mini_playbook_data.org_department_tags
					) &&
						playbookData.mini_playbook_data.org_department_tags
							.length > 0 && (
							<p
								style={{
									color: "#717171",
									fontSize: "10px",
									fontWeight: "600",
									marginTop: "10px",
								}}
							>
								DEPARTMENTS
							</p>
						)}
					<div className="d-flex align-items-flex-start">
						<span className=" cursor-pointer grey-1 tags text-wrap">
							{Array.isArray(
								playbookData.mini_playbook_data
									.org_department_tags
							) &&
								playbookData.mini_playbook_data.org_department_tags
									?.map((org) => org.department_name)
									.slice(0, 1)}
						</span>
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
											playbookData.mini_playbook_data
												.org_department_tags
										) &&
											playbookData.mini_playbook_data.org_department_tags
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
								{playbookData.mini_playbook_data
									.org_department_tags.length > 1 &&
									"+" +
										(
											playbookData.mini_playbook_data
												.org_department_tags?.length - 1
										).toString()}
							</span>
						</OverlayTrigger>
					</div>
					{Array.isArray(playbookData.mini_playbook_data.tags) &&
						playbookData.mini_playbook_data.tags.length > 0 && (
							<p
								style={{
									color: "#717171",
									fontSize: "10px",
									fontWeight: "600",
									marginTop: "10px",
								}}
							>
								TAGS
							</p>
						)}
					<div className="d-flex">
						<span className="cursor-pointer grey-1 tags text-wrap">
							{Array.isArray(
								playbookData.mini_playbook_data.tags
							) &&
								playbookData.mini_playbook_data.tags.slice(
									0,
									1
								)}
						</span>

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
											playbookData.mini_playbook_data
												?.tags
										) &&
											playbookData.mini_playbook_data?.tags.join(
												", "
											)}
									</div>
								</Tooltip>
							}
						>
							<span className="cursor-pointer ml-1 tags">
								{playbookData.mini_playbook_data?.tags.length >
									1 &&
									"+" +
										(
											playbookData.mini_playbook_data
												?.tags?.length - 1
										).toString()}
							</span>
						</OverlayTrigger>
					</div>
				</>
			)}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					height: "10vh",
					justifyContent: "space-around",
				}}
			>
				<ViewRun onClicked={showRuns} />
				<ViewRun text="View Rules" onClicked={showRuleRuns} />
			</div>
			{/* {playbookData?.lastUsedByUserName && playbookData?.lastUsedAt && (
				<div>
					<span
						style={{ fontWeight: "600", fontSize: "10px" }}
						className="grey-1"
					>
						LAST USED
					</span>
					<p className="mb-1 mt-1 font-14 black">
						{playbookData?.lastUsedByUserName} on{" "}
						{dayjs(playbookData?.lastUsedAt).format("D MMM, HH:mm")}
					</p>
				</div>
			)} */}
		</>
	);

	return (
		<>
			<div className="action-list d-flex flex-column justify-content-start flex-1">
				<div
					className="action-list d-flex flex-column p-4 justify-content-start"
					style={{ backgroundColor: "#FFFFFF", borderRadius: "8px" }}
				>
					{playbookInfo}
				</div>
			</div>
		</>
	);
};

export default ViewPlaybookDetails;
