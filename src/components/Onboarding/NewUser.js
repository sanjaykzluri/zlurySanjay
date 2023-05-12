import React, { useState, Component } from "react";
import "./Onboarding.css";
import { Sidebar } from "../Sidebar/Sidebar";
import { HeaderNav } from "../";
import sand from "./sand.svg";
import back1 from "./back1.svg";
import back2 from "./back2.svg";
import back3 from "./back3.svg";
import back4 from "./back4.svg";
import play from "./play.svg";
import { client } from "../../utils/client";
import importTeam from "./importTeam.svg";
import importTransactions from "./importTransactions.svg";
import orgCreated from "./orgCreated.svg";
import { integration as integrationAPI } from "../../utils/integration";
import CircularProgress from "./CircularProgress";
import { fetchIntegrationsService } from "../../modules/integrations/service/api";
import { INTEGRATION_ID } from "../../modules/integrations/constants/constant";
import { TriggerIssue } from "../../utils/sentry";
import HeaderTitleBC from "../HeaderTitleAndGlobalSearch/HeaderTitleBC";
import RoleContext from "services/roleContext/roleContext";
import { getValueFromLocalStorage } from "utils/localStorage";

export class NewUser extends React.Component {
	static contextType = RoleContext;
	constructor(props) {
		super(props);
		this.state = {
			importedTeam: {
				isConnected: false,
				showError: false,
				isLoading: false,
			},
			importedTransactions: {
				isConnected: false,
				showError: false,
				isLoading: false,
			},
			SSO: [],
			Finance: [],
		};
		this.retryResendingInvite = this.retryResendingInvite.bind(this);
	}
	componentDidMount() {
		setTimeout(() => {
			const user = getValueFromLocalStorage("user");
			client
				.post("/auth/authorize2", {
					email: user.email,
					name: user.name,
				})
				.then((res) => {
					const { userInfo } = res.data;
					const { org_status } = userInfo;
					if (org_status === "active") {
						window.location = "/overview";
					}
				});
		}, 15000);

		fetchIntegrationsService(INTEGRATION_ID.FINANCE_INTEGRATION_ID).then(
			(res) => {
				this.setState({
					Finance: [
						...this.state.Finance,
						...res.map((integration) =>
							Object.assign(
								{},
								{
									integration_id: integration.integration_id,
									is_integration_successful:
										integration.integration_status ===
											"connected" || false,
								}
							)
						),
					],
					loading: false,
				});
			}
		);

		fetchIntegrationsService(INTEGRATION_ID.SSO_INTEGRATION_ID).then(
			(res) => {
				this.setState({
					SSO: [
						...this.state.SSO,
						...res.map((integration) =>
							Object.assign(
								{},
								{
									integration_id: integration.integration_id,
									is_integration_successful:
										integration.integration_status ===
											"connected" || false,
								}
							)
						),
					],
					loading: false,
				});
			}
		);

		//Segment Implementation
		window.analytics.page("Overview", "Setting up Zluri", {
			orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
			orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
		});
	}

