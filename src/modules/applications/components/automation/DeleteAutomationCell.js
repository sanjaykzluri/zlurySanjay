import DeleteWorkflowModal from "modules/workflow/components/DeleteWorkflowModal/DeleteWorkflowModal";
import React from "react";
import { useState } from "react";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import optionsButton from "../../../../assets/optionsButton.svg";

export default function DeleteAutomationCell({
	workflow,
	handleRefresh,
	type,
	id,
	name,
	text,
}) {
	const [showModal, setShowModal] = useState(false);

	return (
		<>
			<Dropdown
				toggler={<img src={optionsButton} />}
				options={[
					{
						label: <div style={{ color: "#FF6767" }}>{text}</div>,
						onClick: (e) => {
							setShowModal(true);
						},
					},
				]}
				optionFormatter={(option) => option.label}
				onOptionSelect={(option) => option.onClick()}
				right={0}
			/>

			{showModal && (
				<DeleteWorkflowModal
					type={type}
					workflow_id={id}
					workflow_name={name}
					setShowDeleteWorkflowModal={setShowModal}
					showDeleteWorkflowModal={showModal}
					refreshTable={handleRefresh}
					workflow={workflow}
				/>
			)}
		</>
	);
}
