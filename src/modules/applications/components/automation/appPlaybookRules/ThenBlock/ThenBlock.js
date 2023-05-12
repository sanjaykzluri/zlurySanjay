import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Select } from "UIComponents/Select/Select";
import close from "assets/close.svg";
import add from "assets/icons/plus-blue-circle-reverse.svg";
import { Button } from "UIComponents/Button/Button";
import "../ConditionsBlock/ConditionsBlock.scss";
import "../AutomationRuleBuilder/AutomationRuleBuilder.css";
import { debounce } from "../../../../../../utils/common";
import { setEditAutomationRule } from "../../redux/action";
import { WorkflowTemplateSearchModel } from "modules/workflow/model/model";
import {
	EVENT_TYPE,
	TIME_UNIT,
	generateEventOptions,
	SCHEDULE_TIME,
} from "../../../../../workflow/constants/constant";
import RenderThenBlock from "../RenderThenBlock/RenderThenBlock";
import { BulkRunAPlaybookOptionFormatter } from "modules/workflow/components/BulkRunAPlaybook/BulkRunAPlaybook";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import arrowdropdown from "components/Transactions/Unrecognised/arrowdropdown.svg";
import {
	getMostUsedAppPlaybookService,
	searchPlaybookData,
	getAppPlaybookData,
} from "../../service/automation-api";

