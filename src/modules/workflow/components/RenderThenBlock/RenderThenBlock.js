import React from "react";
import { Select } from "../../../../UIComponents/Select/Select";
import {
	EVENT_TYPE,
	scheduleTimeUnit,
	SCHEDULE_TIME,
	TIME_UNIT,
} from "../../constants/constant";
import close from "../../../../assets/close.svg";
import { BulkRunAPlaybookOptionFormatter } from "../BulkRunAPlaybook/BulkRunAPlaybook";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import {
	getAllPlaybookWorkflowsServiceV2,
	searchTemplatesService,
} from "modules/workflow/service/api";
import arrowdropdown from "components/Transactions/Unrecognised/arrowdropdown.svg";
import { AutomationRuleEventModel, WorkflowTemplateSearchModel } from "modules/workflow/model/model";
import TimePicker from "UIComponents/TimePicker/TimePicker";
import timezone from "assets/workflow/timezone.svg";

const RenderThenBlock = (props) => {
	const {
		onEventEdit,
		isLoading,
		event,
		index,
		onEventDelete,
		debouncedChangeHandler,
		workflows,
		checkSelectedTrigger,
		generateEventOptions,
		rule,
		showDateSelector,
	} = props;

	const getFirstEventIndex = (events = []) => {
		const index = events?.findIndex(
			(eve) =>
				eve?.schedule_time === "onboarding_date" ||
				eve?.schedule_time === "offboarding_date"
		);
		if (index > -1) {
			return index;
		}
		return null;
	};

	const checkTimeRenderCondition = () => {
		const allowedKeys = ["onboarding_date", "offboarding_date"];
		const { events = [] } = rule;
		const index = getFirstEventIndex(events);
		if (
			allowedKeys.includes(event?.schedule_time) &&
			events?.[index] === event
		) {
			return true;
		}
		return false;
	};

	const runTimeUI = (
		<>
			<div className="d-flex align-items-center">
				<span className="font-14 d-flex justify-content-center mr-1">
					{"at "}
				</span>
				<TimePicker
					className="my-1"
					optionClassName="timepicker_options cursor-pointer"
					toggler={
						<div
							className="flex-fill black-1 w-auto attribute-operators-select ml-1 d-flex align-items-center justify-content-center"
							style={{
								border: "1px solid #ebebeb",
								padding: "4px",
								height: "36px",
								minWidth: "100px",
								borderRadius: "4px",
							}}
						>
							<span className="font-14 d-flex justify-content-center">
								{event?.time_values?.display_values?.time ||
									"Time(12:00)"}
							</span>
						</div>
					}
					onOptionSelect={(val) => {
						onEventEdit({
							event: {
								value: val,
								type: EVENT_TYPE.RUN_WORKFLOW,
							},
							index,
							key: "time",
						});
					}}
					value={""}
				/>
				<Select
					selectorClassStyle={{ textTransform: "none !important" }}
					optionsContainerClassName="schedule-unit-picker"
					className="flex-fill black-1 w-auto grey-bg ml-2 my-1"
					options={scheduleTimeUnit}
					fieldNames={{
						label: "unit",
					}}
					placeholder="Select"
					value={
						event?.time_values?.display_values?.unit
							? { unit: event?.time_values?.display_values?.unit }
							: null
					}
					onChange={(obj) => {
						onEventEdit({
							event: {
								value: obj.unit,
								type: EVENT_TYPE.RUN_WORKFLOW,
							},
							index,
							key: "unit",
						});
					}}
				/>
			</div>
			<span
				style={{
					color: "rgba(255, 162, 23, 1)",
					backgroundColor: "rgba(246, 247, 250, 1)",
					minWidth: "100%",
				}}
				className="font-14 d-flex flex-1 mr-1 border-radius-4 my-2 p-2 align-items-center"
			>
				<img alt="" src={timezone} />{" "}
				<span className="bold-600 mx-2">{"Timezone"}</span>{" "}
				{"UTC+0 Ireland, Spain, Iceland, UK, Portugal, Ghana"}
			</span>
		</>
	);

	const renderField = () => {
		switch (event.type) {
			case EVENT_TYPE.RUN_WORKFLOW:
				return (
					<>
						<div
							key={event.workflowTemplateId || event._id}
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
										{!(
											event.workflow_name ||
											event?.workflowTemplateName ||
											event?.name
										) && <div>Select a playbook</div>}
										<div>
											{event.workflow_name ||
												event?.workflowTemplateName ||
												event?.name}
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
									option = new AutomationRuleEventModel(
										option
									);
									onEventEdit({
										event: {
											...option,
											type: EVENT_TYPE.RUN_WORKFLOW,
										},
										index,
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
							{checkSelectedTrigger() &&
								showDateSelector(rule?.events || [], event) && (
									<>
										<Select
											selectorClassStyle={{
												minWidth: "250px",
											}}
											className="black-1 w-auto ml-3 mr-3 grey-bg attribute-operators-select my-1"
											options={
												generateEventOptions() || []
											}
											fieldNames={{
												label: "label",
												value: "value",
												description: "description",
												logo: "logo",
											}}
											value={event?.selectedScheduleTime}
											placeholder="Select"
											onChange={(obj) => {
												const data = {};
												data.schedule_time = obj.value;
												data.selectedScheduleTime = obj;
												onEventEdit({
													event: data,
													index,
												});
											}}
										/>
										{/* {checkTimeRenderCondition() &&
											runTimeUI} */}
									</>
								)}
						</div>
						<img
							alt=""
							src={close}
							width={14}
							className="mr-1 pointer"
							onClick={() => {
								onEventDelete(index);
							}}
						/>
					</>
				);
			case EVENT_TYPE.WAIT:
				return (
					<>
						<div className="d-flex w-100 align-items-center flex-wrap">
							<p className="m-0 font-14 black-1 w-auto mr-3">
								Wait for
							</p>
							<input
								className="p-2 mr-2 my-1"
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
									obj.time = value;
									obj.type = EVENT_TYPE.WAIT;
									obj.schedule_time =
										SCHEDULE_TIME.CURRENT_DATE;
									onEventEdit({
										event: obj,
										index,
										key: "delay",
									});
								}}
								value={event?.time || ""}
							/>
							<Select
								isOptionsLoading={isLoading}
								className="black-1 w-auto mr-3 grey-bg attribute-operators-select my-1"
								value={event?.selectedUnit}
								options={TIME_UNIT}
								fieldNames={{
									label: "unit",
								}}
								placeholder="Select"
								onChange={(obj) => {
									obj.type = EVENT_TYPE.WAIT;
									obj.schedule_time =
										SCHEDULE_TIME.CURRENT_DATE;
									onEventEdit({ event: obj, index });
								}}
							/>
						</div>
						<img
							alt=""
							src={close}
							width={14}
							className="mr-1 pointer"
							onClick={() => {
								onEventDelete(index);
							}}
						/>
					</>
				);
			default:
				return;
		}
	};
	return (
		<div className="d-flex justify-content-between workflow-trigger-row">
			<div className="flex-fill border-radius-4 font-14 d-flex white-bg align-items-center justify-content-between mb-2  mt-2 pl-3 pr-3 pt-1 pb-1">
				{renderField()}
			</div>
		</div>
	);
};

export default RenderThenBlock;
