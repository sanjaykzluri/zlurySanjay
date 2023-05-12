import React, { useState, useEffect } from "react";
import { fetchTrustedDomains } from "services/api/settings";
import "./SSO.css";
import { Helmet } from "react-helmet";
import { useSelector } from "react-redux";
import { Form, Spinner } from "react-bootstrap";
import { Button } from "UIComponents/Button/Button";
import { getAppKey } from "utils/getAppKey";
import {
	createConnection,
	editConnection,
	getAllConnections,
} from "modules/sso/service/api";
import { LoaderPage } from "common/Loader/LoaderPage";
import ToggleSwitch from "react-switch";
import { SSO_OPTION } from "../../constants/constant";
import { SAML } from "modules/sso/components/saml/saml";
import { GoogleSSO } from "modules/sso/components/google/google";
import { TriggerIssue } from "utils/sentry";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";
import { getValueFromLocalStorage } from "utils/localStorage";

export function SSO() {
	const orgName = useSelector((state) => state.userInfo.org_name);
	let [trustedDomains, setTrustedDomains] = useState();
	const [isLoading, setIsLoading] = useState(true);
	const [isSumbitting, setIsSumbitting] = useState(false);
	const [isEnabling, setIsEnabling] = useState();
	const [connections, setConnections] = useState([]);
	const [selectedSSO_Option, setSelectedSSO_Option] = useState();
	const [enabledDomains, setEnabledDomains] = useState([]);
	const { partner } = useContext(RoleContext);
	const [err, setErr] = useState(null);

	const getAllSSOConnections = async () => {
		let isConnectionEnabled = false;
		let domains = trustedDomains;
		if (!domains) {
			let response = await fetchTrustedDomains();
			domains = response.data.domains;
			setTrustedDomains(response.data.domains);
		}
		getAllConnections()
			.then((res) => {
				if (Array.isArray(res)) {
					const connections = Object.keys(SSO_OPTION).map(
						(option) => {
							let data = {};
							res.forEach((item) => {
								if (
									item.strategy ===
									SSO_OPTION[option].strategy
								) {
									data = item;
								}
								if (item.is_enabled) {
									isConnectionEnabled = true;
									setEnabledDomains(item.domain_aliases);
								}
							});
							return Object.assign({}, SSO_OPTION[option], data);
						}
					);
					setConnections(connections);
				} else {
					setConnections(res);
					setSelectedSSO_Option(null);
				}
				setIsLoading(false);
				if (!isConnectionEnabled) {
					setEnabledDomains(
						domains.map((item) => item.domain_name?.toLowerCase())
					);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	useEffect(() => {
		getAllSSOConnections();
	}, []);

	const onChangeDomainAliasChecked = (e, domain) => {
		const domainsAdded = [...enabledDomains];
		const index = getCheckStatus(domain, true);
		if (!e.target.checked) {
			domainsAdded.splice(index, 1);
		} else {
			domainsAdded.push(domain.domain_name?.toLowerCase());
		}
		setEnabledDomains(domainsAdded);
	};

	const handleSubmit = (formData) => {
		setErr(null);
		formData.domain_aliases = enabledDomains;
		setIsSumbitting(formData.strategy);
		if (formData.connection_id) {
			editConnection(formData._id, formData)
				.then((res) => {
					const data = [...connections];
					const index = data.findIndex(
						(connection) => connection._id === res._id
					);
					data.splice(
						index,
						1,
						Object.assign({}, SSO_OPTION[res["strategy"]], res)
					);
					setConnections(data);
					setSelectedSSO_Option(null);
				})
				.catch((err) => {
					setErr(err);
					TriggerIssue("SSO error while edting connection", err);
				})
				.finally(() => {
					setIsEnabling();
					setIsSumbitting();
				});
		} else {
			createConnection(formData)
				.then((res) => {
					setSelectedSSO_Option(null);
					getAllSSOConnections();
				})
				.catch((err) => {
					setErr(err);
					TriggerIssue("SSO error while creating connection", err);
				})
				.finally(() => {
					setIsSumbitting();
				});
		}
	};

	const getCheckStatus = (domain, returnIndex = false) => {
		const index = enabledDomains.findIndex(
			(alias) =>
				alias?.toLowerCase() === domain.domain_name?.toLowerCase()
		);
		if (returnIndex) {
			return index;
		} else return index < 0 ? false : true;
	};

	const onEditConnection = (connection) => {
		setErr(null);
		switch (connection.strategy) {
			case SSO_OPTION.samlp.strategy:
				setSelectedSSO_Option(SSO_OPTION.samlp);
				break;
			case SSO_OPTION["google-apps"].strategy:
				setSelectedSSO_Option(SSO_OPTION["google-apps"]);
				break;
			default:
				setSelectedSSO_Option(null);
		}
	};

	const enableConnection = (connection, flag) => {
		setIsEnabling(connection.strategy);
		editConnection(connection._id, { is_enabled: flag, type: "enable" })
			.then((res) => {
				if (res.is_enabled) {
					setEnabledDomains(res.domain_aliases);
				}
				const data = [...connections];
				const index = data.findIndex(
					(connection) => connection._id === res._id
				);
				data.splice(
					index,
					1,
					Object.assign({}, SSO_OPTION[res["strategy"]], res)
				);
				setConnections(data);
			})
			.catch((err) => {
				TriggerIssue("SSO error while enabling connection", err);
			})
			.finally(() => {
				setIsEnabling();
			});
	};

	const samlOptions = connections.map((connection, index) => (
		<li
			className={connection.available ? "mb-2" : "mb-2 not-available"}
			key={index}
		>
			<div className="d-flex align-items-center mb-3 justify-content-between">
				<div
					className={
						connection.available
							? "d-flex align-items-center p-2 pointer"
							: "d-flex align-items-center p-2 "
					}
					onClick={() => {
						if (connection.available) onEditConnection(connection);
					}}
				>
					<img width={36} src={connection.image} />
					<div className="d-inline-block">
						<p className="font-15 bold-500 m-0 ml-2 mr-3 text-uppercase">
							{connection.connectionName}
							{!connection.available && (
								<span className="coming-soon ml-2">
									Coming soon
								</span>
							)}
						</p>
						<p
							className="font-10 grey ml-2 mb-0"
							style={{ maxWidth: "420px" }}
						>
							{connection.description}
						</p>
					</div>
				</div>
				{connection.available && (
					<div className="d-flex align-items-center p-2">
						{/* <Button
						className="mr-3 font-10"
						onClick={() => {
							onEditConnection(connection);
						}}
						type="reverse"
					>
						Edit Connection
					</Button> */}
						{connection.is_enabled && (
							<a
								style={{
									background: "#2266e2",
									border: "1px solid #2266E2",
									padding: "10px 15px",
								}}
								target="_blank"
								rel="noreferrer"
								className="btn btn-primary font-10"
								href={`https://${getAppKey(
									"REACT_APP_AUTH0_DOMAIN"
								)}/authorize?client_id=${getAppKey(
									"REACT_APP_AUTH0_CLIENT_ID"
								)}&response_type=code&connection=${
									connection.name
								}&prompt=login&scope=openid%20profile&redirect_uri=${
									window.location.origin
								}`}
							>
								Test Connection
							</a>
						)}
						{connection._id && (
							<div className="ml-3 d-flex align-items-center">
								{connection.is_enabled ? (
									<span className="green font-13 mr-2">
										Enabled
									</span>
								) : (
									<span className="font-13 mr-2">Enable</span>
								)}
								<ToggleSwitch
									height={20}
									width={35}
									checked={connection.is_enabled}
									onChange={(v) => {
										enableConnection(connection, v);
									}}
									checkedIcon={false}
									uncheckedIcon={false}
									onColor={"#5fcf64"}
									offColor={"#EBEBEB"}
								/>
								{isEnabling === connection.strategy && (
									<span className="ml-2">
										<Spinner
											size="sm"
											animation="border"
											variant="primary"
										/>
									</span>
								)}
							</div>
						)}
					</div>
				)}
			</div>
			{connection.strategy === SSO_OPTION.samlp.strategy &&
				connection.strategy === selectedSSO_Option?.strategy && (
					<SAML
						connection={connection}
						handleSubmit={(data) => handleSubmit(data)}
						isSumbitting={isSumbitting}
						err={err}
					/>
				)}
			{connection.strategy === SSO_OPTION["google-apps"].strategy &&
				connection.strategy === selectedSSO_Option?.strategy && (
					<GoogleSSO
						connection={connection}
						handleSubmit={(data) => handleSubmit(data)}
						isSumbitting={isSumbitting}
						err={err}
					/>
				)}
		</li>
	));

	return (
		<>
			<Helmet>
				<title>
					{"SSO - " +
						orgName +
						" - " +
						getValueFromLocalStorage("partner")?.name}
				</title>
			</Helmet>
			{isLoading ? (
				<LoaderPage />
			) : (
				<div className="sso-settings p-4">
					<h3 className="font-18 black-1 bold-500">
						Single Sign-On (SSO)
					</h3>
					<p className="font-11 grey">
						Setup single sign-on for your organization. Your team
						members will be required to sign in via SSO to access
						{partner?.name}.
					</p>

					<div className="mt-4">
						<h4 className="font-14 black-1 bold-600">
							Verified Domains
						</h4>
						<p className="font-11 grey">
							The list of trusted domains identified from your
							SSO.
						</p>
						<Form>
							<table className="mb-0 w-80 border-radius-4">
								<thead>
									<tr className="font-11 grey-1">
										<th className="font-11 grey-1 p-2">
											Domain
										</th>
									</tr>
								</thead>
								<tbody
									style={{ width: "100%" }}
									id="scrollRoot"
								>
									{trustedDomains &&
										enabledDomains.length > 0 &&
										trustedDomains.map((domain, key) => (
											<tr key={key}>
												<td className="p-2 d-flex align-content align-items-center">
													{/* <Form.Check
														className=" mr-2 pt-1"
														type="checkbox"
														name="domain.domain_name"
														defaultChecked={getCheckStatus(
															domain
														)}
														onChange={(e) => {
															onChangeDomainAliasChecked(
																e,
																domain
															);
														}}
													/> */}

													<span className="black-1 font-11 flex-fill">
														{domain.domain_name}
													</span>
													{domain.is_verified && (
														<span className="float-right font-10 green">
															Verified
														</span>
													)}
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</Form>
					</div>

					<div className="mt-4">
						<h4 className="font-14 black-1 bold-600">
							Single Sign On
						</h4>
						<p className="font-11 grey mb-4">
							Setup single sign-on for your organization. Your
							team members will be required to sign in via SSO to
							access {partner?.name}.
						</p>
						<div className="sso-connections">
							<h4 className="font-14 black-1 bold-600 mb-3">
								Identitiy Provider
							</h4>
							<ul className="d-flex flex-column list-style-none p-0 sso-options">
								{samlOptions}
							</ul>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
