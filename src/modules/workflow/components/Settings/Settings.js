import React, { useEffect, useState } from "react";
import {
	Col,
	Form,
	OverlayTrigger,
	Row,
	Spinner,
	Tooltip,
} from "react-bootstrap";
import { Button } from "../../../../UIComponents/Button/Button";
import warningIcon from "../../../../assets/icons/delete-warning.svg";
import "../WorkflowSidebar/WorkflowSidebar.css";
import completeicon from "../../../../assets/icons/completeicon.svg";
import { useDispatch, useSelector } from "react-redux";
import { editWorkFlowDetails } from "../../redux/workflow";

function Settings(props) {
	const workflow = useSelector((state) => state.workflows.workflow);
	const [formData, setFormData] = useState(workflow);
	const dispatch = useDispatch();
	const [validated, setValidated] = useState(false);
	const [saving, setSaving] = useState(false);
	const [failedToSave, setFailedToSave] = useState(false);
	const [workflowDetailsUpdated, setWorkflowDetailsUpadeted] =
		useState(false);

	useEffect(() => {
		if (saving) {
			setSaving(false);
			setWorkflowDetailsUpadeted(true);
			setTimeout(() => {
				setWorkflowDetailsUpadeted(false);
				reset();
			}, 3000);
		}
		setFormData(workflow);
	}, [workflow]);

	const reset = () => {
		setWorkflowDetailsUpadeted(false);
		setValidated(false);
		setFormData(workflow);
	};

	const handleOnChange = (e) => {
		setFormData(
			Object.assign({}, formData, {
				[e.target.name]: e.target.value?.trim(),
			})
		);
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		event.stopPropagation();
		const form = event.currentTarget;
		if (form.checkValidity()) {
			setValidated(true);
			saveWorkflowDetails();
		}
	};

	const saveWorkflowDetails = () => {
		setSaving(true);
		dispatch(editWorkFlowDetails(workflow.id, formData, props.isTemplate));
	};

	return (
		<div className="tab_content">
			<div className="tab_content_header">Settings</div>
			<div className="d-flex w-100 mt-2">
				<Form
					noValidate
					validated={validated}
					className="w-100"
					onSubmit={handleSubmit}
				>
					<Row className="mb-1">
						<Form.Group as={Col} md="12" controlId="workflowNameId">
							<Form.Label className="font-12 grey">
								Workflow Name
							</Form.Label>
							<Form.Control
								required
								type="text"
								name="name"
								placeholder="Workflow Name"
								value={formData.name}
								onChange={(e) => handleOnChange(e)}
							/>
						</Form.Group>
					</Row>
					<Row className="mb-1">
						<Form.Group as={Col} md="12" controlId="ForlderId">
							<Form.Label className="font-12 grey">
								Add to Folder
							</Form.Label>
							<Form.Control
								className="text-capitalize"
								disabled
								type="text"
								placeholder="Folder Name"
								defaultValue={workflow.type}
							/>
						</Form.Group>
					</Row>
					{/* <Row className="mb-1">
						<Form.Group md="12" as={Col} className="mb-2">
							<Form.Check
								required
								label="Notify on completion of Run"
								feedbackType="invalid"
								checked={notify}
								onChange={() => setNotify((value) => !value)}
							/>
						</Form.Group>
					</Row>
					<Row className="mb-3">
						<Col md="12">
							<Form.Label className="font-12 grey">
								Check for task completion (for tasks and pending
								actions)
							</Form.Label>
							<div className="d-flex flex-row align-items-center checkPending">
								<Form.Control
									required
									as="select"
									placeholder="hours"
								>
									<option value={3} selected>
										Every 3 hours
									</option>
									<option value={4}>Every 3 hours</option>
								</Form.Control>
								<Form.Control
									required
									as="select"
									placeholder="hours"
								>
									<option value={3} selected>
										for 7 days
									</option>
									<option value={4}>for 7 days</option>
								</Form.Control>
							</div>
						</Col>
					</Row>
					<Row className="mb-1">
						<Form.Group
							as={Col}
							md="12"
							controlId="ActionTimeOutId"
						>
							<Form.Label className="font-12 grey">
								Action Timeout
							</Form.Label>
							<Form.Control
								required
								as="select"
								onChange={(e) =>
									setActionTimeout(e.target.value)
								}
								value={actionTimeout}
							>
								<option value={"60s"}>60s</option>
								<option value={"70s"}>70s</option>
							</Form.Control>
						</Form.Group>
					</Row> */}
					<Button
						type="submit"
						disabled={
							saving || workflow.isExecuted || !formData.name
						}
						style={{ width: "100px" }}
						className={`float-right ${
							failedToSave
								? "warningMessage"
								: workflowDetailsUpdated
								? "bg-white primary-color primary-color-border"
								: ""
						}`}
					>
						<div className="d-flex justify-content-center">
							{saving ? (
								<>
									Updating
									<div>
										<Spinner
											animation="border"
											role="status"
											variant="light"
											size="sm"
											className="ml-2"
											style={{ borderWidth: 2 }}
										>
											<span className="sr-only">
												Loading...
											</span>
										</Spinner>
									</div>
								</>
							) : failedToSave ? (
								<>
									Retry
									<OverlayTrigger
										placement="top"
										overlay={
											<Tooltip>
												{
													"Failed to update workflow details"
												}
											</Tooltip>
										}
									>
										<img
											src={warningIcon}
											width={12}
											className="ml-2"
										/>
									</OverlayTrigger>
								</>
							) : workflowDetailsUpdated ? (
								<>
									Updated
									<img
										src={completeicon}
										width={12}
										className="ml-2"
									/>
								</>
							) : (
								<>Update</>
							)}
						</div>
					</Button>
				</Form>
			</div>
		</div>
	);
}

export default Settings;
