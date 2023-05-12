import React, { useEffect, useState } from "react";
import plus from "../../../../assets/icons/plus-blue.svg";
import completeicon from "../../../../assets/icons/completeicon.svg";
import "./RecommendedActionCard.css";
import { useDispatch, useSelector } from "react-redux";
import { addActionToWorkflow } from "../../redux/workflow";
import { NameBadge } from "../../../../common/NameBadge";
import { ACTION_TYPE } from "../../constants/constant";
import { Loader } from "../../../../common/Loader/Loader";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

function RecommendedActionCard(props) {
	const workflow = useSelector((state) => state.workflows.workflow);
	const editApplication = useSelector(
		(state) => state.workflows.editApplication
	);
	const [isActionAdded, setIsActionAdded] = useState(false);
	const [selectedApplication, setSelectedApplication] = useState();
	const [selectedApplicationIndex, setSelectedApplicationIndex] = useState();
	const [loading, setLoading] = useState(false);
	const dispatch = useDispatch();

	const handleAdd = () => {
		setLoading(true);
		dispatch(
			addActionToWorkflow(
				workflow.id,
				editApplication.workflowApplicationID,
				{
					action: Object.assign({}, props.action, {
						orgIntegrationID: editApplication.orgIntegrationID,
					}),
				},
				false,
				props.isTemplate
			)
		);
	};

	useEffect(() => {
		if (editApplication?.id) {
			const index = workflow.nodes?.findIndex(
				(app) => app.id === editApplication.id
			);
			if (index > -1) {
				setSelectedApplicationIndex(index);
			}
		}
	}, [editApplication]);

	useEffect(() => {
		if (selectedApplicationIndex >= 0) {
			setSelectedApplication(workflow.nodes?.[selectedApplicationIndex]);
		}
	}, [selectedApplicationIndex]);

	useEffect(() => {
		if (selectedApplication?.id) {
			selectedApplication.actions.forEach((action) => {
				if (action.id === props.action.id) {
					setIsActionAdded(true);
				}
			});
		}
	}, [selectedApplication]);

	useEffect(() => {
		if (workflow) {
			const appIndex = workflow.nodes?.findIndex(
				(app) => app.id === editApplication.id
			);
			if (appIndex > -1) {
				const actionIndex = workflow.nodes[
					appIndex
				]?.actions?.findIndex(
					(action) => action.id === props.action.id
				);
				if (actionIndex > -1) {
					setIsActionAdded(true);
					setLoading(false);
				} else {
					setIsActionAdded(false);
				}
			}
		}
	}, [workflow]);

	return (
		<>
			<div
				className={`d-flex flex-row recommendedItem mt-2 ${
					isActionAdded ? "added" : ""
				} ${workflow.isExecuted ? "o-5" : ""}`}
			>
				{selectedApplication?.logo ? (
					<img
						className="recommendedAppIcon"
						src={selectedApplication?.logo}
					/>
				) : (
					<NameBadge
						className="mr-2 img-circle"
						width={32}
						name={props.action.name}
					/>
				)}

				<div className="d-flex flex-column align-self-center">
					<div className="grey font-16 title">
						{props.action.name}
						{props.action.type === ACTION_TYPE.MANUAL && (
							<OverlayTrigger
								placement="top"
								overlay={(props) => (
									<Tooltip {...props} id="button-tooltip">
										A manual task creates a task for
										assignee to be done before a due date
									</Tooltip>
								)}
							>
								<span
									style={{
										backgroundColor: "#5ABAFF",
										bottom: "2px",
									}}
									className="position-relative font-8 p-1 primary-color-bg white bold-700 m-2 border-radius-2 pl-2 pr-2"
								>
									MANUAL TASK
								</span>
							</OverlayTrigger>
						)}
					</div>
				</div>
				<div className="d-flex ml-auto mt-auto mb-auto  pl-2 pr-2">
					{loading ? (
						<>
							<Loader height={30} width={30} />
						</>
					) : (
						<>
							{isActionAdded ? (
								<>
									<img
										src={completeicon}
										width={10}
										className="mr-1"
									/>
									<div className="authorized_green font-13">
										Added
									</div>
								</>
							) : (
								!workflow.isExecuted && (
									<div
										className="d-flex cursor-pointer"
										onClick={() => handleAdd()}
									>
										<img
											src={plus}
											width={10}
											className="mr-1"
										/>
										<div className="primary-color font-13">
											Add
										</div>
									</div>
								)
							)}
						</>
					)}
				</div>
			</div>
		</>
	);
}

export default RecommendedActionCard;
