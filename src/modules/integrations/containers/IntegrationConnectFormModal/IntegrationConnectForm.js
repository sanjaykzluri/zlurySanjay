import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { getAppKey } from "../../../../utils/getAppKey";
import { PopupWindowPostRequest } from "../../../../utils/PopupWindowPostRequest";
import { TriggerIssue } from "../../../../utils/sentry";
import { getValueFromLocalStorage } from "../../../../utils/localStorage";
import {
	integrationConnected,
	refreshIntegrations,
} from "../../redux/integrations";
import questioncircle from "../../../../assets/icons/question-circle.svg";
import exclamation from "../../../../assets/icons/exclamation.svg";
import check from "../../../../assets/icons/check-circle.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import bluequestion from "../../../../assets/icons/question-blue.svg";
import { ConnectionSucces } from "../../components/ConnectionSucces/ConnectionSucces";
import { ConnectionFail } from "../../components/ConnectionFail/ConnectionFail";
import "./IntegrationConnectForm.css";
import exchange from "../../../../assets/icons/exchangeArrow.svg";
import zluri from "../../../../assets/zluri-logo.svg";
import { Status } from "@sentry/react";
import { unescape, urlifyImage } from "../../../../utils/common";
import { NameBadge } from "../../../../common/NameBadge";
import PasswordInputField from "../../../../common/PasswordInputField";
import { Select } from "UIComponents/Select/Select";
import Tags from "@yaireo/tagify/dist/react.tagify";
import { INPUT_TYPE } from "constants/ui";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";

export const STATUS = {
	DEFAULT: "DEFAULT",
	CONNECTING: "CONNECTING",
	RETRY: "RETRY",
	CONNECTED: "CONNECTED",
};

