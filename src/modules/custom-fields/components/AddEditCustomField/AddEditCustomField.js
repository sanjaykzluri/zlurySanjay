import React, { useEffect, useState } from "react";
import { Button } from "../../../../UIComponents/Button/Button";
import { CUSTOM_FIELD_ENTITY_LIST, FIELD_TYPE } from "../../constants/constant";
import "./AddEditCustomField.css";
import deleteIcon from "../../../../assets/icons/delete.svg";
import deleteBlue from "../../../../assets/icons/delete-blue.svg";
import add from "../../../../assets/icons/plus-blue.svg";
import { mapValueToKeyState } from "../../../../utils/mapValueToKeyState";
import { CustomField, CustomFieldEdit } from "../../model/model";
import { Spinner } from "react-bootstrap";
import { Select } from "UIComponents/Select/Select";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import arrowdropdown from "assets/arrowdropdown.svg";
import { searchIntegrationsAuditlogs } from "services/api/search";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";
import { getOrgIntegrationSchema } from "modules/integrations/service/api";
import { TriggerIssue } from "utils/sentry";
import { HeaderFormatter } from "modules/licenses/utils/LicensesUtils";
import { Beta } from "modules/shared/components/BetaTagAndModal/Beta/beta";

export function AddEditCustomField(props) {
	const [field, setField] = useState(props.field);
	const [isValidated, setIsValidated] = useState(false);
	const [showWarning, setShowWarning] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [zluriEntity, setZluriEntity] = useState();
	const [loadingSchema, setLoadingSchema] = useState(false);

	const [integration, setIntegration] = useState(
		field?.integration ? field.integration : null
	);
	const [dataKey, setDataKey] = useState(
		field?.org_integration_custom_path
			? field.org_integration_custom_path
			: ""
	);
	const [integrationSchema, setIntegrationSchema] = useState({});

	const customFields = props.customFields[props.field.of];
	let customFieldNames = customFields?.map((cf) => {
		if (props.field.name !== cf.name) {
			return cf.name;
		}
	});
	const indexOfCustomField = customFields?.indexOf(field);
	if (indexOfCustomField > -1) {
		customFieldNames.splice(indexOfCustomField, 1);
	}

	useEffect(() => {
		if (!field.id) {
			if (field.type === FIELD_TYPE.BOOLEAN.VALUE) {
				setField({ ...field, options: ["Yes", "No"] });
			} else {
				setField({ ...field, options: [""] });
			}
		}
	}, [field.type]);

	useEffect(() => {
		if (
			!field.name ||
			([FIELD_TYPE.BOOLEAN.VALUE, FIELD_TYPE.DROPDOWN.VALUE].includes(
				field.type
			) &&
				field.options.filter((ele) => !ele).length) ||
			(field.type === "entity" && !zluriEntity)
		) {
			setIsValidated(false);
		} else {
			setIsValidated(true);
		}
	}, [field]);

	useEffect(() => {
		if (integration && integration?.integration_id) {
			setLoadingSchema(true);
			getOrgIntegrationSchema(integration.integration_id)
				.then((res) => {
					setIntegrationSchema(res.schema || {});
					setLoadingSchema(false);
				})
				.catch((err) => {
					TriggerIssue("Error in fetching integration schema", err);
					setLoadingSchema(false);
				});
		}
	}, [integration]);

	const types = Object.keys(FIELD_TYPE).map((res, index) => (
		<div
			key={index}
			onClick={() => {
				mapValueToKeyState(
					setField,
					FIELD_TYPE[res].VALUE,
					field,
					"type"
				);
			}}
			className={
				field.type === FIELD_TYPE[res].VALUE
					? "p-2 mr-3 pointer cf-edit__type is-active"
					: "cf-edit__type p-2 mr-3 pointer"
			}
		>
			<img src={FIELD_TYPE[res].ICON} className="mb-2" />
			<p className="m-0 z__description-highlight">
				{" "}
				{FIELD_TYPE[res].LABEL}{" "}
			</p>
		</div>
	));

	const typeOptions = () =>
		field.options.map((option, index) => (
			<div className="d-flex mb-3" key={index}>
				<input
					maxlength="25"
					placeholder="Option"
					type="text"
					className="flex-fill pl-2"
					value={option}
					onChange={(e) => {
						let o = [...field.options];
						o[index] = e.target.value;
						setField({ ...field, options: o });
					}}
					disabled={field.type === FIELD_TYPE.BOOLEAN.VALUE}
				/>
				{FIELD_TYPE.DROPDOWN.VALUE === field.type && (
					<Button
						onClick={() => removeOption(index)}
						type="normal"
						className="mt-n1"
					>
						<img src={deleteIcon} />
					</Button>
				)}
			</div>
		));

	const addOptions = () => {
		let options = [...field.options];
		options.push("");
		setField({ ...field, options });
	};

	const removeOption = (index) => {
		let options = [...field.options];
		options.splice(index, 1);
		setField({ ...field, options });
	};

	useEffect(() => {
		if (customFieldNames.includes(field.name)) {
			setShowWarning(true);
		} else {
			setShowWarning(false);
		}
	}, [field]);

	const handleAddEditCustomField = (field) => {
		setSubmitting(true);
		let fieldReqObj = { ...field };
		if (zluriEntity || field?.type === "reference") {
			fieldReqObj.type = "reference";
			fieldReqObj.field_reference =
				zluriEntity?.field_reference || field?.reference;
		}
		if (integration && dataKey) {
			fieldReqObj.integration = integration;
			fieldReqObj.org_integration_id = integration?.integration_id;
			fieldReqObj.org_integration_custom_path = dataKey;
		}
		props.onAddEditField(new CustomFieldEdit(fieldReqObj));
	};

	function handleEntity(value) {
		setZluriEntity(value);
		field.name && setIsValidated(true);
	}

	return (
		<div className="cf-edit__container">
			{!field.id && (
				<div className="cf-edit__header p-4">
					<p className="mb-3 z__block-header">Select Field Type</p>
					<div className="d-flex text-center">{types}</div>
				</div>
			)}
			<div className="cf-edit__body p-4">
				{field.type && (
					<div>
						<div className="mb-4">
							<p className="z__block-header mb-1">Field Name</p>
							<input
								maxlength="25"
								placeholder="Name"
								type="text"
								className="w-100 pl-2"
								value={field.name}
								onChange={(e) => {
									mapValueToKeyState(
										setField,
										e.target.value?.trimStart(),
										field,
										"name"
									);
								}}
							/>
							<div
								className="custom__field__validation"
								hidden={!showWarning}
							>
								Custom field with this name already exists.
								Please enter a different name.
							</div>
						</div>
						{[
							FIELD_TYPE.BOOLEAN.VALUE,
							FIELD_TYPE.DROPDOWN.VALUE,
						].includes(field.type) && (
							<div className="mb-2">
								<p className="z__block-header mb-1">
									{" "}
									{FIELD_TYPE.DROPDOWN.VALUE === field.type
										? "Dropdown"
										: null}{" "}
									Options
								</p>
								{typeOptions()}
								{field.type === FIELD_TYPE.DROPDOWN.VALUE && (
									<div>
										<Button
											type="link pl-0"
											onClick={() => addOptions()}
										>
											<img
												src={add}
												width={12}
												className="mr-2 mt-n1"
											/>{" "}
											Add an option
										</Button>
									</div>
								)}
							</div>
						)}
						{field.type === "entity" && (
							<div className="mb-4">
								<p className="z__block-header mb-1">
									Linked Entity
								</p>
								<Select
									placeholder="Select"
									label="name"
									options={CUSTOM_FIELD_ENTITY_LIST}
									fieldNames={{ label: "name" }}
									onChange={(value) => {
										handleEntity(value);
									}}
								/>
							</div>
						)}
					</div>
				)}
				{field.type === FIELD_TYPE.TEXT.VALUE &&
					props.field.of === "users" && (
						<>
							<div className="d-flex align-items-center font-12 mb-2 bold-600">
								<HeaderFormatter
									text="Connect this custom field to an integration (Optional)"
									tooltipContent="Select an integration and the field from the integration you’d like to fetch data for this custom field from"
								/>
								<Beta style={{ fontSize: "12px" }} />
							</div>
							<div className="d-flex align-items-center justify-content-between">
								<div className="w-50 d-flex flex-column">
									<div className="font-12 mb-1">
										Integration Name
									</div>
									<Dropdown
										toggler={
											integration ? (
												<div
													className="d-flex align-items-center font-12 border-1 border-radius-4"
													style={{
														gap: "4px",
														height: "34px",
														width: "210px",
														padding: "0 8px",
														borderColor:
															"#dddddd !important",
													}}
												>
													<GetImageOrNameBadge
														url={integration.logo}
														name={
															integration.name ||
															integration.keyword
														}
														height={22}
														width={22}
													/>
													<LongTextTooltip
														text={
															integration.name ||
															integration.keyword
														}
														maxWidth={"130px"}
													/>
													<img
														src={arrowdropdown}
														style={{
															marginLeft: "auto",
														}}
													/>
												</div>
											) : (
												<div
													className="d-flex align-items-center border-1 border-radius-4"
													style={{
														height: "34px",
														width: "210px",
														padding: "0 8px",
														borderColor:
															"#dddddd !important",
													}}
												>
													<div className="font-12 ml-1">
														Select Integration
													</div>
													<img
														src={arrowdropdown}
														style={{
															marginLeft: "auto",
														}}
													/>
												</div>
											)
										}
										options={[]}
										apiSearch={true}
										apiSearchCall={(query, cancelToken) =>
											searchIntegrationsAuditlogs(
												query,
												cancelToken
											)
										}
										apiSearchDataKey="results"
										onOptionSelect={(option) =>
											setIntegration(option)
										}
										optionFormatter={(option) => (
											<div
												className="d-flex align-items-center font-12"
												style={{ gap: "4px" }}
											>
												<GetImageOrNameBadge
													url={option.logo}
													name={
														option.name ||
														option.keyword
													}
													height={22}
													width={22}
												/>
												<LongTextTooltip
													text={
														option.name ||
														option.keyword
													}
													maxWidth={"130px"}
												/>
											</div>
										)}
									/>
								</div>
								<div className="w-50 d-flex flex-column">
									<div className="font-12 mb-1">
										Field Name
									</div>
									{Object.keys(integrationSchema || {})
										.length > 0 ? (
										<Dropdown
											toggler={
												<div
													className="d-flex align-items-center border-1 border-radius-4"
													style={{
														height: "34px",
														width: "210px",
														padding: "0 8px",
														borderColor:
															"#dddddd !important",
													}}
												>
													<div className="font-12 ml-1">
														{dataKey ? (
															<LongTextTooltip
																text={dataKey}
																maxWidth={
																	"150px"
																}
															/>
														) : (
															"Select Data Key"
														)}
													</div>
													<img
														src={arrowdropdown}
														style={{
															marginLeft: "auto",
														}}
													/>
												</div>
											}
											isEnabled={
												Object.keys(
													integrationSchema || {}
												).length > 0
											}
											options={Object.keys(
												integrationSchema || {}
											)}
											onOptionSelect={(option) =>
												setDataKey(option)
											}
											localSearch={true}
											optionFormatter={(option) => (
												<div
													className="d-flex align-items-center font-12"
													style={{ gap: "4px" }}
												>
													<LongTextTooltip
														text={option}
														maxWidth={"150px"}
													/>
												</div>
											)}
										/>
									) : (
										<div
											className="d-flex align-items-center border-1 border-radius-4 font-12 red"
											style={{
												height: "34px",
												width: "202px",
												padding: "0 8px",
												borderColor:
													"#dddddd !important",
											}}
										>
											{!integration
												? "Select integration"
												: loadingSchema
												? "Loading Schema..."
												: "No keys in integration schema"}
										</div>
									)}
								</div>
							</div>
						</>
					)}
			</div>
			<div className="cf-edit__footer p-3">
				<div className="d-flex">
					<div className="flex-fill">
						{field.id && (
							<Button
								type="link"
								onClick={() => {
									props.onDeleteField(
										new CustomFieldEdit(field)
									);
								}}
							>
								<img
									src={deleteBlue}
									width={15}
									className="mr-1 mt-n1"
								/>{" "}
								Delete Field
							</Button>
						)}
					</div>
					<div className="flex-fill text-right">
						<Button
							onClick={() => props.onClose()}
							type="link"
							className="mr-2"
						>
							{" "}
							Cancel{" "}
						</Button>
						<Button
							disabled={!isValidated || showWarning || submitting}
							onClick={() => handleAddEditCustomField(field)}
						>
							{field.id ? "Edit Field" : "Add Field"}
							{submitting && (
								<Spinner
									animation="border"
									role="status"
									variant="light"
									size="sm"
									className="ml-2"
									style={{ borderWidth: 2 }}
								>
									<span className="sr-only">Loading...</span>
								</Spinner>
							)}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
