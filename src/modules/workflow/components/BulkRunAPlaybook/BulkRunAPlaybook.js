import React, { useState } from "react";
import playbookPlay from "assets/users/playbookPlay.svg";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import { useSelector } from "react-redux";
import { WORFKFLOW_TYPE } from "modules/workflow/constants/constant";
import {
	bulkRunAPlaybookForUsers,
	getAllPlaybookWorkflowsServiceV2,
} from "modules/workflow/service/api";
import { searchPlaybookData } from "../../../applications/components/automation/service/automation-api";
import ActionModal from "modules/workflow/components/ActionModal/ActionModal";
import { useHistory } from "react-router-dom";
import { TriggerIssue } from "utils/sentry";
import WorkflowsNameInTable from "modules/workflow/components/WorkflowName.js";
import { capitalizeFirstLetter } from "utils/common";
import arrowdropdown from "assets/arrowdropdown.svg";
import rightarrow from "assets/users/rightarrow.svg";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { trackActionSegment } from "modules/shared/utils/segment";

export default function BulkRunAPlaybook({
	userIds = [],
	className,
	style,
	checkAll,
	metaData,
	checkAllExceptionData,
	playbookOptionsMenuRight = -275,
	playbookTypeMenuRight,
	appIdforMiniPlaybook,
	pageLocation,
}) {
	const history = useHistory();
	const [playbook, setPlaybook] = useState();
	const [loading, setLoading] = useState(false);
	const { org_beta_features } = useSelector((state) => state.userInfo);
	const playbookOptions = [
		WORFKFLOW_TYPE.ONBOARDING,
		WORFKFLOW_TYPE.OFFBOARDING,
	];
	const options =
		appIdforMiniPlaybook && org_beta_features?.includes("automation")
			? [...playbookOptions, WORFKFLOW_TYPE.APPPLAYBOOK]
			: playbookOptions;

	const callBulkRunAPlaybook = () => {
		trackActionSegment("Clicked on Run Playbook Button", {
			page: pageLocation,
		});
		setLoading(true);
		bulkRunAPlaybookForUsers(playbook?.workflow_id || playbook?._id, {
			set_all: checkAll,
			user_ids: checkAll ? checkAllExceptionData : userIds,
			filter_by: metaData?.filter_by,
		})
			.then((res) => {
				if (!playbook.type) {
					history.push(
						`/applications/${playbook.mini_playbook_data.app_id}?selectedTab=runs#automation`
					);
				} else {
					history.push(`/workflows/${playbook.type}#completed`);
				}
				setPlaybook();
				setLoading(false);
			})
			.catch((err) => {
				TriggerIssue("Error in bulk running a playbook", err);
				setPlaybook();
				setLoading(false);
			});
	};

	return (
		<>
			<div
				className={className}
				style={style}
				key={JSON.stringify(playbook)}
			>
				<Dropdown
					isParentDropdown={true}
					toggler={
						<div
							className="d-flex align-items-center border-1 border-radius-4"
							style={{
								height: "34px",
								padding: "0 8px",
								borderColor: "#dddddd !important",
							}}
						>
							<img src={playbookPlay} />
							<div className="font-13 ml-1">Run a playbook</div>
							<img
								src={arrowdropdown}
								style={{ marginLeft: "8px" }}
							/>
						</div>
					}
					top={35}
					right={playbookTypeMenuRight}
					options={options}
					optionFormatter={(option) => (
						<Dropdown
							top={0}
							right={playbookOptionsMenuRight}
							toggler={
								<div
									className="d-flex align-items-center"
									style={{
										height: "34px",
										width: "184px",
									}}
								>
									<div className="d-flex align-items-center font-12">
										{option === WORFKFLOW_TYPE.APPPLAYBOOK
											? capitalizeFirstLetter(option)
											: capitalizeFirstLetter(option) +
											  " " +
											  "playbook"}
									</div>
									<img
										src={rightarrow}
										style={{ marginLeft: "8px" }}
									/>
								</div>
							}
							options={[]}
							apiSearch={true}
							apiSearchCall={(query, cancelToken) =>
								option !== "appPlaybook"
									? getAllPlaybookWorkflowsServiceV2(
											option,
											0,
											query
									  )
									: searchPlaybookData(0, 6, query)
							}
							apiSearchDataKey="data"
							optionFormatter={(option) =>
								BulkRunAPlaybookOptionFormatter({
									playbook: option,
								})
							}
							onOptionSelect={(option) => setPlaybook(option)}
							optionStyle={{
								padding: "0px !important",
								flexDirection: "column",
								width: "285px",
								minHeight: "60px",
								alignItems: "flex-start",
								paddingTop: "6px",
								paddingBottom: "6px",
							}}
							menuStyle={{
								width: "295px",
							}}
							searchBoxStyle={{ width: "260px" }}
							menuHeaderText="Select playbook to run"
						/>
					)}
					menuStyle={{ overflow: "unset", width: "180px" }}
					optionStyle={{ padding: "0px !important" }}
				/>
			</div>
			{!!playbook && (
				<ActionModal
					modalClass="workflows-modal"
					onCloseModal={() => setPlaybook()}
					openModal={!!playbook}
					workflowId={playbook?.workflow_id || playbook?._id}
					onUseTemplate={() => callBulkRunAPlaybook()}
					buttonTitle="Run Playbook"
					title={playbook?.workflow_name || playbook?.name}
					data={playbook}
					loading={loading}
				/>
			)}
		</>
	);
}

export function BulkRunAPlaybookOptionFormatter({ playbook }) {
	return (
		<>
			<div className="d-flex justfiy-content-between">
				<WorkflowsNameInTable
					hideTitle={true}
					title={
						playbook?.workflow_name ||
						playbook?.workflowTemplateName ||
						playbook?.name
					}
					id={
						playbook?.workflow_id ||
						playbook?.workflowTemplateId ||
						playbook?._id
					}
					allApps={
						(playbook?.apps || playbook?.workflow_apps) &&
						(playbook?.apps?.length ||
							playbook?.workflow_apps?.length)
							? playbook?.apps || playbook?.workflow_apps
							: playbook?.mini_playbook_data
							? [playbook?.mini_playbook_data]
							: []
					}
					totalActionsCount={
						playbook?.action_count ||
						playbook?.workflow_action_count
							? playbook?.action_count ||
							  playbook?.workflow_action_count
							: 0
					}
					total_apps={
						playbook?.app_count || playbook?.workflow_app_count || 0
					}
					total_actions={
						playbook?.action_count ||
						playbook?.workflow_action_count ||
						0
					}
					iconSize="13.5px"
				/>
				<div className="d-flex align-items-center font-8 grey-1">{`${capitalizeFirstLetter(
					playbook.type
				)} | ${
					playbook.action_count ||
					playbook?.workflow_action_count ||
					0
				} Actions`}</div>
			</div>
			<OverlayTrigger
				overlay={
					<Tooltip>
						{playbook.workflow_name ||
							playbook?.workflowTemplateName ||
							playbook?.name}
					</Tooltip>
				}
			>
				<div
					className="bold-500 mt-1 font-13 truncate_10vw"
					style={{ maxWidth: "265px" }}
				>
					{playbook.workflow_name ||
						playbook?.workflowTemplateName ||
						playbook?.name}
				</div>
			</OverlayTrigger>
		</>
	);
}
