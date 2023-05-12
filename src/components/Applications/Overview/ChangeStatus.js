import React, { Component, useState, useEffect, useRef } from "react";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";
import CreatableSelect from "react-select/creatable";
import { Spinner } from "react-bootstrap";
import completeiconimg from "./completeicon.svg";
import edit from "./edit.svg";
import cancel from "./cancel.svg";
import check from "../../../assets/applications/check.svg";
import inactivecheck from "../../../assets/applications/inactivecheck.svg";
import acceptbutton from "./acceptbutton.svg";
import { getSearch } from "../../../services/api/search";
import close from "../../../assets/close.svg";
import adobe from "../../../assets/transactions/adobe.svg";
import {
	patchApplication,
	updateApplication,
} from "../../../services/api/applications";
import uploadimage from "../../Applications/AllApps/uploadimage.svg";
import { Loader } from "../../../common/Loader/Loader";
import newbutton from "../../Applications/AllApps/newbutton.svg";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllApplications } from "../../../actions/applications-action";
import "./Overview.css";
import { useOutsideClickListener } from "../../../utils/clickListenerHook";
import { capitalizeFirstLetter } from "../../../utils/common";
import { applicationConstants } from "../../../constants";
function SuggestionBar(props) {
	return (
		<>
			<div className="SuggestionBardiv__WFM__2__appsowner">
				<button
					className="option__card__WFM"
					onClick={() => {
						props.handleSelect("active");
						props.onHide();
					}}
				>
					Active
				</button>
				<hr style={{ margin: "0px 18px" }}></hr>
				<button
					className="option__card__WFM"
					onClick={() => {
						props.handleSelect("inactive");
						props.onHide();
					}}
				>
					Inactive
				</button>
			</div>
		</>
	);
}
export function ChangeStatus(props) {
	const [patchObj, setPatchObj] = useState({
		op: "replace",
		field: "",
		value: "",
	});
	const dispatch = useDispatch();
	const [appId, setAppId] = useState("");
	const [loadingicon, setloadingicon] = useState(false);
	const [completeicon, setcompleteicon] = useState(false);
	const [newStatus, setNewStatus] = useState(props.status);
	const [tempStatus, setTempStatus] = useState(null);
	const [edited, setEdited] = useState(false);
	const [inputClicked, setInputClicked] = useState(false);
	const editFieldRef = useRef();

	useEffect(() => {
		const pathname = window.location.pathname;
		const id = pathname.split("/")[2];
		setAppId(id);
	}, []);
	const [showHideStatusEdit, setShowHideStatusEdit] = useState(false);
	const handleStatus = (value) => {};
	const updatevaluefrommodal = (status) => {
		setTempStatus(status);
	};
	let addCardClose = () => setInputClicked(false);

	useOutsideClickListener(
		editFieldRef,
		() => {
			setShowHideStatusEdit(false);
			setInputClicked(false);
			if (!edited) {
				setTempStatus(newStatus);
			}
		},
		[edited]
	);

	const refreshAllApps = () => {
		dispatch({
			type: applicationConstants.DELETE_APPLICATIONS_CACHE,
		});
	};

	return (
		<>
			{!showHideStatusEdit ? (
				<div
					className={
						!props.disableEdit
							? "overview__middle__topconttext2__hover"
							: "font-13"
					}
					style={{ color: "#222222" }}
				>
					<div className="d-flex align-items-center">
						{edited ? (
							newStatus === "active" ? (
								<>
									<img
										src={check}
										style={{ marginRight: "4px" }}
									></img>
									Active
									<button
										type="submit"
										className="apps__ov__editbutton"
										onClick={() => {
											!props.disableEdid &&
												setShowHideStatusEdit(true);
										}}
									>
										<img src={edit} alt=""></img>
									</button>
								</>
							) : (
								<>
									<img
										src={inactivecheck}
										style={{ marginRight: "4px" }}
									></img>
									Inactive
									<button
										type="submit"
										className="apps__ov__editbutton"
										onClick={() => {
											setShowHideStatusEdit(true);
											if (!edited) {
												// setNewStatus(props.status);
											}
										}}
									>
										<img src={edit} alt=""></img>
									</button>
								</>
							)
						) : newStatus === "active" ? (
							<>
								<img
									src={check}
									style={{ marginRight: "4px" }}
								></img>
								Active
								<button
									type="submit"
									className="apps__ov__editbutton"
									onClick={() => {
										setShowHideStatusEdit(true);
										if (!edited) {
											// setNewStatus(props.status);
											// setTempStatus(props.status);
										}
									}}
								>
									<img src={edit} alt=""></img>
								</button>
							</>
						) : newStatus === "inactive" ? (
							<>
								<img
									src={inactivecheck}
									style={{ marginRight: "4px" }}
								></img>
								Inactive
								<button
									type="submit"
									className="apps__ov__editbutton"
									onClick={() => {
										setShowHideStatusEdit(true);
										if (!edited) {
											setNewStatus(props.status);
										}
									}}
								>
									<img src={edit} alt=""></img>
								</button>
							</>
						) : (
							<>
								<img
									src={inactivecheck}
									style={{ marginRight: "4px" }}
								></img>
								<div className="text-capitalize">
									{props.status}
								</div>
							</>
						)}
					</div>
					<hr className="hidden__hr__appinfo"></hr>
				</div>
			) : (
				<div
					ref={editFieldRef}
					className="overview__middle__topconttext2__EditCategory"
				>
					<input
						type="select"
						className="overview__middle__topconttext2__EditCategory__input"
						defaultValue={"Select Status"}
						placeholder="Select Status"
						value={tempStatus && capitalizeFirstLetter(tempStatus)}
						onClick={() => {
							setInputClicked(true);
						}}
						onChange={(e) => handleStatus(e.target.value)}
					></input>
					{inputClicked ? (
						<SuggestionBar
							onHide={addCardClose}
							handleSelect={updatevaluefrommodal}
						></SuggestionBar>
					) : null}
					{!completeicon && !loadingicon ? (
						<>
							<button
								onClick={() => setShowHideStatusEdit(false)}
								className="overview__middle__topconttext2__EditCategory__button1"
							>
								<img src={cancel}></img>
							</button>
							<button
								onClick={() => {
									setNewStatus(tempStatus);
									setloadingicon(true);
									setInputClicked(false);
									setEdited(true);
									let finalId = appId;
									if (props.idFromTable) {
										finalId = props.idFromTable;
									}

									updateApplication(finalId, {
										app_status: tempStatus,
									}).then((res) => {
										refreshAllApps();
										setloadingicon(false);
										setcompleteicon(true);
										setTimeout(() => {
											setcompleteicon(false);
											setShowHideStatusEdit(false);
										}, 500);
										setNewStatus(tempStatus);
									});
								}}
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
								className="my-custom-spinner"
							/>
						</>
					)}
				</div>
			)}
		</>
	);
}
