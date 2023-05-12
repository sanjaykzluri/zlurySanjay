import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select } from "../../../../UIComponents/Select/Select";
import close from "../../../../assets/close.svg";
import add from "../../../../assets/icons/plus-blue-circle-reverse.svg";
import { Button } from "UIComponents/Button/Button";
import "../ConditionsBlock/ConditionsBlock.scss";
import {
	getRuleAttributes,
	searchDraftsService,
	searchTemplatesService,
	getMostUsedTemplatesService,
	getAllPlaybookWorkflowsServiceV2,
} from "modules/workflow/service/api";
import { debounce } from "../../../../utils/common";
// import { debounce } from "underscore";
import { setEditAutomationRule } from "../../redux/workflow";
import { AutomationRuleEventModel, WorkflowTemplateSearchModel } from "modules/workflow/model/model";
import {
	EVENT_TYPE,
	TIME_UNIT,
	generateEventOptions,
	SCHEDULE_TIME,
	defaultReqBody,
	scheduleTimeUnit,
} from "../../constants/constant";
import RenderThenBlock from "../RenderThenBlock/RenderThenBlock";
import { BulkRunAPlaybookOptionFormatter } from "../BulkRunAPlaybook/BulkRunAPlaybook";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import arrowdropdown from "components/Transactions/Unrecognised/arrowdropdown.svg";
import TimePicker from "UIComponents/TimePicker/TimePicker";
import { calculateUTCTime } from "utils/DateUtility";

