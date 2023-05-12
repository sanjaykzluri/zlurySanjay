import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Form, Row, Col, Navbar } from "react-bootstrap";
import "./Onboarding.css";
import csv from "./csv.svg";
import { step } from "../../services/api/onboarding";
import { LoaderPage } from "../../common/Loader/LoaderPage";
import { StepsErrorModal } from "./ErrorModal";
import "../../components/Header/Header.css";
import { currencySymbols } from "../../constants/currency";
import { fetchIntegrationsService } from "../../modules/integrations/service/api";
import { IntegrationCard } from "../../modules/integrations/components/IntegrationCard/IntegrationCard";
import { IntegrationCardLoader } from "../../modules/integrations/components/IntegrationCardLoader/IntegrationCardLoader";
import { Integration } from "../../modules/integrations/model/model";
import lock from "../../assets/icons/lock.svg";
import msg from "../../assets/icons/message-send.svg";
import add from "../../assets/icons/plus-blue.svg";
import success from "../../assets/icons/check-circle.svg";
import { Button } from "../../UIComponents/Button/Button";
import {
	INTEGRATION_ID,
	INTEGRATION_STATUS,
} from "../../modules/integrations/constants/constant";
import { connect } from "react-redux";
import { SAVE_USER_INFO_OBJECT } from "../../constants/user";
import UploadTransactionsSidePanel from "../Uploads/UploadTransactionsSidePanel";
import { FULL_MONTH } from "../../utils/DateUtility";
import { compose } from "redux";
import { getValueFromLocalStorage } from "utils/localStorage";
import RoleContext from "services/roleContext/roleContext";

function trackEvent(title) {
	const userInfo = getValueFromLocalStorage("userInfo");
	window.analytics.page("Onboarding", title, {
		orgId: userInfo?.org_id || "",
		orgName: userInfo?.org_name || "",
	});
}

export function Step1(props) {
	useEffect(() => {
		//Segment Implementation
		trackEvent("Step 1: Add Company Details");
	}, []);

	if (props.currentStep !== 1) {
		return null;
	}

	let currencyOptions = Object.keys(currencySymbols).map(
		(currency, index) => (
			<option key={index} value={currency}>
				{currency}
			</option>
		)
	);

	return (
		<div className="steps__child1">
			<div className="steps__child1__d1">Add Your Company Details</div>
			<div className="steps__child__form">
				<Form>
					<Form.Group controlId="companyname">
						<Form.Label bsPrefix="steps__labelform">
							Company Name
						</Form.Label>
						<Form.Control
							name="name"
							bsPrefix="steps__controlform"
							type="email"
							value={props.name}
							onChange={props.handleChange}
							placeholder="Ex: ABC Marketing or ABC Co"
							required
						/>
					</Form.Group>
					<Row>
						<Col>
							<Form.Group controlId="defaultcurrency">
								<Form.Label bsPrefix="steps__labelform">
									Default Currency
								</Form.Label>
								<Form.Control
									className="cursor-pointer"
									defaultValue={props.currency}
									name="currency"
									onChange={props.handleChange}
									bsPrefix="steps__controlform"
									as="select"
								>
									{currencyOptions}
								</Form.Control>
							</Form.Group>
						</Col>
						<Col>
							<Form.Group controlId="startoffinyear">
								<Form.Label bsPrefix="steps__labelform">
									Start of Financial Year
								</Form.Label>
								<Form.Control
									className="cursor-pointer"
									name="month"
									// value={props.month}
									onChange={props.handleChange}
									bsPrefix="steps__controlform"
									as="select"
								>
									<option>January</option>
									<option>February</option>
									<option>March</option>
									<option>April</option>
									<option>May</option>
									<option>June</option>
									<option>July</option>
									<option>August</option>
									<option>September</option>
									<option>October</option>
									<option>November</option>
									<option>December</option>
								</Form.Control>
							</Form.Group>
						</Col>
					</Row>
				</Form>
			</div>
		</div>
	);
}

