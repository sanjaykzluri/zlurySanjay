import React, { useState, useEffect, useRef, useContext } from "react";
import completeiconimg from "../../Applications/Overview/completeicon.svg";
import { Form, Spinner } from "react-bootstrap";
import edit from "../../Applications/Overview/edit.svg";
import cancel from "../../Applications/Overview/cancel.svg";
import acceptbutton from "../../Applications/Overview/acceptbutton.svg";
import "../../Applications/Overview/Overview.css";
import { useOutsideClickListener } from "../../../utils/clickListenerHook";
import { patchDepartments } from "../../../services/api/departments";
import RoleContext from "../../../services/roleContext/roleContext";
import { trackActionSegment } from "modules/shared/utils/segment";
import { TriggerIssue } from "utils/sentry";

export function ChangeBudget(props) {
	const [loadingicon, setloadingicon] = useState(false);
	const [completeicon, setcompleteicon] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const ref = useRef(null);
	const [patchObj, setPatchObj] = useState({});
	const [totalBudget, setTotalBudget] = useState("");
	const { isViewer } = useContext(RoleContext);

	useEffect(() => {
		const tempObj = {
			patches: [
				{
					op: "replace",
					field: "budget",
					value: "",
				},
			],
		};
		tempObj.patches[0].value = props.totalBudget;
		setPatchObj(tempObj);
		setLoaded(true);
		setTotalBudget(props.totalBudget);
	}, []);
	const [showHideStatusEdit, setShowHideStatusEdit] = useState(false);

	useOutsideClickListener(ref, () => {
		setShowHideStatusEdit(false);
	});

	function handleEdit(number) {
		const tempObj = patchObj;
		if(number < props.min_budget) {
			props.setInvalid && props.setInvalid(true);
		} else {
			props.setInvalid && props.setInvalid(false);
			tempObj.patches[0].value = number;
			setPatchObj(tempObj);
		}
	}

	function handleSubmit() {
		setloadingicon(true);
		patchDepartments(props.department_id, patchObj)
			.then((res) => {
				if (res.status === "success") {
					trackActionSegment("Edited Department Budget", {
						deptId: props.department_id,
						additionalInfo: patchObj,
					});
					setcompleteicon(true);
					setTimeout(() => {
						setcompleteicon(false);
						setShowHideStatusEdit(false);
					}, 500);
					setTotalBudget(res.patched_department.budget);
				}
				setloadingicon(false);
			})
			.catch((err) => TriggerIssue("ERROR IN UPDATING BUDGET", err));
	}

	return (
		<>
			{!showHideStatusEdit ? (
				<div
					className="overview__middle__topconttext2__hover"
					ref={ref}
				>
					{loaded && (
						<div className="d-flex align-items-center">
							<div className="overview__top__next__instext">
								{props.kFormatter(props.budgetUsed || 0)}
							</div>
							<div
								className="overview__top__next__instext2"
								style={{ whiteSpace: "nowrap" }}
							>
								of {props.kFormatter(totalBudget || 0)} used
							</div>
							{!isViewer && (
								<button
									type="submit"
									className="apps__ov__editbutton"
									onClick={() => {
										setShowHideStatusEdit(true);
									}}
								>
									<img src={edit} alt=""></img>
								</button>
							)}
						</div>
					)}
					<hr className="hidden__hr__appinfo"></hr>
				</div>
			) : (
				<div
					className="overview__middle__topconttext2__EditCategory"
					style={{ marginTop: "-5px" }}
					ref={ref}
				>
					{loaded && (
						<Form.Control
							type="number"
							className="overview__middle__topconttext2__EditCategory__input"
							defaultValue={totalBudget || 0}
							onChange={(e) => handleEdit(e.target.value)}
						></Form.Control>
					)}
					{!completeicon && !loadingicon ? (
						<>
							<button
								onClick={() => {
									setShowHideStatusEdit(false);
									props.setInvalid && props.setInvalid(false);
								}}
								className="overview__middle__topconttext2__EditCategory__button1"
							>
								<img src={cancel}></img>
							</button>
							<button
								disabled={props.invalid}
								onClick={() => handleSubmit()}
								className="overview__middle__topconttext2__EditCategory__button2"
							>
								<img src={acceptbutton}></img>
							</button>
						</>
					) : completeicon ? (
						<img src={completeiconimg}></img>
					) : (
						<>
							<Spinner
								animation="border"
								variant="light"
								bsPrefix="my-custom-spinner"
								className="my-custom-spinner m-auto"
							/>
						</>
					)}
				</div>
			)}
		</>
	);
}
