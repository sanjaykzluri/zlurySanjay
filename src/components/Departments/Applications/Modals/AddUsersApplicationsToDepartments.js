import React, { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { Form } from "react-bootstrap";
import "../../../Users/Applications/Modals/AddApplicationModal.scss";
import { Loader } from "../../../../common/Loader/Loader";
import close from "assets/close.svg";
import {
	getAppSearchGlobal,
	searchUsers,
} from "../../../../services/api/search";
import { addCustomApplication } from "../../../../services/api/applications";
import { unescape } from "../../../../utils/common";
import { debounce } from "../../../../utils/common";
import { client } from "../../../../utils/client";
import {
	AddApps,
	IntegrationAvailableSection,
} from "../../../Applications/AllApps/AddApps";
import imageHeader from "../../../Users/Applications/Modals/image-header.svg";

import { mapValueToKeyState } from "../../../../utils/mapValueToKeyState";
import {
	convertArrayToBindSelect,
	convertObjToBindSelect,
} from "../../../../utils/convertDataToBindSelect";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import UserManualUsage from "./UserManualUsage";
import { SuggestionBar } from "../../../../modules/shared/components/ManualUsage/SuggestionBar/SuggestionBar";
import { MANUAL_USAGE_INTERVAL_ } from "../../../../modules/shared/constants/ManualUsageConstants";
import { NameBadge } from "../../../../common/NameBadge";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useOutsideClickListener } from "../../../../utils/clickListenerHook";
import ErrorScreen from "../../../../common/ErrorModal/ErrorScreen";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import { Select } from "UIComponents/Select/Select";
import { TriggerIssue } from "utils/sentry";
import { getAllUsersV2 } from "services/api/users";
import { defaultReqBody } from "modules/workflow/constants/constant";