class Step2 extends React.Component {
	static contextType = RoleContext;
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			integrationsList: null,
			onboarding_step_integrations: [],
			skip: false,
			requestSentData: {},
		};
		this.onAppIntegrated = this.onAppIntegrated.bind(this);
		this.onAppIntegrationRequestSent =
			this.onAppIntegrationRequestSent.bind(this);
	}

	componentDidMount() {
		fetchIntegrationsService(INTEGRATION_ID.SSO_INTEGRATION_ID).then(
			(res) => {
				const integrations = res.map(
					(integration) => new Integration(integration)
				);
				const connectedIntegration = [];
				const invitedIntegrations = [];
				integrations.forEach((integration) => {
					if (integration.connected_accounts > 0) {
						connectedIntegration.push({
							integration_id: integration.id,
							is_integration_successful: true,
						});
					}
					if (integration.num_pending_accounts > 0) {
						invitedIntegrations.push({
							integration_id: integration.id,
							is_integration_invited: true,
						});
					}
				});
				this.setState({
					integrationsList: integrations,
					loading: false,
					onboarding_step_integrations: [
						...this.state.onboarding_step_integrations,
						...connectedIntegration,
						...invitedIntegrations,
					],
				});

				if (invitedIntegrations.length > 0) {
					this.setState({
						skip: true,
					});
				}
			}
		);
		//Segment Implementation

		trackEvent("Step 2: Add Team to Zluri");
	}

	onAppIntegrated(integration) {
		this.setState({
			integrationsList: this.state.integrationsList.map((item) => {
				item.status =
					item.id === integration.id
						? INTEGRATION_STATUS.CONNECTED
						: item.status;
				return item;
			}),
			onboarding_step_integrations: [
				...this.state.onboarding_step_integrations,
				...[
					{
						integration_id: integration.id,
						is_integration_successful: true,
					},
				],
			],
		});
	}

	onAppIntegrationRequestSent(data) {
		this.setState({
			skip: true,
			requestSentData: data,
		});
	}

	render() {
		const integrationLists = this.state.integrationsList
			? this.state.integrationsList.map((integration, index) => (
					<IntegrationCard
						onboarding={true}
						blockNavigation={true}
						onSuccess={() => {
							this.onAppIntegrated(integration);
						}}
						onRequestSent={(data) => {
							this.onAppIntegrationRequestSent(data);
						}}
						key={index}
						integration={integration}
					/>
			  ))
			: null;

		if (this.props.currentStep !== 2) return null;

		return (
			<div className="steps__child2">
				<div className="steps__child1__d1">
					Add Your Team to {this.context?.partner?.name}
				</div>
				<div className="steps__child2__d2">
					Connect with one of the following services to add your team
					to {this.context?.partner?.name}
				</div>
				<div>
					<p className="font-12 grey-1 mt-2">
						<img
							src={lock}
							alt="secured"
							width={11}
							className="mt-n1 mr-1"
						/>{" "}
						Your data security is a priority for{" "}
						{this.context?.partner?.name}. Please read our privacy
						policy & terms of service for more information
					</p>
				</div>
				<div className="steps__child2__d3">
					<div className="d-flex mt-5 flex-wrap">
						{integrationLists ? (
							integrationLists
						) : (
							<IntegrationCardLoader />
						)}
					</div>
				</div>

				{this.state.skip &&
					this.state.requestSentData?.integration_name && (
						<div className="green green-bg font-14 p-1 pl-2 o-8 d-inline-block">
							<img src={msg} width={24} className="mr-2" /> A link
							to connect{" "}
							{this.state.requestSentData?.integration_name} has
							been sent to {this.state.requestSentData?.to_email}
						</div>
					)}

				<button
					className="btn btn-primary mb-5 NextButton"
					onClick={() =>
						this.props.nextButton(
							this.state.onboarding_step_integrations
						)
					}
					disabled={
						!this.state.onboarding_step_integrations.length &&
						!this.state.skip
					}
					type="button"
				>
					Next
				</button>
			</div>
		);
	}
}
class Step3 extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			sendData: [],
			uploadModalVisible: false,
			progress: 0,
			showConsentModal: false,
			selectedIntegration: {},
			showError: false,
			coWorkerSent: false,
			loading: true,
			onboarding_step_integrations: [],
			loadingInviteToCoworker: false,
			showErrorInSendingInvite: false,
			uploadedFile: {},
			//
			integrationsList: null,
		};
		this.coWorkerEmail = "";
		this.formRef = React.createRef();
		this.onAppIntegrated = this.onAppIntegrated.bind(this);
		this.onAppIntegrationRequestSent =
			this.onAppIntegrationRequestSent.bind(this);
	}
	componentDidMount() {
		fetchIntegrationsService(INTEGRATION_ID.FINANCE_INTEGRATION_ID).then(
			(res) => {
				const integrations = res.map(
					(integration) => new Integration(integration)
				);
				const connectedIntegration = [];
				const invitedIntegrations = [];
				integrations.forEach((integration) => {
					if (integration.connected_accounts > 0) {
						connectedIntegration.push({
							integration_id: integration.id,
							is_integration_successful: true,
						});
					}
					if (integration.num_pending_accounts > 0) {
						invitedIntegrations.push({
							integration_id: integration.id,
							is_integration_invited: true,
						});
					}
				});
				this.setState({
					integrationsList: integrations,
					loading: false,
					onboarding_step_integrations: [
						...this.state.onboarding_step_integrations,
						...connectedIntegration,
						...invitedIntegrations,
					],
				});
				if (invitedIntegrations.length > 0) {
					this.setState({
						skip: true,
					});
				}
			}
		);
		//Segment Implementation
		trackEvent("Step 3: Add Transactions");
	}

	onAppIntegrated(integration) {
		this.setState({
			integrationsList: this.state.integrationsList.map((item) => {
				item.status =
					item.id === integration.id
						? INTEGRATION_STATUS.CONNECTED
						: item.status;
				return item;
			}),
			onboarding_step_integrations: [
				...this.state.onboarding_step_integrations,
				...[
					{
						integration_id: integration.id,
						is_integration_successful: true,
					},
				],
			],
		});
	}

	onAppIntegrationRequestSent(data) {
		this.setState({
			requestSentData: data,
		});
	}

	render() {
		const integrationLists = this.state.integrationsList
			? this.state.integrationsList.map((integration, index) => (
					<IntegrationCard
						onboarding={true}
						blockNavigation={true}
						onSuccess={() => {
							this.onAppIntegrated(integration);
						}}
						onRequestSent={(data) => {
							this.onAppIntegrationRequestSent(data);
						}}
						key={index}
						integration={integration}
					/>
			  ))
			: null;

		if (this.props.currentStep !== 3) {
			return null;
		}
		return (
			<div className="steps__child2" key={this.state.selected5}>
				<div className="steps__child1__d1">Add transactions</div>
				<div className="steps__child2__d2">
					Add transactions to keep track of your SaaS spendings
				</div>
				<div>
					<p className="font-12 grey-1 mt-2">
						<img
							src={lock}
							alt="secured"
							width={11}
							className="mt-n1 mr-1"
						/>{" "}
						Your data security is a priority for{" "}
						{this.context?.partner?.name}. Please read our privacy
						policy & terms of service for more information
					</p>
				</div>
				<div className="steps__child2__d3">
					<div className="d-flex mt-5 flex-wrap">
						{integrationLists ? (
							integrationLists
						) : (
							<IntegrationCardLoader />
						)}
						<div
							onClick={() => {
								if (!this.state.uploadedFile?.name) {
									this.setState({
										selected5: !this.state.selected5,
										uploadModalVisible: true,
									});
								}
							}}
							className="z_i_card text-capitalize text-center border-1 border-radius-4 p-2 pointer mr-3 mb-3"
						>
							<img
								className="mt-1 img-circle"
								width={60}
								height={60}
								src={csv}
							/>
							<h3 className="mt-1 mt-3 font-16 bold-400 black-1 mt-1">
								CSV Upload
							</h3>
							{this.state.uploadedFile?.name ? (
								<div
									className="flex-center"
									style={{ padding: "12px 18px" }}
								>
									<div style={{ flexGrow: 1 }}>
										<div className="d-flex align-items-center">
											<span
												className="font-10 grey-1 mt-1 text-truncate ml-auto mr-auto"
												style={{
													textTransform: "none",
													width: "70%",
												}}
											>
												{this.state.uploadedFile?.name}
											</span>
											<Button
												onClick={(e) => {}}
												className="z_i_btn_success green d-flex"
											>
												<img
													src={success}
													width={20}
													className="mr-2"
												/>
												Uploaded
											</Button>
										</div>
									</div>
								</div>
							) : (
								<Button type="link" className="d-flex">
									<img
										src={add}
										width={11}
										className="mr-2"
									/>{" "}
									Upload
								</Button>
							)}
						</div>
					</div>
				</div>
				{this.state.uploadModalVisible && (
					<UploadTransactionsSidePanel
						setUploadedFile={(fileObj) => {
							this.setState({
								uploadedFile: fileObj,
							});
						}}
						closeUploadTransactions={() =>
							this.setState({ uploadModalVisible: false })
						}
					/>
				)}
				{this.state.requestSentData?.to_email && (
					<div className="green green-bg font-14 p-1 pl-2 o-8 d-inline-block">
						<img src={msg} width={24} className="mr-2" /> A link to
						connect {this.state.requestSentData?.integration_name}{" "}
						has been sent to {this.state.requestSentData?.to_email}
					</div>
				)}

				<div className="d-flex">
					<Button
						disabled={
							!this.state.onboarding_step_integrations.length &&
							!this.state.requestSentData &&
							!this.state.uploadedFile?.name
						}
						className="btn btn-primary ml-0 mr-4 NextButton"
						onClick={() =>
							this.props.nextButton(
								this.state.onboarding_step_integrations
							)
						}
						type="button"
					>
						Next
					</Button>
					<button
						style={{
							marginTop: "40px",
							height: "48px",
						}}
						className="btn btn-link"
						onClick={() =>
							this.props.nextButton(
								this.state.onboarding_step_integrations
							)
						}
						type="button"
					>
						Skip
					</button>
				</div>
			</div>
		);
	}
}

class StepsAllComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currentStep: 1,
			name: "",
			currency: "USD",
			month: "January",
			loading: true,
			errorModalVisible: false,
			isCompanyNameFilled: false,
			selectedAtleastOneInStep2: false,
			selectedAtleastOneInStep3: false,
			showLogsMenu: false,
		};
		this.handleChange = this.handleChange.bind(this);
		this._next = this._next.bind(this);
		this.iconRef = React.createRef();
		this.handleClickOutside = this.handleClickOutside.bind(this);
		this.updateLocalStorage = this.updateLocalStorage.bind(this);
		this.nextButton = this.nextButton.bind(this);
	}

	handleClickOutside(event) {
		if (this.iconRef && !this.iconRef.current.contains(event.target)) {
			this.setState({ showLogsMenu: false });
		}
	}

	componentDidMount() {
		const userInfo = getValueFromLocalStorage("userInfo") || "";
		const { org_onboarding_status } = userInfo;
		if (org_onboarding_status && org_onboarding_status === "completed") {
			this.props.history.push("/newuseroverview");
		}
		if (org_onboarding_status === "step1") {
			this.setState({
				currentStep: 1,
				isCompanyNameFilled: false,
			});
		}
		if (org_onboarding_status === "step2") {
			this.setState({
				currentStep: 2,
				isCompanyNameFilled: true,
			});
		}
		if (org_onboarding_status === "step3") {
			this.setState({
				currentStep: 3,
				isCompanyNameFilled: true,
				selectedAtleastOneInStep2: true,
			});
		}
		this.setState({
			loading: false,
		});
		document.addEventListener("mousedown", this.handleClickOutside);
	}

	componentWillUnmount() {
		document.removeEventListener("mousedown", this.handleClickOutside);
	}

	updateLocalStorage(toStep) {
		let newUserInfo = getValueFromLocalStorage("userInfo");
		newUserInfo.org_onboarding_status = toStep;
		this.props.saveUserInfo(newUserInfo);
	}

	_next(onboarding_step_integrations) {
		let currentStep = this.state.currentStep;
		const orgId = getValueFromLocalStorage("userInfo")?.org_id;
		if (currentStep === 1) {
			step(orgId, 1, {
				org_name: this.state.name,
				org_default_currency: this.state.currency,
				org_start_month: FULL_MONTH.indexOf(this.state.month) + 1,
			}).then((res) => {
				if (res.error) {
					this.setState({
						errorModalVisible: true,
					});
				}
				let newUserInfo = getValueFromLocalStorage("userInfo");
				newUserInfo.org_currency = res?.status?.org_data?.currency;
				this.props.saveUserInfo(newUserInfo);
				this.setState({ isCompanyNameFilled: true });
				currentStep++;
				this.updateLocalStorage("step2");
				this.setState({
					currentStep: currentStep,
				});
			});
		} else {
			step(orgId, currentStep, {
				onboarding_step_integrations,
				onboarding_step_is_skipped: true,
			}).then((res) => {
				this.updateLocalStorage(
					res.status.org_data.org_onboarding_status
				);
				if (res.status.org_data.org_onboarding_status == "completed") {
					window.location.pathname =
						"/onboarding/signinoptions/two-step-verification";
				} else {
					currentStep++;
					this.setState({
						currentStep: currentStep,
					});
				}
			});
		}
	}

	handleChange(event) {
		const { name, value } = event.target;
		if (name == "name") {
			value.length > 0
				? this.setState({ [name]: value, isCompanyNameFilled: true })
				: this.setState({ isCompanyNameFilled: false });
		}
		this.setState({
			[name]: value,
		});
	}

	nextButton() {
		let currentStep = this.state.currentStep;
		// Will be using this only for step1
		return (
			<button
				className="btn btn-primary NextButton"
				type="button"
				onClick={() => this._next()}
				disabled={
					!(currentStep == 1
						? this.state.isCompanyNameFilled
						: this.state.selectedAtleastOneInStep2)
				}
			>
				Next
			</button>
		);
	}

	render() {
		const user = getValueFromLocalStorage("user");

		return (
			<>
				{this.state.loading ? (
					<LoaderPage />
				) : (
					<>
						<Navbar
							bg="white"
							variant="light"
							className="Nav justify-content-end"
						>
							<div
								style={{ position: "relative" }}
								ref={this.iconRef}
								className="mr-2"
							>
								<Navbar.Brand>
									<img
										role="button"
										alt=""
										src={user.picture}
										width="30"
										height="30"
										className="d-inline-block align-top"
										id="profileimage"
										onClick={() => {
											this.setState({
												showLogsMenu: true,
											});
										}}
									/>{" "}
								</Navbar.Brand>
								{this.state.showLogsMenu ? (
									<div
										className="overview__logsbutton__menu menu"
										style={{ height: "fit-content" }}
									>
										<button
											onClick={() => {
												this.props.history.push(
													"/logout"
												);
											}}
										>
											Logout
										</button>
									</div>
								) : null}
							</div>
						</Navbar>
						<hr style={{ margin: "0px 40px" }} />
						<div className="steps__div2">
							{this.state.currentStep <= 3 ? (
								<div className="steps__div2__d1">
									Step {this.state.currentStep} of 3
								</div>
							) : null}
							<hr style={{ margin: "0px" }} />
							<Step1
								currentStep={this.state.currentStep}
								handleChange={this.handleChange}
								name={this.state.name}
								currency={this.state.currency}
								month={this.state.month}
								errorModalVisible={() =>
									this.setState({ errorModalVisible: true })
								}
							/>
							<Step2
								currentStep={this.state.currentStep}
								handleChange={this.handleChange}
								selectedIntegration={() =>
									this.setState({
										selectedAtleastOneInStep2: true,
									})
								}
								errorModalVisible={() =>
									this.setState({ errorModalVisible: true })
								}
								nextButton={this._next}
							/>
							<Step3
								currentStep={this.state.currentStep}
								handleChange={this.handleChange}
								selectedIntegration={() =>
									this.setState({
										selectedAtleastOneInStep3: true,
									})
								}
								errorModalVisible={() =>
									this.setState({ errorModalVisible: true })
								}
								nextButton={this._next}
							/>
							{this.state.currentStep == 1
								? this.nextButton()
								: null}
							<StepsErrorModal
								isOpen={this.state.errorModalVisible}
								handleClose={() =>
									this.setState({ errorModalVisible: false })
								}
							/>
						</div>
					</>
				)}
			</>
		);
	}
}

function mapDispatchToProps(dispatch) {
	return {
		saveUserInfo: (data) =>
			dispatch({ type: SAVE_USER_INFO_OBJECT, payload: data }),
	};
}

export default compose(
	withRouter,
	connect(null, mapDispatchToProps)
)(StepsAllComponent);
