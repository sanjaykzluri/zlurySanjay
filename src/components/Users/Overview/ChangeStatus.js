import React, { useState, useEffect, useRef, useContext } from "react";
import edit from "./edit.svg";
import cancel from "./cancel.svg";
import check from "../../../assets/applications/check.svg";
import inactivecheck from "../../../assets/applications/inactivecheck.svg";
import acceptbutton from "./acceptbutton.svg";
import { updateUser } from "../../../services/api/users";
import { useLocation } from "react-router-dom";
import { useOutsideClickListener } from "../../../utils/clickListenerHook";
import { capitalizeFirstLetter } from "../../../utils/common";
import RoleContext from "../../../services/roleContext/roleContext";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const USER_STATUS = {
	ACTIVE: "active",
	IN_ACTIVE: "inactive",
};

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
	const [status, setStatus] = useState();
	const [inputClicked, setInputClicked] = useState(false);
	const [showHideStatusEdit, setShowHideStatusEdit] = useState(false);
	const [primaryName, setPrimaryName] = useState();
	const location = useLocation();
	const editFieldRef = useRef();
	const { isViewer } = useContext(RoleContext);

	useEffect(() => {
		setStatus(props.status);
		props.sourceArray?.forEach((item) => {
			if (item.is_primary) {
				setPrimaryName(item.keyword);
				return;
			}
		});
	}, []);

	useOutsideClickListener(editFieldRef, () => {
		setShowHideStatusEdit(false);
		setInputClicked(false);
	});

	const noHoverStatus = (
		<div
			className={
				!props.disableEdit && "overview__middle__topconttext2__hover"
			}
		>
			<div className="d-flex align-items-center">
				<>
					<img
						src={
							typeof status === "string" &&
							status?.toLocaleLowerCase() === USER_STATUS.ACTIVE
								? check
								: inactivecheck
						}
						style={{
							marginRight: "4px",
							width: props.isOverview ? "12px" : "auto",
						}}
					/>
					<div className="text-capitalize">
						{capitalizeFirstLetter(status)}
					</div>
					{!isViewer && (
						<button
							className="apps__ov__editbutton"
							onClick={() => {
								!props.disableEdit &&
									setShowHideStatusEdit(true);
							}}
						>
							<img src={edit} alt=""></img>
						</button>
					)}
				</>
			</div>
			<hr className="hidden__hr__appinfo"></hr>
		</div>
	);

	const hoverStatus = (
		<OverlayTrigger
			placement="top"
			overlay={
				<Tooltip>{`Marked as ${status} ${
					!primaryName || primaryName === "manual"
						? "manually"
						: `by ${primaryName}`
				} `}</Tooltip>
			}
		>
			{noHoverStatus}
		</OverlayTrigger>
	);

	const handleStatusSave = () => {
		setShowHideStatusEdit(false);
		setInputClicked(false);
		let userId = props.idFromTable || location.pathname.split("/")[2];

		updateUser(userId, {
			user_status: status,
		})
			.then((res) => {})
			.catch((err) => console.error("Error updating user status:", err));
	};

	return (
		<>
			{!showHideStatusEdit ? (
				<div className="d-flex">
					{props.hasStatusHover ? hoverStatus : noHoverStatus}
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
						value={status}
						onClick={() => {
							setInputClicked(true);
						}}
					/>
					{inputClicked && (
						<SuggestionBar
							onHide={() => setInputClicked(false)}
							handleSelect={setStatus}
						/>
					)}
					<button
						onClick={() => setShowHideStatusEdit(false)}
						className="overview__middle__topconttext2__EditCategory__button1"
					>
						<img src={cancel}></img>
					</button>
					<button
						onClick={handleStatusSave}
						className="overview__middle__topconttext2__EditCategory__button2"
					>
						<img src={acceptbutton}></img>
					</button>
				</div>
			)}
		</>
	);
}
