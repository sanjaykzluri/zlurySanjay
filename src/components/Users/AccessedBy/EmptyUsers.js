import React from "react";
import "../../../common/empty.css";
import empty from "../../../assets/users/empty.svg";
import add from "../../../assets/addwhite.svg";

export function EmptyUsers(props) {
	return (
		<div className="d-flex flex-column justify-content-center align-items-center mt-auto ml-auto mr-auto h-75">
			<img src={empty} width={200} />
			<div className="empty-header">Add Users here</div>
			<button
				color="primary"
				className="ov__button2 empty-page-button w-auto pl-3 pr-3 mt-3"
				onClick={() => props.setClickedOnAddUsersEmpty(true)}
			>
				<img style={{ paddingRight: "5px" }} src={add} />
				Add Users
			</button>
		</div>
	);
}