export default function ThenBlock({ rule, workflowType }) {
	const dispatch = useDispatch();
	const [selectedAction, setSelectedAction] = useState(null);
	const [showAction, setShowAction] = useState(false);
	const [showAddWorkflow, setShowAddWorkflow] = useState(false);
	const [showAddTimeDelay, setShowAddTimeDelay] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [workflows, setWorkflows] = useState([]);

	useEffect(() => {
		getAppPlaybookData(0, 10, workflowType)
			.then((res) => {
				setWorkflows(
					res.data.map(
						(item) => new WorkflowTemplateSearchModel(item)
					)
				);
			})
			.catch((err) => {
				console.log("err", err);
			});
	}, []);

	const debouncedChangeHandler = useCallback(
		debounce((query) => {
			if (query || query === "") {
				setIsLoading(true);
				setWorkflows([]);
				searchPlaybookData(0, 10, query, workflowType).then((res) => {
					setWorkflows(
						res.data.map(
							(item) => new WorkflowTemplateSearchModel(item)
						)
					);
					setIsLoading(false);
				});
			}
		}, 1000),
		[]
	);

	const checkSelectedTrigger = () => {
		const index = rule?.triggerName?.indexOf(rule?.tag);
		return index > -1 ? true : false;
	};

	const updateRuleEvents = (events) => {
		const ruleData = Object.assign({}, rule, {
			events: events,
		});
		dispatch(setEditAutomationRule(ruleData));
	};

	const onEventAdd = (event, key) => {
		const newEvent = { ...event };
		if (event.type === EVENT_TYPE.WAIT) {
			if (key === "delay") {
				newEvent.duration = `${event.time}`;
			} else {
				newEvent.selectedUnit = { unit: event.unit };
				newEvent.duration = `${event.unit}`;
			}
			showAddTimeDelay && setShowAddTimeDelay(false);
		}
		if (event.type === EVENT_TYPE.RUN_WORKFLOW) {
			showAddWorkflow && setShowAddWorkflow(false);
		}
		const events = [...rule?.events, newEvent];
		updateRuleEvents(events);
		setSelectedAction(null);
	};

	const onEventEdit = ({ event, index, key }) => {
		const events = [...rule?.events];
		const eventData = { ...events[index], ...event };
		if (event.type === EVENT_TYPE.WAIT) {
			if (key === "delay") {
				eventData.duration = `${event?.time} ${
					eventData?.unit ? eventData?.unit : ""
				}`;
			} else {
				eventData.selectedUnit = { unit: event.unit };
				eventData.duration = `${
					eventData?.time ? eventData?.time : ""
				} ${event.unit}`;
			}
			events[index] = eventData;
		} else {
			events[index] = eventData;
		}
		updateRuleEvents(events);
	};

	const onEventDelete = (index) => {
		const events = [...rule?.events];
		events.splice(index, 1);
		updateRuleEvents(events);
	};

	const eventsAddedUI = rule?.events.map((event, index) => {
		return (
			<RenderThenBlock
				rule={rule}
				onEventEdit={onEventEdit}
				isLoading={isLoading}
				setIsLoading={setIsLoading}
				event={event}
				index={index}
				key={index}
				onEventDelete={onEventDelete}
				debouncedChangeHandler={debouncedChangeHandler}
				setWorkflows={setWorkflows}
				workflows={workflows}
				checkSelectedTrigger={checkSelectedTrigger}
				generateEventOptions={() => generateEventOptions(rule?.tag)}
			/>
		);
	});

	return (
		<div className="d-flex flex-row">
			<div className="rule_start_text">then</div>
			<div className="rule-block mb-3">
				{eventsAddedUI}
				{showAddWorkflow && (
					<div className="app-attribution-when-block border-radius-8 mb-1">
						<div className="d-flex app-rule-attribute-condition-row justify-content-between">
							<div className="flex-fill border-radius-4 font-14 d-flex align-items-center">
								<div className="d-flex align-items-center pl-3">
									<div
										style={{
											background:
												"rgba(34, 102, 226, 0.1)",
											borderRadius: "4px 0px 0px 4px",
											padding: "8px",
										}}
									>
										<p className="m-0 font-13 font-weight-bold w-auto mr-3 create-rule-font">
											{selectedAction?.label ||
												selectedAction?.lable ||
												""}
										</p>
									</div>
									{EVENT_TYPE.RUN_WORKFLOW ===
										selectedAction?.key && (
										<Dropdown
											toggler={
												<div
													className="d-flex align-items-center border-0"
													style={{
														height: "36px",
														padding: "4px",
														background:
															"rgba(241, 243, 250, 0.6)",
														borderRadius:
															"0px 4px 4px 0px",
													}}
												>
													<div
														className="font-13"
														style={{
															color: "#2266E2",
														}}
													>
														Select playbook
													</div>
													<img
														src={arrowdropdown}
														style={{
															marginLeft: "8px",
														}}
													/>
												</div>
											}
											options={workflows}
											apiSearch={true}
											apiSearchCall={(
												query,
												cancelToken
											) =>
												searchPlaybookData(
													0,
													6,
													query,
													workflowType,
													cancelToken
												)
											}
											apiSearchDataKey="data"
											optionFormatter={(option) =>
												BulkRunAPlaybookOptionFormatter(
													{
														playbook: option,
													}
												)
											}
											onOptionSelect={(option) => {
												option =
													new WorkflowTemplateSearchModel(
														option
													);
												onEventAdd({
													...option,
													type: EVENT_TYPE.RUN_WORKFLOW,
													schedule_time:
														SCHEDULE_TIME.CURRENT_DATE,
													event_label:
														selectedAction?.label,
												});
											}}
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
										/>
									)}

									{checkSelectedTrigger() && (
										<Select
											className="black-1 w-auto ml-3 mr-3 grey-bg attribute-operators-select"
											options={
												generateEventOptions(
													rule?.tag
												) || []
											}
											fieldNames={{
												label: "label",
												value: "value",
											}}
											placeholder="Select"
											onChange={(obj) => {
												const data = {};
												data.schedule_time = obj.value;
												data.selectedScheduleTime = obj;
												data.type =
													EVENT_TYPE.RUN_WORKFLOW;
												onEventAdd(data);
											}}
										/>
									)}
								</div>
								<img
									alt=""
									src={close}
									width={14}
									className="ml-3 mr-1 pointer"
									onClick={() => {
										setShowAddWorkflow(false);
										setSelectedAction(null);
									}}
								/>
							</div>
						</div>
					</div>
				)}

				{showAction && (
					<Select
						filter
						search
						options={
							rule?.trigger?.events?.filter(
								(event) => event.enabled
							) ||
							rule?.selectedTrigger?.events?.filter(
								(event) => event.enabled
							) ||
							[]
						}
						placeholder="Select action"
						inputClassName="rule-attribute-content"
						optionsFieldClassName="rule-option-style"
						className="rule-if-attribute"
						fieldNames={{
							label: "lable",
							value: "lable",
							logo: "logo",
						}}
						onChange={(action) => {
							setSelectedAction(action);
							setShowAction(false);
							setShowAddWorkflow(true);
						}}
					/>
				)}
				{!selectedAction && (
					<>
						<Button
							className="d-block bold-600"
							onClick={() => {
								setShowAction(true);
							}}
						>
							<img alt="" src={add} height="14" />
							<span className="ml-2">Add action</span>
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
