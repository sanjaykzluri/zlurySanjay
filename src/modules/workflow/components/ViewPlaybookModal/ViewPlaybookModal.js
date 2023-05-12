import React, { useEffect, useState } from "react";
import "./ViewPlaybookModal.css";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "UIComponents/Modal/Modal";
import {
	clearWorkflow,
	clearWorkflowLogs,
	getWorkFlow,
} from "../../redux/workflow";
import ViewPlaybook from "../ViewPlaybook/ViewPlaybook";

export default function ViewPlaybookModal({
	openModal,
	data,
	onCloseModal,
	modalClass,
	workflowId,
	onEditPublishedPlaybook,
	entity,
	editPlaybook,
	onshowCompileScreen,
}) {
	const dispatch = useDispatch();
	const workflow = useSelector((state) => state.workflows.workflow);
	const router = useSelector((state) => state.router);
	const { query } = router.location;
	const [loading, setLoading] = useState(true);
	const [playbookData, setPlaybookData] = useState(workflow);

	useEffect(() => {
		const { playbookId } = query;
		dispatch(
			getWorkFlow({ id: playbookId || workflowId, isTemplate: true })
		);
	}, [workflowId]);

	useEffect(() => {
		if (Object.keys(workflow).length > 0) {
			setPlaybookData(workflow);
			setLoading(false);
		}
	}, [workflow]);

	// useEffect(() => {
	// 	return () => {
	// 		dispatch(clearWorkflow());
	// 		dispatch(clearWorkflowLogs());
	// 	};
	// }, []);

	return (
		<Modal
			contentClassName={modalClass}
			imgClassName="imgClass"
			dialogClassName="view_playbook_modal_dialog"
			show={openModal}
			titleClass={"flex-1 d-flex pl-0"}
			headerStyle={"p-0"}
			onClose={() => onCloseModal()}
		>
			<ViewPlaybook
				loading={loading}
				playbookData={playbookData}
				workflowId={workflowId}
				onEditPublishedPlaybook={onEditPublishedPlaybook}
				entity={entity}
				editPlaybook={editPlaybook}
				onCloseModal={onCloseModal}
				onshowCompileScreen={onshowCompileScreen}
			/>
		</Modal>
	);
}
