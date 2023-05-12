import React from "react";
import { useContext } from "react";
import { useHistory } from "react-router-dom";
import RoleContext from "services/roleContext/roleContext";
import { Button } from "../../../../UIComponents/Button/Button";

const WorkflowOverviewHeader = (props) => {
	const { onCreateNewWorkflow } = props;
	const history = useHistory();
	const { partner } = useContext(RoleContext);

	return (
		<div
			className={`mx-auto d-flex p-3 justify-content-between`}
			style={{
				background: "#F5F6F9",
				borderRadius: "8px",
				alignItems: "center",
			}}
		>
			<div className="flex-1 p-2">
				<p className="font-14 black mb-0 text-captalize">
					<span style={{ textTransform: "capitalize" }}>
						{props.workflowType || ""}
					</span>{" "}
					{props.workflowType === "onboarding"
						? "users has never been this simple"
						: "in a few clicks!"}
				</p>
				<p className="font-12 grey mb-0 mt-2">
					{props.workflowType === "onboarding"
						? "Experience seamless onboarding using recommended engine based on each user, automated & delegate actions along with reusable playbooks!"
						: `${partner?.name} Offboarding workflows curates every app being used by the user and lets you offboard using seamless automated and delegated actions in a matter of clicks.`}
				</p>
			</div>
			<div className="p-2">
				<div className="d-flex justify-content-between">
					<Button
						type="border"
						onClick={() => {
							onCreateNewWorkflow();
						}}
						className="btn_secondary font-13 ml-3 pl-4 pr-4 align-self-center black-1 "
					>
						New Workflow
					</Button>
					<Button
						type="border"
						onClick={() => {
							history.push(`#playbooks`);
						}}
						className="btn_secondary font-13 ml-3 pl-4 pr-4 align-self-center black-1 "
					>
						Use a playbook
					</Button>
				</div>
			</div>
		</div>
	);
};

export default WorkflowOverviewHeader;
