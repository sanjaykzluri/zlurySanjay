import React from "react";
import UserInfoTableComponent from "../UserInfoTableComponent";
import DraftDefaultUserDisplay from "./DraftDefaultUserDisplay";
import DraftTwoUsersDisplay from "./DraftTwoUsersDisplay";

export default function DraftUsersDisplay({ usersList }) {
	switch (usersList?.length) {
		case 0:
			return <div className="custom-badge">0</div>;
		case 1:
			if (usersList && Array.isArray(usersList) && usersList.length) {
				return (
					<div>
						<UserInfoTableComponent
							profile_img={usersList[0].user_logo}
							user_name={usersList[0].user_name || "N/A"}
							user_id={usersList[0].user_id || "N/A"}
						/>
					</div>
				);
			} else {
				return <div className="custom-badge">0</div>;
			}

		case 2:
			return <DraftTwoUsersDisplay usersList={usersList} />;
		default:
			return <DraftDefaultUserDisplay usersList={usersList} />;
	}
}
