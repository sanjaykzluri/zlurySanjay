import React, { useState, useEffect, useRef, useContext } from "react";
import edit from "./edit.svg";
import cancel from "./cancel.svg";
import acceptbutton from "./acceptbutton.svg";
import { patchUser } from "../../../services/api/users";
import "../../../App.css";
import PlusCircle from "../../../assets/icons/plus-circle.svg";
import { useOutsideClickListener } from "../../../utils/clickListenerHook";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import RoleContext from "../../../services/roleContext/roleContext";

export function ChangeDesignation(props) {
	const [patchObj, setPatchObj] = useState({
		op: "replace",
		field: "",
		value: "",
	});
	const [showHideDesignationEdit, setShowHideDesignationEdit] = useState(false);
	const [appId, setAppId] = useState("");
	const [edited, setEdited] = useState(false);
	const [isShowAddDesignation, setShowAddDesignation] = useState(false);
	useEffect(() => {
		const pathname = window.location.pathname;
		const id = pathname.split("/")[2];
		setAppId(id);
		setNewDesignation(props.user?.user_designation);
		if (!props.user?.user_designation) {
			setShowAddDesignation(true);
		}
	}, []);
	const editFieldRef = useRef();
	const [newDesignation, setNewDesignation] = useState();
	const [designationVal, setDesignationVal] = useState();
	const { isViewer } = useContext(RoleContext);

	const showTooltipLength = 10;

	useOutsideClickListener(editFieldRef, () => {
		setShowHideDesignationEdit(false);
	})

	function handleSave() {
		setEdited(true);
		let tempObj = { ...patchObj };
		tempObj.field = "designation";
		tempObj.value = designationVal;
		let finalObj = {};
		finalObj.patches = [];
		finalObj.patches.push(tempObj);
		let finalId = appId;
		if (props.idFromTable) {
			finalId = props.idFromTable;
		}
		patchUser(finalId, finalObj).then((res) => {
			if (res?.status === "success") {
				setShowAddDesignation(!res?.patched_user.designation?.length > 0);
				setNewDesignation(res?.patched_user.designation);
				props.refreshReduxState && props.refreshReduxState();
			}
		}).catch((err) => {
			console.log("ERROR IN UPDATING DESIGNATION", err);
		}).finally(() => {
			setShowHideDesignationEdit(false);

		})
	}

	return (
		<>
			{!showHideDesignationEdit ? (
				<div
					style={{ marginBottom: props.marginRequired ? "25px" : "inherit" }}
					className="overview__middle__topconttext2__hover"
				>
					<div className="d-flex align-items-center overview__middle__topconttext2__grey">
						{/* <div className="truncate_10vw">
							{edited? newDesignation :props.user?.user_designation}

						</div> */}
						{(isShowAddDesignation && !isViewer) ? (
							<div
								onClick={() => setShowHideDesignationEdit(true)}
								className="cursor-pointer"
								style={{ color: "#717171" }}
							>
								<img src={PlusCircle} width="24" className="mr-2" />
								<span>Add Designation</span>
							</div>
						) : newDesignation ? (
							<>
								<OverlayTrigger
									placement="top"
									overlay={
										<Tooltip>
											{newDesignation}
										</Tooltip>
									}
								>
									<div className="truncate_10vw overview__middle__topconttext2__grey">
										{newDesignation}
									</div>
								</OverlayTrigger>
								{
									!isViewer &&
									<button
										type="submit"
										className="apps__ov__editbutton"
										onClick={() => {
											setShowHideDesignationEdit(true);
											if (!edited) {
												setDesignationVal(props.user?.user_designation);
											}
										}
										}
									>
										<img src={edit} alt=""></img>
									</button>
								}
							</>
						) : (
							<div className="grey-1">
								<span>No Designation</span>
							</div>
						)}
					</div>
				</div>
			) : (
				<div ref={editFieldRef} className="overview__middle__topconttext2__EditCategory">
					<input
						type="text"
						className="overview__middle__topconttext2__EditCategory__input text-capitalize"
						value={designationVal}
						placeholder="Enter Designation"
						onChange={(event) => {
							setDesignationVal(event.target.value);
						}}
					/>
					<button
						onClick={() => {
							setShowHideDesignationEdit(false);
						}}
						className="overview__middle__topconttext2__EditCategory__button1"
					>
						<img src={cancel} />
					</button>
					<button
						onClick={() => handleSave()}
						className="overview__middle__topconttext2__EditCategory__button2"
					>
						<img src={acceptbutton} alt="Accept" />
					</button>
				</div>
			)}
		</>
	);
}
