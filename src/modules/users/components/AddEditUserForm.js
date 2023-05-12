import React, { useEffect, useRef, useState } from "react";
import close from "assets/close.svg";
import {
	addEditUserRequiredFields,
	addUserFormFields,
	addUserOnboardingDataFields,
	addUserOnboardingTimezoneDataFields,
	defaultAddUserObject,
	EXTERNAL_USER,
	userStatuses,
	userType,
	USER_TYPE_OPTIONS,
} from "../constants/UserContants";
import bluearrowdropdown from "assets/licenses/bluearrowsdropdown.svg";
import { Modal, Form, Button, Spinner } from "react-bootstrap";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import { CustomFieldSectionInForm } from "modules/shared/components/CustomFieldSectionInForm/CustomFieldSectionInForm";
import { CUSTOM_FIELD_ENTITY } from "modules/custom-fields/constants/constant";
import { searchAllDepartments, searchUsers } from "services/api/search";
import { AsyncTypeahead } from "common/Typeahead/AsyncTypeahead";
import _ from "underscore";
import { getValidator } from "utils/common";
import { addUser, getTimezones, updateUser } from "services/api/users";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";
import { Loader } from "common/Loader/Loader";
import { SUPPORTED_IMAGE_FORMATS } from "constants/upload";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import arrowdropdown from "components/Transactions/Unrecognised/arrowdropdown.svg";
import { uploadImage } from "services/upload/upload";
import { getAdmins } from "services/api/settings";
import {
	addTimeToDate,
	dateResetTimeZone,
	timeGenerator,
} from "utils/DateUtility";
import { HeaderFormatter } from "modules/licenses/utils/LicensesUtils";
import { getValueFromLocalStorage } from "utils/localStorage";
import TimePicker from "UIComponents/TimePicker/TimePicker";
import { Select } from "UIComponents/Select/Select";
import { scheduleTimeUnit } from "modules/workflow/constants/constant";
import { TriggerIssue } from "utils/sentry";
import moment from "moment-timezone";
import { DatePicker } from "UIComponents/DatePicker/DatePicker";

