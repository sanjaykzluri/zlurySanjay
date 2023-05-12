import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ContentLoader from "react-content-loader";
import { getAllUsers, getUsersBySearch } from "../../redux/workflow";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { Button } from "../../../../UIComponents/Button/Button";
import { Form, Spinner } from "react-bootstrap";
import { SearchInputArea } from "../../../../components/searchInputArea";
import search from "../../../../assets/search.svg";
import closeIcon from "../../../../assets/close.svg";
import { NameBadge } from "../../../../common/NameBadge";
import { debounce } from "../../../../utils/common";
import { client } from "../../../../../src/utils/client";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import noUserFound from "../../../../assets/noUserFound.svg";
import declaration from "../../../../assets/icons/declaration.svg";
import { checkSpecialCharacters } from "../../../../services/api/search";

export default function OffboardingConfirmDeclaration(props) {
	const dispatch = useDispatch();
	const {
		openModal,
		title,
		subTitle,
		onCloseModal,
		onContinue,
		buttonTitle,
		modalClass,
	} = props;
	const [checked, setChecked] = useState(false);

	return (
		<Modal
			contentClassName={modalClass}
			dialogClassName="z_i_connect_modal_dialog"
			show={openModal}
			title={""}
			onClose={() => onCloseModal()}
		>
			<React.Fragment>
				<div
					style={{
						backgroundColor: "rgba(235, 235, 235, .5)",
						borderRadius: "5px",
						padding: "10px",
						paddingTop: "50px",
						paddingBottom: "20px",
					}}
					className="d-flex flex-1 flex-column justify-content-center align-items-center"
				>
					<img
						style={{
							height: "50px",
							width: "50px",
							marginBottom: "10px",
						}}
						src={declaration}
					/>
					<span className="title-text">{title}</span>
					<span className="sub-title">{subTitle}</span>
				</div>
				<div className="p-4 mt-4 mb-2 d-flex flex-column justify-content-center align-items-center">
					<div className="d-flex flex-1 flex-row justify-content-center">
						<Form.Check
							className="checkbox-container margin-right-10"
							type="checkbox"
							value={checked}
							// checked={false}
							onChange={(e) => {}}
							onClick={(e) => {
								setChecked(!checked);
								// onPressUser(e.target.checked, e.target.value, el);
							}}
						/>
						<span className="title-text">
							I declare that I’ve completed all the offboarding
							tasks assigned to me
						</span>
					</div>
					<div className="mt-4 mb-4 text-center">
						<Button
							className="p-3"
							onClick={() => {
								onContinue();
							}}
							disabled={props.onLoading || !checked}
						>
							{buttonTitle}
							{props.onLoading && (
								<Spinner
									style={{ top: "0px" }}
									className="ml-2 mr-2 blue-spinner action-edit-spinner"
									animation="border"
								/>
							)}
						</Button>
					</div>
				</div>
			</React.Fragment>
		</Modal>
	);
}
