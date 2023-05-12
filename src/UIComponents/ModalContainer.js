import React from "react";
import { closeModal } from "reducers/modal.reducer";
import { useDispatch, useSelector } from "react-redux";
import AddEditUser from "modules/users/components/AddEditUserForm";
import { AddTransactionModal } from "components/Transactions/Modals/AddTransactionModal";
import AddExistingUserToDepartment from "modules/Departments/components/AddExistingUserToDepartment";
import ApplicationSourceSettings from "modules/applications/components/overview/ApplicationSourceSettings";
import BulkAddEditViaUploadCSV from "modules/shared/components/BulkAddEditViaUploadCSV/BulkAddEditViaUploadCSV";
import TaskManagementModal from "modules/TaskManagement/components/TaskManagementModal";
import { CreateRule } from "modules/applications/components/automation/appPlaybookRules/createRule";
import { CreatePlaybook } from "modules/applications/components/automation/appPlaybooks/playbooks/createPlaybook";

const modals = {
	user: <AddEditUser isOpen handleSubmit={() => null} />,
	transaction: <AddTransactionModal isOpen handleSubmit={() => null} />,
	bulkAddEditViaUploadCSV: (
		<BulkAddEditViaUploadCSV isOpen handleSubmit={() => null} />
	),
	addExistingUserToDepartment: (
		<AddExistingUserToDepartment isOpen handleSubmit={() => null} />
	),
	applicationSourceSettings: (
		<ApplicationSourceSettings isOpen handleSubmit={() => null} />
	),
	taskManagement: <TaskManagementModal isOpen handleSubmit={() => null} />,
	createRule: <CreateRule isOpen handleSubmit={() => null} />,
	createPlaybook: <CreatePlaybook isOpen handleSubmit={() => null} />,
};

export function ModalContainer() {
	const activeModals = useSelector((state) => state.modal);
	const activeModalTypes = activeModals.keySeq().toArray();
	const dispatch = useDispatch();
	const close = (type) => dispatch(closeModal(type));
	return (
		<>
			{activeModalTypes.map((type) =>
				React.cloneElement(modals[type], {
					...activeModals.get(type),
					key: type,
					handleClose: () => close(type),
				})
			)}
		</>
	);
}