	retryResendingInvite(category, responsibility) {
		const requestedIntegration = this.state[responsibility];
		const integrationsByCategory = this.state[category];
		requestedIntegration.isLoading = true;
		this.setState({ [responsibility]: requestedIntegration });

		integrationsByCategory.forEach((integration) => {
			const data = {
				org_id: getValueFromLocalStorage("userInfo")?.org_id,
				integration_id: integration.integration_id,
			};
			integrationAPI
				.post("/invite/resend", data)
				.then((res) => res.data)
				.then((res) => {
					const requestedIntegration = this.state[responsibility];
					if (res.statusCode == 202) {
						requestedIntegration.isConnected = true;
					} else {
						requestedIntegration.showError = true;
					}
					requestedIntegration.isLoading = false;
					this.setState({ [responsibility]: requestedIntegration });
				})
				.catch((err) => {
					TriggerIssue(
						"Error on sending invite resend on new user overview page",
						err
					);
					const requestedIntegration = this.state[responsibility];
					requestedIntegration.showError = true;
					requestedIntegration.isLoading = false;
					this.setState({ [responsibility]: requestedIntegration });
				});
		});
	}
	render() {
		return (
			<>
				<Sidebar>
					<HeaderTitleBC
						title={`Setting up ${this.context?.partner?.name}`}
					/>
					<hr style={{ margin: "0px 40px" }} />
					<div
						className="d-flex pt-3 pb-4"
						style={{ backgroundColor: "#F9F9F9" }}
					>
						<CircularProgress
							value={100}
							heading={"Created your Organization"}
							description={`Your Organization has been created on ${this.context?.partner?.name}`}
							status={1}
							fillImage={
								<img
									src={orgCreated}
									style={{ width: "85%" }}
									alt="orgCreated"
									className="m-auto"
								></img>
							}
						></CircularProgress>
						<CircularProgress
							value={
								this.state.importedTeam.isConnected ? 100 : 80
							}
							heading={"Import your Team"}
							description={
								this.state.importedTeam.isConnected
									? `We've successfully added your team to ${this.context?.partner?.name}`
									: `A request has been sent to mithun@zluri.com to connect ${this.context?.partner?.name} with Google`
							}
							status={
								this.state.importedTeam.isConnected
									? 1
									: this.state.importedTeam.showError
									? 0
									: null
							}
							buttonName={"Resend Request"}
							isLoading={this.state.importedTeam.isLoading}
							func={() =>
								this.retryResendingInvite("SSO", "importedTeam")
							}
							fillImage={
								<img
									src={importTeam}
									style={{ width: "90%" }}
									alt="orgCreated"
									className="m-auto"
								></img>
							}
						></CircularProgress>
						<CircularProgress
							value={
								this.state.importedTransactions.isConnected
									? 100
									: 80
							}
							heading={"Import your Transactions"}
							description={
								this.state.importedTransactions.isConnected
									? `We’ve successfully added your transactions to ${this.context?.partner?.name}`
									: "Something went wrong while importing your transactions from Quickbooks"
							}
							status={
								this.state.importedTransactions.isConnected
									? 1
									: this.state.importedTransactions.showError
									? 0
									: null
							}
							buttonName={"Retry"}
							isLoading={
								this.state.importedTransactions.isLoading
							}
							func={() =>
								this.retryResendingInvite(
									"Finance",
									"importedTransactions"
								)
							}
							fillImage={
								<img
									src={importTransactions}
									style={{ width: "85%" }}
									alt="orgCreated"
									className="m-auto"
								></img>
							}
						></CircularProgress>
					</div>
					<div style={{ padding: "0px 40px" }}>
						<div className="nu__d3">
							Learn More about ${this.context?.partner?.name}
						</div>
						<div className="nu__d4">
							Quick tips and tricks to start you off
						</div>
						<div className="nu__d5">
							<div className="nu__d5__div">
								<div
									className="nu__d5__div__box"
									style={{ background: "#6967E0" }}
								>
									<img
										src={back1}
										style={{
											width: "100%",
											height: "100%",
										}}
									/>
									<div className="nu__d5__div__box__text">
										Getting Started with{" "}
										{this.context?.partner?.name}
									</div>
									<button className="nu__d5__div__box__btn">
										<img src={play}></img>
									</button>
								</div>
								<div className="nu__d5__div__text1">
									Starting off with{" "}
									{this.context?.partner?.name}
								</div>
								<div className="nu__d5__div__text2">
									Quick tips and tricks to help you master
									{this.context?.partner?.name} and SaaS spend
									tracking
								</div>
							</div>
							<div className="nu__d5__div">
								<div
									className="nu__d5__div__box"
									style={{ background: "#5CAF53" }}
								>
									<img
										src={back2}
										style={{
											width: "100%",
											height: "100%",
										}}
									/>
									<div className="nu__d5__div__box__text">
										{this.context?.partner?.name}{" "}
										Recommendations
									</div>
									<button className="nu__d5__div__box__btn">
										<img src={play} />
									</button>
								</div>
								<div className="nu__d5__div__text1">
									{this.context?.partner?.name}{" "}
									Recommendations
								</div>
								<div className="nu__d5__div__text2">
									Get recommendations that'll help your team
									optimize SaaS spendings
								</div>
							</div>
							<div className="nu__d5__div">
								<div
									className="nu__d5__div__box"
									style={{ background: "#FFB169" }}
								>
									<img
										src={back3}
										style={{
											width: "100%",
											height: "100%",
										}}
									/>
									<div className="nu__d5__div__box__text">
										Transactions
									</div>
									<button className="nu__d5__div__box__btn">
										<img src={play} />
									</button>
								</div>
								<div className="nu__d5__div__text1">
									Adding Transactions to{" "}
									{this.context?.partner?.name}
								</div>
								<div className="nu__d5__div__text2">
									Learn how to add transactions, archive
									unnecessary transactions
								</div>
							</div>
							<div className="nu__d5__div">
								<div
									className="nu__d5__div__box"
									style={{ background: "#FF6767" }}
								>
									<img
										src={back4}
										style={{
											width: "100%",
											height: "100%",
										}}
									/>
									<div className="nu__d5__div__box__text">
										Adding Integrations
									</div>
									<button className="nu__d5__div__box__btn">
										<img src={play} />
									</button>
								</div>
								<div className="nu__d5__div__text1">
									Adding Integrations
								</div>
								<div className="nu__d5__div__text2">
									Connect with other apps to make the most out
									of {this.context?.partner?.name}
								</div>
							</div>
							<div className="nu__d5__div">
								<div
									className="nu__d5__div__box"
									style={{ background: "#2266E2" }}
								>
									<img
										src={back1}
										style={{
											width: "100%",
											height: "100%",
										}}
									/>
									<div className="nu__d5__div__box__text">
										Custom Reminders
									</div>
									<button className="nu__d5__div__box__btn">
										<img src={play} />
									</button>
								</div>
								<div className="nu__d5__div__text1">
									Custom Reminders
								</div>
								<div className="nu__d5__div__text2">
									Add custom reminders for renewals and never
									miss a payment again
								</div>
							</div>
							<div className="nu__d5__div" />
						</div>
					</div>
				</Sidebar>
			</>
		);
	}
}
