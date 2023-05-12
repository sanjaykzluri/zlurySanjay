import React, { useState } from "react";
import GetImageOrNameBadge from "../../../../common/GetImageOrNameBadge";
import { NameBadge } from "../../../../common/NameBadge";
import { Button } from "../../../../UIComponents/Button/Button";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { ActionFieldRenderer } from "../ActionFieldRenderer/ActionFieldRenderer";
import "./MulitInputModal.css";

export default function MulitInputModal(props) {
	const {
		field,
		formInputValidation,
		depsTriggerResponse,
		handleOnChangeSetupForm,
		openMulitInputDrawer,
		onRefresh,
		workflow,
		action,
		formData,
		resolveDependency,
		selectedDynamicOptions,
	} = props;

	const fields = workflow.users.map((user, index) => {
		const userData = formData.find(
			(userData) => userData.k === user.user_id
		);
		const defaultValue = userData.v[field.key];
		return (
			<React.Fragment key={user.user_id}>
				<tr className="spacer"></tr>
				<tr className="mi-row">
					<td>
						<div className="d-flex d-inline-flex  p-2 pl-3 pr-3">
							<GetImageOrNameBadge
								name={user.user_name}
								url={user.user_logo}
								width={24}
								height={24}
								imageClassName={"mr-1 rounded-circle"}
								nameClassName={"mr-2 img-circle"}
							/>

							<p className="font-14 black-1 m-0">
								{user.user_name}
							</p>
						</div>
					</td>
					<td>
						<ActionFieldRenderer
							key={user.user_id}
							resolveDependency={resolveDependency}
							field={field}
							action={action}
							formInputValidation={formInputValidation}
							depsTriggerResponse={depsTriggerResponse}
							handleOnChangeSetupForm={handleOnChangeSetupForm}
							openMulitInputDrawer={openMulitInputDrawer}
							onRefresh={onRefresh}
							workflow={workflow}
							defaultValue={defaultValue}
							userSpecificField={true}
							users={[user]}
							formData={formData}
							selectedDynamicOptions={selectedDynamicOptions}
						/>
					</td>
				</tr>
			</React.Fragment>
		);
	});
	return (
		<>
			<Modal
				backdrop="static"
				size="md"
				show={props.show}
				onClose={() => props.close()}
				drawer="right"
				className="multi-input-modal"
			>
				<div className="multi-input-modal-container">
					<header
						style={{
							borderBottom: "1px solid #EBEBEB",
						}}
						className="d-flex justify-content-between  pt-0 pb-4 pl-4 pr-4"
					>
						<h3 className="text-capitalize font-18 bold-600 align-self-center m-0">
							{field.name}
						</h3>
						<div className="align-self-center">
							<Button
								className="font-12"
								type="link"
								onClick={() => {
									props.enableSingleField(field);
								}}
							>
								Reset to Single Value
							</Button>
							<Button
								className="font-13"
								type="primary"
								onClick={() => {
									props.onSave(field);
								}}
							>
								Save
							</Button>
						</div>
					</header>
					<section>
						<table className="w-100 mt-3">
							<thead>
								<tr>
									<th className="p-2">Name</th>
									<th className="p-2 text-capitalize">
										{field.name}
									</th>
								</tr>
							</thead>
							<tbody>{fields}</tbody>
						</table>
					</section>
				</div>
			</Modal>
		</>
	);
}
