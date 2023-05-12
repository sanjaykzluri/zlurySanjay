import React, {
	useState,
	useRef,
	useEffect,
	useContext,
	Fragment,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Account.css";
import userAvatar from "../../../assets/users/user-avatar.svg";
import { Form, Row, Col, Button, Spinner } from "react-bootstrap";
import { ResetPassword } from "../ResetPassword";
import {
	updateUserAccountDetails,
	resetPasswordEmail,
} from "../../../services/api/settings";
import { SUPPORTED_IMAGE_FORMATS } from "../../../constants/upload";
import { uploadImage } from "../../../services/upload/upload";
import { patchUser } from "../../../services/api/users";
import { Helmet } from "react-helmet";
import { ImmutableSet, allowDigitsOnly } from "../../../utils/common";
import { saveUserDetails } from "../../../actions/ui-action";
import { getValueFromLocalStorage } from "../../../utils/localStorage";
import RoleContext from "../../../services/roleContext/roleContext";
import { MFA } from "../../../modules/mfa/containers/MFA/MFA";
import { MFA_VIEW } from "../../../modules/mfa/constants/constant";
import { useAuth0 } from "@auth0/auth0-react";
import { setValueToLocalStorage } from "utils/localStorage";
import { UPDATE_USER_INFO_OBJECT } from "constants/user";

export function Account() {
	const { isViewer } = useContext(RoleContext);
	const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
	const [resetPasswordSubmitting, setResetPasswordSubmitting] =
		useState(false);
	const inputRef = useRef();
	const {
		user_id,
		org_id: orgId,
		org_name: orgName,
		phone,
	} = useSelector((state) => state.userInfo);
	const localUserDetails = getValueFromLocalStorage("user");

	const dispatch = useDispatch();
	const [localStorageUser, setLocalStorageUser] = useState({
		...localUserDetails,
		auth0_id: localUserDetails.sub,
		profile_img: localUserDetails.picture,
		user_id,
		phone,
	});
	const [user, setUser] = useState(localStorageUser);
	const [saving, setSaving] = useState(false);
	const [uploadInProgress, setUploadInProgress] = useState(false);
	const [updatedFieldNames, setUpdatedFieldNames] = useState(
		new ImmutableSet()
	);
	useEffect(() => {
		//Segment Implementation
		window.analytics.page("Settings", "Account", {
			orgId: orgId || "",
			orgName: orgName || "",
		});
	}, []);

	const handleUserChange = (key, value) => {
		value = value?.trimStart();
		if (key !== "profile_img" && key !== "picture") {
			if (localStorageUser[key] !== value) {
				setUpdatedFieldNames(updatedFieldNames.add("user"));
			} else {
				setUpdatedFieldNames(updatedFieldNames.delete("user"));
			}
		}
		setUser({ ...user, [key]: value });
	};
	const commonSegmentTrack = (message) => {
		//Segment Implementation
		window.analytics.track(message, {
			currentCategory: "Settings",
			currentPageName: "Account",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	const handleSaveClick = () => {
		commonSegmentTrack("Clicked on Save Account Details");
		setSaving(true);
		for (const key of Object.keys(user)) {
			if (!user[key]) {
				user[key] = null;
			}
		}
		updateUserAccountDetails(user)
			.then((res) => {
				setSaving(false);
				if (res.error) {
					console.error("Error while updating account details");
					return;
				} else {
					setUpdatedFieldNames(new ImmutableSet());
					setValueToLocalStorage("user", JSON.stringify(user));
					dispatch({
						type: UPDATE_USER_INFO_OBJECT,
						payload: { phone: user.phone },
					});
					setLocalStorageUser(user);
				}
			})
			.catch((err) => {
				setSaving(false);
				console.error("Error while updating account details", err);
			});
	};

	const updateUserProfilePic = (imageUrl) => {
		const patchObj = {
			patches: [
				{
					op: "replace",
					field: "profile_img",
					value: imageUrl,
					auth0_id: user.auth0_id,
				},
			],
		};

		return patchUser(user?.user_id, patchObj).then(() => {});
	};

	const removeUserProfilePic = () => {
		commonSegmentTrack("Clicked on Remove Profile Pic");
		inputRef.current.value = null;
		handleUserChange("profile_img", "");
		const patchObj = {
			patches: [
				{
					op: "replace",
					field: "profile_img",
					value: "",
				},
			],
		};

		patchUser(user?.user_id, patchObj)
			.then((res) => {
				if (res.status === "success") {
					// Do something here
					handleUserChange("picture", "");
					handleUserChange("profile_img", "");
					const updatedUser = {
						...user,
						picture: "",
						profile_img: "",
					};
					setUser(updatedUser);
					setValueToLocalStorage("user", JSON.stringify(updatedUser));
					dispatch(saveUserDetails(updatedUser));
					setLocalStorageUser(user);
					setUploadInProgress(false);
				}
			})
			.catch((err) => {
				console.error("Error removing user profile picture", err);
			});
	};

	const handleProfilePicChange = (e) => {
		let file = e.target.files[0];

		setUploadInProgress(true);
		uploadImage(file)
			.then((res) => {
				if (res.resourceUrl) {
					const { resourceUrl } = res;

					updateUserProfilePic(resourceUrl)
						.then((res) => {
							handleUserChange("picture", resourceUrl);
							handleUserChange("profile_img", resourceUrl);
							const updatedUser = {
								...user,
								picture: resourceUrl,
								profile_img: resourceUrl,
							};
							setUser(updatedUser);
							setValueToLocalStorage.setItem(
								"user",
								JSON.stringify(updatedUser)
							);
							dispatch(saveUserDetails(updatedUser));
							setLocalStorageUser(user);
							setUploadInProgress(false);
						})
						.catch((err) => {
							setUploadInProgress(false);
							console.error(
								"Error updating user profile picture",
								err
							);
						});
				}
			})
			.catch((err) => {
				setUploadInProgress(false);
				console.error("Error uploading image", err);
			});
	};

	const sendResetPasswordEmail = async () => {
		try {
			setResetPasswordSubmitting(true);
			const user = getValueFromLocalStorage("user");
			const resetPasswordResut = await resetPasswordEmail(user.email);
			setResetPasswordSubmitting(false);
		} catch (err) {
			console.error("Error sending password", err);
		}
	};

	const clickedOnUpload = () => {
		commonSegmentTrack("Clicked on Upload Image");
	};
	return (
		<>
			<Helmet>
				<title>
					{"Account Settings - " +
						getValueFromLocalStorage("userInfo")?.org_name +
						` - ${getValueFromLocalStorage("partner")?.name}`}
				</title>
			</Helmet>
			<div className="acc__cont">
				<div className="acc__cont__d1">Account</div>
				<div className="acc__cont__d2">Avatar</div>
				<div className="acc__cont__d3">
					<div
						className={
							"profile-image-preview mr-4 " +
							(uploadInProgress ? "loading" : "")
						}
					>
						{uploadInProgress && (
							<div className="preview-loader">
								<Spinner animation="border" />
							</div>
						)}
						<img src={user.profile_img || userAvatar} />
					</div>
					{!isViewer && (
						<Fragment>
							<label className="acc__cont__d3__d2 cursor-pointer mb-0">
								<input
									type="file"
									ref={inputRef}
									accept={SUPPORTED_IMAGE_FORMATS.toString()}
									disabled={uploadInProgress}
									onChange={handleProfilePicChange}
									onClick={clickedOnUpload}
								/>
								Upload
							</label>
							<button
								className="acc__cont__d3__d3"
								onClick={removeUserProfilePic}
							>
								Remove
							</button>
						</Fragment>
					)}
				</div>
				<hr style={{ margin: "32px 0px" }}></hr>
				<div className="acc__cont__d4 justify-content-between">
					<div>Account Details</div>
					<Button
						className="z-btn-primary"
						disabled={
							!user.name ||
							saving ||
							updatedFieldNames.set.size === 0
						}
						onClick={handleSaveClick}
					>
						Save
						{saving && (
							<Spinner
								animation="border"
								role="status"
								variant="light"
								size="sm"
								className="ml-2"
								style={{ borderWidth: 2 }}
							>
								<span className="sr-only">Loading...</span>
							</Spinner>
						)}
					</Button>
				</div>

				<Form style={{ marginTop: "24px" }}>
					<Row>
						<Col>
							<Form.Group controlId="formBasicName2">
								<Form.Label bsPrefix="acc__label">
									Name
								</Form.Label>
								<Form.Control
									bsCustomPrefix="acc__control"
									type="text"
									value={user.name}
									placeholder="Enter Name"
									isInvalid={!user.name}
									onChange={(e) =>
										handleUserChange("name", e.target.value)
									}
								/>
								<Form.Control.Feedback type="invalid">
									Please enter valid name !
								</Form.Control.Feedback>
							</Form.Group>
						</Col>
						<Col>
							<Form.Group controlId="formBasicEmail">
								<Form.Label bsPrefix="acc__label">
									Email
								</Form.Label>
								<Form.Control
									bsCustomPrefix="acc__control"
									type="text"
									value={user.email}
									placeholder="abc@email.com"
									disabled={true} // Disabling this field for now as editing is not supported yet
									onChange={(e) =>
										handleUserChange(
											"email",
											e.target.value
										)
									}
								/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col sm="6">
							<Form.Group controlId="formBasicPhone">
								<Form.Label bsPrefix="acc__label">
									Phone No
								</Form.Label>
								<Form.Control
									bsCustomPrefix="acc__control"
									type="number"
									value={user.phone}
									onChange={(e) =>
										handleUserChange(
											"phone",
											e.target.value
										)
									}
									onKeyDown={allowDigitsOnly}
								/>
							</Form.Group>
						</Col>
					</Row>
				</Form>
				{/* <hr style={{ margin: "22px 0px 32px" }}></hr>
				<div className="acc__cont__d4">Linked Accounts</div>
				<div className="acc__cont__d6">
					Enim culpa ullamco ea laborum enim deserunt cillum dolor
					tempor dolore in est in et.
				</div>
				<div className="acc__cont__d7">
					<div className="acc__cont__d7__d1">
						<img
							src={profile}
							style={{ width: "24px", height: "24px" }}
						></img>
					</div>
					<div className="acc__cont__d7__d2">Sign in With Google</div>
					<button className="acc__cont__d7__d3">Connected</button>
				</div>
				<div className="acc__cont__d7">
					<div className="acc__cont__d7__d1">
						<img
							src={profile}
							style={{ width: "24px", height: "24px" }}
						></img>
					</div>
					<div className="acc__cont__d7__d2">Sign in With Google</div>
					<button className="acc__cont__d7__d3">Connected</button>
				</div> */}
				<hr style={{ margin: "28px 0px 32px" }}></hr>
				<MFA view={MFA_VIEW.SETTINGS} />
				<hr style={{ margin: "28px 0px 32px" }}></hr>
				<div>
					<div className="acc__cont__d4 mb-3">Reset Password</div>
					<Button
						onClick={() => {
							sendResetPasswordEmail();
							setResetPasswordOpen(true);
							commonSegmentTrack("Clicked on Reset Password");
						}}
						className="font-13 button-primary-white-background"
						style={{
							// background: "#ffffff",
							// color: "#2266E2",
							width: resetPasswordSubmitting ? 164 : 134,
						}}
						// className="acc__cont__d8"
					>
						Reset Password
						{resetPasswordSubmitting && (
							<Spinner
								animation="border"
								role="status"
								size="sm"
								className="ml-2"
								style={{
									borderWidth: 2,
									color: "rgb(34, 102, 226)",
								}}
							>
								<span className="sr-only">Loading...</span>
							</Spinner>
						)}
					</Button>
					<ResetPassword
						isOpen={resetPasswordOpen}
						handleClose={() => setResetPasswordOpen(false)}
					/>
				</div>
				<hr style={{ margin: "32px 0px 32px" }}></hr>
			</div>
		</>
	);
}
