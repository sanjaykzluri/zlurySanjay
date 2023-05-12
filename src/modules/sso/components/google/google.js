import React, { useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import { Button } from "UIComponents/Button/Button";
import question from "../../../../assets/icons/question-blue.svg";
import "./google.css";
import { getValueFromLocalStorage } from "utils/localStorage";
import { SSO_OPTION } from "modules/sso/constants/constant";
import { useContext } from "react";
import RoleContext from "services/roleContext/roleContext";

export function GoogleSSO(props) {
	const partner = useContext(RoleContext);
	let organisationName = getValueFromLocalStorage("userInfo")?.org_name || "";
	const [formData, setFormData] = useState(
		Object.assign({}, props.connection, {
			name: `google-${organisationName
				.replace(/[^a-zA-Z]/g, "")
				.toLowerCase()}`,
		})
	);

	const handleOnChange = (e) => {
		setFormData(
			Object.assign({}, formData, {
				[e.target.name]: e.target.value?.trim(),
			})
		);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
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
									<Form.Label>Client ID</Form.Label>
									<Form.Control
										type="text"
										name="client_id"
										value={formData.client_id}
										onChange={(e) => handleOnChange(e)}
										required
									></Form.Control>
								</Form.Group>

								<Form.Group>
									<Form.Label>Client Secret</Form.Label>
									<Form.Control
										type="text"
										name="client_secret"
										value={formData.client_secret}
										onChange={(e) => handleOnChange(e)}
										required
									></Form.Control>
								</Form.Group>
								<Button
									btnType="submit"
									disabled={props.isSumbitting}
								>
									{props.isSumbitting ===
									SSO_OPTION["google-apps"].strategy ? (
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
							Configuring Google SSO for {partner?.name} requires
							multiple steps to be performed in {partner?.name}{" "}
							interface as well as Google Cloud Console.
						</p>
						<ol className="font-13 ">
							<li>
								Please refer to the link{" "}
								<a
									target="_blank"
									rel="noreferrer"
									href="https://help.zluri.com/en/articles/6551969-how-to-configure-google-sso-for-zluri"
								>
									here
								</a>{" "}
								to go through the steps.
							</li>
						</ol>
					</div>
				</div>
			</div>
		</>
	);
}
