import React, {
	useState,
	useRef,
	useEffect,
	useCallback,
	useContext,
} from "react";
import add from "../../assets/add.svg";
import search from "../../assets/search.svg";
import arrowdropdown from "../../assets/arrowdropdown.svg";
import { OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import edit from "../Applications/Overview/edit.svg";
import _ from "underscore";
import { Popover } from "../../UIComponents/Popover/Popover";
import { Loader } from "../../common/Loader/Loader";
import {
	fetchFirstFewRoles,
	updateRole,
	addNewRole,
	searchUserAppRoles,
	unAssignRole,
} from "../../services/api/roleApi";
import { useOutsideClickListener } from "../../utils/clickListenerHook";
import "./RoleAssignment.css";
import cancel from "../../components/Applications/Overview/cancel.svg";
import completeiconimg from "../../components/Applications/Overview/completeicon.svg";
import acceptbutton from "../../components/Applications/Overview/acceptbutton.svg";
import { Fragment } from "react";
import ErrorScreen from "../LicenceAssignment/ErrorScreen";
import { checkSpecialCharacters } from "../../services/api/search";
import { debounce } from "../../utils/common";
import { client } from "../../utils/client";
import RoleContext from "../../services/roleContext/roleContext";

function RoleAssignment(props) {
	const [isEditing, setIsEditing] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const showAddButtonRef = useRef();
	const [roles, setRoles] = useState();
	const [loading, setLoading] = useState(true);
	const [searchRoles, setSearchRoles] = useState([]);
	const [initialRoles, setInitialRoles] = useState([]);
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [showAddNewRole, setShowAddNewRole] = useState(false);
	const [errorRemoveRole, setErrorRemoveRole] = useState(false);
	const [newRole, setNewRole] = useState("");
	const [readyToSave, setReadyToSave] = useState(false);
	const editFieldRef = useRef();
	const [errorAddingRole, setErrorAddingRole] = useState();
	const [errorAssigningRole, setErrorAssigningRole] = useState();
	const [selectedRole, setSelectedRole] = useState();
	const [searchQuery, setSearchQuery] = useState("");
	const [loadingRemoveRole, setLoadingRemoveRole] = useState(false);
	const cancelToken = useRef();
	const { isViewer } = useContext(RoleContext);

	useOutsideClickListener(showAddButtonRef, () => {
		setIsEditing(false);
		setShowAddNewRole(false);
	});

	useOutsideClickListener(editFieldRef, () => {
		setShowAddNewRole(false);
	});

	const stopBubblingEvent = (e) => {
		e.stopPropagation();
		e.preventDefault();
	};

	useEffect(() => {
		setRoles(props.currentRoles || [""]);
	}, [props.currentRoles]);

	function handleAddEditRole(e) {
		stopBubblingEvent(e);
		if (!isViewer) {
			setIsEditing(!isEditing);
		}
	}

	function handleFetchFirstFewRoles() {
		try {
			setLoading(true);
			fetchFirstFewRoles(props.appId).then((res) => {
				if (res?.error) {
					setErrorAddingRole(res?.error);
				} else {
					setInitialRoles(res || []);
					setErrorAddingRole();
				}
				setLoading(false);
			});
		} catch (error) {
			setLoading(false);
			setErrorAddingRole(error);
		}
	}

	useEffect(() => {
		if (isEditing) {
			handleFetchFirstFewRoles();
		} else {
			setSearchRoles([]);
			setInitialRoles([]);
			setLoading(true);
		}
	}, [isEditing]);

	useEffect(() => {
		if (selectedRole) {
			handleRoleClick();
		}
	}, [selectedRole]);

	function handleRoleClick() {
		if (props.returnRoleOnClick) {
			setRoles([selectedRole]);
			props.setNewlySelectedRole &&
				props.setNewlySelectedRole(selectedRole);
			setIsEditing(false);
			return;
		}

		if (
			props.isBulkAssign ||
			selectedRole?.toLocaleLowerCase() !=
				(_.isString(_.first(roles))
					? _.first(roles)?.toLocaleLowerCase()
					: "")
		) {
			try {
				setLoading(true);
				updateRole(props.appId, props.userIds, selectedRole).then(
					(res) => {
						if (res?.status === "success") {
							props.refresh && props.refresh();
							setErrorAssigningRole();
							setSelectedRole();
						} else {
							setIsEditing(false);
							setErrorAssigningRole(
								"Error in assigning the role"
							);
						}
						setLoading(false);
					}
				);
			} catch (error) {
				setLoading(false);
				setErrorAssigningRole(error);
			}
		}
	}

	function handleAddingNewRole(value) {
		setNewRole(value);
		if (value.length == 0) {
			setReadyToSave(false);
		} else {
			setReadyToSave(true);
		}
	}

	function handleAddNewRole() {
		if (!!newRole) {
			try {
				setSubmitting(true);
				addNewRole(props.appId, newRole).then((res) => {
					if (res?.status === "success") {
						setSubmitted(true);
						setErrorAddingRole();
						setTimeout(() => {
							setNewRole("");
							setSubmitted(false);
							setSubmitting(false);
							setSearchTerm("");
							setShowAddNewRole(false);
							handleFetchFirstFewRoles();
						}, 100);
					} else {
						setSubmitting(false);
						setIsEditing(false);
						setErrorAddingRole("Error in adding the role");
					}
					setSubmitting(false);
				});
			} catch (error) {
				setSubmitting(false);
				setErrorAddingRole(error);
			}
		}
	}

	const handleSearchRequests = useCallback(
		debounce((searchQuery) => {
			cancelToken.current = client.CancelToken.source();
			setLoading(true);
			try {
				searchUserAppRoles(
					props.appId,
					searchQuery,
					cancelToken.current
				)
					.then((res) => {
						if (Array.isArray(res) && !res.error) {
							setSearchRoles(res);
						}
						setLoading(false);
					})
					.catch((err) => {
						setLoading(false);
						console.error("Error fetching userapp roles ", err);
					});
			} catch (error) {
				setLoading(false);
				console.error("Error fetching userapp roles ", error);
			}
		}, 300),
		[]
	);

	useEffect(() => {
		if (cancelToken.current)
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		if (!checkSpecialCharacters(searchQuery) && searchQuery.length > 1) {
			setLoading(true);
			handleSearchRequests(searchQuery);
		}
	}, [searchQuery]);

	const handleSearchQuery = (event) => {
		setSearchTerm(event.target.value?.trimStart());
		let searchQuery = event.target.value.trim();
		if (searchQuery.length == 1) {
			event.preventDefault();
		} else {
			setSearchQuery(searchQuery);
		}
	};

	const handleRemoveRole = (e) => {
		if (props.returnRoleOnClick) {
			setRoles([null]);
			props.setNewlySelectedRole && props.setNewlySelectedRole("");
			setIsEditing(false);
			return;
		}

		stopBubblingEvent(e);
		try {
			setLoadingRemoveRole(true);
			unAssignRole(props.appId, props.userIds).then((resp) => {
				if (resp.status === "success") {
					setErrorRemoveRole(false);
					props.refresh && props.refresh();
				} else {
					setErrorRemoveRole(true);
				}
			});
			setLoadingRemoveRole(false);
		} catch (error) {
			setLoadingRemoveRole(false);
			setErrorRemoveRole(true);
		}
	};

	const handleAddNewRoleClick = () => {
		setShowAddNewRole(true);
		setNewRole(searchTerm);
		if (searchTerm.length > 0) {
			setReadyToSave(true);
		} else {
			setReadyToSave(false);
		}
	};

	return (
		<div
			onClick={(e) => stopBubblingEvent(e)}
			ref={showAddButtonRef}
			className="position-relative"
		>
			{props.isBulkAssign ? (
				<div onClick={(e) => handleAddEditRole(e)}>
					Assign Role
					<img src={arrowdropdown} className="ml-2" />
				</div>
			) : _.first(roles) || props.newlySelectedRole ? (
				<OverlayTrigger
					placement="top"
					overlay={
						<Tooltip>
							<div className="text-capitalize">
								{props.newlySelectedRole
									? props.newlySelectedRole
									: _.first(roles) || "-"}
								{_.first(roles) && roles.length >= 2
									? ` + ${roles.length - 1}`
									: ""}
							</div>
						</Tooltip>
					}
				>
					<div className="d-flex showChildButtonOnHover">
						<div
							className={`flex flex-row justify-content-right align-items-center text-capitalize text-truncate w-auto ${
								props.isNotActive ? "o-6" : ""
							}`}
						>
							{props.newlySelectedRole
								? props.newlySelectedRole
								: _.first(roles)}
							{_.first(roles) && roles.length >= 2
								? ` + ${roles.length - 1}`
								: ""}
						</div>
						{!isViewer && (
							<button
								onClick={() => {
									setIsEditing(true);
								}}
							>
								<img src={edit} alt=""></img>
							</button>
						)}
					</div>
				</OverlayTrigger>
			) : (
				<div
					onClick={(e) => handleAddEditRole(e)}
					className={`d-flex flex-row cursor-pointer ${
						props.isNotActive ? "o-6" : ""
					}`}
				>
					{!isViewer && (
						<div
							className="rounded-circle d-flex mr-1 p-1"
							style={{
								border: "0.7px dashed #717171",
								height: "21px",
								width: "21px",
							}}
						>
							<img src={add} width={11} className="m-auto" />
						</div>
					)}
					<div
						className={`m-auto ${
							isViewer
								? "text-capitalize font-10 grey-1"
								: "font-13 text-nowrap"
						}`}
					>
						{isViewer ? "No data available" : "Add Role"}
					</div>
				</div>
			)}
			<Popover
				align="center"
				show={isEditing}
				refs={[showAddButtonRef]}
				style={{
					width: "250px",
					left: "124px",
					top: "25px",
					padding: "8px",
					maxHeight: "315px",
				}}
			>
				<div className="d-flex flex-column">
					<div className="border rounded d-flex">
						<img src={search} aria-hidden="true" className="m-2" />
						<input
							type="text"
							value={searchTerm}
							className="w-100 border-0"
							placeholder="Search Roles"
							onChange={handleSearchQuery}
						/>
					</div>
				</div>
				{!loading ? (
					<div
						className="d-flex flex-column mt-2"
						style={{ maxHeight: "250px", overflowY: "scroll" }}
						key={searchTerm}
					>
						{Array.isArray(
							searchTerm.length > 1 ? searchRoles : initialRoles
						) &&
						(searchTerm.length > 1 ? searchRoles : initialRoles)
							.length > 0 ? (
							(searchTerm.length > 1
								? searchRoles
								: initialRoles
							)?.map(
								(role, index) =>
									role.role_value && (
										<div
											onClick={(e) => {
												stopBubblingEvent(e);
												setSelectedRole(
													role.role_value
												);
											}}
											key={index}
											className="roleItem p-2 text-capitalize font-14 bold-normal rounded mb-1 cursor-pointer text-capitalize"
										>
											{role.role_value}
										</div>
									)
							)
						) : (
							<div className="p-2 mr-auto grey-1 o-6 mt-2 text-left">
								0 Roles available
							</div>
						)}
						{_.first(roles) ? (
							<div
								className="mt-1 mb-auto d-flex p-2 align-items-center licenceCard licenceCardDropdownItem w-100 font-14 rounded cursor-pointer bold-normal"
								onClick={(e) => handleRemoveRole(e)}
								style={{ height: "40px" }}
							>
								Remove Role
								{loadingRemoveRole && (
									<div className="d-flex align-items-center ml-2">
										<Spinner
											animation="border"
											variant="primary"
											bsPrefix="my-custom-spinner"
											className="my-custom-spinner"
										/>
									</div>
								)}
							</div>
						) : (
							<Fragment>
								<div className="border-top"></div>
								{showAddNewRole ? (
									<div
										className="overview__middle__topconttext2__EditCategory"
										ref={editFieldRef}
									>
										<input
											type="text"
											className="overview__middle__topconttext2__EditCategory__input"
											style={{ flexGrow: 1 }}
											placeholder="Enter Role"
											value={newRole}
											onChange={(e) =>
												handleAddingNewRole(
													e.target.value
												)
											}
										/>
										{submitting && (
											<div className="d-flex align-items-center mr-2">
												<Spinner
													animation="border"
													variant="light"
													bsPrefix="my-custom-spinner"
													className="my-custom-spinner"
												/>
											</div>
										)}
										{submitted && (
											<div className="d-flex align-items-center mr-2">
												<img src={completeiconimg} />
											</div>
										)}
										{!submitting && !submitted && (
											<>
												<button
													onClick={(e) => {
														stopBubblingEvent(e);
														setShowAddNewRole(
															false
														);
														setNewRole("");
													}}
													className="overview__middle__topconttext2__EditCategory__button1 mr-1"
												>
													<img src={cancel} />
												</button>
												{readyToSave && (
													<button
														className="overview__middle__topconttext2__EditCategory__button2 mr-1"
														onClick={(e) => {
															stopBubblingEvent(
																e
															);
															handleAddNewRole();
														}}
													>
														<img
															src={acceptbutton}
														></img>
													</button>
												)}
											</>
										)}
									</div>
								) : (
									<div
										className="mt-1 mb-auto d-flex p-2 align-items-center licenceCard licenceCardDropdownItem w-100 font-14 rounded cursor-pointer bold-normal"
										onClick={() => handleAddNewRoleClick()}
										style={{ height: "40px" }}
									>
										{searchTerm.length > 1 &&
										searchRoles.length === 0 ? (
											<div className="text-truncate">
												Add {searchTerm} role
											</div>
										) : (
											<Fragment>Add new role</Fragment>
										)}
									</div>
								)}
							</Fragment>
						)}
					</div>
				) : (
					<Loader height={50} width={50} />
				)}
			</Popover>
			{errorAddingRole && (
				<ErrorScreen
					isOpen={!!errorAddingRole}
					closeModal={() => {
						setErrorAddingRole();
						props.refresh && props.refresh();
					}}
					isSuccess={!errorAddingRole}
					loading={submitting}
					successMsgHeading={"Successfuly added role"}
					warningMsgHeading={"The license could not be added"}
					warningMsgDescription={
						"An error occured during license creation. Would you like to retry?"
					}
					retryFunction={(e) => {
						stopBubblingEvent(e);
						handleAddNewRole();
					}}
				/>
			)}
			{errorAssigningRole && (
				<ErrorScreen
					isOpen={!!errorAssigningRole}
					closeModal={() => {
						setErrorAssigningRole();
					}}
					isSuccess={!errorAssigningRole}
					loading={loading}
					successMsgHeading={"Successfuly assigned role"}
					warningMsgHeading={"The license could not be assigned"}
					warningMsgDescription={
						"An error occured during license assignment. Would you like to retry?"
					}
					retryFunction={(e) => {
						stopBubblingEvent(e);
						handleRoleClick(e);
					}}
				/>
			)}
			{errorRemoveRole && (
				<ErrorScreen
					isOpen={!!errorRemoveRole}
					closeModal={() => {
						setErrorRemoveRole();
					}}
					isSuccess={!errorRemoveRole}
					loading={loadingRemoveRole}
					successMsgHeading={"Successfuly unassigned role"}
					warningMsgHeading={"The role could not be unassigned"}
					warningMsgDescription={
						"An error occured during role unassignment. Would you like to retry?"
					}
					retryFunction={(e) => {
						stopBubblingEvent(e);
						handleRemoveRole(e);
					}}
				/>
			)}
		</div>
	);
}

export default RoleAssignment;
