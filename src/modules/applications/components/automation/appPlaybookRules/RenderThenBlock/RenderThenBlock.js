import React from "react";
import { Select } from "UIComponents/Select/Select";
import {
	EVENT_TYPE,
	SCHEDULE_TIME,
	TIME_UNIT,
} from "../../../../../workflow/constants/constant";
import close from "assets/close.svg";
import { BulkRunAPlaybookOptionFormatter } from "modules/workflow/components/BulkRunAPlaybook/BulkRunAPlaybook";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import { getAllPlaybookWorkflowsServiceV2 } from "modules/workflow/service/api";
import arrowdropdown from "components/Transactions/Unrecognised/arrowdropdown.svg";
import { WorkflowTemplateSearchModel } from "modules/workflow/model/model";

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
	} = props;

	const renderField = () => {
		switch (event.type) {
			case EVENT_TYPE.RUN_WORKFLOW:
				return (
					<>
						<div
							className="d-flex align-items-center pl-3 ml-3"
							key={event.workflowTemplateId || event._id}
							style={{
								background: "rgba(34, 102, 226, 0.1)",
								borderRadius: "4px 0px 0px 4px",
							}}
						>
							<p className="m-0 font-13 font-weight-bold w-auto mr-3 create-rule-font">
								{event.event_label || "Run"}
							</p>
							<Dropdown
								toggler={
									<div
										className="d-flex align-items-center border-1 border-radius-4"
										style={{
											height: "36px",
											padding: "4px",
										}}
									>
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
									option = new WorkflowTemplateSearchModel(
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
							{checkSelectedTrigger() && (
								<Select
									options={generateEventOptions() || []}
									fieldNames={{
										label: "label",
										value: "value",
									}}
									value={event?.selectedScheduleTime}
									inputClassName="rule-attribute-content"
									className="rule-if-attribute"
									placeholder="Select"
									onChange={(obj) => {
										const data = {};
										data.schedule_time = obj.value;
										data.selectedScheduleTime = obj;
										onEventEdit({ event: data, index });
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
								onEventDelete(index);
							}}
						/>
					</>
				);
			case EVENT_TYPE.WAIT:
				return (
					<>
						<div className="d-flex align-items-center">
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
									const { value } = e.target;
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
								value={event?.selectedUnit}
								options={TIME_UNIT}
								fieldNames={{
									label: "unit",
								}}
								placeholder="Select"
								inputClassName="rule-attribute-content"
								className="rule-if-attribute"
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
							className="ml-3 mr-1 pointer"
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
		<div className="d-flex app-rule-attribute-condition-row justify-content-between mb-1">
			<div className="flex-fill border-radius-4 font-14 d-flex align-items-center">
				{renderField()}
			</div>
		</div>
	);
};

export default RenderThenBlock;
