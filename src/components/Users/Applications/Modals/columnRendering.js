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
import "./AddApplicationModal.scss";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { SuggestionBar } from "../../../../modules/shared/components/ManualUsage/SuggestionBar/SuggestionBar";
import { MANUAL_USAGE_INTERVAL_ } from "../../../../modules/shared/constants/ManualUsageConstants";
export function ColumnRenderingModal(props) {
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
		const requiredFields = ["app_name", "app_category_id"];
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
			<h1>Sort listing using drag & drop</h1>
			<ul id="sortable">
				<li class="ui-state-default" id="1">
					<span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Item 1
				</li>
				<li class="ui-state-default" id="2">
					<span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Item 2
				</li>
				<li class="ui-state-default" id="3">
					<span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Item 3
				</li>
				<li class="ui-state-default" id="4">
					<span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Item 4
				</li>
				<li class="ui-state-default" id="5">
					<span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Item 5
				</li>
				<li class="ui-state-default" id="6">
					<span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Item 6
				</li>
				<li class="ui-state-default" id="7">
					<span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Item 7
				</li>
			</ul>

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
		</Modal>
	);
}

// AddApplicationModal.propTypes = {
// 	isOpen: PropTypes.bool.isRequired,
// 	application: PropTypes.object,
// 	submitting: PropTypes.bool,
// 	handleClose: PropTypes.func.isRequired,
// 	handleSubmit: PropTypes.func.isRequired,
// };
