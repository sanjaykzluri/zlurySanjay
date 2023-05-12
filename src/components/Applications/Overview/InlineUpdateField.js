import React, { useState, useEffect, useRef, useContext } from "react";
import completeiconimg from "./completeicon.svg";
import { Spinner } from "react-bootstrap";
import edit from "./edit.svg";
import cancel from "./cancel.svg";
import acceptbutton from "./acceptbutton.svg";
import { patchApplication } from "../../../services/api/applications";
import "./Overview.css";
import { useOutsideClickListener } from "../../../utils/clickListenerHook";
import { convertObjToBindSelect } from "../../../utils/convertDataToBindSelect";
import { APPLICATION_TYPE } from "../../../constants";
import { SelectOld } from "../../../UIComponents/SelectOld/Select";
import RoleContext from "../../../services/roleContext/roleContext";
import { useDispatch, useSelector } from "react-redux";
export function InlineUpdateField(props) {
	const [patchObj, setPatchObj] = useState({
		op: "replace",
		field: props.name,
		value: props.value,
	});
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [onEdit, setOnEdit] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isCompleted, setIsCompleted] = useState(false);
	const [applicationID, setApplicationID] = useState("");
	const editFieldRef = useRef();
	const { isViewer } = useContext(RoleContext);

	useEffect(() => {
		if (!applicationID)
			setApplicationID(window.location.pathname.split("/")[2]);
	}, [props.value]);

	const onSave = () => {
		setIsLoading(true);
		patchApplication(applicationID, { patches: [patchObj] }).then((res) => {
			setIsCompleted(true);
			props.onUpdate(patchObj.value);
			setTimeout(() => {
				setIsCompleted(false);
				setIsLoading(false);
				setOnEdit(false);
			}, 500);
		});
	};

	useOutsideClickListener(editFieldRef, () => {
		setOnEdit(false);
	});

	const clickOnTypeButton = () => {
		setOnEdit(true);
		//Segment Implementation
		window.analytics.track("Clicked on Update/Edit Type Button", {
			currentCategory: "Applications",
			currentPageName: "Application-Overview",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	return (
		<>
			{!onEdit && (
				<div
					style={{
						marginBottom: "25px",
						textTransform: "capitalize",
					}}
					className={`overview__middle__topconttext2__hover ${props.className}`}
				>
					<div className="d-flex align-items-center">
						<>
							{props.value}
							{!isViewer && (
								<button
									type="submit"
									className="apps__ov__editbutton"
									onClick={clickOnTypeButton}
								>
									<img src={edit} alt=""></img>
								</button>
							)}
						</>
					</div>
					<hr className="hidden__hr__appinfo"></hr>
				</div>
			)}
			{onEdit && (
				<div
					ref={editFieldRef}
					className={`overview__middle__topconttext2__EditCategory ${props.editClassName}`}
				>
					<SelectOld
						style={{
							width: 120,
							color: "#fff",
							backgroundColor: "transparent",
							border: "0",
						}}
						value={{ value: props.value }}
						className="text-capitalize quick-edit__type"
						label="value"
						placeholder="Change Type"
						options={convertObjToBindSelect(APPLICATION_TYPE)}
						onSelect={(v) =>
							setPatchObj(
								Object.assign(
									{},
									{ ...patchObj, value: v.value }
								)
							)
						}
					/>
					{!isCompleted && !isLoading ? (
						<>
							<button
								onClick={() => {
									setOnEdit(false);
								}}
								className="overview__middle__topconttext2__EditCategory__button1"
							>
								<img src={cancel} />
							</button>
							<button
								onClick={() => {
									onSave();
								}}
								className="overview__middle__topconttext2__EditCategory__button2"
							>
								<img src={acceptbutton} />
							</button>
						</>
					) : isCompleted ? (
						<img
							src={completeiconimg}
							width={15}
							className="ml-4"
						/>
					) : (
						<>
							<Spinner
								style={{
									position: "absolute",
									top: "35%",
									right: "5px",
								}}
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