export default function AddEditUser({ isOpen, handleClose, modalProps }) {
	const hiddenFileInputBtn = useRef();
	const [user, setUser] = useState(
		modalProps.user
			? { ...modalProps.user }
			: {
					...defaultAddUserObject,
					account_type:
						modalProps?.screenTagKey === "employees"
							? userType.EMPLOYEE
							: modalProps?.screenTagKey || userType.EMPLOYEE,
					user_department_id: modalProps.department_id || null,
					user_department: modalProps.department_name || null,
			  }
	);
	const [submitting, setSubmitting] = useState(false);
	const [validation, setValidation] = useState({});
	const [markedForOnboarding, setMarkedForOnboarding] = useState(false);
	const [img, setImg] = useState(user?.user_profile);
	const [imgUploading, setImgUploading] = useState(false);
	const [onboardingDataMissingError, setOnboardingDataMissingError] =
		useState(false);
	const [timsezones, setTimezones] = useState();
	const [dateAndTimezone, setDateAndTimezone] = useState();

	useEffect(() => {
		if (timsezones) {
			const localTimeZone = moment.tz.guess();
			const defaultTimezone = timsezones?.filter((timezone) =>
				timezone?.utc?.includes(localTimeZone)
			);
			let defaultValues = [
				{
					name: "timezone",
					value: defaultTimezone?.[0],
				},
				{
					name: "time",
					value: "06:00 AM",
				},
			];
			defaultValues?.map((item) =>
				handleDateAndTimezone({
					target: { name: item.name, value: item.value },
				})
			);
		}
	}, [timsezones]);

	useEffect(() => {
		setUser({ ...user, user_profile: img });
	}, [img]);

	useEffect(() => {
		if (!timsezones)
			getTimezones()
				.then((res) => {
					if (Array.isArray(res)) {
						setTimezones(res);
					} else {
						setTimezones([]);
					}
				})
				.catch((err) => {
					setTimezones([]);
					TriggerIssue("Error in get Timezones", err);
				});
	}, [timsezones]);

	const validateField = (fieldName, value) => {
		if (!value) {
			setValidation({
				...validation,
				...{ [fieldName]: { msg: `Please enter ${fieldName}` } },
			});
		} else if (validation[fieldName]) {
			delete validation[fieldName];
			setValidation({ ...validation });
		}
	};

	const handleDateAndTimezone = (e) => {
		const { name, value } = e.target;
		setDateAndTimezone((prev = {}) => {
			if (
				(name === "time" || prev?.time) &&
				(name === "timezone" || prev?.timezone) &&
				(name === "date" || prev?.date)
			) {
				const t = name === "time" ? value : prev?.time;
				const d = name === "date" ? value : prev?.date;
				const tz =
					name === "timezone" ? value?.utc : prev?.timezone?.utc;
				let splittedTime = t?.split(" ");
				let u = splittedTime[1];
				const newDate = addTimeToDate(t, u, d);
				const selectedTimeZone = tz?.[0];
				const localTimeZone = moment.tz.guess();
				moment.tz.setDefault(selectedTimeZone);
				const effectiveDate = moment(newDate)
					.tz(selectedTimeZone, true)
					.toJSON();
				validateField(`onboardingData.date`, effectiveDate);
				const tempUser = {
					...user,
					onboardingData: {
						...user.onboardingData,
						date: effectiveDate,
						display_values: dateAndTimezone,
					},
				};
				setUser(tempUser);
				moment.tz.setDefault(localTimeZone);
			}
			return { ...prev, [name]: value };
		});
	};

	const handleEdit = (key, value) => {
		if (typeof value === "string") {
			value = value?.trimStart();
		}
		validateField(key, value);
		const tempUser = { ...user, [key]: value };
		setUser(tempUser);
	};

	const handleUserDepartmentEdit = (id, name) => {
		validateField("user_department_id", id);
		const tempUser = {
			...user,
			user_department_id: id,
			user_department: name,
		};
		setUser(tempUser);
	};

	const handleOnboardingDataEdit = (key, value) => {
		if (typeof value === "string") {
			value = value?.trimStart();
		}
		validateField(`onboardingData.${key}`, value);
		const tempUser = {
			...user,
			onboardingData: { ...user.onboardingData, [key]: value },
		};
		setUser(tempUser);
	};

	const isInvalid = (fieldName) => !!validation[fieldName]?.msg;

	const onValueChangeFromCustomFields = (id, val) => {
		if (typeof val === "string") {
			val = val?.trimStart();
		}
		const state = { ...user };
		const customFields = [...state.user_custom_fields];
		const index = customFields.findIndex((cf) => cf.field_id === id);

		customFields.splice(index, index > -1 ? 1 : 0, {
			field_id: id,
			field_value: val,
		});
		state.user_custom_fields = customFields;
		setUser(state);
	};

	const validateUser = (user) => {
		const errors = {};
		let reqFields = [...addEditUserRequiredFields[user?.account_type]];
		if (user?.user_personal_email) {
			reqFields.push({ field: "user_personal_email", type: "email" });
		}
		reqFields.forEach(({ field, type }) => {
			const validator = getValidator(type);
			if (!validator.validate(_.get(user, field.split(".")))) {
				errors[field] = {
					msg: `Please enter ${field}`,
				};
			}
		});
		return errors;
	};

	const handleSubmit = () => {
		if (user) {
			let flag = false;
			let errors = validateUser(user);
			if (Object.keys(errors).length > 0) {
				setValidation(errors);
				flag = true;
			}
			if (markedForOnboarding) {
				if (
					!user.onboardingData.date ||
					!user.onboardingData.assigned_to
				) {
					setOnboardingDataMissingError(true);
					setTimeout(
						() => setOnboardingDataMissingError(false),
						5000
					);
					flag = true;
				}
			}
			if (flag) return;
		}
		setSubmitting(true);
		if (user.account_type === EXTERNAL_USER) {
			user.is_external = true;
		}
		if (
			user.account_type === userType.GROUP ||
			user.account_type === userType.SERVICE
		) {
			user.user_designation = null;
		}

		if (modalProps.user) {
			updateUser(user.user_id, user)
				.then((res) => {
					if (res.status === apiResponseTypes.SUCCESS) {
						setSubmitting(false);
						modalProps.onUserChange && modalProps.onUserChange();
						ApiResponseNotification({
							responseType: apiResponseTypes.SUCCESS,
							title: "User details successfully updated",
						});

						handleClose();
					}
				})
				.catch((err) => {
					setSubmitting(false);
					ApiResponseNotification({
						responseType: apiResponseTypes.ERROR,
						errorObj: err,
						title: "Error while editing a user.",
						description: err?.response?.data?.errors,
						retry: handleSubmit,
					});
				});
		} else {
			addUser(user)
				.then((res) => {
					if (res.status === "success") {
						window.analytics.track("Added a new User", {
							newUserName: user.user_name,
							newUserEmail: user.user_email,
							newUserDesignation: user.user_designation,
							newUserDepartmentId: user.user_department_id,
							newUserDepartment: user.user_department,
							newUserStatus: user.user_status,
							currentCategory: "User",
							currentPageName: "All-Users",
							orgId:
								getValueFromLocalStorage("userInfo")?.org_id ||
								"",
							orgName:
								getValueFromLocalStorage("userInfo")
									?.org_name || "",
						});
						modalProps.onUserAdd &&
							modalProps.onUserAdd({
								...user,
								user_id: res.user_id,
							});
						modalProps.handleRefresh && modalProps.handleRefresh();
						modalProps.fetchUserTabCount &&
							modalProps.fetchUserTabCount();
						setSubmitting(false);
						handleClose();
						ApiResponseNotification({
							responseType: apiResponseTypes.SUCCESS,
							title: "New user successfully added",
						});
					} else {
						setSubmitting(false);
						ApiResponseNotification({
							responseType: apiResponseTypes.ERROR,
							errorObj: res,
							title: "Error while adding a user.",
							retry: handleSubmit,
						});
					}
				})
				.catch((err) => {
					setSubmitting(false);
					ApiResponseNotification({
						responseType: apiResponseTypes.ERROR,
						errorObj: err,
						title: "Error while adding a user.",
						description: err?.response?.data?.errors?.[0]?.msg
							?.toLowerCase()
							?.includes("user with this email already exists")
							? "User with this email already exists."
							: "",
						retry: handleSubmit,
					});
				});
		}
	};

	const handleImgUpload = () => {
		!imgUploading && hiddenFileInputBtn.current.click();
	};

	const handleProfileImageChange = (e) => {
		let file = e.target.files[0];
		setImgUploading(true);
		uploadImage(file)
			.then((res) => {
				setImgUploading(false);
				setImg(res.resourceUrl);
			})
			.catch((error) => {
				ApiResponseNotification({
					responseType: apiResponseTypes.ERROR,
					title: "Error in uploading user profile image",
					errorObj: error,
				});
				setImgUploading(false);
			});
	};

	const formFieldsMap = (fieldName) => {
		switch (fieldName) {
			case "profile_img":
				return (
					<div
						className="d-flex flex-column justify-content-center align-items-center"
						style={{ width: "160px" }}
					>
						<div style={{ width: "61px" }}>
							{imgUploading ? (
								<Loader height={61} width={61} />
							) : user.user_profile ? (
								<img
									src={user.user_profile}
									height={61}
									width={61}
									onClick={handleImgUpload}
									className="cursor-pointer"
								/>
							) : (
								<NumberPill
									number="?"
									pillWidth={61}
									pillHeight={61}
									onClick={handleImgUpload}
									style={{ cursor: "pointer" }}
									className="profile_img_number_pill"
								/>
							)}
						</div>
						<div
							onClick={handleImgUpload}
							className="add_logo_btn_vendor cursor-pointer"
						>
							Add Profile Image
						</div>
						<Form.File
							id="user_profile"
							accept={SUPPORTED_IMAGE_FORMATS.toString()}
							style={{ display: "none" }}
						>
							<Form.File.Input
								ref={hiddenFileInputBtn}
								disabled={imgUploading}
								onChange={handleProfileImageChange}
							/>
						</Form.File>
					</div>
				);
			case "name":
				return (
					<>
						<Form.Label
							className="required"
							style={{ opacity: 0.8 }}
						>
							Name
						</Form.Label>
						<Form.Control
							type="text"
							placeholder="eg: John Doe"
							value={user.user_name}
							isInvalid={isInvalid("user_name")}
							onChange={(e) =>
								handleEdit("user_name", e.target.value)
							}
						/>
						<Form.Control.Feedback
							type="invalid"
							className="font-10"
						>
							Please enter a name.
						</Form.Control.Feedback>
					</>
				);
			case "status":
				return (
					<>
						<Form.Label
							className="required"
							style={{ opacity: 0.8 }}
						>
							Status
						</Form.Label>
						<Dropdown
							toggler={
								<div
									className="d-flex align-items-center justify-content-between border-1 border-radius-4"
									style={{ height: "36px", padding: "0 8px" }}
								>
									<div className="font-13 text-capitalize">
										{user.user_status}
									</div>
									<img src={arrowdropdown} />
								</div>
							}
							options={userStatuses}
							onOptionSelect={(option) =>
								handleEdit("user_status", option)
							}
							dropdownWidth="auto"
							menuStyle={{ width: "223px" }}
						/>
					</>
				);
			case "email":
				return (
					<>
						<Form.Label
							className="required d-flex "
							style={{ opacity: 0.8, marginTop: "6px" }}
						>
							<HeaderFormatter
								text={"Email"}
								tooltipContent="Ensure email being added is under your domain."
							/>
						</Form.Label>
						<Form.Control
							type="text"
							placeholder="eg: john.doe@mycompany.com"
							value={user.user_email}
							isInvalid={isInvalid("user_email")}
							onChange={(e) =>
								handleEdit("user_email", e.target.value)
							}
						/>
						<Form.Control.Feedback
							type="invalid"
							className="font-10"
						>
							Please enter a valid email.
						</Form.Control.Feedback>
					</>
				);
			case "designation":
				return (
					<>
						<Form.Label
							className="required"
							style={{ opacity: 0.8 }}
						>
							Designation
						</Form.Label>
						<Form.Control
							type="text"
							placeholder="eg: General Associate"
							value={user.user_designation}
							isInvalid={isInvalid("user_designation")}
							onChange={(e) =>
								handleEdit("user_designation", e.target.value)
							}
						/>
						<Form.Control.Feedback
							type="invalid"
							className="font-10"
						>
							Please enter user designation.
						</Form.Control.Feedback>
					</>
				);
			case "department":
				return (
					<AsyncTypeahead
						className="mb-0"
						label="Department"
						placeholder="eg: Sales"
						fetchFn={searchAllDepartments}
						isInvalid={isInvalid("user_department_id")}
						invalidMessage={
							<div className="font-10">
								Please select the user department.
							</div>
						}
						onSelect={(selection) => {
							handleUserDepartmentEdit(
								selection.department_id,
								selection.department_name_path || selection.department_name
							);
						}}
						keyFields={{
							id: "department_id",
							value: "department_name_path",
						}}
						allowFewSpecialCharacters={true}
						labelClassName="o-8 required"
						defaultValue={user?.user_department}
						invalidMsgClassName={
							isInvalid("user_department_id") ? "d-block" : ""
						}
						disabled={modalProps.deptFieldDisabled}
					/>
				);
			case "owner":
				return (
					<AsyncTypeahead
						className="mb-0"
						label="Owner"
						labelClassName="o-8 font-12"
						placeholder="Owner"
						fetchFn={searchUsers}
						onSelect={(selection) => {
							setUser({
								...user,
								owner_id: selection.user_id,
								owner_name: selection.owner_name,
								owner_profile: selection.profile_img,
							});
						}}
						requiredValidation={false}
						keyFields={{
							id: "user_id",
							image: "profile_img",
							value: "user_name",
							email: "user_email",
						}}
						allowFewSpecialCharacters={true}
						defaultValue={user?.owner_name}
						appLogo={user?.owner_profile}
						onChange={() => {
							setUser({
								...user,
								owner_id: null,
							});
						}}
					/>
				);
			case "reporting_manager":
				return (
					<AsyncTypeahead
						className="mb-0"
						label="Reporting Manager"
						labelClassName="o-8"
						placeholder="eg: Mark Davis"
						fetchFn={searchUsers}
						onSelect={(selection) => {
							setUser({
								...user,
								reporting_manager_id: selection.user_id,
								reporting_manager_name: selection.user_name,
								reporting_manager_profile:
									selection.profile_img,
							});
						}}
						requiredValidation={false}
						keyFields={{
							id: "user_id",
							image: "profile_img",
							value: "user_name",
							email: "user_email",
						}}
						allowFewSpecialCharacters={true}
						defaultValue={user?.reporting_manager_name}
						appLogo={user?.reporting_manager_profile}
						onChange={() => {
							setUser({
								...user,
								reporting_manager_id: null,
							});
						}}
					/>
				);

			case "personal_email":
				return (
					<>
						<Form.Label
							className="d-flex"
							style={{ opacity: 0.8, marginTop: "6px" }}
						>
							<HeaderFormatter
								text={"Personal Email"}
								tooltipContent="Password Reset will be shared to Personal Email
								if the user is not onboarded."
							/>
						</Form.Label>
						<Form.Control
							type="text"
							placeholder="eg: john.doe@gmail.com"
							value={user.user_personal_email}
							isInvalid={
								user.user_personal_email &&
								isInvalid("user_personal_email")
							}
							onChange={(e) =>
								handleEdit(
									"user_personal_email",
									e.target.value
								)
							}
						/>
						<Form.Control.Feedback
							type="invalid"
							className="font-10"
						>
							Please enter a valid personal id.
						</Form.Control.Feedback>
					</>
				);

			case "mark_for_onboarding":
				return (
					<div className="d-flex flex-row align-items-center">
						<Form.Check
							checked={markedForOnboarding}
							onChange={() => {
								if (markedForOnboarding) {
									setUser({
										...user,
										onboardingData: {},
									});
								} else {
									setUser({
										...user,
										onboardingData: {
											assigned_to: null,
											assigned_to_name: null,
											assigned_to_profile: null,
											date: null,
										},
									});
								}
								setDateAndTimezone();
								setTimezones();
								setOnboardingDataMissingError(false);
								setMarkedForOnboarding(!markedForOnboarding);
							}}
						/>
						<div style={{ fontSize: "12px" }}>
							Mark for Onboarding
						</div>
					</div>
				);
			case "assign_to":
				return (
					<AsyncTypeahead
						label={`Assign to`}
						placeholder="Search User"
						fetchFn={getAdmins}
						onSelect={(selection) => {
							validateField(
								`onboardingData.assigned_to`,
								selection._id
							);
							setUser({
								...user,
								onboardingData: {
									...user.onboardingData,
									assigned_to: selection._id,
									assigned_to_name: selection.name,
									assigned_to_profile: selection.profile_img,
								},
							});
						}}
						requiredValidation={true}
						keyFields={{
							id: "_id",
							image: "profile_img",
							value: "name",
							email: "email",
						}}
						allowFewSpecialCharacters={true}
						labelClassName="font-12"
						defaultValue={user?.onboardingData?.assigned_to_name}
						appLogo={user?.onboardingData?.assigned_to_profile}
					/>
				);
			case "onboard_date":
				return (
					<>
						<Form.Label style={{ opacity: 0.8 }}>
							Onboard Date
						</Form.Label>
						<DatePicker
							key={`Onboard Date`}
							placeholder={`Onboard Date`}
							onChange={(date) => {
								handleDateAndTimezone({
									target: {
										name: "date",
										value: dateResetTimeZone(date),
									},
								});
							}}
							calendarClassName="rangefilter-calendar"
							calendarContainerClassName="add_edit_user_calendar"
							value={dateAndTimezone?.date || null}
							style={{ background: "white" }}
							minDate={new Date()}
						/>
					</>
				);
			case "timezone_picker":
				return (
					<Select
						key={Math.random()}
						filter
						search
						selectorClassStyle={{
							textTransform: "none !important",
						}}
						isOptionsLoading={!timsezones}
						className="flex-fill black-1 w-auto my-1"
						options={timsezones}
						fieldNames={{
							label: "text",
						}}
						placeholder="Timezone"
						value={
							dateAndTimezone?.timezone
								? [dateAndTimezone?.timezone]
								: null
						}
						onChange={(obj) => {
							handleDateAndTimezone({
								target: {
									name: "timezone",
									value: obj,
								},
							});
						}}
					/>
				);
			case "time_picker":
				return (
					<Select
						selectorClassStyle={{
							textTransform: "none !important",
							minWidth: "130px",
						}}
						optionsContainerClassName="mark-for-on-off-boarding-time-picker"
						className="flex-fill black-1 w-auto my-1"
						options={timeGenerator(30)}
						fieldNames={{
							label: "time",
						}}
						placeholder="Time"
						value={
							dateAndTimezone?.time
								? {
										time: dateAndTimezone?.time,
										value: dateAndTimezone?.time,
								  }
								: null
						}
						onChange={(obj) => {
							handleDateAndTimezone({
								target: {
									name: "time",
									value: obj?.value,
								},
							});
						}}
					/>
				);
			default:
				return <></>;
		}
	};

	return (
		<Modal centered show={isOpen} onHide={handleClose}>
			<Modal.Header closeButton={false}>
				{modalProps.user ? (
					<Modal.Title
						className="d-flex align-items-center"
						style={{ fontWeight: "600" }}
					>
						<div className="font-18">Edit User</div>
					</Modal.Title>
				) : (
					<Modal.Title
						className="d-flex align-items-center"
						style={{ fontWeight: "600" }}
					>
						<div className="font-18">Add New</div>
						<Dropdown
							toggler={
								<div className="d-flex ml-1">
									<div className="font-18 primary-color text-capitalize">
										{user.account_type === EXTERNAL_USER
											? "External Employee"
											: user.account_type}
									</div>
									<img
										src={bluearrowdropdown}
										alt=""
										className="ml-1"
									/>
								</div>
							}
							options={USER_TYPE_OPTIONS}
							optionFormatter={(option) => option.label}
							onOptionSelect={(option) =>
								handleEdit("account_type", option.value)
							}
							menuStyle={{ width: "140px" }}
						/>
					</Modal.Title>
				)}
				<img alt="Close" onClick={handleClose} src={close} />
			</Modal.Header>
			<hr />
			<Modal.Body style={{ height: "69vh", overflowY: "auto" }}>
				<div className="d-flex flex-column">
					<div
						className="add_user_form_grid grey-bg"
						style={{ padding: "20px 20px" }}
					>
						{addUserFormFields.COMMON?.map((fieldName, index) => (
							<div key={`${index}`}>
								{formFieldsMap(fieldName)}
							</div>
						))}
					</div>
					<div
						className="add_user_form_grid mt-2"
						key={`${user.account_type}`}
						style={{ padding: "0px 20px" }}
					>
						{addUserFormFields[user.account_type]?.map(
							(fieldName, index) => (
								<div key={`${index}_${user.account_type}`}>
									{formFieldsMap(fieldName)}
								</div>
							)
						)}
					</div>
					{!modalProps.user && (
						<div
							className="d-flex flex-column mt-3"
							style={{
								background: "rgba(90, 186, 255, 0.1)",
								borderRadius: "3px",
								padding: "8px 20px",
							}}
						>
							{formFieldsMap("mark_for_onboarding")}
							{markedForOnboarding && (
								<>
									<div
										className="add_user_form_grid mt-1"
										key={`${markedForOnboarding}`}
									>
										{addUserOnboardingDataFields?.map(
											(fieldName, index) => (
												<div
													key={`${index}_${markedForOnboarding}`}
												>
													{formFieldsMap(fieldName)}
												</div>
											)
										)}
									</div>
									<div
										className="add_user_form_grid mt-1"
										key={`${markedForOnboarding}`}
									>
										{addUserOnboardingTimezoneDataFields?.map(
											(fieldName, index) => (
												<div
													key={`${index}_${markedForOnboarding}`}
												>
													{formFieldsMap(fieldName)}
												</div>
											)
										)}
									</div>
								</>
							)}
							{onboardingDataMissingError && (
								<div className="w-100 warningMessage d-flex justify-content-center">
									Please enter the missing onboarding data.
								</div>
							)}
						</div>
					)}
					<div className="mt-2" style={{ padding: "0px 20px" }}>
						<CustomFieldSectionInForm
							customFieldData={user.user_custom_fields}
							of={CUSTOM_FIELD_ENTITY.USERS}
							onValueChange={(id, val) =>
								onValueChangeFromCustomFields(id, val)
							}
						/>
					</div>
				</div>
			</Modal.Body>
			<hr />
			<Modal.Footer className="addTransactionModal__footer">
				<button className="btn btn-link" onClick={handleClose}>
					Cancel
				</button>
				<Button disabled={submitting} onClick={handleSubmit}>
					{modalProps.user ? "Edit User" : " Add User"}
					{submitting && (
						<Spinner
							animation="border"
							role="status"
							variant="light"
							size="sm"
							className="ml-2"
							style={{ borderWidth: 2 }}
						/>
					)}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
