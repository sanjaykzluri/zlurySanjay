import React, { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { Form } from "react-bootstrap";
import {
	checkSpecialCharacters,
	getAppSearchGlobal,
} from "../../../../services/api/search";
import { addCustomApplication } from "../../../../services/api/applications";
import { debounce, unescape } from "../../../../utils/common";
import { client } from "../../../../utils/client";
import {
	AddApps,
	IntegrationAvailableSection,
} from "../../../Applications/AllApps/AddApps";
import imageHeader from "./image-header.svg";

import { mapValueToKeyState } from "../../../../utils/mapValueToKeyState";
import { convertObjToBindSelect } from "../../../../utils/convertDataToBindSelect";
import "./AddApplicationModal.scss";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { SuggestionBar } from "../../../../modules/shared/components/ManualUsage/SuggestionBar/SuggestionBar";
import { MANUAL_USAGE_INTERVAL_ } from "../../../../modules/shared/constants/ManualUsageConstants";
import { NameBadge } from "../../../../common/NameBadge";
import ErrorScreen from "../../../../common/ErrorModal/ErrorScreen";
import { useContext } from "react";
import RoleContext from "services/roleContext/roleContext";
export function AddApplicationModal(props) {
	const [searchResult, setsearchresult] = useState("");
	const [appName, setAppName] = useState("");
	const [appId, setAppId] = useState("");
	const [appImage, setAppImage] = useState("");
	const [loading, setLoading] = useState(true);
	const [showHide, setshowHide] = useState(false);
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const [formErrors, setFormErrors] = useState([]);

	const [interval, setInterval] = useState(MANUAL_USAGE_INTERVAL_.week);

	const [addingNewAppModalOpen, setAddingNewAppModalOpen] = useState(false);
	const [newAppData, setNewAppData] = useState();
	const cancelToken = useRef();
	const { partner } = useContext(RoleContext);
	let intervalOptions = Object.keys(MANUAL_USAGE_INTERVAL_).map((period) => (
		<option key={period} value={period}>
			{period}
		</option>
	));

	const [frequency, setFrequency] = useState(2);
	useEffect(() => {
		if (props.application) {
			updateValueFromModal(
				props.application.app_id,
				props.application.app_name
			);
		}
		return () => {
			setAppName("");
		};
	}, [props.application]);

	let handleChange = (key, value) => {
		try {
			setAppName(value);
			setAppId(null);
			setAppImage(null);
			if (cancelToken.current)
				cancelToken.current.cancel(
					"Operation cancelled in favor of a new request"
				);
			// console.log("Its cancelled");
			cancelToken.current = client.CancelToken.source();
			generateAppSuggestions(value, cancelToken.current);
			if (value.length > 0) {
				setshowHide(true);
				setLoading(true);
			} else {
				setshowHide(false);
			}
		} catch (err) {
			console.log(err);
		}
	};

	const generateAppSuggestions = useCallback(
		debounce((query, reqCancelToken) => {
			if (query && query.length >= 1) {
				if (checkSpecialCharacters(query, true)) {
					setsearchresult({
						results: [],
					});
					setLoading(false);
					return;
				}
				getAppSearchGlobal(query, reqCancelToken).then((res) => {
					setsearchresult(res);
					setLoading(false);
				});
			}
		}, 300)
	);

	const updateValueFromModal = (app_id, app_name, designation, app_image) => {
		setAppId(app_id);
		setAppName(app_name);
		setAppImage(app_image);
	};
	const updateNewAppFromModal = (value) => {
		setAddingNewAppModalOpen(value);
	};
	let addCardClose = () => setshowHide(false);

	const handleSubmit = (application) => {
		setNewAppData(application);
		setSubmitInProgress(true);
		setFormErrors([]);

		let addAppPromise = addCustomApplication(application);
		if (addAppPromise) {
			addAppPromise
				.then((res) => {
					if (res.error) {
						setFormErrors([res.error]);
					} else {
						setAppId(res.org_app_id);
						setAppName(res.org_app_name);
						setAddingNewAppModalOpen(false);
						setFormErrors([]);
					}
					setSubmitInProgress(false);
				})
				.catch((err) => {
					setSubmitInProgress(false);
					if (err.response && err.response.data) {
						setFormErrors(err.response.data.errors);
					}
				});
		}
	};

	const clearModal = () => {
		setshowHide(false);
		setAppName(null);
		setAppId(null);
		setAppImage(null);
		setInterval(MANUAL_USAGE_INTERVAL_.week);
		setFrequency(2);
	};
	// console.log(appImage);
	return (
		<Modal
			show={props.isOpen}
			onClose={() => {
				clearModal();
				props.handleClose();
			}}
			size="md"
			title="Add Application"
			footer={true}
			onOk={async () => {
				await props.handleSubmit({
					app_id: appId,
					frequency,
					interval,
				});
				clearModal();
				props.handleClose();
			}}
			disableOkButton={!appId}
			ok={"Add Application"}
			submitInProgress={props.submitting}
			style={{ height: "488px" }}
		>
			<div className="addTransactionModal__body_upper">
				<div className="d-flex flex-row w-100 pl-3">
					<div>
						<img src={imageHeader}></img>
					</div>
					<div>
						<h4
							className="font-weight-normal p-0 m-0"
							style={{
								fontSize: 14,
								lineHeight: "22px",
							}}
						>
							Automatically add app data with Integrations
						</h4>
						<p
							className="font-weight-normal p-0 m-0"
							style={{
								fontSize: 11,
								lineHeight: "18px",
								color: "#717171",
							}}
						>
							Run your SaaS management on auto-pilot using{" "}
							{partner?.name}
							integrations
						</p>
						<p
							className="font-weight-normal p-0"
							style={{
								fontSize: 13,
								lineHeight: "16.38px",
								marginTop: 6,
								color: "#2266E2",
							}}
						>
							Discover Integrations
						</p>
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
										handleChange("name", e.target.value)
									}
								/>
							</Form.Row>
						</Form.Group>
						<div style={{ position: "relative" }}>
							{showHide ? (
								<SuggestionBar
									loading={loading}
									options={searchResult.results}
									option_id={["app_id", "org_application_id"]}
									option_name="app_name"
									option_image="app_image_url"
									onHide={addCardClose}
									handleSelect={updateValueFromModal}
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
								></SuggestionBar>
							) : null}
						</div>
						{!!appId && (
							<div>
								<div style={{ marginBottom: 11 }}>
									Set usage Frequency
								</div>
								<div className="row d-flex flex-column grow">
									<div
										className="d-flex flex-nowrap align-items-start"
										style={{ paddingLeft: 12 }}
									>
										<div
											className="z__operator__user"
											onClick={() => {
												if (frequency > 1)
													setFrequency(frequency - 1);
											}}
										>
											-
										</div>
										<div className="z__number__user">
											{frequency}
										</div>
										<div
											className="z__operator__user"
											onClick={() => {
												setFrequency(frequency + 1);
											}}
										>
											+
										</div>
										{/* </div> */}
										{/* </div> */}
										{/* <div className="col-md-8"> */}
										<p
											className="z__block-header text-left"
											style={{
												lineHeight: "20px",
												marginLeft: 12,
												marginRight: 12,
											}}
										>
											times every
										</p>
										<Form.Control
											as="select"
											className="cursor-pointer w-50"
											value={interval}
											onChange={(e) => {
												let { value } = e.target;
												mapValueToKeyState(
													setInterval,
													value
												);
											}}
											style={{ height: "40px" }}
										>
											{intervalOptions}
										</Form.Control>
									</div>
								</div>
							</div>
						)}
					</Form>
				</div>
			</div>
			{addingNewAppModalOpen ? (
				<AddApps
					custom={appName}
					handleSubmit={handleSubmit}
					show={addingNewAppModalOpen}
					onHide={() => setAddingNewAppModalOpen(false)}
					submitting={submitInProgress}
					validationErrors={formErrors}
					clearValidationErrors={() => setFormErrors([])}
					style={{ zIndex: "1" }}
				/>
			) : null}
			{formErrors.length > 0 && addingNewAppModalOpen && (
				<ErrorScreen
					isOpen={formErrors.length > 0 && addingNewAppModalOpen}
					closeModal={() => {
						setFormErrors([]);
					}}
					isSuccess={!formErrors.length > 0}
					loading={submitInProgress}
					successMsgHeading={"Successfuly added application"}
					warningMsgHeading={"The application could not be added."}
					warningMsgDescription={
						"An error occured while adding new application. Would you like to retry?"
					}
					retryFunction={() => {
						handleSubmit(newAppData);
					}}
					errors={formErrors}
					entity={"application"}
				/>
			)}
		</Modal>
	);
}

AddApplicationModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	application: PropTypes.object,
	submitting: PropTypes.bool,
	handleClose: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
};
