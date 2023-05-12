import React, { useEffect, useState, useRef } from "react";
import { Spinner, Form } from "react-bootstrap";
import cancel from "components/Applications/Overview/cancel.svg";
import completeiconimg from "components/Applications/Overview/completeicon.svg";
import acceptbutton from "components/Applications/Overview/acceptbutton.svg";
import { currencyOptions } from "constants/currency";
import { useOutsideClickListener } from "utils/clickListenerHook";
import { AsyncTypeahead } from "common/Typeahead/AsyncTypeahead";
import { searchApplicationLicenseSuggestions } from "services/api/licenses";
import { getEditLicenseRequestPayload } from "../utils/employeeUtils";
export function LicenseCostEditComponent({
	data,
	setData,
	handleEditState,
	index,
	updateFunc,
	comp = "cost",
	handleDataSet,
}) {
	const [reqBody, setReqBody] = useState();
	const editFieldRef = useRef();
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	useEffect(() => {
		if (data) {
			setReqBody(data);
		}
	}, [data]);

	const getReqBody = () => {
		if (comp === "name") {
			return { license_name: reqBody.license_name, type: "license" };
		}
		if (comp === "cost") {
			return {
				cost_per_item: {
					currency: reqBody.currency,
					amount: reqBody.license_cost,
					complete_term: false,
					frequency: 1,
					period: reqBody.per_license_term,
				},
				type: "license",
			};
		}
	};

	const onSuccess = () => {
		let tempData = JSON.parse(JSON.stringify(data));
		if (comp === "name") {
			tempData.license_name = reqBody.license_name;
		}

		if (comp === "cost") {
			tempData.license_cost = reqBody.license_cost;
			tempData.currency = reqBody.currency;
			tempData.per_license_term = reqBody.per_license_term;
		}
		setData(tempData);
		handleDataSet(tempData);
	};

	const handleSave = () => {
		setSubmitting(true);
		updateFunc(getReqBody(), reqBody._id)
			.then((res) => {
				if (res.error) {
					console.error(
						"Error updating application owner:",
						res.error
					);
				}
				onSuccess();
				setSubmitting(false);
				setSubmitted(true);
				setTimeout(() => {
					setSubmitted(false);
					handleEditState();
				}, 300);
			})
			.catch((err) => {
				console.error("Error updating application owner:", err);
				setSubmitting(false);
				setSubmitted(true);
				setTimeout(() => {
					setSubmitted(false);
				}, 300);
			});
	};

	const handleSingleLicenseEdit = (value, key, index) => {
		if (typeof value === "string") {
			value = value?.trimStart();
		}
		if (typeof value === "number") {
			if (value < 0) {
				value = 0;
			}
		}
		setReqBody({ ...reqBody, license_name: value });
	};
	const renderUI = () => {
		switch (comp) {
			case "cost":
				return (
					<>
						<div className="license_cost_edit_fields">
							<select
								className="border-0 license_cost_edit_fields_currency"
								as="select"
								onChange={(e) => {
									setReqBody({
										...reqBody,
										currency: e.target.value,
									});
								}}
								value={reqBody?.currency}
							>
								{currencyOptions}
							</select>
							<hr className="vertical-line"></hr>
							<input
								className={` license_cost_edit_fields_cost`}
								placeholder="Cost"
								type="number"
								value={reqBody?.license_cost}
								onChange={(e) => {
									setReqBody({
										...reqBody,
										license_cost: e.target.value,
									});
								}}
							/>
							<hr className="vertical-line"></hr>
							<select
								className="border-0 license_cost_edit_fields_term"
								as="select"
								onChange={(e) => {
									setReqBody({
										...reqBody,
										per_license_term: e.target.value,
									});
								}}
								value={reqBody?.per_license_term}
							>
								<option value="months">per month</option>
								<option value="years">per year</option>
							</select>
						</div>
					</>
				);
			case "name":
				return (
					<AsyncTypeahead
						key={reqBody?.app_id}
						fetchFn={(query) =>
							searchApplicationLicenseSuggestions(
								reqBody?.app_id,
								query
							)
						}
						defaultValue={reqBody?.license_name}
						typeaheadInputClass="request-license-edit-fields-background"
						className="mt-3 request-license-edit-fields-background"
						keyFields={{
							value: "value",
							title: "title",
						}}
						// requiredValidation={true}
						hideNoResultsText={true}
						allowFewSpecialCharacters={true}
						placeholder="Select License"
						onSelect={(selection) =>
							handleSingleLicenseEdit(selection.value, "name")
						}
						onChange={(value) => {
							handleSingleLicenseEdit(value, "name");
						}}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<>
			<div
				ref={editFieldRef}
				className="overview__middle__topconttext2__EditCategory align-items-center "
				style={{ height: "45px", width: "fit-content" }}
			>
				{renderUI()}

				{submitting && (
					<div className="d-flex align-items-center mr-2">
						<Spinner
							animation="border"
							variant="light"
							bsPrefix="my-custom-spinner"
							className="my-custom-spinner"
						/>
					</div>
				)}
				{submitted && (
					<div className="d-flex align-items-center mr-2">
						<img src={completeiconimg} />
					</div>
				)}
				{!submitting && !submitted && (
					<>
						<button
							onClick={handleEditState}
							className="overview__middle__topconttext2__EditCategory__button1 mr-1"
						>
							<img src={cancel} />
						</button>
						<button
							className="overview__middle__topconttext2__EditCategory__button2"
							onClick={handleSave}
						>
							<img src={acceptbutton}></img>
						</button>
					</>
				)}
			</div>
		</>
	);
}
