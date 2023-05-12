import React, { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { Form } from "react-bootstrap";
import { getAppSearchGlobal } from "../../../../services/api/search";
import { addCustomApplication } from "../../../../services/api/applications";
import { debounce } from "../../../../utils/common";
import { client } from "../../../../utils/client";
import { AddApps } from "../../../Applications/AllApps/AddApps";
import imageHeader from "./image-header.svg";

import { mapValueToKeyState } from "../../../../utils/mapValueToKeyState";
import { convertObjToBindSelect } from "../../../../utils/convertDataToBindSelect";
import { SelectOld } from "../../../../UIComponents/SelectOld/Select";
import "./AddApplicationModal.scss";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { SuggestionBar } from "../../../../modules/shared/components/ManualUsage/SuggestionBar/SuggestionBar";
import { MANUAL_USAGE_INTERVAL_ } from "../../../../modules/shared/constants/ManualUsageConstants";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";

export function FilterModal(props) {
	const [searchResult, setsearchresult] = useState("");
	const [appName, setAppName] = useState("");
	const [appId, setAppId] = useState("");
	const [loading, setLoading] = useState(true);
	const [showHide, setshowHide] = useState(false);
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const [formErrors, setFormErrors] = useState([]);

	const [interval, setInterval] = useState(MANUAL_USAGE_INTERVAL_.week);

	const [addingNewAppModalOpen, setAddingNewAppModalOpen] = useState(false);
	const cancelToken = useRef();
	const intervalOptions = convertObjToBindSelect(MANUAL_USAGE_INTERVAL_);

	const [frequency, setFrequency] = useState(2);
	const { partner } = useContext(RoleContext);
	useEffect(() => {
		if (props.application) {
			updateValureFromModal(
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
				getAppSearchGlobal(query, reqCancelToken).then((res) => {
					setsearchresult(res);
					setLoading(false);
				});
			}
		}, 300)
	);

	const updateValureFromModal = (app_id, app_name) => {
		setAppId(app_id);
		setAppName(app_name);
	};
	const updateNewAppFromModal = (value) => {
		setAddingNewAppModalOpen(value);
	};
	let addCardClose = () => setshowHide(false);
	const handleSubmit = (application) => {
		setSubmitInProgress(true);
		setFormErrors([]);
		let errors = validateCustomApp(application);
		if (errors.length > 0) {
			setFormErrors(errors);
			setSubmitInProgress(false);
			return;
		}
		let addAppPromise = addCustomApplication(application);
		if (addAppPromise) {
			addAppPromise
				.then((res) => {
					if (res.error)
						throw "Server returned error object instead of response";

					setAppId(res.org_app_id);
					setAppName(res.org_app_name);
					setAddingNewAppModalOpen(false);
					setFormErrors([]);
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

	const validateCustomApp = (application) => {
		const requiredFields = [
			"app_name",
			"app_small_description",
			"app_description",
			"app_category_id",
		];
		let errors = [];

		requiredFields.forEach((field) => {
			if (!application[field]) {
				errors.push({
					value: application[field],
					msg: `Please enter a valid ${field}`,
					param: field,
				});
			}
		});

		return errors;
	};
	return (
		<Modal
			show={props.isOpen}
			onClose={props.handleClose}
			size="md"
			title="Add Application"
			footer={true}
			onOk={async () => {
				await props.handleSubmit({
					app_id: appId,
					frequency,
					interval,
				});
			}}
			disableOkButton={!appId}
			ok={"Add Application"}
			submitInProgress={props.submitting}
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
								Select Filters
							</Form.Label>
							<Form.Control
								style={{ width: "100%" }}
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
									handleSelect={updateValureFromModal}
									handleNew={updateNewAppFromModal}
									showAddButton={true}
									addTitle={"Add New Application"}
								></SuggestionBar>
							) : null}
						</div>
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
								<SelectOld
									value={intervalOptions.find(
										(res) => res.value === interval
									)}
									style={{
										width: "125px",
										height: "40px",
									}}
									classNames="flex-fill"
									options={intervalOptions}
									isSearchable={false}
									onSelect={(v) =>
										mapValueToKeyState(setInterval, v.value)
									}
								/>
							</div>
						</div>
					</Form>
				</div>
			</div>
		</Modal>
	);
}
