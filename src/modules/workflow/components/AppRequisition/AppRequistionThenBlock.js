import React, { useCallback, useEffect, useState } from "react";
import { searchTemplatesService } from "modules/workflow/service/api";
import { useDispatch } from "react-redux";
import close from "../../../../assets/close.svg";
import { Select } from "../../../../UIComponents/Select/Select";
import { debounce } from "../../../../utils/common";
import "../ConditionsBlock/ConditionsBlock.scss";
import { WorkflowTemplateSearchModel } from "modules/workflow/model/model";
import { setEditAutomationRule } from "../../redux/workflow";
import "./AppRequistionThenBlock.css";

export default function AppRequisitionThenBlock({ rule, workflowType }) {
	const dispatch = useDispatch();
	const [showAddWorkflow, setShowAddWorkflow] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [workflows, setWorkflows] = useState([]);
	const [activeOption, setActiveOption] = useState(
		rule?.events?.[0]?.type || "initiate_approval_process"
	);



	const debouncedChangeHandler = useCallback(
		debounce((query) => {
			if (query || query === "") {
				setIsLoading(true);
				setWorkflows([]);
				searchTemplatesService(rule.tag, query).then((res) => {
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

	const updateRuleEvents = (events) => {
		dispatch(setEditAutomationRule({events}));
		setShowAddWorkflow(false);
	};

	const onEventAdd = (event) => {
		const events = [event];
		updateRuleEvents(events);
	};
	useEffect(() => {
		onEventAdd({
			type: activeOption,
			event: "insert",
		});
	}, [activeOption]);
	const handleRequestClick = (type) => {
		setActiveOption(type);
	};


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
						Setup a workflow you want to run when the conditions are
						met
					</p>
				</div>
				<div
					style={{ borderTop: "1px solid #EBEBEB", marginTop: "8px" }}
				/>
				<div className="workflow-rule-block  mb-5 p-3 border-radius-8">
					<div className="tab__button__wrapper">
						<div
							className={`${
								activeOption === "initiate_approval_process"
									? "tab__button__active"
									: ""
							} tab__button cursor-pointer`}
							onClick={() =>
								handleRequestClick("initiate_approval_process")
							}
						>
							Initiate approval process
						</div>
						<div
							className={`${
								activeOption === "auto_rejection"
									? "tab__button__active"
									: ""
							} tab__button cursor-pointer`}
							onClick={() => handleRequestClick("auto_rejection")}
						>
							Auto-Reject Request
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}