import React, { useEffect, useRef, useState } from "react";
import { Spinner } from "react-bootstrap";
import edit from "assets/icons/edit.svg";
import completeiconimg from "assets/icons/completeicon.svg";
import acceptbutton from "assets/icons/acceptbutton.svg";
import cancel from "assets/icons/cancel.svg";
import _ from "underscore";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import { setAutomationRuleName } from "../../redux/action";

function AutomationRuleName() {
	const rule = useSelector((state) => state?.appRule?.rule);
	const [editing, setEditing] = useState(false);
	const [isEdited, setIsEdited] = useState(false);
	const editFieldRef = useRef();
	const [formData, setFormData] = useState(rule);
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
		setFormData(rule);
	}, [rule]);

	const reset = () => {
		setSubmitted(false);
		setEditing(false);
		setIsEdited(false);
		setFormData(rule);
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
		dispatch(setAutomationRuleName(formData));
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
						placeholder="Rule name"
						value={formData?.name || ""}
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
							<img alt="" src={completeiconimg} />
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
								<img alt="" src={cancel} />
							</button>
							{isEdited && (
								<button
									className="overview__middle__topconttext2__EditCategory__button2 mr-1 mt-auto mb-auto"
									onClick={() => {
										onSave();
									}}
								>
									<img alt="" src={acceptbutton}></img>
								</button>
							)}
						</>
					)}
				</div>
			) : (
				<div className="d-flex">
					<div className="font-22 text-capitalize ">
						<OverlayTrigger
							placement="bottom"
							overlay={<Tooltip>{formData?.name || ""}</Tooltip>}
						>
							<div className="rule-header-name">
								{formData?.name || ""}
							</div>
						</OverlayTrigger>
					</div>
					<img
						alt=""
						src={edit}
						onClick={() => setEditing(true)}
						className="ml-2 cursor-pointer"
						width={15}
					/>
				</div>
			)}
		</>
	);
}

export default AutomationRuleName;
