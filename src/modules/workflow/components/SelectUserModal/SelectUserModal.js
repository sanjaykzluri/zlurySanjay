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
import { checkSpecialCharacters } from "../../../../services/api/search";
import { WORFKFLOW_TYPE } from "../../constants/constant";

export default function SelectUserModal(props) {
	const [searchQuery, setSearchQuery] = useState();
	const dispatch = useDispatch();
	const users = useSelector((state) => state.workflows.users);
	const [selectedUser, setSelectedUser] = useState(
		props.selectedUsers.map((user) =>
			Object.assign(user, { _id: user.user_id })
		)
	);
	const [usersLoader, setUsersLoader] = useState(false);
	const cancelToken = useRef();
	const NUM_OF_LOADERS_2_DISPLAY = 10;
	const {
		openModal,
		title,
		subTitle,
		data,
		onCloseModal,
		onContinue,
		buttonTitle,
		modalClass,
		onSelectBulkUser,
		showBulkUser,
	} = props;
	const [emptyScreen, setEmptyScreen] = useState(false);

	useEffect(() => {
		setSelectedUser(
			props.selectedUsers.map((user) =>
				Object.assign(user, { _id: user.user_id })
			)
		);

		return () => {
			setEmptyScreen(false);
			getUsersForWorkflow();
		};
	}, [openModal]);

	const UsersLoader = () => {
		return (
			<div
				className={`search-iteam d-flex pl-3 pr-3 `}
				style={{
					height: "52px",
					justifyContent: "space-between",
					width: "100%",
				}}
			>
				<div
					style={{ marginLeft: "25px" }}
					className="user-info d-flex justify-content-start align-items-center"
				>
					<ContentLoader
						style={{ marginRight: 8 }}
						width={36}
						height={36}
					>
						<circle cx="18" cy="18" r="18" fill="#EBEBEB" />
					</ContentLoader>
					<div className="user-name-and-designation d-flex flex-column justify-content-start">
						<ContentLoader width={91} height={10}>
							<rect
								width="91"
								height="10"
								rx="2"
								fill="#EBEBEB"
							/>
						</ContentLoader>
						<div className="user-designation">
							<ContentLoader width={50} height={5}>
								<rect
									width="91"
									height="10"
									rx="2"
									fill="#EBEBEB"
								/>
							</ContentLoader>
						</div>
					</div>
				</div>
				<div className="user-email d-flex mr-3">
					<ContentLoader width={91} height={10}>
						<rect width="91" height="10" rx="2" fill="#EBEBEB" />
					</ContentLoader>
				</div>
			</div>
		);
	};

	//API call to get all users
	const getUsersForWorkflow = (
		page = 0,
		row = 10,
		reqBody = { filter_by: [], sort_by: [], columns: [], screen_tag: 2 }
	) => {
		dispatch(getAllUsers(page, row, reqBody));
	};
	const removeFromSelectedUserArray = (id) => {
		let filteredList = selectedUser.filter((user) => user._id != id);
		setSelectedUser(filteredList);
	};
	const addToSelectedUserArray = (data) => {
		selectedUser.push(data);
		setSelectedUser([...selectedUser]);
	};
	const onPressUser = (isChecked, userId, data) => {
		if (isChecked) {
			addToSelectedUserArray(data);
		}
		if (!isChecked) {
			removeFromSelectedUserArray(userId);
		}
	};

	useEffect(() => {
		setSearchQuery();
		getUsersForWorkflow();
	}, []);

	useEffect(() => {
		setUsersLoader(false);
		setEmptyScreen(false);
	}, [users]);

	useEffect(() => {
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		if (searchQuery) {
			setUsersLoader(true);
			cancelToken.current = client.CancelToken.source();
			if (checkSpecialCharacters(searchQuery)) {
				setUsersLoader(false);
				setEmptyScreen(true);
			} else {
				setEmptyScreen(false);
				dispatch(
					getUsersBySearch(searchQuery, cancelToken.current, true)
				);
			}
		} else {
			setEmptyScreen(false);
			setUsersLoader(true);
			getUsersForWorkflow();
		}
	}, [searchQuery]);

	return (
		<Modal
			contentClassName={modalClass}
			dialogClassName="z_i_connect_modal_dialog"
			show={openModal}
			title={
				<div className="title-container">
					<span className="title-text">{title}</span>
					<span className="sub-title">{subTitle}</span>
				</div>
			}
			onClose={() => onCloseModal()}
		>
			<React.Fragment>
				<div className="container mt-2  d-flex flex-column w-100">
					{Array.isArray(selectedUser) && selectedUser.length ? (
						<div className="chips-container m-auto d-flex justify-content-start  p-2">
							{selectedUser.map((user, index) => {
								return (
									<Chip
										key={index}
										data={user}
										title={user.user_name}
										id={user._id}
										profile_pic={
											unescape(user.user_profile) ||
											unescape(user.profile_img)
										}
										onClick={removeFromSelectedUserArray}
									/>
								);
							})}
						</div>
					) : null}

					<div className="search-container m-auto d-flex flex-column justify-content-start">
						<div className="d-flex inputWithIconApps mr-0 mt-auto mb-auto border-light">
							<SearchInputArea
								placeholder={`Search for users`}
								setSearchQuery={debounce(setSearchQuery, 300)}
							/>
							<img src={search} aria-hidden="true" />
						</div>
						{/* {showBulkUser &&
							props.workflowType ===
								WORFKFLOW_TYPE.ONBOARDING && (
								<span className="d-flex flex-1 justify-content-center font-11 grey-1 mt-2 mb-2">
									Users not on Zluri?
									<span
										onClick={() => {
											onSelectBulkUser();
										}}
										style={{
											color: "#2266e2",
											cursor: "pointer",
										}}
										className="ml-1"
									>
										Add users via CSV
									</span>
								</span>
							)} */}
					</div>
				</div>
				<div
					className="container p-0 mt-4 mb-2 d-flex flex-column justify-content-between w-100"
					style={{ height: "300px" }}
				>
					{/* this could be better, but dont know how to make it better */}
					<div className="search-results d-flex flex-column ">
						{/* if "users" state is empty display loaders until the state is filled with user */}
						{emptyScreen ? (
							<div
								className="no-user-found-div"
								style={{
									height: "400px",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
								}}
							>
								<img
									src={noUserFound}
									className="no-user-found-image"
								/>
							</div>
						) : usersLoader ? (
							Array.from(
								{ length: NUM_OF_LOADERS_2_DISPLAY },
								(item, index) => {
									return <UsersLoader key={index} />;
								}
							)
						) : (
							<div>
								{users && users.data && users.data.length ? (
									users.data.map((el, index) => {
										const ifSelected = checkIfSelected(
											"_id",
											el.user_id,
											selectedUser
										);
										return (
											<div
												key={index}
												className={`search-iteam d-flex pl-3 pr-3 ${
													ifSelected ? "selected" : ""
												}`}
												style={{
													height: "52px",
													justifyContent:
														"space-between",
													width: "100%",
													paddingRight: "20px",
												}}
											>
												<div className="user-pic-checkbox-and-name d-flex">
													<Form.Check
														className="checkbox-container margin-right-15"
														type="checkbox"
														value={el.user_id}
														checked={ifSelected}
														onChange={(e) => {}}
														onClick={(e) => {
															onPressUser(
																e.target
																	.checked,
																e.target.value,
																el
															);
														}}
													/>

													<div className="user-info d-flex justify-content-start align-items-center">
														{userProfile(
															el.user_name,
															el.user_profile ||
																el.profile_img
														)}

														<div className="user-name-and-designation d-flex flex-column justify-content-start">
															<div className="user-name">
																<OverlayTrigger
																	placement="top"
																	overlay={
																		<Tooltip>
																			{
																				el.user_name
																			}
																		</Tooltip>
																	}
																>
																	<span
																		className="title-text"
																		style={{
																			display:
																				"block",
																			width: "175px",
																			whiteSpace:
																				"nowrap",
																			overflow:
																				"hidden",
																			textOverflow:
																				"ellipsis",
																			textAlign:
																				"left",
																		}}
																	>
																		{
																			el.user_name
																		}
																	</span>
																</OverlayTrigger>
															</div>
															{el.user_designation && (
																<div className="user-designation">
																	<span>
																		{el.user_designation
																			? el.user_designation
																					.charAt(
																						0
																					)
																					.toUpperCase() +
																			  el.user_designation?.slice(
																					1
																			  )
																			: null}
																	</span>
																</div>
															)}
														</div>
													</div>
												</div>
												<div className="user-email d-flex mr-3">
													<span>{el.user_email}</span>
												</div>
											</div>
										);
									})
								) : (
									<div
										className="no-user-found-div"
										style={{
											height: "300px",
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
										}}
									>
										<img
											src={noUserFound}
											className="no-user-found-image"
										/>
									</div>
								)}
							</div>
						)}
					</div>
					<div className="mt-4 mb-3 text-center">
						<Button
							style={{ width: "227px", height: "48px" }}
							onClick={() => {
								onContinue(selectedUser);
							}}
							disabled={!selectedUser.length || props.onLoading}
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

function userProfile(username, profileUrl) {
	if (profileUrl && profileUrl !== "") {
		return (
			<img
				src={profileUrl}
				alt="user-icon"
				style={{
					borderRadius: "50%",
				}}
			/>
		);
	} else {
		return (
			<NameBadge
				width={32}
				borderRadius={"50%"}
				className="user-name-badge-onboarding"
				name={username}
			/>
		);
	}
}

function Chip(props) {
	const { title, onClick, id, profile_pic, data } = props;
	return (
		<div
			className="md-chip mr-2"
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			{profile_pic && !profile_pic === "" ? (
				<img
					style={{
						cursor: "pointer",
						height: "17px",
						width: "17px",
						borderRadius: "8px",
					}}
					src={profile_pic}
				/>
			) : (
				<NameBadge
					width={"17px"}
					height={"17px"}
					borderRadius={"50%"}
					className="font-9"
					name={title}
				/>
			)}
			<span
				style={{
					color: "#222222",
					fontSize: "14px",
				}}
				className="p-2"
			>
				{title}
			</span>
			<img
				style={{
					cursor: "pointer",
					paddingRight: "5px",
					height: "17px",
					width: "14px",
				}}
				src={closeIcon}
				onClick={() => {
					onClick(data._id);
				}}
			/>
		</div>
	);
}

function checkIfSelected(key, value, sourceList) {
	const result = sourceList.find((obj) => obj[key] === value);
	return result || false;
}
