import React, { useState, useEffect, useCallback, useRef } from "react";
import { Spinner } from "react-bootstrap";
import PropTypes from "prop-types";
import edit from "../../Applications/Overview/edit.svg";
import cancel from "../../Applications/Overview/cancel.svg";
import completeiconimg from "../../Applications/Overview/completeicon.svg";
import acceptbutton from "../../Applications/Overview/acceptbutton.svg";
import {
	checkSpecialCharacters,
	searchUsers,
} from "../../../services/api/search";
import { Loader } from "../../../common/Loader/Loader";
import "../../Applications/Overview/Overview.css";
import { NameBadge } from "../../../common/NameBadge";
import { Link, useLocation } from "react-router-dom";
import { debounce } from "../../../utils/common";
import { client } from "../../../utils/client";
import PlusCircle from "../../../assets/icons/plus-circle.svg";
import { useOutsideClickListener } from "../../../utils/clickListenerHook";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { updateIntegrationUserMapping } from "modules/integrations/service/api";

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
												src={option.profile_img}
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
											{option.user_email && (
												<OverlayTrigger
													position="top"
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
											)}
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

export function UserSelect(props) {
	const defaultUserState = {
		id: "",
		name: "",
		profile_img: "",
	};
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

	useEffect(() => {
		setUser({
			id: props.userId,
			name: props.user.name,
			profile_img: props.user.profile_img,
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
		setSelection();
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
		let integrationId =
			props.idFromTable || location.pathname.split("/")[2];
		const payload = {
			integrations_user_key_map: [
				{
					integration_user_key_map_id: props.row._id,
					user_id: selection?.user_id ? selection?.user_id : null,
				},
			],
		};

		if (editText?.length === 0) {
			setUser({ ...defaultUserState });
		} else {
			setUser({
				id: selection?.user_id,
				name: selection?.user_name,
				profile_img: selection?.profile_img,
			});
		}
		setSubmitting(true);
		updateIntegrationUserMapping(integrationId, payload)
			.then(() => {
				setSubmitting(false);
				setSubmitted(true);
				setReadyToSave(false);
				setEditing(false);
				props.refreshTable();
			})
			.catch(() => {
				setSubmitting(false);
				setSubmitted(true);
			});
	};

	return (
		<>
			<div className="overview__middle__topconttext2">
				<span>
					{!editing ? (
						<div className="overview__middle__topconttext2__hover">
							<div className="d-flex align-items-center">
								{user.profile_img ? (
									<img
										src={user.profile_img}
										width="24"
										className="mr-2"
									/>
								) : (
									<NameBadge
										name={user.name}
										width={24}
										className="mr-2"
									/>
								)}
								{(user.name && user.name.length > 0) ||
								!!props?.row?.org_user_id ? (
									<>
										<Link
											to={`/users/${props?.row?.org_user_id}#overview`}
											className="table-link"
										>
											{user.name}
										</Link>
										<button
											className="apps__ov__editbutton"
											onClick={() => {
												setEditText(user.name);
												setEditing(true);
											}}
										>
											<img src={edit} alt=""></img>
										</button>
									</>
								) : (
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
										<span>Map User</span>
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
								placeholder="Search User"
								style={{ flexGrow: 1 }}
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
