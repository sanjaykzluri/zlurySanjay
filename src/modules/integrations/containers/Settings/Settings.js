import React, { useEffect, useState } from "react";
import { Button } from "../../../../UIComponents/Button/Button";
import bluequestion from "../../../../assets/icons/question-blue.svg";
import questioncircle from "../../../../assets/icons/question-circle.svg";
import exclamation from "../../../../assets/icons/exclamation.svg";
import check from "../../../../assets/icons/check-circle.svg";
import { getValueFromLocalStorage } from "../../../../utils/localStorage";
import { PopupWindowPostRequest } from "../../../../utils/PopupWindowPostRequest";
import {
	integrationConnected,
	refreshPRState,
	resetIntegration,
	updateRequestForIntegrations,
} from "../../redux/integrations";
import "./Settings.css";
import { useDispatch } from "react-redux";
import { getAppKey } from "../../../../utils/getAppKey";
import { TriggerIssue } from "../../../../utils/sentry";
import { INTEGRATION_STATUS } from "../../constants/constant";
import { ConnectionSucces } from "../../components/ConnectionSucces/ConnectionSucces";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { ConnectionFail } from "../../components/ConnectionFail/ConnectionFail";
import { useHistory, useLocation } from "react-router-dom";
import { SelectOld } from "../../../../UIComponents/SelectOld/Select";
import _ from "underscore";
import moment from "moment";
import { Form } from "react-bootstrap";
import PasswordInputField from "../../../../common/PasswordInputField";
import Tags from "@yaireo/tagify/dist/react.tagify";
import { Select } from "UIComponents/Select/Select";
import { INPUT_TYPE } from "constants/ui";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";