export function AddUsersApplicationsToDepartments(props) {
	const selectUserRef = useRef();
	const [searchResultApplication, setSearchResultApplication] = useState("");
	const [searchResultUsers, setSearchResultUsers] = useState("");

	const [appName, setAppName] = useState("");
	const [appId, setAppId] = useState("");
	const [appImage, setAppImage] = useState("");
	const [user_name, setUserName] = useState("");
	const [userId, setUserId] = useState("");

	const [usersObj, setUsersObj] = useState([]);

	const [loadingApplication, setLoadingApplication] = useState(true);
	const [loadingUser, setLoadingUser] = useState(true);

	const [showHideApplication, setshowHideApplication] = useState(false);
	const [showHideUser, setShowHideUser] = useState(false);
	const [submitInProgressApplication, setSubmitInProgressApplication] =
		useState(false);
	const [formErrorsApplication, setFormErrorsApplication] = useState([]);
	const [addingNewAppModelOpen, setAddingNewAppModalOpen] = useState(false);
	const cancelTokenApplication = useRef();
	const cancelTokenUser = useRef();
	const intervalOptions = convertObjToBindSelect(MANUAL_USAGE_INTERVAL_);

	const [selectedUserError, setSelectedUserError] = useState("");
	const [newAppData, setNewAppData] = useState();
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const { partner } = useContext(RoleContext);

	const cancelToken = useRef();
	const [usersLoading, setUsersLoading] = useState(true);
	const [users, setUsers] = useState([]);
	const [selectedUsersId, setSelectedUsersId] = useState([]);

	useEffect(() => {
		getAllUsersV2(defaultReqBody, 0, 30)
			.then((res) => {
				res = res?.data?.filter(
					(option) => props.id === option?.user_department_id
				);
				if (res) {
					setUsers(res);
					setUsersLoading(false);
				}
			})
			.catch((err) => {
				TriggerIssue("Error in loading users", err);
				setUsersLoading(false);
			});
	}, []);

	const onUsersSearch = useCallback(
		debounce((query) => {
			if (query && query.length >= 1) {
				setUsersLoading(true);
				searchUsers(query, cancelToken, false, false, props.id)
					.then((res) => {
						res = res.results;
						if (res) {
							setUsers(res);
							setUsersLoading(false);
						}
					})
					.catch((err) => {
						setUsersLoading(false);
						TriggerIssue("Error in searching users", err);
					});
			}
		}, 200),
		[usersLoading]
	);

	useEffect(() => {
		if (props.application) {
			updateValueFromAppModal(
				props.application.app_id,
				props.application.app_name
			);
		}
		return () => {
			setAppName("");
			setUserName("");
		};
	}, [props]);

	useEffect(() => {
		//Segment Implementation
		if (props.department) {
			window.analytics.page(
				"Department",
				"Department-Applications; Add-New-Application",
				{
					department_name: props.department,
					department_id: props.id,
					orgId: orgId || "",
					orgName: orgName || "",
				}
			);
		}
	}, []);

	let handleChangeApplication = (key, value) => {
		try {
			setAppName(value);
			setAppId(null);
			setAppImage(null);
			if (cancelTokenApplication.current)
				cancelTokenApplication.current.cancel(
					"Operation cancelled in favor of a new request"
				);
			cancelTokenApplication.current = client.CancelToken.source();
			generateAppSuggestions(value, cancelTokenApplication.current);
			if (value.length > 0) {
				setshowHideApplication(true);
				setLoadingApplication(true);
			} else {
				setshowHideApplication(false);
			}
		} catch (err) {
			console.log(err);
		}
	};

	const generateAppSuggestions = useCallback(
		debounce((query, reqCancelToken) => {
			if (query && query.length >= 1) {
				getAppSearchGlobal(query, reqCancelToken).then((res) => {
					setSearchResultApplication(res);
					setLoadingApplication(false);
				});
			}
		}, 300)
	);

	const updateValueFromAppModal = (
		appId,
		app_name,
		_user_designation,
		app_image
	) => {
		setAppId(appId);
		setAppName(app_name);
		setAppImage(app_image);
	};

	const onSelectUser = (users) => {
		const userIds = users.map((user) => user.user_id);
		const transformedUsers = users.map((user) => ({
			user_id: user.user_id,
			user_name: user.user_name,
			user_designation: user.user_designation,
			user_image: user.user_profile,
			frequency: 2,
			interval: MANUAL_USAGE_INTERVAL_.week,
			checked: true,
		}));
		setSelectedUsersId([...userIds]);
		setUsersObj([...transformedUsers]);
	};

	const updateUserFrequency = (index, value) => {
		const newUsersObj = usersObj;
		newUsersObj[index].frequency = value;
		setUsersObj([...newUsersObj]);
	};

	const updateUserInterval = (index, value) => {
		const newUsersObj = usersObj;
		newUsersObj[index].interval = value;
		setUsersObj([...newUsersObj]);
	};

	const updateUserChecked = (index, value) => {
		const newUsersObj = usersObj;
		newUsersObj[index].checked = value;
		setUsersObj([...newUsersObj]);
	};
	const updateNewAppFromModal = (value) => {
		setAddingNewAppModalOpen(value);
	};

	let addCardCloseApplication = () => setshowHideApplication(false);
	let addCardCloseUser = () => setShowHideUser(false);

	const handleSubmitApplication = (application) => {
		setNewAppData(application);
		setSubmitInProgressApplication(true);
		let addAppPromise = addCustomApplication(application);
		if (addAppPromise) {
			addAppPromise
				.then((res) => {
					if (res.error) {
						setFormErrorsApplication([res.error]);
					} else {
						setAppId(res.org_app_id);
						setAppName(res.org_app_name);
						// setImage(res.org_app_image)
						setAddingNewAppModalOpen(false);
						setFormErrorsApplication([]);
					}
					setSubmitInProgressApplication(false);
				})
				.catch((err) => {
					setSubmitInProgressApplication(false);
					if (err.response && err.response.data) {
						setFormErrorsApplication(err.response.data.errors);
					}
				});
		}
	};

	useOutsideClickListener(selectUserRef, () => {
		setShowHideUser(false);
	});

	return (
		<Modal
			show={props.isOpen}
			onClose={props.handleClose}
			size="md"
			title="Add Application"
			footer={true}
			onOk={async () => {
				const submitUserObj = [];
				for (let i = 0; i < usersObj.length; i++) {
					if (usersObj[i].checked) {
						submitUserObj.push({
							user_id: usersObj[i].user_id,
							frequency: usersObj[i].frequency,
							interval: usersObj[i].interval,
						});
					}
				}
				await props.handleSubmit(appId, submitUserObj);
			}}
			disableOkButton={!appId || usersObj.length === 0}
			ok={"Add Application"}
			submitInProgress={props.submitting}
		>
			<div className="addTransactionModal__body_upper">
				<div
					className="addTransactionModal__body_upper_inner"
					style={{
						display: "flex",
						flexDirection: "row",
						width: "100%",
						paddingLeft: 13,
					}}
				>
					<div>
						<img src={imageHeader}></img>
					</div>
					<div>
						<h4
							style={{
								fontSize: 14,
								fontWeight: 400,
								lineHeight: "22px",
								padding: 0,
								margin: 0,
							}}
						>
							Automatically add app data with Integrations
						</h4>
						<p
							style={{
								fontSize: 11,
								fontWeight: 400,
								lineHeight: "18px",
								padding: 0,
								margin: 0,
								color: "#717171",
							}}
						>
							Run your SaaS management on auto-pilot using{" "}
							{partner?.name}
							integrations
						</p>
						<Link
							to={`/integrations`}
							style={{
								fontSize: 13,
								fontWeight: 400,
								lineHeight: "16.38px",
								padding: 0,
								marginTop: 6,
								// marginBottom: 6,
								color: "#2266E2",
							}}
						>
							Discover Integrations
						</Link>
					</div>
				</div>
			</div>
			<div className="addTransactionModal__body_lower">
				<div className="addTransactionModal__body_lower_inner">
					<Form style={{ width: "100%" }}>
						<Form.Group>
							<Form.Label style={{ opacity: 0.8 }}>
								Select Application
							</Form.Label>
							<Form.Row>
								{appId && (
									<img
										style={{
											width: 24,
											position: "absolute",
											zIndex: 1,
											marginTop: 6,
											marginLeft: 9,
										}}
										src={
											!!appImage
												? unescape(appImage)
												: `https://ui-avatars.com/api/?name=${appName}`
										}
									/>
								)}
								<Form.Control
									className="w-100"
									style={{ paddingLeft: appId ? 40 : 16 }}
									type="text"
									value={appName}
									placeholder="Application"
									disabled={
										props.application &&
										props.application.app_id
									}
									onChange={(e) =>
										handleChangeApplication(
											"name",
											e.target.value
										)
									}
								/>
							</Form.Row>
						</Form.Group>
						<div style={{ position: "relative" }}>
							{showHideApplication ? (
								<SuggestionBar
									loading={loadingApplication}
									options={searchResultApplication.results}
									option_id={["app_id", "org_application_id"]}
									option_name="app_name"
									option_image="app_image_url"
									onHide={addCardCloseApplication}
									handleSelect={updateValueFromAppModal}
									handleNew={updateNewAppFromModal}
									showAddButton={true}
									addTitle={"Add New Application"}
									additional_information={
										"app_integration_id"
									}
									showAdditionalRightInformation={true}
									additionalInformationFormatter={(value) => {
										if (value) {
											return IntegrationAvailableSection();
										}
									}}
								/>
							) : null}
						</div>
						<div
							style={{
								opacity: "0.8",
								fontSize: "12px",
								lineHeight: "15px",
								color: "#000000",
								marginBottom: "0.5rem",
							}}
						>
							Select Users
						</div>
						<div>
							<Select
								mode="multi"
								className="flex-fill black-1 w-auto"
								options={users?.filter(
									(user) =>
										!selectedUsersId?.includes(
											user?.user_id
										)
								)}
								isOptionsLoading={usersLoading}
								fieldNames={{
									label: "user_name",
									value: "user_id",
								}}
								search
								onSearch={(query) => {
									onUsersSearch(query);
								}}
								placeholder={"Select Users"}
								onChange={(users) => onSelectUser(users)}
								value={selectedUsersId}
								renderSelectedValues={(
									value,
									props,
									removeSelectedOption
								) => (
									<>
										{Array.isArray(value) &&
											value.map((val, index) => {
												return (
													index < 5 && (
														<div
															className="z-select-selected-option d-flex align-items-center m-2"
															key={index}
														>
															{props.selectedOptionRender(
																val,
																props
															)}
															<span
																className="ml-2 remove-selected-option"
																onClick={(
																	e
																) => {
																	e.stopPropagation();
																	removeSelectedOption(
																		val
																	);
																}}
															>
																<img
																	width={8}
																	src={close}
																/>
															</span>
														</div>
													)
												);
											})}
										{Array.isArray(value) &&
											value.length > 5 && (
												<NumberPill
													number={`+${
														value.length - 5
													} users`}
													className="padding_4 m-1 d-flex align-items-center justify-content-center"
													borderRadius="8px"
												/>
											)}
									</>
								)}
							/>
						</div>
						<div
							style={{ position: "relative" }}
							ref={selectUserRef}
						>
							{showHideUser ? (
								<SuggestionBar
									loading={loadingUser}
									options={searchResultUsers}
									option_id="user_id"
									option_name="user_name"
									option_designation="user_designation"
									option_image="profile_img"
									option_email="user_email"
									onHide={addCardCloseUser}
									handleSelect={updateValueFromUserModal}
									showAddButton={false}
									// addTitle={"Add New Application"}
								/>
							) : null}
						</div>

						<div
							style={{
								height: 120,
								width: 419,
								overflowY: "visible",
								overflowX: "hidden",
							}}
						>
							{usersObj.map((user, index) => {
								return (
									<UserManualUsage
										user={user}
										index={index}
										intervalOptions={intervalOptions}
										INTERVAL_={MANUAL_USAGE_INTERVAL_}
										updateUserFrequency={
											updateUserFrequency
										}
										updateUserInterval={updateUserInterval}
										updateUserChecked={updateUserChecked}
									/>
								);
							})}
						</div>
					</Form>
				</div>
			</div>

			{addingNewAppModelOpen ? (
				<AddApps
					custom={appName}
					handleSubmit={handleSubmitApplication}
					show={addingNewAppModelOpen}
					onHide={() => setAddingNewAppModalOpen(false)}
					submitting={submitInProgressApplication}
					validationErrors={formErrorsApplication}
					clearValidationErrors={() => setFormErrorsApplication([])}
					style={{ zIndex: "1" }}
				/>
			) : null}
			{formErrorsApplication.length > 0 && addingNewAppModelOpen && (
				<ErrorScreen
					isOpen={
						formErrorsApplication.length > 0 &&
						addingNewAppModelOpen
					}
					closeModal={() => {
						setFormErrorsApplication([]);
					}}
					isSuccess={!formErrorsApplication > 0}
					loading={submitInProgressApplication}
					successMsgHeading={"Successfuly added application"}
					warningMsgHeading={"The application could not be added."}
					warningMsgDescription={
						"An error occured while adding new application. Would you like to retry?"
					}
					retryFunction={() => {
						handleSubmitApplication(newAppData);
					}}
					errors={formErrors}
					entity={"application"}
				/>
			)}
		</Modal>
	);
}

AddUsersApplicationsToDepartments.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	application: PropTypes.object,
	submitting: PropTypes.bool,
	handleClose: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
};
