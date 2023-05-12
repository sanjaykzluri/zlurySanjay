import React, { useEffect, useRef, useState } from "react";
import search from "../../../../assets/search.svg";
import Add from "../../../../assets/add.svg";
import AddUserModal from "../Modals/AddUserModal";
import {
	addUsersInAccessedBy,
	removeUsersAccessedBy,
} from "../../../../services/api/users";
import { useLocation } from "react-router-dom";
import "./Filters.css";
export function AccessedByFilters(props) {
	const location = useLocation();
	const ref = useRef();
	const [addUserModalOpen, setAddUserModalOpen] = useState(false);
	const [isRequesting, setIsRequesting] = useState(false);
	const [userIds, setUserIds] = useState([]);
	const defaultReqBody = {
		user_ids: [],
	};
	const [reqBody, setReqBody] = useState({
		user_ids: [],
	});
	const clickedOnAdd = () => {
		setAddUserModalOpen(true);
	};
	useEffect(() => {
		if (props.clickedOnAddUsersEmpty) {
			setAddUserModalOpen(true);
		}
	}, [props.clickedOnAddUsersEmpty]);
	useEffect(() => {
		let tempReqBody = { ...reqBody };
		tempReqBody.user_ids = userIds;
		setReqBody(tempReqBody);
	}, [userIds]);
	useEffect(() => {
		let tempReqBody = { ...reqBody };
		tempReqBody.user_ids = props.selectedIds;
		setReqBody(tempReqBody);
	}, [props.selectedIds]);
	function handleSubmit() {
		try {
			const id = location.pathname.split("/")[2];
			setIsRequesting(true);
			addUsersInAccessedBy(id, reqBody).then((res) => {
				if (res.status === "success") {
					props.setSuccessResponse(true);
					setAddUserModalOpen(false);
					setIsRequesting(false);
					setReqBody(defaultReqBody);
				} else {
					console.log("Response is not as expected", res);
				}
			});
		} catch (error) {
			setIsRequesting(false);
			console.log(error, "Error ");
		}
	}
	const handleRemoveUsers = () => {
		try {
			const id = location.pathname.split("/")[2];
			removeUsersAccessedBy(id, reqBody).then((res) => {
				if (res.status === "success") {
					props.setSuccessResponse(true);
					setReqBody(defaultReqBody);
				} else {
					console.log("Response is not as expected", res);
				}
			});
		} catch (error) {
			console.log(error, "Error ");
		}
	};
	return (
		<>
			<div className="top__Uploads justify-content-between">
				<div className="Uploads__left"></div>

				<div className="Uploads__right">
					{props.selectedIds && props.selectedIds.length > 0 && (
						<button
							className="accessedby__filters__removeusers mr-3"
							onClick={handleRemoveUsers}
						>
							Remove Users
						</button>
					)}
					<div className="inputWithIconApps ml-0 mt-auto mb-auto mr-0">
						{props && props.setSearchQuery && (
							<input
								type="text"
								onChange={(e) => {
									props.setSearchQuery(e.target.value);
								}}
							/>
						)}

						<img src={search} aria-hidden="true" />
					</div>
					<button className="appsad ml-3" onClick={clickedOnAdd}>
						<img alt="Add" src={Add} />
						<span id="te">Add</span>
					</button>
				</div>
			</div>
			{addUserModalOpen && (
				<AddUserModal
					isOpen={addUserModalOpen}
					onOk={async () => {
						await handleSubmit();
					}}
					submitInProgress={isRequesting}
					disableOkButton={isRequesting}
					setUserIds={setUserIds}
					handleClose={() => {
						props.setClickedOnAddUsersEmpty(false);
						setAddUserModalOpen(!addUserModalOpen);
					}}
					allUsersData={props.allUsersData}
				/>
			)}
		</>
	);
}
