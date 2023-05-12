import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { useHistory } from "react-router";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { Button } from "../../../../UIComponents/Button/Button";
import { duplicateWorkflowPlaybook } from "modules/workflow/service/api";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";

const DuplicatePlaybookModal = ({ modalClass, show, onHide, data }) => {
	const history = useHistory();

	const defaultPlaybookName = () => {
		return !data?.name?.includes("copy of")
			? `copy of ${data?.name || data?.workflow_name}`
			: `${data?.name || data?.workflow_name}`;
	};
	const [playbookName, setPlaybookName] = useState(defaultPlaybookName());
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
		return () => {
			setError(false);
			setLoading(false);
			setPlaybookName();
		};
	}, []);

	const onHandleChange = (e) => {
		setError(false);
		setPlaybookName(e.target.value);
	};

	const handleSaveTemplate = () => {
		setLoading(true);
		const reqObj = {
			change_array: [
				{
					key: "name",
					type: "string",
					value: playbookName,
				},
			],
		};
		duplicateWorkflowPlaybook(data?._id || data?.workflow_id, reqObj)
			.then((res) => {
				if (!res.success) {
					setError(true);
					setLoading(false);
				} else if (res.template) {
					history.push(`/playbook/${res.template._id}`);
				}
			})
			.catch((error) => {
				setError(false);
				setLoading(false);
				ApiResponseNotification({
					responseType: apiResponseTypes.ERROR,
					title: `Error in copying playbook`,
					errorObj: error,
				});
			});
	};

	return (
		<>
			<Modal
				contentClassName={modalClass}
				dialogClassName="z_i_connect_modal_dialog"
				show={show}
				centered
				style={{ maxWidth: "50%!important" }}
				title={
					<div className="title-container">
						<span className="title-text">Copy Playbook</span>
					</div>
				}
				onClose={() => onHide()}
			>
				<React.Fragment>
					<div className="flex-1 d-flex py-4 flex-column p-4 px-4">
						<p className="grey-1 font-12 mb-2">Playbook Name</p>
						<input
							className="w-100 mb-2 p-2"
							type="text"
							name="name"
							placeholder="Playbook Name"
							value={playbookName}
							onChange={(e) => {
								e.preventDefault();
								onHandleChange(e);
							}}
						/>
						{error && (
							<p
								style={{ color: "#FF6767" }}
								className="font-10 mb-2"
							>
								Please rename playbook, as a playbook with this
								name already exists
							</p>
						)}
					</div>
					<div style={{ borderTop: "1px solid #EBEBEB" }} />
					<div className="flex-1 d-flex justify-content-end px-4 py-3">
						<Button
							type="link"
							className="text-center"
							onClick={() => onHide()}
						>
							Cancel
						</Button>
						<Button
							className="text-center"
							disabled={!playbookName || loading || error}
							onClick={() => {
								handleSaveTemplate();
							}}
						>
							{loading && (
								<Spinner
									className="mr-2 ml-2 blue-spinner action-edit-spinner"
									animation="border"
								/>
							)}
							Save playbook
						</Button>
					</div>
				</React.Fragment>
			</Modal>
		</>
	);
};

export default DuplicatePlaybookModal;
