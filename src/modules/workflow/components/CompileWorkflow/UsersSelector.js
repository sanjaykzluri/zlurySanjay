import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	compileWorkflow,
	editWorkFlowDetails,
	editWorkflowUsers,
	getAllUsers,
	searchUsersForDraft,
} from "../../redux/workflow";
import { client } from "utils/client";
import deleteIcon from "assets/icons/delete.svg";
import { Select } from "UIComponents/Select/Select";
import { defaultReqBody } from "common/infiniteTableUtil";
import { Button, BUTTON_TYPE } from "../../../../UIComponents/Button/Button";
import ViewPlaybookRunUIOnboarding from "../ViewPlaybook/ViewPlaybookRunUIOnboarding";
import { Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import error_nocircle from "assets/error_nocircle.svg";
import emptyusers from "assets/workflow/emptyusers.svg";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import "./compileworkflow.css";
import { Loader } from "common/Loader/Loader";
import { MONTH } from "utils/DateUtility";
import { getOnboardingOffboardingUsersV2 } from "services/api/users";
const UsersSelector = ({ setCurrentUser, currentUser, setCompiling }) => {
	const [user, setUser] = useState("");
	const [usersLoader, setUsersLoader] = useState(false);
	const [userSelectionLoader, setUserSelectionLoader] = useState(false);
	const users = useSelector((state) => state.workflows.workflow.users || []);
	const workflow_id = useSelector((state) => state.workflows.workflow.id);
	const [reqBody] = useState({ ...defaultReqBody });
	const workflow = useSelector((state) => state.workflows.workflow);
	const [onboardingUsers, setOnboardingUsers] = useState(null);
	const [onboardingUsersLoading, setOnboardingUsersLoading] = useState(true);
	const [selectedItems, setSelectedItems] = useState([]);

	const compiledExecDocs = useSelector(
		(state) => state.workflows.compiledExecDocs
	);
	const searchedUsers = useSelector(
		(state) => state.workflows.usersForDraft || []
	);
	const dispatch = useDispatch();
	const cancelToken = useRef();
	const getUsersForWorkflow = (
		page = 0,
		row = 10,
		reqBody = { filter_by: [], sort_by: [], columns: [], screen_tag: 2 }
	) => {
		dispatch(getAllUsers(page, row, reqBody));
	};

	const handleOptionClick = (option) => {
		setCompiling(true);
		if (selectedItems?.includes(option?.user_id)) {
			removeFromSelectedUserArray(option);
		} else {
			addToSelectedUserArray(option);
		}
	};

	const hasError = (compiled_doc) => {
		for (let node of compiled_doc.nodes) {
			if (!node.isSchemaValid) {
				return true;
			}
		}
		return false;
	};
	const errorsCount = () => {
		let count = 0;
		for (let compiled_doc of compiledExecDocs) {
			if (compiled_doc.has_action_error) {
				count++;
			}
		}
		return count;
	};
	useEffect(() => {
		setCurrentUser(users[0]);
	}, [users]);

	useEffect(() => {
		const userIDs = users?.map((user) => user?.user_id);
		setSelectedItems(userIDs);
	}, []);

	useEffect(() => {
		getOnboardingOffboardingUsersV2(
			{ ...reqBody, type: workflow?.type || "onboarding" },
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
	}, [selectedItems]);

	const getName = (workflow, users) => {
		const workflow_type = workflow?.type || "";
		const userCount = users.length - 1;
		const date = new Date();
		const formattedDate = `${date.getDate()} ${MONTH[date.getMonth()]}`;
		const selectedUserName =
			users[0].user_name?.trim() || users[0].name?.trim();
		return `${workflow_type} ${selectedUserName}${
			userCount > 0 ? ` and ${userCount} others` : ""
		} on ${formattedDate}`;
	};

	const addToSelectedUserArray = (data) => {
		setCompiling(true);
		const updatedUsers = [...users, data];
		const updated_user_ids = updatedUsers.map(
			(user) => user.org_user_id || user._id
		);
		const name = getName(workflow, updatedUsers);
		dispatch(
			editWorkflowUsers(
				workflow_id,
				{ users_ids: updated_user_ids, name: name },
				false,
				workflow.source
			)
		);
	};

	const removeFromSelectedUserArray = (data) => {
		deleteSelectedUser(data);
	};

	const deleteSelectedUser = (user) => {
		setCompiling(true);
		const updatedUsers = users.filter(
			(current_user) =>
				current_user._id.toString() !== user.user_id.toString()
		);

		const updated_user_ids = updatedUsers.map((user) => user._id);
		const name = getName(workflow, updatedUsers);
		dispatch(
			editWorkflowUsers(
				workflow_id,
				{ users_ids: updated_user_ids, name: name },
				false,
				workflow.source
			)
		);
	};

	const markedForOnboardingUserUI = (
		<>
			<ViewPlaybookRunUIOnboarding
				onboardingUsers={onboardingUsers}
				onboardingUsersLoading={onboardingUsersLoading}
				playbookData={workflow}
				selectedUsers={users}
				setSelectedUsers={addToSelectedUserArray}
			/>
		</>
	);

	useEffect(() => {
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		if (user || user === "") {
			setUsersLoader(true);
			cancelToken.current = client.CancelToken.source();
			dispatch(
				searchUsersForDraft(user || " ", cancelToken.current, true)
			);
		} else {
			setUsersLoader(true);
			getUsersForWorkflow();
		}
	}, [user]);

	useEffect(() => {
		setUsersLoader(false);
	}, [searchedUsers]);

	const checkIfSelected = (key, value) => {
		const result = users?.find((obj) => obj[key] === value);
		return result ? true : false;
	};
	const changeUser = (data) => {
		setCurrentUser(data);
	};

	const searchUserUI = (
		<>
			<span
				className="grey-1"
				style={{
					display: "block",
					fontSize: "12px",
					fontWeight: "600",
				}}
			>
				Add users
			</span>
			<div
				className="d-flex flex-column justify-content-start mt-2"
				style={{ backgroundColor: "#FFFFFF" }}
			>
				<div className="d-flex mr-0 mt-auto mb-auto border-light">
					<Select
						optionsContainerClassName="approver-action"
						className="flex-fill"
						isOptionsLoading={usersLoader}
						value={user}
						clearInput={true}
						options={searchedUsers?.data || []}
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
										onClick={() => {
											if (
												selectedItems?.includes(
													option?.user_id
												) &&
												users.length === 1
											) {
												return null;
											} else {
												handleOptionClick(option);
											}
										}}
									>
										<Form.Check
											key={Math.random()}
											className="checkbox-container margin-right-15"
											type="checkbox"
											value={option?.user_id}
											checked={selectedItems?.includes(
												option?.user_id
											)}
											onClick={() =>
												handleOptionClick(option)
											}
											onChange={() => {}}
											disabled={
												selectedItems?.includes(
													option?.user_id
												) && users.length === 1
											}
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
							setUser(query);
						}}
						onChange={(obj) => {}}
					/>
				</div>
			</div>
		</>
	);
	const usersCount = (
		<>
			{compiledExecDocs?.length && (
				<div
					className="d-flex flex-column"
					style={{ margin: "10px 0px 0px 10px" }}
				>
					<span style={{ fontSize: "10px", fontWeight: "700" }}>
						{compiledExecDocs?.length} USERS{" "}
					</span>
					{errorsCount() > 0 && (
						<small
							style={{ color: " #FE6955", fontSize: "8px" }}
						>{`${errorsCount()} of ${
							compiledExecDocs?.length
						} have setup errors`}</small>
					)}
				</div>
			)}
		</>
	);
	const selectedUsersUI = (
		<>
			<div
				style={{
					borderRadius: "8px",
					flexDirection: "column",
					backgroundColor: "#FFFFFF",
					minHeight: "20px",
				}}
				className="d-flex flex-1 mt-3"
			>
				{usersCount}
				<div className="d-flex justify-content-center">
					<hr
						style={{
							color: "#EBEBEB",
							width: "100%",
							margin: "10px",
						}}
					/>
				</div>
				{compiledExecDocs && compiledExecDocs?.length === 0 && (
					<div
						style={{ flexDirection: "column" }}
						className="d-flex justify-content-center flex-1 align-items-center"
					>
						<img alt="" src={emptyusers} />
					</div>
				)}
				<div style={{ height: "35vh", overflowY: "auto" }}>
					{compiledExecDocs &&
						compiledExecDocs?.length > 0 &&
						compiledExecDocs?.map((user, index) => (
							<div
								className={`d-flex p-2 ${
									currentUser.user_id === user.user_id
										? "selected_user_wrapper"
										: ""
								}`}
								style={{ margin: " 0px 10px 0px 10px" }}
								key={index + user?._id}
								onClick={() => changeUser(user)}
							>
								<div className="d-flex flex-row align-items-center flex-1">
									<GetImageOrNameBadge
										key={index}
										name={user.user_name}
										url={
											user.user_logo || user?.user_profile
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
										<span
											style={{
												display: "block",
												fontSize: "13px",
												fontWeight: "400",
											}}
											className="text-truncate-10vw"
										>
											{user?.user_name}
											{hasError(user) && (
												<img
													src={error_nocircle}
													width="20px"
													height="20px"
												/>
											)}
										</span>
										<span
											style={{
												display: "block",
												fontSize: "11px",
												fontWeight: "400",
											}}
											className="grey-1 text-truncate-10vw"
										>
											{user?.email || user?.user_email}
										</span>
									</div>
								</div>

								<Button
									style={{
										fontSize: "10px",
										fontWeight: "400",
										alignItems: "center",
									}}
									disabled={users.length === 1}
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
			</div>
		</>
	);

	return (
		<>
			{userSelectionLoader && <Loader height={40} width={40} />}
			{!userSelectionLoader && searchUserUI}
			{markedForOnboardingUserUI}
			{!userSelectionLoader && selectedUsersUI}
		</>
	);
};
export default UsersSelector;
