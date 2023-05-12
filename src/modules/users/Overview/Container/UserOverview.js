import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { fetchAllUsers } from "../../../../actions/users-action";
import { fetchUserDetails } from "../../../../components/Users/redux";
import { usersConstants } from "../../../../constants/users";
import { HeaderRight } from "../Components/HeaderRight";
import { NotesListUsers } from "../Components/NotesListUsers";
import { OnboardOffboardContainer } from "../Components/OnobardOffboardContainer";
import SpendGraphUsers from "../Components/SpendGraphUsers";
import { UserDescription } from "../Components/UserDescription";
import "components/Users/Overview/OverviewUsers.css";

export function UserOverview({
	onUserChange,
	userAccountTypeChangedFromOverview,
}) {
	const user = useSelector((state) => state.user);
	const history = useHistory();
	const location = useLocation();
	const dispatch = useDispatch();
	const id = location.pathname.split("/")[2];
	function refreshUsers() {
		dispatch({
			type: usersConstants.DELETE_USERS_CACHE,
		});
		dispatch(fetchUserDetails(id));
		dispatch(fetchAllUsers(0));
	}
	return (
		<>
			<div className="securityoverview__wrapper">
				<div className="securityoverview__left">
					<UserDescription
						refreshUsers={refreshUsers}
						onUserChange={onUserChange}
						userAccountTypeChangedFromOverview={
							userAccountTypeChangedFromOverview
						}
						user={user}
					></UserDescription>
				</div>
				<div
					className="securityoverview__right"
					style={{ padding: "10px 20px 0px" }}
				>
					<HeaderRight user={user}></HeaderRight>
					{user?.user_onboard_offboard_details && (
						<OnboardOffboardContainer
							user={user}
							type={user?.user_onboard_offboard_details?.type}
						></OnboardOffboardContainer>
					)}
					<NotesListUsers user={user}></NotesListUsers>
					<SpendGraphUsers user={user}></SpendGraphUsers>
				</div>
			</div>
		</>
	);
}
