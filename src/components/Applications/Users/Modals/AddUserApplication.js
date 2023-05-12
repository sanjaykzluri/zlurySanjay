import React, { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { Form } from "react-bootstrap";
import "../../../Users/Applications/Modals/AddApplicationModal.scss";
import { searchUsers } from "../../../../services/api/search";
import { debounce, unescape } from "../../../../utils/common";
import { client } from "../../../../utils/client";
import imageHeader from "../../../Users/Applications/Modals/image-header.svg";
import { useDispatch, useSelector } from "react-redux";
import { mapValueToKeyState } from "../../../../utils/mapValueToKeyState";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { MANUAL_USAGE_INTERVAL_ } from "../../../../modules/shared/constants/ManualUsageConstants";
import { SuggestionBar } from "../../../../modules/shared/components/ManualUsage/SuggestionBar/SuggestionBar";
import { NameBadge } from "../../../../common/NameBadge";
import { openModal } from "reducers/modal.reducer";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";

export function AddUserApplication(props) {
	const { partner } = useContext(RoleContext);
	const dispatch = useDispatch();
	const [searchResult, setSearchResult] = useState("");
	const [userName, setUserName] = useState("");
	const [userId, setUserId] = useState("");
	const [userImage, setUserImage] = useState("");
	const [loading, setLoading] = useState(true);
	const [showHide, setShowHide] = useState(false);
	const [interval, setInterval] = useState(MANUAL_USAGE_INTERVAL_.week);
	const cancelToken = useRef();
	let intervalOptions = Object.keys(MANUAL_USAGE_INTERVAL_).map((period) => (
		<option key={period} value={period}>
			{period}
		</option>
	));
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [frequency, setFrequency] = useState(2);

	useEffect(() => {
		if (props.user) {
			updateValueFromModal(props.user.user_id, props.user.user_name);
		}
		return () => {
			setUserName("");
		};
	}, [props.user]);

	useEffect(() => {
		//Segment Implementation
		window.analytics.page(
			"Applications",
			"Application-Overview; Add-Users",
			{
				orgId: orgId || "",
				orgName: orgName || "",
			}
		);
	}, []);

	let handleChange = (key, value) => {
		try {
			setUserName(value);
			setUserId(null);
			setUserImage(null);
			if (cancelToken.current)
				cancelToken.current.cancel(
					"Operation cancelled in favor of a new request"
				);
			cancelToken.current = client.CancelToken.source();
			generateUserSuggestions(value, cancelToken.current);
			if (value.length > 0) {
				setShowHide(true);
				setLoading(true);
			} else {
				setShowHide(false);
			}
		} catch (err) {
			console.log(err);
		}
	};

	const generateUserSuggestions = useCallback(
		debounce((query, reqCancelToken) => {
			if (query && query.length >= 1) {
				searchUsers(query, reqCancelToken, true).then((res) => {
					if (res.results) {
						setSearchResult(res);
					}
					setLoading(false);
				});
			}
		}, 300)
	);

	const updateValueFromModal = (user_id, user_name, user_image) => {
		setUserId(user_id);
		setUserName(user_name);
		setUserImage(user_image);
	};

	let addCardClose = () => setShowHide(false);

	const clearModal = () => {
		setShowHide(false);
		setUserName(null);
		setUserId(null);
		setUserImage(null);
		setInterval(MANUAL_USAGE_INTERVAL_.week);
		setFrequency(2);
	};

	return (
		<Modal
			show={props.isOpen}
			onClose={() => {
				clearModal();
				props.handleClose();
			}}
			size="md"
			title="Add Users"
			footer={true}
			onOk={async () => {
				await props.handleSubmit({
					userId,
					frequency,
					interval,
				});
				clearModal();
				props.handleClose();
			}}
			disableOkButton={!userId}
			ok={"Add User"}
			submitInProgress={props.submitting}
			style={{ height: "488px" }}
		>
			<div className="addTransactionModal__body_upper">
				<div className="addTransactionModal__body_upper_inner d-flex flex-row w-100 pl-3">
					<div>
						<img src={imageHeader}></img>
					</div>
					<div>
						<h4
							className="font-weight-normal p-0 m-0"
							style={{
								fontSize: 14,
								lineHeight: "22px",
							}}
						>
							Automatically add app data with Integrations
						</h4>
						<p
							className="font-weight-normal p-0 m-0"
							style={{
								fontSize: 11,
								lineHeight: "18px",
								color: "#717171",
							}}
						>
							Run your SaaS management on auto-pilot using{" "}
							{partner?.name}
							integrations
						</p>
						<p
							className="font-weight-normal p-0 m-0 mt-2"
							style={{
								fontSize: 13,
								lineHeight: "16.38px",
								marginTop: 6,
								color: "#2266E2",
							}}
						>
							Discover Integrations
						</p>
					</div>
				</div>
			</div>
			<div className="addTransactionModal__body_lower">
				<div className="addTransactionModal__body_lower_inner">
					<Form style={{ width: "100%" }}>
						<Form.Group>
							<Form.Label style={{ opacity: 0.8 }}>
								Select Users
							</Form.Label>
							<Form.Row className="position-relative">
								{userId &&
									(userImage ? (
										<img
											className="add-user-application-modal-image"
											src={unescape(userImage)}
										/>
									) : (
										<NameBadge
											name={userName}
											className="add-user-application-modal-image"
										/>
									))}
								<Form.Control
									className="w-100"
									style={{ paddingLeft: userId ? 40 : 16 }}
									type="text"
									value={userName}
									placeholder="User"
									disabled={props.user && props.user.user_id}
									onChange={(e) =>
										handleChange("name", e.target.value)
									}
								/>
							</Form.Row>
						</Form.Group>
						<div style={{ position: "relative" }}>
							{showHide ? (
								<SuggestionBar
									loading={loading}
									options={searchResult.results}
									option_id="user_id"
									option_name="user_name"
									option_image="profile_img"
									option_email="user_email"
									onHide={addCardClose}
									handleSelect={updateValueFromModal}
									handleNew={() =>
										dispatch(
											openModal("user", {
												onUserAdd: (user) =>
													updateValueFromModal(
														user.user_id,
														user.user_name
													),
											})
										)
									}
									showAddButton={true}
									addTitle={"Add New User"}
								/>
							) : null}
						</div>
						{!!userId && (
							<div>
								<div style={{ marginBottom: 11 }}>
									Set usage Frequency
								</div>
								<div className="row d-flex flex-column grow">
									<div
										className="d-flex flex-nowrap align-items-start"
										style={{ paddingLeft: 12 }}
									>
										<div
											className="z__operator__user"
											onClick={() => {
												if (frequency > 1)
													setFrequency(frequency - 1);
											}}
										>
											-
										</div>
										<div className="z__number__user">
											{frequency}
										</div>
										<div
											className="z__operator__user"
											onClick={() => {
												setFrequency(frequency + 1);
											}}
										>
											+
										</div>
										<p
											className="z__block-header text-left"
											style={{
												lineHeight: "20px",
												marginLeft: 12,
												marginRight: 12,
											}}
										>
											times every
										</p>
										<Form.Control
											as="select"
											className="cursor-pointer w-50"
											value={interval}
											onChange={(e) => {
												let { value } = e.target;
												mapValueToKeyState(
													setInterval,
													value
												);
											}}
											style={{ height: "40px" }}
										>
											{intervalOptions}
										</Form.Control>
									</div>
								</div>
							</div>
						)}
					</Form>
				</div>
			</div>
		</Modal>
	);
}

AddUserApplication.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	application: PropTypes.object,
	submitting: PropTypes.bool,
	handleClose: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
};