export function Settings(props) {
	const userDetails = getValueFromLocalStorage("userInfo");
	const history = useHistory();
	const dispatch = useDispatch();
	const controller = new AbortController();
	const [isValidated, setIsValidated] = useState(false);
	let client = null;
	const [formfields, setFormfields] = useState(props.integration.form);
	const [showConnectSucessModal, setShowConnectSucessModal] = useState(false);
	const [showConnectFailModal, setShowConnectFailModal] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const [selectedAccount, setSelectedAccount] = useState();
	const [availableAccounts, setAvailableAccounts] = useState([]);
	const [errorMessage, setErrorMessage] = useState("");
	const [filtersApplied, setFiltersApplied] = useState(false);
	const location = useLocation();
	const { partner } = useContext(RoleContext);

	useEffect(() => {
		if (location.hash != "#settings") {
			setFormfields(
				formfields?.map((f) => {
					f.value = "";
					return f;
				})
			);
		}
	}, [location.hash]);

	useEffect(() => {
		if (
			props.integration?.accounts &&
			Array.isArray(props.integration?.accounts) &&
			props.integration?.accounts.length > 0
		) {
			var tempAvailableAccounts = props.integration.accounts.map(
				(account) => {
					return {
						label: account.name,
						value: account,
					};
				}
			);
			setAvailableAccounts(tempAvailableAccounts);
			const tempSelectedAccount =
				history?.location?.state?.selectedAccount;
			if (
				tempSelectedAccount &&
				typeof tempSelectedAccount === "object" &&
				history.action === "PUSH"
			) {
				const filteredAccount = _.first(
					_.where(props.integration?.accounts, {
						org_integration_id:
							tempSelectedAccount?.org_integration_id,
					})
				);
				if (
					filteredAccount?.integration_status !=
					tempSelectedAccount?.integration_status
				) {
					setSelectedAccount(filteredAccount);
					checkForPreAppliedFilter(filteredAccount);
				} else {
					setSelectedAccount(
						history?.location?.state?.selectedAccount
					);
					checkForPreAppliedFilter(
						history?.location?.state?.selectedAccount
					);
				}
			} else {
				const alreadySelectedAcc = _.first(
					_.where(props.integration?.accounts, {
						org_integration_id: selectedAccount?.org_integration_id,
					})
				);
				setSelectedAccount(
					alreadySelectedAcc || _.first(props.integration?.accounts)
				);
				checkForPreAppliedFilter(
					alreadySelectedAcc || _.first(props.integration?.accounts)
				);
			}
		}
	}, [props.integration]);

	useEffect(() => {
		const isIntegrationConnected =
			selectedAccount?.integration_status ===
			INTEGRATION_STATUS.CONNECTED;
		setIsConnected(isIntegrationConnected);
	}, [selectedAccount]);

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
				orgIntegrationId: selectedAccount?.org_integration_id,
			};
		}
		client = PopupWindowPostRequest(
			props.integration.connectURL,
			"IntegrationsApplication",
			Object.assign(data, {
				integrationId: props.integration.id,
				formFields: populateFormValue(),
			})
		);

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
							setErrorMessage(e?.data?.message);
							setShowConnectFailModal(true);
						}
						if (
							e?.data?.status === "success" &&
							e?.data?.message === "connected"
						) {
							setTimeout(() => {
								dispatch(integrationConnected());
								dispatch(
									updateRequestForIntegrations(
										props.integration.id
									)
								);
								dispatch(refreshPRState(props.integration.id));
								dispatch(resetIntegration());
								setFormfields(props.integration.form);
								if (props.adminView) {
									props.onSuccess();
								}
								if (props.onboarding) {
									history.push(`/steps`);
								}
							}, [3000]);
						}
					}
				} catch (e) {
					TriggerIssue(
						`On Connecting Integration ${props.integration.name}`,
						e
					);
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
			formfields?.map((f) => {
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

		if (field.field_type === INPUT_TYPE.MULTI_SELECT && field.value) {
			let arr = field?.value?.split(",");
			options = arr.map((el) => {
				return {
					field_name: el,
				};
			});
		}

		const isEven = index % 2 === 0;
		return (
			<div
				className={`mb-3 d-flex flex-column ${
					isEven ? "mr-auto" : "ml-auto"
				}`}
				key={index}
				style={props.adminView ? { width: "100%" } : { width: "48%" }}
			>
				<label className="mr-2 d-block mt-auto mb-2">
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
						placeholder={isConnected ? "Data Already Entered" : ""}
						value={field.value}
						className="pl-2 w-100 font-13 mt-auto"
						onChange={(e) =>
							updateFormFields(e.target.value, field)
						}
					/>
				) : field.field_type === "url" ? (
					<input
						placeholder={isConnected ? "Data Already Entered" : ""}
						type={field.field_type}
						value={field.value}
						className="pl-2 w-100 mt-auto"
						onChange={(e) =>
							updateFormFields(e.target.value, field)
						}
					/>
				) : field.field_type === "password" ? (
					<PasswordInputField
						placeholder={isConnected ? "Data Already Entered" : ""}
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
						value={options}
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
						placeholder={isConnected ? "Data Already Entered" : ""}
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

	const checkForPreAppliedFilter = (account) => {
		if (
			account?.settings &&
			Object.keys(account?.settings?.formFields).length > 0
		) {
			Object.keys(account?.settings?.formFields).forEach((row) => {
				let tempObj = formfields.find((el) => el.field_id === row);
				updateFormFields(account?.settings?.formFields[row], tempObj);
			});
			setFiltersApplied(true);
		} else {
			formfields.forEach((field, index) =>
				updateFormFields(undefined, field)
			);
			setFiltersApplied(false);
		}
	};

	return (
		<div className="z_i_app_security pt-4 d-flex">
			<div
				style={{ width: "60%" }}
				className={!props.adminView ? "mr-5" : "w-100"}
			>
				{!props.adminView && (
					<div className="d-flex">
						<div className="font-16 bold-400 mt-auto mb-auto mr-2">
							Settings for
						</div>
						<SelectOld
							style={{ minWidth: "222px" }}
							className="mt-auto mb-auto mr-0"
							isSearchable={false}
							placeholder={selectedAccount?.name}
							value={selectedAccount?.name}
							options={availableAccounts}
							onSelect={(v) => {
								setSelectedAccount(v.value);
								checkForPreAppliedFilter(v.value);
							}}
						/>
					</div>
				)}
				<div
					className="z_i_app_security_form rounded p-4 mt-4 w-100"
					style={{
						backgroundColor: "#ebebeb2b",
						border: "1px solid #7171711a",
					}}
				>
					{!props.adminView && (
						<div className="d-flex flex-row mb-3">
							<div className="d-flex flex-column">
								<img
									src={
										selectedAccount?.integration_status ===
										INTEGRATION_STATUS.CONNECTED
											? check
											: exclamation
									}
									width={20}
								/>
							</div>
							<div className="d-flex flex-column ml-1">
								<div className="text-capitalize font-14 bold-600">
									{selectedAccount?.name}
								</div>
								{selectedAccount?.last_sync_date ? (
									<div className="font-11 grey-1">
										Last synced{" "}
										{moment(
											selectedAccount?.last_sync_date
										).fromNow()}
									</div>
								) : null}
							</div>
						</div>
					)}
					{props.integration.enable_finance_filter && (
						<div
							className="mb-3 d-flex flex-column pl-4 pt-2 pb-2 mt-3"
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
								onClick={(e) => {
									if (
										selectedAccount?.settings &&
										Object.keys(
											selectedAccount?.settings
												?.formFields
										).length > 0
									) {
										Object.keys(
											selectedAccount?.settings
												?.formFields
										).forEach((row) => {
											let tempObj = formfields.find(
												(el) => el.field_id === row
											);
											updateFormFields(
												selectedAccount?.settings
													?.formFields[row],
												tempObj
											);
										});
									}
									setFiltersApplied(true);
								}}
								checked={filtersApplied}
							/>
						</div>
					)}

					{props.integration.enable_finance_filter ? (
						filtersApplied ? (
							<div
								className={`d-flex ${
									props.adminView
										? "flex-column"
										: "flex-wrap"
								}`}
								key={isValidated}
							>
								{form}
							</div>
						) : null
					) : (
						<div
							className={`d-flex ${
								props.adminView ? "flex-column" : "flex-wrap"
							}`}
							key={isValidated}
						>
							{form}
						</div>
					)}

					<div
						className={
							!props.adminView ? "mt-4" : "mt-4 text-center"
						}
					>
						<Button
							className="pl-5 pr-5"
							disabled={!isValidated}
							onClick={(e) => {
								integrateApplication();
							}}
						>
							{props.adminView ? "Connect" : "Re-Connect"}
						</Button>
					</div>
				</div>
			</div>
			<div
				style={{ width: "40%" }}
				className={!props.adminView ? "" : "help_text_admin_view"}
			>
				{props.integration.helpText && (
					<div className="z_i_app_security_note d-flex align-items-start p-3 mt-3">
						<img className="mr-2" width={15} src={bluequestion} />
						<div>
							<h4 className="font-12 bold-600">How-to Guide</h4>
							<div
								className="font-13 text-break"
								dangerouslySetInnerHTML={{
									__html: props.integration.helpText,
								}}
							></div>
						</div>
					</div>
				)}
				{props.integration.helpURL && (
					<div className="border-1 border-radius-4 p-2 mt-3">
						<a
							className="font-16 primary-color"
							href={props.integration.helpURL}
							target="_blank"
							rel="noreferrer"
						>
							{" "}
							<img
								className="mr-2"
								width={20}
								src={questioncircle}
							/>{" "}
							More details
						</a>
					</div>
				)}
			</div>
			<Modal
				dialogClassName="z_i_connect_modal_dialog"
				show={showConnectFailModal}
				onClose={() => setShowConnectFailModal(false)}
			>
				<ConnectionFail
					className="p-5"
					errorMessage={errorMessage}
					onClose={() => setShowConnectFailModal(false)}
				/>
			</Modal>
		</div>
	);
}
