import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, getUsersBySearch } from "../../redux/workflow";
import { Button, BUTTON_TYPE } from "../../../../UIComponents/Button/Button";
import { Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { client } from "../../../../../src/utils/client";
import { Select } from "UIComponents/Select/Select";
import ViewPlaybookRunUIOnboarding from "./ViewPlaybookRunUIOnboarding";
import { getOnboardingOffboardingUsersV2 } from "services/api/users";
import { defaultReqBody } from "common/infiniteTableUtil";
import emptyusers from "../../../../assets/workflow/emptyusers.svg";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import deleteIcon from "../../../../assets/icons/delete.svg";

const ViewPlaybookRunUIContainer = ({
	loading,
	playbookData,
	selectedUsers,
	setSelectedUsers,
	deleteSelectedUser,
	entity,
}) => {
	const [searchQuery, setSearchQuery] = useState();
	const dispatch = useDispatch();
	const users = useSelector((state) => state.workflows.users);
	const [usersLoader, setUsersLoader] = useState(false);
	const cancelToken = useRef();
	const [reqBody] = useState({ ...defaultReqBody });
	const [onboardingUsers, setOnboardingUsers] = useState(null);
	const [onboardingUsersLoading, setOnboardingUsersLoading] = useState(true);
	const [selectedUserId, setSelectedUserId] = useState([]);

	useEffect(() => {
		const userIDs = selectedUsers?.map((user) => user?.user_id);
		setSelectedUserId(userIDs);
	}, [selectedUsers]);

	useEffect(() => {
		getOnboardingOffboardingUsersV2(
			{ ...reqBody, type: playbookData?.type || "onboarding" },
			0,
			30
		)
			.then((res) => {
				setOnboardingUsers(res?.data);
				setOnboardingUsersLoading(false);
			})
			.catch((err) => {
				console.log("err", err);
			});
	}, []);

	const handleOptionClick = (option) => {
		// setCompiling(true);
		if (selectedUserId?.includes(option?.user_id)) {
			removeFromSelectedUserArray(option);
		} else {
			addToSelectedUserArray(option);
		}
	};

	//API call to get all users
	const getUsersForWorkflow = (
		page = 0,
		row = 10,
		reqBody = { filter_by: [], sort_by: [], columns: [], screen_tag: 2 }
	) => {
		dispatch(getAllUsers(page, row, reqBody));
	};

	const removeFromSelectedUserArray = (data) => {
		data.org_user_id = data.user_id;
		deleteSelectedUser(data);
	};

	const addToSelectedUserArray = (data) => {
		data.org_user_id = data.user_id;
		data.name = data.user_name;
		setSelectedUsers(data);
	};

	const onPressUser = (isChecked, userId, data) => {
		if (isChecked) {
			addToSelectedUserArray(data);
		}
		if (!isChecked) {
			removeFromSelectedUserArray(data);
		}
	};

	useEffect(() => {
		setUsersLoader(false);
	}, [users]);

	useEffect(() => {
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		if (searchQuery || searchQuery === "") {
			setUsersLoader(true);
			cancelToken.current = client.CancelToken.source();
			dispatch(
				getUsersBySearch(searchQuery || " ", cancelToken.current, true)
			);
		} else {
			setUsersLoader(true);
			getUsersForWorkflow();
		}
	}, [searchQuery]);

	const searchUserUI = (
		<>
			<div className="d-flex flex-column justify-content-start">
				<div className="d-flex mr-0 mt-auto mb-auto border-light">
					<Select
						optionsContainerClassName="approver-action"
						className="flex-fill"
						isOptionsLoading={usersLoader}
						value={searchQuery}
						clearInput={true}
						options={users?.data || []}
						fieldNames={{
							label: "user_name" || "name",
							description: "user_email",
							logo: "profile_img" || "user_profile",
						}}
						optionRender={(option, props) => {
							return (
								<div className="text-capitalize">
									<div
										className="d-flex object-contain img-circle"
										key={option.user_id}
										onClick={() =>
											handleOptionClick(option)
										}
									>
										<Form.Check
											key={Math.random()}
											className="checkbox-container margin-right-15"
											type="checkbox"
											value={option?.user_id}
											checked={selectedUserId?.includes(
												option?.user_id
											)}
											onClick={(e) => {
												e.stopPropagation();
												handleOptionClick(option);
											}}
											onChange={() => {}}
										/>
										<div>
											<p className="font-14 grey mb-1">
												{option[props.fieldNames.label]}
											</p>
											{option[
												props.fieldNames.description
											] && (
												<p className="font-9 grey-1 mb-0">
													{
														option[
															props.fieldNames
																.description
														]
													}
												</p>
											)}
										</div>
									</div>
								</div>
							);
						}}
						// filter
						search
						placeholder={`Search Users`}
						onSearch={(query) => {
							setSearchQuery(query);
						}}
						onChange={(obj) => {}}
					/>
				</div>
			</div>
		</>
	);

	const markedForOnboardingUserUI = (
		<>
			<ViewPlaybookRunUIOnboarding
				onboardingUsers={onboardingUsers}
				onboardingUsersLoading={onboardingUsersLoading}
				loading={loading}
				playbookData={playbookData}
				selectedUsers={selectedUsers}
				setSelectedUsers={setSelectedUsers}
			/>
		</>
	);

	const selectedUsersUI = (
		<>
			<div
				style={{
					border: "1px dashed #D4DBEC",
					background: "#FFFFFF",
					flexDirection: "column",
					borderRadius: "8px",
				}}
				className="d-flex flex-1 mt-3"
			>
				{selectedUsers && selectedUsers?.length === 0 && (
					<div
						style={{
							flexDirection: "column",
						}}
						className="d-flex justify-content-center flex-1 align-items-center"
					>
						<img alt="" src={emptyusers} />
						<span
							className="grey-1"
							style={{
								display: "block",
								fontSize: "12px",
								fontWeight: "400",
							}}
						>
							Add users to run this playbook
						</span>
					</div>
				)}
				{selectedUsers && selectedUsers?.length > 0 && (
					<div style={{ margin: "10px 10px 0px 10px" }}>
						<small
							style={{
								fontSize: "10px",
								fontWeight: "500",
								color: "#717171",
							}}
						>
							{selectedUsers.length} users added{" "}
						</small>
						<div className="d-flex justify-content-center">
							<hr
								style={{
									color: "#EBEBEB",
									width: "100%",
									marginBottom: "0px",
								}}
							/>
						</div>
					</div>
				)}
				{selectedUsers && selectedUsers?.length > 0 && (
					<div style={{ height: "35vh", overflowY: "auto" }}>
						{selectedUsers?.map((user, index) => (
							<div
								className={`d-flex p-2`}
								key={index + user?.org_user_id}
							>
								<div className="d-flex flex-row align-items-center flex-1">
									<GetImageOrNameBadge
										key={index}
										name={user.name}
										url={
											user.profile_img ||
											user?.user_profile
										}
										width={25}
										height={25}
										imageClassName={
											index === 0
												? " mr-1 z-index-1  img-circle white-bg"
												: null +
												  "img-circle avatar  mr-1 z-index-1"
										}
										nameClassName={
											index === 0
												? " mr-1 z-index-1  img-circle white-bg"
												: null +
												  "img-circle avatar  mr-1 z-index-1"
										}
									/>
									<div className="mr-2">
										<OverlayTrigger
											placement="top"
											overlay={
												<Tooltip>{user?.name}</Tooltip>
											}
										>
											<span
												style={{
													display: "block",
													fontSize: "13px",
													fontWeight: "400",
												}}
												className="text-truncate-10vw"
											>
												{user?.name}
											</span>
										</OverlayTrigger>
										<OverlayTrigger
											placement="top"
											overlay={
												<Tooltip>
													{user?.email ||
														user?.user_email}
												</Tooltip>
											}
										>
											<span
												style={{
													display: "block",
													fontSize: "11px",
													fontWeight: "400",
												}}
												className="grey-1 text-truncate-10vw"
											>
												{user?.email ||
													user?.user_email}
											</span>
										</OverlayTrigger>
									</div>
								</div>

								<Button
									style={{
										fontSize: "10px",
										fontWeight: "400",
										alignItems: "center",
									}}
									className="p-0 d-flex title-text justify-content-end ml-2"
									type={BUTTON_TYPE.LINK}
									onClick={() => {
										deleteSelectedUser(user);
									}}
								>
									<img
										alt=""
										src={deleteIcon}
										height={15}
										width={15}
									/>
								</Button>
							</div>
						))}
					</div>
				)}
			</div>
		</>
	);

	return (
		<>
			<div
				className="action-list d-flex flex-column justify-content-start flex-1"
				style={{ height: "100%" }}
			>
				{searchUserUI}
				{entity !== "appPlaybooks" && markedForOnboardingUserUI}
				{selectedUsersUI}
			</div>
		</>
	);
};

export default ViewPlaybookRunUIContainer;

const checkIfSelected = (key, value, sourceList) => {
	const result = sourceList.find((obj) => obj[key] === value);
	return result ? true : false;
};