export default function IntegrationConnectForm(props) {
	const userDetails = getValueFromLocalStorage("userInfo");
	const history = useHistory();
	const dispatch = useDispatch();
	const controller = new AbortController();
	const [isValidated, setIsValidated] = useState(false);
	let client = null;
	const [formfields, setFormfields] = useState(props.integration?.form);
	const [orgIntegrationId, setOrgIntegrationId] = useState();
	const [errorMessage, setErrorMessage] = useState("");
	const [orgIntegrationAccountName, setOrgIntegrationAccountName] =
		useState();
	const [connectionStatus, setConnectionStatus] = useState(STATUS.DEFAULT);
	const [filtersApplied, setFiltersApplied] = useState(false);
	const [selectedScopes, setSelectedScopes] = useState([]); //For OAuth based integratoins with forms.
	const { partner } = useContext(RoleContext);

	useEffect(() => {
		let scopes = [];

		if (props.scopes?.length) {
			props.scopes?.map((scope) => {
				if (!scope.is_default)
					scopes.push(scope.integration_scope_value);
			});
		}
		setSelectedScopes(scopes);
	}, [props.scopes]);

	const integrateApplication = () => {
		let data = {};
		if (props.adminView) {
			data = {
				orgId: props.adminData.org_id,
				userId: props.adminData.user_id,
				inviteCode: props.adminData.code,
			};
		} else {
			data = {
				orgId: userDetails.org_id,
				userId: userDetails.user_id,
				Authorization: `Bearer ${getValueFromLocalStorage("token")}`,
			};
		}
		if (!props.orgIntegrationId && selectedScopes) {
			Object.assign(data, {
				skipSync: false,
				newScopes: selectedScopes,
			});
		}
		if (props.orgIntegrationId) {
			Object.assign(data, {
				skipSync: true,
				newScopes: selectedScopes || [],
				orgIntegrationId: props.orgIntegrationId,
			});
		}

		client = PopupWindowPostRequest(
			props.integration.connectURL,
			"IntegrationsApplication",
			Object.assign(data, {
				integrationId: props.integration.id,
				formFields: populateFormValue(),
			})
		);
		let isFailed = false;
		let isConnected = false;

		const popupTick = setInterval(function () {
			if (client.closed) {
				clearInterval(popupTick);
				controller.abort();
				if (!isFailed && !isConnected) {
					props.onCancel && props.onCancel();
				}
			}
		}, 500);

		setConnectionStatus(STATUS.CONNECTING);
		props.onConnecting && props.onConnecting();
		window.addEventListener(
			"message",
			(e) => {
				try {
					if (e?.origin === getAppKey("REACT_APP_INTEGRATION_URL")) {
						controller.abort();
						if (e?.data?.status === "error") {
							TriggerIssue(
								`On Connecting Integration ${props.integration.name}`,
								e
							);
							props.onError(e?.data?.message);
							setErrorMessage(e?.data?.message);
							setConnectionStatus(STATUS.RETRY);
							isFailed = true;
						}
						if (
							e?.data?.status === "success" &&
							e?.data?.message === "connected"
						) {
							isConnected = true;
							setOrgIntegrationAccountName(e?.data?.name);
							setOrgIntegrationId(e?.data?.orgIntegrationId);
							props.onConnectionSuccessfull &&
								props.onConnectionSuccessfull();
							setConnectionStatus(STATUS.CONNECTED);
							props.onSuccess &&
								props.onSuccess({
									orgIntegrationId: e.data.orgIntegrationId,
									orgIntegrationName: e.data.name,
								});
						}
					}
				} catch (e) {
					isFailed = true;
					TriggerIssue(
						`On Connecting Integration ${props.integration.name}`,
						e
					);
					setErrorMessage(e?.data?.message);
					setConnectionStatus(STATUS.RETRY);
				}
			},
			{ signal: controller.signal }
		);
	};

	useEffect(() => {
		if (formfields) {
			setIsValidated(validate());
		}
	}, [formfields]);

	const populateFormValue = () => {
		let data = {};
		formfields.forEach((field) => {
			data[field.field_id] = field.value;
		});
		return JSON.stringify(data);
	};

	const validate = () => {
		let isValidated = true;
		formfields.forEach((field) => {
			if (!field.is_optional && !field.value) {
				isValidated = false;
			}
		});
		return isValidated;
	};

	const updateFormFields = (value, field) => {
		setFormfields(
			formfields.map((f) => {
				if (f.field_id === field.field_id) {
					f.value = value;
				}
				return f;
			})
		);
	};

	const updateFormFieldsForMultiSelect = (data, field) => {
		let updatedValueForRequest = [];
		data.forEach((el) => updatedValueForRequest.push(el.field_value));
		updatedValueForRequest = updatedValueForRequest.toString();
		updateFormFields(updatedValueForRequest, field);
	};

	const form = formfields?.map((field, index) => {
		let options;
		if (field.field_type === "dropdown") {
			options = field?.options?.map((option) => (
				<option value={option.field_value} key={option.field_name}>
					{option.field_name}
				</option>
			));
		}

		return (
			<div
				className="mb-3 d-flex flex-column ml-auto mr-auto"
				key={index}
				style={{ width: "80%" }}
			>
				<label className="mr-2 d-block mt-auto mb-2 ">
					{field.field_name}
				</label>
				{field.field_type === "dropdown" ? (
					<Form.Control
						as="select"
						className="mt-auto"
						placeholder={field.field_name}
						onChange={(e) =>
							updateFormFields(e.target.value, field)
						}
					>
						<option value={null} selected disabled>
							Select {field.field_name}
						</option>
						{options}
					</Form.Control>
				) : field.field_type === "textarea" ? (
					<textarea
						rows="4"
						value={field.value}
						className="pl-2 w-100 font-13 mt-auto"
						onChange={(e) =>
							updateFormFields(e.target.value, field)
						}
					/>
				) : field.field_type === "url" ? (
					<input
						type={field.field_type}
						value={field.value}
						className="pl-2 w-100 mt-auto"
						onChange={(e) =>
							updateFormFields(e.target.value, field)
						}
					/>
				) : field.field_type === "password" ? (
					<PasswordInputField
						value={field.value}
						onChange={(e) =>
							updateFormFields(e.target.value, field)
						}
					/>
				) : field.field_type === INPUT_TYPE.MULTI_SELECT ? (
					<Select
						isOptionsLoading={false}
						options={field.options}
						fieldNames={{
							label: "field_name",
						}}
						filter
						search
						placeholder={field.field_name}
						onChange={(arr) => {
							updateFormFieldsForMultiSelect(arr, field);
						}}
						mode="multi"
					/>
				) : field.field_type === "multi-tags" ? (
					<>
						<Tags
							value={field.value}
							className="form-control"
							placeholder="Add Tags"
							settings={{
								originalInputValueFormat: (valuesArr) =>
									valuesArr.map((item) => item.value),
							}}
							onChange={(e) => {
								updateFormFields(e.target.value, field);
							}}
						/>
					</>
				) : (
					<input
						type={field.field_type}
						value={field.value}
						className="pl-2 w-100 mt-auto"
						onChange={(e) =>
							updateFormFields(e.target.value, field)
						}
					/>
				)}
			</div>
		);
	});

	const header = (
		<div className="z_i_connect_modal_header text-center pt-5 pb-3 rounded">
			<div className="ml-4 mr-4 mb-2 d-flex justify-content-center">
				<img width={40} height={40} src={zluri}></img>
				<img className="ml-2 mr-2" src={exchange}></img>
				{props.integration.logo ? (
					<div
						className="img-circle background-contain background-no-repeat background-position-center"
						style={{
							backgroundImage: `url(${urlifyImage(
								unescape(props.integration.logo)
							)})`,
							width: "40px",
							height: "40px",
						}}
					></div>
				) : (
					<NameBadge
						name={props.integration.name}
						width={40}
						height={40}
						className="img-circle"
					/>
				)}
			</div>
			<h3 className="font-18 bold-600 black-1 mt-3">
				Connect {partner?.name} with {props.integration.name}
			</h3>
		</div>
	);

	return (
		<div>
			{connectionStatus === STATUS.CONNECTING ? (
				<>
					{/* {header} */}
					<div
						className="text-center mx-auto mt-6 mb-6"
						style={{ maxWidth: "300px" }}
					>
						<h3 className="bold-600 font-18 black-1">
							Connecting..
						</h3>
						<p className="font-14 bold-400 black-1">
							A new window has been opened for you to authorise
							this connection
						</p>
					</div>
				</>
			) : connectionStatus === STATUS.CONNECTED ? (
				<ConnectionSucces
					integrationName={props.integration.name}
					accountName={orgIntegrationAccountName}
					orgIntegrationId={orgIntegrationId}
					onClose={() => {
						props.onClose && props.onClose();
						dispatch(integrationConnected());
						dispatch(refreshIntegrations());
					}}
					showAccountForm={props.showAccountForm}
				/>
			) : connectionStatus === STATUS.RETRY ? (
				<ConnectionFail
					className="p-5"
					isRetryOnClose={connectionStatus === STATUS.RETRY}
					errorMessage={errorMessage}
					onClose={() => setConnectionStatus(STATUS.DEFAULT)}
				/>
			) : (
				<div>
					{/* {header} */}
					{!props.showHelpText && (
						<div>
							<div
								style={{
									backgroundColor: "rgba(245, 246, 249, 1)",
									width: "100%",
								}}
								className="d-flex flex-row py-2 px-4"
							>
								<img
									className="mr-2 mt-1 mb-1"
									width={15}
									src={bluequestion}
								/>
								<h4
									style={{ color: "rgba(90, 186, 255, 1)" }}
									className="font-13 bold-600 mb-auto mt-auto cursor-pointer"
									onClick={() =>
										props.setShowHowToSidebar &&
										props.setShowHowToSidebar(true)
									}
								>
									How to Connect
								</h4>
							</div>
						</div>
					)}
					{props.integration.helpText && props.showHelpText && (
						<div className="z_i_app_security_note d-flex align-items-start px-2 py-3 m-4">
							<div className="w-100 pl-4 pr-4">
								<div className="d-flex flex-row">
									<img
										className="mr-2 mt-1 mb-1"
										width={15}
										src={bluequestion}
									/>
									<h4 className="font-12 bold-600 mb-auto mt-auto">
										How-to Guide
									</h4>
									{props.integration.helpURL && (
										<div className="ml-auto">
											<a
												className="font-12 primary-color bold-600"
												href={props.integration.helpURL}
												target="_blank"
												rel="noreferrer"
											>
												{" "}
												<img
													className="mr-1 mt-0"
													width={10}
													src={questioncircle}
												/>{" "}
												More details
											</a>
										</div>
									)}
								</div>
								<div
									className="font-13 text-break remove_child_margins ml-1"
									dangerouslySetInnerHTML={{
										__html: props.integration.helpText,
									}}
								></div>
							</div>
						</div>
					)}
					{props.integration.enable_finance_filter && (
						<div
							className="mb-3 d-flex flex-column ml-auto mr-auto pl-4 pt-2 pb-2 mt-3"
							style={{
								width: "80%",
								background: "#F5F6F9",
								borderRadius: "4px",
							}}
						>
							<div className="mb-2 grey font-13">
								Select an option
							</div>
							<Form.Check
								type="radio"
								label={`Allow ${partner?.name} to fetch all expense data`}
								name={"formHorizontalRadios"}
								id={"5"}
								onClick={(e) => {
									formfields.forEach((field, index) =>
										updateFormFields(undefined, field)
									);
									setFiltersApplied(false);
								}}
								checked={!filtersApplied}
							/>
							<Form.Check
								type="radio"
								label={`Filter expense data shared with ${partner?.name}`}
								name={"formHorizontalRadios"}
								id={"5"}
								onClick={(e) => setFiltersApplied(true)}
								checked={filtersApplied}
							/>
						</div>
					)}
					{props.integration.enable_finance_filter ? (
						filtersApplied ? (
							<div className="d-flex flex-column mt-3">
								{form}
							</div>
						) : null
					) : (
						<div className="d-flex flex-column mt-3">{form}</div>
					)}
					{/* <div className="d-flex flex-column mt-3">{form}</div> */}
					<div className="mt-4 text-center mb-6">
						<Button
							className="pl-5 pr-5"
							disabled={!isValidated}
							onClick={(e) => {
								props.setShowConnectModal
									? props.setShowConnectModal(true)
									: integrateApplication();
							}}
						>
							{props.buttonText || "Connect"}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
