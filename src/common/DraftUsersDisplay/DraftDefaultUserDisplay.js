import React from "react";
import UserInfoTableComponent from "../UserInfoTableComponent";
import { NAME_LIMIT } from "./constants";

export default function DraftDefaultUserDisplay({ usersList }) {
	if (usersList && Array.isArray(usersList) && usersList.length) {
		return usersList[0].user_name.length > NAME_LIMIT ||
			usersList[1].user_name.length > NAME_LIMIT ? (
			<div style={{ display: "flex", minWidth: "200px" }}>
				<div style={{ marginRight: "10px" }}>
					<UserInfoTableComponent
						profile_img={usersList[0].user_logo}
						user_name={usersList[0].user_name || "N/A"}
						user_id={usersList[0].user_id || "N/A"}
					/>
				</div>
				<div className="custom-badge">+{usersList.length - 1}</div>
			</div>
		) : (
			<div style={{ display: "flex", minWidth: "200px" }}>
				<div style={{ marginRight: "10px" }}>
					<UserInfoTableComponent
						profile_img={usersList[0].user_logo}
						user_name={usersList[0].user_name || "N/A"}
						user_id={usersList[0].user_id || "N/A"}
					/>
				</div>
				<div style={{ marginRight: "10px" }}>
					<UserInfoTableComponent
						profile_img={usersList[1].user_logo}
						user_name={usersList[1].user_name || "N/A"}
						user_id={usersList[1].user_id || "N/A"}
					/>
				</div>
				<div className="custom-badge">+{usersList.length - 2}</div>
			</div>
		);
	} else {
		return <div className="custom-badge">0</div>;
	}
}
