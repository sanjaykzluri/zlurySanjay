import React, {
	useState,
	useEffect,
	useCallback,
	useRef,
	useContext,
} from "react";
import { Spinner } from "react-bootstrap";
import PropTypes from "prop-types";
import edit from "./edit.svg";
import cancel from "./cancel.svg";
import completeiconimg from "./completeicon.svg";
import acceptbutton from "./acceptbutton.svg";
import {
	checkSpecialCharacters,
	searchUsers,
} from "../../../services/api/search";
import { Loader } from "../../../common/Loader/Loader";
import "./Overview.css";
import { NameBadge } from "../../../common/NameBadge";
import { Link, useLocation } from "react-router-dom";
import UserAppMetaInfoCard from "../../../modules/shared/components/UserAppMetaInfo/UserAppMetaInfoCard";
import { debounce, unescape } from "../../../utils/common";
import { client } from "../../../utils/client";
import PlusCircle from "../../../assets/icons/plus-circle.svg";
import { useOutsideClickListener } from "../../../utils/clickListenerHook";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import RoleContext from "../../../services/roleContext/roleContext";
import { useDispatch, useSelector } from "react-redux";
import group from "../../../assets/users/group.svg";
import service from "../../../assets/users/service.svg";
import { userType } from "../../../constants/users";
import { trackActionSegment } from "modules/shared/utils/segment";
function SuggestionBar(props) {
	return (
		<>
			<div className="quick-edit-menu shadow d-block">
				{props.loading ? (
					<>
						<div className="quick-edit-menu-item">
							<Loader height={60} width={60}></Loader>
						</div>
					</>
				) : (
					<>
						{props.options.length > 0 ? (
							props.options.map((option) => (
								<>
									<div
										className="quick-edit-menu-item border-bottom"
										onClick={() => {
											props.handleSelect(option);
											props.onHide();
										}}
									>
										{option.profile_img ? (
											<img
												src={unescape(
													option.profile_img
												)}
												width="24"
												className="mr-2"
											/>
										) : (
											<NameBadge
												name={option.user_name}
												width={24}
												className="mr-2"
											/>
										)}
										<div className="col">
											<div className="row">
												<OverlayTrigger
													placement="top"
													overlay={
														<Tooltip>
															{option.user_name}
														</Tooltip>
													}
												>
													<div
														className={
															"truncate_10vw"
														}
													>
														{option.user_name}
													</div>
												</OverlayTrigger>
											</div>
											<OverlayTrigger
												placement="top"
												overlay={
													<Tooltip>
														{option.user_email}
													</Tooltip>
												}
											>
												<div className="row user_email_suggestion">
													{option.user_email.slice(
														0,
														20
													) + "..."}
												</div>
											</OverlayTrigger>
										</div>
									</div>
								</>
							))
						) : (
							<div
								className="quick-edit-menu-item justify-content-center text-secondary"
								style={{ fontSize: 12 }}
							>
								<i>No results found</i>
							</div>
						)}
					</>
				)}
			</div>
		</>
	);
}