export default function ThenBlock({ rule, workflowType }) {
	const dispatch = useDispatch();
	const [showAddWorkflow, setShowAddWorkflow] = useState(false);
	const [showAddTimeDelay, setShowAddTimeDelay] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [workflows, setWorkflows] = useState([]);

	useEffect(() => {
		getAllPlaybookWorkflowsServiceV2(workflowType, 0, defaultReqBody)
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
				getAllPlaybookWorkflowsServiceV2(rule.tag, 0, query).then(
					(res) => {
						setWorkflows(res.data);
						setIsLoading(false);
					}
				);
			}
		}, 1000),
		[]
	);

	const showDateSelector = (events = [], evt) => {
		const index = events?.findIndex((eve) => eve?.type === "run_workflow");
		if (index > -1 && events[index] === evt) {
			return true;
		}
		return false;
	};

	const checkSelectedTrigger = () => {
		const index = rule?.trigger?.title?.indexOf(rule.tag);
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
			if (key === "time") {
				const time_values = {
					display_values: {
						time: event?.value,
					},
					run_values: {},
				};
				newEvent.time_values = time_values;
				delete newEvent.value;
			} else if (key === "unit") {
				const time_values = {
					display_values: {
						unit: event?.value,
					},
					run_values: {},
				};
				newEvent.time_values = time_values;
				delete newEvent.value;
			}
			showAddWorkflow && setShowAddWorkflow(false);
		}
		const events = [...rule.events, newEvent];
		updateRuleEvents(events);
	};

	const onEventEdit = ({ event, index, key }) => {
		const events = [...rule.events];
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
		} else if (event.type === EVENT_TYPE.RUN_WORKFLOW) {
			if (key === "time") {
				const time_values = {
					...eventData?.time_values,
					display_values: {
						...eventData?.time_values?.display_values,
						time: event?.value,
					},
					run_values: {
						...eventData?.time_values?.run_values,
					},
				};
				eventData.time_values = time_values;
				delete eventData.value;
			} else if (key === "unit") {
				const time_values = {
					...eventData?.time_values,
					display_values: {
						...eventData?.time_values?.display_values,
						unit: event?.value,
					},
					run_values: {
						...eventData?.time_values?.run_values,
					},
				};
				eventData.time_values = time_values;
				delete eventData.value;
			}
			if (eventData?.time_values?.display_values) {
				const { time, unit } = eventData?.time_values?.display_values;
				if (time && unit) {
					const { hours, minutes } = calculateUTCTime(time, unit);
					if (hours && (minutes || minutes === 0)) {
						eventData.time_values.run_values = {
							...eventData?.time_values?.run_values,
							hours,
							minutes,
						};
					}
				}
			}
			events[index] = eventData;
		} else {
			events[index] = eventData;
		}
		updateRuleEvents(events);
	};

	const onEventDelete = (index) => {
		const events = [...rule.events];
		events.splice(index, 1);
		updateRuleEvents(events);
	};

	const eventsAddedUI = rule.events.map((event, index) => {
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
				showDateSelector={showDateSelector}
			/>
		);
	});

	return (
		<div
			style={{
				backgroundColor: "#FFFFFF",
				padding: "16px",
				borderRadius: "4px",
			}}
		>
			<div>
				<div className="d-flex flex-row align-items-center">
					<h4 className="tab_content_header flex-1 m-0">THEN..</h4>
					<p className="font-10 grey-1 m-0">
						Setup a playbook you want to run when the conditions are
						met
					</p>
				</div>
				<div
					style={{ borderTop: "1px solid #EBEBEB", marginTop: "8px" }}
				/>
				<div className="workflow-rule-block  mb-5 p-3 border-radius-8">
					{eventsAddedUI}
					{showAddWorkflow && (
						<div className="d-flex  justify-content-between workflow-trigger-row">
							<div className="flex-fill border-radius-4 font-14 d-flex white-bg align-items-center justify-content-between mb-2  mt-2 pl-3 pr-3 pt-1 pb-1">
								<div
									style={{ flexWrap: "wrap" }}
									className="d-flex w-100 align-items-center flex-wrap"
								>
									<p className="m-0 font-14 black-1 w-auto mr-3">
										Run
									</p>
									<Dropdown
										toggler={
											<div
												className="d-flex align-items-center border-1 border-radius-4 my-1"
												style={{
													height: "36px",
													padding: "4px",
												}}
											>
												<div>Select a playbook</div>
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
										apiSearchCall={(query, cancelToken) =>
											getAllPlaybookWorkflowsServiceV2(
												rule.tag,
												0,
												query
											)
										}
										apiSearchDataKey="data"
										optionFormatter={(option) =>
											BulkRunAPlaybookOptionFormatter({
												playbook: option,
											})
										}
										onOptionSelect={(option) => {
											option =
												new AutomationRuleEventModel(
													option
												);
											onEventAdd({
												...option,
												type: EVENT_TYPE.RUN_WORKFLOW,
												schedule_time:
													SCHEDULE_TIME.CURRENT_DATE,
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
								</div>
								<img
									alt=""
									src={close}
									width={14}
									className="mr-1 pointer"
									onClick={() => {
										setShowAddWorkflow(false);
									}}
								/>
							</div>
						</div>
					)}
					{showAddTimeDelay && (
						<div className="d-flex  justify-content-between workflow-trigger-row">
							<div className="flex-fill border-radius-4 font-14 d-flex white-bg align-items-center justify-content-between mb-2  mt-2 pl-3 pr-3 pt-1 pb-1">
								<div className="d-flex w-100 align-items-center flex-wrap">
									<p className="m-0 font-14 black-1 w-auto mr-3">
										Wait for
									</p>
									<input
										className="p-2 mr-2"
										type="number"
										name="time"
										id="time"
										placeholder="Delay"
										onKeyPress={(event) => {
											if (!/[0-9]/.test(event.key)) {
												event.preventDefault();
											}
										}}
										onChange={(e) => {
											var { value } = e.target;
											if (value > 99) {
												value = 99;
											}
											const obj = {};
											obj.type = EVENT_TYPE.WAIT;
											obj.time = value;
											obj.schedule_time =
												SCHEDULE_TIME.CURRENT_DATE;
											onEventAdd(obj, "delay");
										}}
									/>
									<Select
										// isOptionsLoading={isLoading}
										className="black-1 w-auto mr-3 grey-bg attribute-operators-select"
										options={TIME_UNIT}
										fieldNames={{
											label: "unit",
										}}
										placeholder="Select"
										onChange={(obj) => {
											obj.type = EVENT_TYPE.WAIT;
											obj.schedule_time =
												SCHEDULE_TIME.CURRENT_DATE;
											onEventAdd(obj);
										}}
									/>
								</div>
								<img
									alt=""
									src={close}
									width={14}
									className="mr-1 pointer"
									onClick={() => {
										setShowAddTimeDelay(false);
									}}
								/>
							</div>
						</div>
					)}

					<div className="d-flex rule-block mt-3 mb-3 border-radius-8">
						<Button
							className="d-block bold-600 mr-2"
							onClick={() => {
								setShowAddWorkflow(true);
							}}
							type="dashed"
						>
							<img alt="" src={add} height="14" />
							<span className="ml-2">Add playbook</span>
						</Button>
						<Button
							className="d-block bold-600 ml-2"
							onClick={() => {
								setShowAddTimeDelay(true);
							}}
							type="dashed"
						>
							<img alt="" src={add} height="14" />
							<span className="ml-2">Add time delay</span>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
