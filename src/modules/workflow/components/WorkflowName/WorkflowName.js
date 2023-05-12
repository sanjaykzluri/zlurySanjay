import React, { useEffect, useRef, useState } from "react";
import { Spinner } from "react-bootstrap";
import edit from "../../../../assets/icons/edit.svg";
import completeiconimg from "../../../../assets/icons/completeicon.svg";
import acceptbutton from "../../../../assets/icons/acceptbutton.svg";
import cancel from "../../../../assets/icons/cancel.svg";
import _ from "underscore";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";

function WorkflowName(props) {
	const workflow = useSelector((state) => state[props.entity].workflow);
	const [editing, setEditing] = useState(false);
	const [isEdited, setIsEdited] = useState(false);
	const editFieldRef = useRef();
	const [formData, setFormData] = useState(workflow);
	const [submitted, setSubmitted] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const dispatch = useDispatch();

	useEffect(() => {
		if (submitting) {
			setSubmitting(false);
			setSubmitted(true);
			setTimeout(() => {
				reset();
			}, 3000);
		}
		setFormData(workflow);
	}, [workflow]);

	const reset = () => {
		setSubmitted(false);
		setEditing(false);
		setIsEdited(false);
		setFormData(workflow);
	};

	const handleOnChange = (e) => {
		setFormData(
			Object.assign({}, formData, {
				[e.target.name]: e.target.value,
			})
		);
		if (e.target.value) {
			setIsEdited(true);
		}
	};

	const onSave = () => {
		setSubmitting(true);
		dispatch(
			props.editWorkFlowDetails(
				workflow.id,
				{
					// ...formData,
					name: formData.name?.trim(),
				},
				props.isTemplate
			)
		);
	};

	const onCancel = () => {
		reset();
	};

	return (
		<>
			{editing ? (
				<div
					ref={editFieldRef}
					className="overview__middle__topconttext2__EditCategory w-auto"
					style={{ top: "0px" }}
				>
					<input
						type="text"
						className="overview__middle__topconttext2__EditCategory__input width_25vw"
						style={{ flexGrow: 1 }}
						placeholder="Workflow name"
						value={formData.name}
						name="name"
						onChange={(e) => handleOnChange(e)}
					/>
					{submitting && (
						<div className="d-flex align-items-center mr-2">
							<Spinner
								animation="border"
								variant="light"
								bsPrefix="my-custom-spinner"
								className="my-custom-spinner"
							/>
						</div>
					)}
					{submitted && (
						<div className="d-flex align-items-center mr-2">
							<img src={completeiconimg} />
						</div>
					)}
					{!submitting && !submitted && (
						<>
							<button
								onClick={() => {
									onCancel();
								}}
								className="overview__middle__topconttext2__EditCategory__button1 mr-1 mt-auto mb-auto"
							>
								<img src={cancel} />
							</button>
							{isEdited && (
								<button
									className="overview__middle__topconttext2__EditCategory__button2 mr-1 mt-auto mb-auto"
									onClick={() => {
										onSave();
									}}
								>
									<img src={acceptbutton}></img>
								</button>
							)}
						</>
					)}
				</div>
			) : (
				<div className="d-flex">
					<div
						className={`text-capitalize ${
							props.entity === "workflows"
								? "font-22 "
								: "font-16 "
						}`}
					>
						<LongTextTooltip
							text={workflow.name}
							maxWidth={"20vw"}
							placement="bottom"
						/>
					</div>
					{!workflow.isExecuted && (
						<img
							src={edit}
							onClick={() => setEditing(true)}
							className="ml-2 cursor-pointer"
							width={15}
						/>
					)}
				</div>
			)}
		</>
	);
}

export default WorkflowName;