export function ChangeOwner(props) {
	const defaultUserState = {
		id: "",
		name: "",
		profile_img: "",
	};
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [user, setUser] = useState({ ...defaultUserState });
	const [editText, setEditText] = useState("");
	const [editing, setEditing] = useState(false);
	const [showUserSuggestions, setShowUserSuggestions] = useState(false);
	const [userSuggestions, setUserSuggestions] = useState([]);
	const [loading, setloading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [readyToSave, setReadyToSave] = useState(false);
	const [selection, setSelection] = useState();
	const location = useLocation();
	const cancelToken = useRef();
	const editFieldRef = useRef();
	const { isViewer } = useContext(RoleContext);

	useEffect(() => {
		setUser({
			id: props.userId,
			name: props.userName,
			profile_img: props.userImage,
		});
	}, []);

	useOutsideClickListener(editFieldRef, () => {
		setEditing(false);
		onEditClose();
	});

	const onEditClose = () => {
		setEditText("");
		setShowUserSuggestions(false);
		setUserSuggestions([]);
		setReadyToSave(false);
	};

	const handleUserEdit = (value) => {
		setEditText(value);
		if (cancelToken.current) cancelToken.current.cancel();
		if (value.length == 0) {
			setShowUserSuggestions(false);
			setUserSuggestions([]);
			setReadyToSave(true);
		} else {
			setReadyToSave(false);
		}

		if (value.length > 1) {
			if (checkSpecialCharacters(value, true)) {
				setUserSuggestions([]);
				setShowUserSuggestions(true);
				setloading(false);
			} else {
				setShowUserSuggestions(true);
				setloading(true);
				cancelToken.current = client.CancelToken.source();
				generateUserSuggestions(value, cancelToken.current);
			}
		}
	};

	const generateUserSuggestions = useCallback(
		debounce((query, cancelToken) => {
			searchUsers(query, cancelToken, true).then((res) => {
				setUserSuggestions(res.results);
				setloading(false);
			});
		}, 200),
		[]
	);

	const handleUserSelect = (userSelection) => {
		setSelection(userSelection);
		setEditText(userSelection.user_name);
		setReadyToSave(true);
	};

	const handleSave = () => {
		let app_or_dep_Id =
			props.idFromTable || location.pathname.split("/")[2];
		let patchObj = {};

		if (editText.length === 0) {
			setUser({ ...defaultUserState });
			patchObj = {
				patches: [
					{
						op: "delete",
						field: props.fieldName,
						value: "",
					},
				],
			};
		} else {
			setUser({
				id: selection.user_id,
				name: selection.user_name,
				profile_img: selection.profile_img,
			});
			patchObj = {
				patches: [
					{
						op: "replace",
						field: props.fieldName,
						value: selection.user_id,
					},
				],
			};
		}

		setSubmitting(true);

		props
			.updateFunc(app_or_dep_Id, patchObj)
			.then((res) => {
				if (res.error) {
					console.error(
						"Error updating application owner:",
						res.error
					);
				}

				setSubmitting(false);
				setSubmitted(true);

				setTimeout(() => {
					setSubmitted(false);
					setReadyToSave(false);
					setEditing(false);
					props.getSelectionObject && props.getSelectionObject(selection);
					props.refreshReduxState && props.refreshReduxState();
					trackActionSegment("Changed Owner", {
						currentCategory: `${props.screenTagKey || ""} ${
							props.v2TableEntity || ""
						} `,
						currentPage: "Add/Edit Owner Component",
						refData: patchObj,
					});
				}, 300);
			})
			.catch((err) => {
				console.error("Error updating application owner:", err);
				setSubmitting(false);
				setSubmitted(true);

				setTimeout(() => {
					setSubmitted(false);
					setReadyToSave(false);
					setEditing(false);
				}, 300);
				setUser({
					id: props.userId,
					name: props.userName,
					profile_img: props.userImage,
				});
			});
	};
	function clickedOnOwner(id, name) {
		//Segment Implementation
		window.analytics.track("Clicked on Owner name", {
			currentCategory: "Applications",
			currentPageName: "All-Applications",
			clickedOwnerId: id,
			clickedOwnerName: name,
			orgId: orgId || "",
			orgName: orgName || "",
		});
	}
	return (
		<>
			<div
				className="overview__middle__topconttext2"
				style={{ minWidth: "200px" }}
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
				}}
			>
				<span>
					{!editing ? (
						<div
							className={`overview__middle__topconttext2__hover`}
						>
							<div
								className={`d-flex align-items-center ${
									props.isNotActive ? "o-6" : ""
								}`}
							>
								{user.profile_img ? (
									<img
										src={unescape(user.profile_img)}
										width="24"
										className={`mr-2 ${props.ownerImageClass}`}
									/>
								) : (
									<NameBadge
										name={user.name}
										width={24}
										className={`mr-2 ${props.ownerImageClass}`}
									/>
								)}
								{user.name && user.name.length > 0 ? (
									<>
										<Link
											to={`/users/${user.id}#overview`}
											className={`table-link ${props.ownerNameStyle}`}
											onClick={() =>
												clickedOnOwner(
													user.id,
													user.name
												)
											}
										>
											{props.isAppTable ? (
												<OverlayTrigger
													placement="top"
													overlay={
														<Tooltip>
															{user.name}
														</Tooltip>
													}
												>
													<div className="truncate_10vw">
														{user.name}
													</div>
												</OverlayTrigger>
											) : (
												user.name
											)}
										</Link>
										{!isViewer && (
											<button
												className="apps__ov__editbutton"
												onClick={() => {
													setEditText(user.name);
													setEditing(true);
												}}
											>
												<img src={edit} alt=""></img>
											</button>
										)}

										{props.userAccountType && (
											<OverlayTrigger
												placement="top"
												overlay={
													<Tooltip>
														<span className="text-capitalize">
															{
																props.userAccountType
															}
														</span>
													</Tooltip>
												}
											>
												<div className="truncate_10vw">
													{props.userAccountType ===
													userType.SERVICE ? (
														<img
															src={service}
															width={16}
														></img>
													) : props.userAccountType ===
													  userType.GROUP ? (
														<img
															src={group}
															width={16}
														></img>
													) : null}
												</div>
											</OverlayTrigger>
										)}
									</>
								) : !isViewer ? (
									<div
										onClick={() => setEditing(true)}
										className="cursor-pointer"
										style={{ color: "#717171" }}
									>
										<img
											src={PlusCircle}
											width="24"
											className="mr-2"
										/>
										<span>{`Add ${
											props.componentText || "Owner"
										}`}</span>
									</div>
								) : (
									<div className="grey-1">
										<span>{`No ${
											props.componentText || "Owner"
										}`}</span>
									</div>
								)}
							</div>
						</div>
					) : (
						<div
							ref={editFieldRef}
							className="overview__middle__topconttext2__EditCategory"
						>
							<input
								type="text"
								className="overview__middle__topconttext2__EditCategory__input"
								style={{ flexGrow: 1 }}
								placeholder={`Enter ${
									props.componentText || "Owner"
								}`}
								value={editText}
								onChange={(e) => handleUserEdit(e.target.value)}
							/>
							{showUserSuggestions && (
								<SuggestionBar
									options={userSuggestions}
									loading={loading}
									onHide={() => setShowUserSuggestions(false)}
									handleSelect={handleUserSelect}
								/>
							)}
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
										onClick={() => {
											setEditing(false);
											setShowUserSuggestions(false);
											setEditText("");
										}}
										className="overview__middle__topconttext2__EditCategory__button1 mr-1"
									>
										<img src={cancel} />
									</button>
									{readyToSave && (
										<button
											className="overview__middle__topconttext2__EditCategory__button2 mr-1"
											onClick={handleSave}
										>
											<img src={acceptbutton}></img>
										</button>
									)}
								</>
							)}
						</div>
					)}
				</span>
			</div>
		</>
	);
}
