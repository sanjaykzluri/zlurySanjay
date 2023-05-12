import React, {
	Component,
	useState,
	useEffect,
	useRef,
	useContext,
} from "react";
import completeiconimg from "./completeicon.svg";
import { Spinner } from "react-bootstrap";
import edit from "./edit.svg";
import cancel from "./cancel.svg";
import check from "../../../assets/applications/check.svg";
import inactivecheck from "../../../assets/applications/inactivecheck.svg";
import acceptbutton from "./acceptbutton.svg";
import { getSearch } from "../../../services/api/search";
import close from "../../../assets/close.svg";
import adobe from "../../../assets/transactions/adobe.svg";
import { patchApplication } from "../../../services/api/applications";
import uploadimage from "../../Applications/AllApps/uploadimage.svg";
import { Loader } from "../../../common/Loader/Loader";
import newbutton from "../../Applications/AllApps/newbutton.svg";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllApplications } from "../../../actions/applications-action";
import "./Overview.css";
import { useOutsideClickListener } from "../../../utils/clickListenerHook";
import RoleContext from "../../../services/roleContext/roleContext";
function SuggestionBar(props) {
	return (
		<>
			<div className="SuggestionBardiv__WFM__2__appsowner">
				<button
					className="option__card__WFM"
					onClick={() => {
						props.handleSelect(true);
						props.onHide();
					}}
				>
					On
				</button>
				<hr style={{ margin: "0px 18px" }}></hr>
				<button
					className="option__card__WFM"
					onClick={() => {
						props.handleSelect(false);
						props.onHide();
					}}
				>
					Off
				</button>
			</div>
		</>
	);
}
export function ChangeRenewal(props) {
	const [patchObj, setPatchObj] = useState({
		op: "replace",
		field: "",
		value: "",
	});
	const [appId, setAppId] = useState("");
	const [loadingicon, setloadingicon] = useState(false);
	const [completeicon, setcompleteicon] = useState(false);
	const [newStatus, setNewStatus] = useState(null);
	const [tempStatus, setTempStatus] = useState(null);
	const [edited, setEdited] = useState(false);
	const [inputClicked, setInputClicked] = useState(false);
	const ref = useRef(null);
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
	const { isViewer } = useContext(RoleContext);

	useOutsideClickListener(ref, () => {
		setShowHideStatusEdit(false);
	});

	return (
		<>
			{!showHideStatusEdit ? (
				<div
					style={{ marginBottom: "25px" }}
					className={`overview__middle__topconttext2__hover ${props.className}`}
					ref={ref}
				>
					<div className="d-flex align-items-center">
						{edited ? (
							newStatus ? (
								<>
									On
									{!isViewer && (
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
									)}
								</>
							) : (
								<>
									Off
									{!isViewer && (
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
									)}
								</>
							)
						) : props.status ? (
							<>
								On
								{!isViewer && (
									<button
										type="submit"
										className="apps__ov__editbutton"
										onClick={() => {
											setShowHideStatusEdit(true);
											if (!edited) {
												setNewStatus(props.status);
												setTempStatus(props.status);
											}
										}}
									>
										<img src={edit} alt=""></img>
									</button>
								)}
							</>
						) : (
							<>
								Off
								{!isViewer && (
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
								)}
							</>
						)}
					</div>
					<hr className="hidden__hr__appinfo"></hr>
				</div>
			) : (
				<div
					className="overview__middle__topconttext2__EditCategory"
					ref={ref}
				>
					<input
						type="select"
						className="overview__middle__topconttext2__EditCategory__input"
						defaultValue={"Select Status"}
						value={tempStatus ? "On" : "Off"}
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

									setEdited(true);
									let tempObj = { ...patchObj };
									tempObj.field = "auto_renewal";
									tempObj.value = tempStatus;
									let finalObj = {};
									finalObj.patches = [];
									finalObj.patches.push(tempObj);
									patchApplication(appId, finalObj).then(
										(res) => {
											if (res.status) {
												setloadingicon(false);
												setcompleteicon(true);
												setTimeout(() => {
													setcompleteicon(false);
													setShowHideStatusEdit(
														false
													);
												}, 500);
												props.refreshPage &&
													props.refreshPage();
											}
										}
									);
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
								className="blue-spinner"
							/>
						</>
					)}
				</div>
			)}
		</>
	);
}
