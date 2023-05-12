import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./Overview.css";
import { Empty } from "../Empty/Empty";
import { Button } from "../../../../UIComponents/Button/Button";
import plus from "../../../../assets/icons/plus-blue-bold.svg";
import { SIDEBAR_TABS, ICONS, ACTION_TYPE } from "../../constants/constant";
import GetImageOrNameBadge from "../../../../common/GetImageOrNameBadge";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import info from "../../../../assets/icons/info-orange.svg";
import error from "../../../../assets/icons/error.svg";

function Overview(props) {
	const workflow = useSelector((state) => state.workflows.workflow);
	const scopeValidations = useSelector(
		(state) => state.workflows.scopeValidations
	);

	const EmptyComponent = () => (
		<Empty empty={true} minHeight={"100%"}>
			<div className="d-flex flex-column justify-content-center align-items-center">
				<span className="font-14">No actions added</span>
				<Button
					className="bold-600"
					type="link"
					onClick={() => {
						props.setActiveTab(SIDEBAR_TABS.RECOMMENDED);
					}}
				>
					{" "}
					<img src={plus} /> Add a recommended action
				</Button>
			</div>
		</Empty>
	);

	const showErrorInfo = (action, messageNode) => {
		return (
			<OverlayTrigger
				placement="right"
				delay={{
					show: 250,
					hide: 400,
				}}
				overlay={(props) => (
					<Tooltip {...props} id="button-tooltip">
						{messageNode}
					</Tooltip>
				)}
			>
				<img
					alt=""
					src={
						!action.isValidated ||
						(action.type === "integration" &&
							!action.orgIntegrationID)
							? error
							: info
					}
					className="ml-2 mr-3"
				/>
			</OverlayTrigger>
		);
	};

	const actionValidationUI = (app, action) => {
		const scopeValidation = scopeValidations[app.orgIntegrationID]
			? scopeValidations[app.orgIntegrationID][action.uniqId] ||
			  scopeValidations[app.orgIntegrationID].error
			: null;
		if (
			action.type === ACTION_TYPE.INTEGRATION &&
			action.type !== ACTION_TYPE.MANUAL &&
			!action.orgIntegrationID
		) {
			return showErrorInfo(
				action,
				<p className="m-0 font-12 grey-1 mb-2">
					To perform this action, you need to have an integration with{" "}
					{app.name || "Application"} else you can try converting it
					to a manual task.
				</p>
			);
		}
		if (!action.isValidated) {
			return showErrorInfo(
				action,
				<p className="m-0 font-12 grey-1 mb-2">
					There are a few parameters need to be added with this
					action. Please setup the action completely
				</p>
			);
		}
		/* Checking if the action is not a manual action and if the scope validation is an error. */
		if (scopeValidation?.error && action.type !== ACTION_TYPE.MANUAL) {
			return showErrorInfo(
				action,
				<p className="m-0 font-12 grey-1 mb-2">
					Zluri doesn't have the required permissions to perform this
					task
				</p>
			);
		}
		return null;
	};

	const actionsList =
		Object.keys(workflow).length &&
		workflow.nodes?.map((app) => {
			if (app?.actions?.length) {
				return (
					app.actions
						// .filter((item) => item?.id)
						.map((action, index) => {
							return (
								<li
									className="d-flex flex-row overview_item align-items-center"
									key={index}
								>
									{app &&
									app.isGrouped &&
									app.apps &&
									app.apps.length > 0 ? (
										<GetImageOrNameBadge
											name={
												ICONS[
													app?.isGrouped ===
													"needs_review"
														? "needs review"
														: app?.isGrouped
												].name || ""
											}
											url={
												ICONS[
													app?.isGrouped ===
													"needs_review"
														? "needs review"
														: app?.isGrouped
												].icon || ""
											}
											width={24}
											height={24}
											imageClassName={
												"border-radius-4 mr-2 object-contain"
											}
											nameClassName={"mr-2 img-circle"}
										/>
									) : (
										<GetImageOrNameBadge
											name={app.name}
											url={app.logo}
											width={24}
											height={24}
											imageClassName={
												"border-radius-4 mr-2 object-contain"
											}
											nameClassName={"mr-2 img-circle"}
										/>
									)}
									<p className="font-14 ml-2 align-self-center m-0 black-1">
										{`${action.index}. ${action.name} ${
											app.isGrouped
												? ` from ${app.apps.length} ${
														ICONS[app.isGrouped]
															.name
												  } apps`
												: ""
										}`}
									</p>
									{actionValidationUI(app, action)}
									{action.type === ACTION_TYPE.MANUAL && (
										<OverlayTrigger
											placement="top"
											overlay={(props) => (
												<Tooltip
													{...props}
													id="button-tooltip"
												>
													A manual task creates a task
													for assignee to be done
													before a due date
												</Tooltip>
											)}
										>
											<span
												style={{
													backgroundColor: "#5ABAFF",
													bottom: "2px",
												}}
												className="d-flex justify-content-center align-items-center position-relative font-8 p-1 primary-color-bg white bold-700 mx-2 border-radius-2 pl-2 pr-2"
											>
												MANUAL TASK
											</span>
										</OverlayTrigger>
									)}
								</li>
							);
						})
				);
			}
			// return false;
		});

	const isEmpty = () => {
		if (workflow.nodes?.length > 0) {
			return workflow.nodes.every((item) => item.actions.length === 0);
		}
	};

	return (
		<>
			{workflow.nodes?.length === 0 || isEmpty() ? (
				<EmptyComponent />
			) : (
				<div className="tab_content">
					<div className="tab_content_header">Overview</div>

					<div className="tab_content_body">
						<ul className="p-0">{actionsList}</ul>
					</div>
				</div>
			)}
		</>
	);
}

export default Overview;
