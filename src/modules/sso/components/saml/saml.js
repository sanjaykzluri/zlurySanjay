import React, { useState } from "react";
import copy from "../../../../assets/icons/copy.svg";
import upload from "../../../../assets/icons/file-upload.svg";
import uploaded from "../../../../assets/icons/file-uploaded.svg";
import { Form, Spinner } from "react-bootstrap";
import { Button } from "UIComponents/Button/Button";
import { getAppKey } from "utils/getAppKey";
import question from "../../../../assets/icons/question-blue.svg";
import deleteIcon from "../../../../assets/deleteIcon.svg";
import "./saml.css";
import { getValueFromLocalStorage } from "utils/localStorage";
import { SSO_OPTION } from "modules/sso/constants/constant";
import { useEffect } from "react";

export function SAML(props) {
	let organisationName = getValueFromLocalStorage("userInfo")?.org_name || "";
	const [formData, setFormData] = useState(
		Object.assign({}, props.connection, {
			name: `saml-${organisationName
				.replace(/[^a-zA-Z]/g, "")
				.toLowerCase()}`,
		})
	);
	const [fileRequiredError, setFileRequiredError] = useState(false);
	const hiddenFileInput = React.useRef(null);
	const [file, setFile] = useState();
	const [showUploadFileBtn, setShowUploadFileBtn] = useState(
		props.connection?.signingCert ? false : true
	);

	useEffect(() => {
		delete formData.signingCert;
	}, []);

	useEffect(() => {}, [formData]);

	const handleOnChange = (e) => {
		setFormData(
			Object.assign({}, formData, {
				[e.target.name]: e.target.value?.trim(),
			})
		);
	};

	const handleFileUpload = (file) => {
		setFile(file);
		setShowUploadFileBtn(false);
		let fileReader = new FileReader();
		fileReader.onloadend = (e) => {
			setFormData(
				Object.assign({}, formData, {
					signingCert: fileReader.result,
				})
			);
			setFileRequiredError(false);
		};
		fileReader.readAsText(file);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (
			!(formData.signingCert || props.connection.signingCert) ||
			showUploadFileBtn
		) {
			setFileRequiredError(true);
			return;
		}
		props.handleSubmit(formData);
	};

	return (
		<>
			<div className="row">
				<div className="col-md-7">
					<div className="sso-settings-sidebar">
						<div className="pt-3 p-2">
							<h4 className="font-14 black-1 bold-600">
								Service provider details
							</h4>
							<p className="font-11 grey">
								Copy the Entity ID and the ACS URL to your
								identity provider
							</p>
							<div className="d-flex flex-column mb-3">
								<label className="font-12 black">ACS URL</label>
								<div className="d-flex">
									<input
										type="text"
										value={`https://${getAppKey(
											"REACT_APP_AUTH0_DOMAIN"
										)}/login/callback?connection=${
											formData.name
										}`}
										disabled
										className="p-2 flex-fill mr-3"
									/>
									<img
										className="pointer border-1 p-2 border-radius-4"
										src={copy}
										onClick={() =>
											navigator.clipboard.writeText(
												`https://${getAppKey(
													"REACT_APP_AUTH0_DOMAIN"
												)}/login/callback?connection=${
													formData.name
												}`
											)
										}
									/>
								</div>
							</div>
							<div className="d-flex flex-column">
								<label className="font-12 black">
									Entity ID
								</label>
								<div className="d-flex">
									<input
										type="text"
										value={`urn:auth0:${getAppKey(
											"REACT_APP_AUTH0_TENNAT"
										)}:${formData.name}`}
										disabled
										className="p-2 flex-fill mr-3"
									/>
									<img
										className="pointer border-1 p-2 border-radius-4"
										src={copy}
										onClick={() =>
											navigator.clipboard.writeText(
												`urn:auth0:${getAppKey(
													"REACT_APP_AUTH0_TENNAT"
												)}:${formData.name}`
											)
										}
									/>
								</div>
							</div>
						</div>
						<div className="p-2">
							<Form
								onSubmit={(e) => {
									handleSubmit(e);
								}}
							>
								<Form.Group>
									<Form.Label>Connection Name</Form.Label>
									<Form.Control
										type="text"
										name="name"
										value={`${formData.name}`}
										disabled
									/>
								</Form.Group>

								<Form.Group>
									<Form.Label>Sign On URL</Form.Label>
									<Form.Control
										type="url"
										name="signInEndpoint"
										value={formData.signInEndpoint}
										onChange={(e) => handleOnChange(e)}
										required
									></Form.Control>
								</Form.Group>

								<Form.Group>
									<Form.Label>
										X509 Signing Certificate
									</Form.Label>
									<div className="upload-sign-cert p-2">
										<div className="background-color-white border-radius-4  p-2">
											<div
												className="d-flex p-3 align-items-center"
												style={{
													border: "1px dashed rgb(0 0 0 / 10%)",
													borderRadius: "4px",
												}}
											>
												<img
													src={
														showUploadFileBtn
															? upload
															: uploaded
													}
													className="mr-3"
												/>
												<div style={{ flex: 1 }}>
													<p className="m-0 font-12 black-1 o-8">
														X509 Signing Certificate{" "}
														{props.connection
															.signInEndpoint &&
															"Added"}
													</p>

													{file && (
														<p className="font-12  primary-color mt-2 mb-0">
															{file.name}{" "}
															<img
																width={10}
																className="pointer ml-2"
																src={deleteIcon}
																onClick={() => {
																	setFile();
																	setShowUploadFileBtn(
																		true
																	);
																	if (
																		hiddenFileInput &&
																		hiddenFileInput.current
																	) {
																		hiddenFileInput.current.value =
																			null;
																	}
																}}
															/>{" "}
														</p>
													)}
													{showUploadFileBtn &&
														!file && (
															<>
																<Button
																	onClick={(
																		e
																	) => {
																		e.preventDefault();
																		hiddenFileInput.current.click();
																	}}
																	type="link"
																	className="p-0 font-13 bold-500"
																>
																	+ Upload
																</Button>
																<input
																	type="file"
																	accept=".pem,.cert"
																	style={{
																		display:
																			"none",
																	}}
																	ref={
																		hiddenFileInput
																	}
																	onChange={(
																		e
																	) =>
																		handleFileUpload(
																			e
																				.target
																				.files[0]
																		)
																	}
																/>
															</>
														)}
												</div>

												{props.connection.signingCert &&
													!showUploadFileBtn &&
													!file && (
														<Button
															onClick={(e) => {
																setShowUploadFileBtn(
																	true
																);
															}}
															type="link"
															className="p-0 font-13 bold-500"
														>
															Remove
														</Button>
													)}
											</div>
										</div>
									</div>
								</Form.Group>
								{fileRequiredError && (
									<p className="font-12 red mb-4">
										Please upload X509 Signing Certificate
									</p>
								)}
								<Button
									btnType="submit"
									disabled={props.isSumbitting}
								>
									{props.isSumbitting ===
									SSO_OPTION.samlp.strategy ? (
										<span className="pl-4 pr-4">
											<Spinner
												size="sm"
												animation="border"
											/>
										</span>
									) : (
										"Save"
									)}
								</Button>
								{props.err && (
									<p className="font-14 red mt-3 mb-1 text-center">
										Something went wrong. Please try again
										later.
									</p>
								)}
							</Form>
						</div>
					</div>
				</div>
				<div className="col-md-5">
					<div
						className="bg-blue border-radius-4 black-1 p-3"
						style={{
							border: "1px solid #5ABAFF",
						}}
					>
						<div className="d-flex align-items-center  mb-2">
							<img src={question} />
							<h4 className="font-12 bold-600 ml-2 m-0">
								How-to Guide
							</h4>
						</div>

						<p className="font-13">
							Configuring SAML connection requires multiple steps
							to be configured in your SAML provider. Please refer
							to the following help articles for the steps.
						</p>
						<ol className="font-13 ">
							<li>
								Please refer to the help article on the link{" "}
								<a
									target="_blank"
									rel="noreferrer"
									href="https://help.zluri.com/en/articles/6458388-how-to-configure-okta-saml-login-for-zluri"
								>
									here
								</a>{" "}
								for steps on how to configure SAML on Okta.
							</li>
							<li>
								Please refer to the{" "}
								<a
									href="https://help.zluri.com/en/articles/6458429-how-to-configure-google-saml-login-for-zluri"
									target="_blank"
									rel="noreferrer"
								>
									help
								</a>{" "}
								article on the link here for steps on how to
								configure SAML on Google.
							</li>
						</ol>
					</div>
				</div>
			</div>
		</>
	);
}
