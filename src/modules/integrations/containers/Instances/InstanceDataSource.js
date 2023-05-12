import { Loader } from "common/Loader/Loader";
import {
	getOrgIntegrationInstanceDataSource,
	getOrgIntegrationSchema,
	saveOrgIntegrationInstanceDataSource,
} from "modules/integrations/service/api";
import React, { useEffect, useState } from "react";
import { TriggerIssue } from "utils/sentry";
import { Button, Form, Spinner } from "react-bootstrap";
import arrowdropdown from "components/Transactions/Unrecognised/arrowdropdown.svg";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";
import { useDispatch, useSelector } from "react-redux";
import { getAllCustomField } from "modules/custom-fields/redux/custom-field";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";
import dataSourceMapping from "assets/integrations/dataSourceMapping.svg";
import { HeaderFormatter } from "modules/licenses/utils/LicensesUtils";

export default function InstanceDataSource({
	currentSection,
	sections,
	instance,
	integration,
}) {
	const dispatch = useDispatch();
	const { customFields } = useSelector((state) => state);
	const [loadingDataSource, setLoadingDataSource] = useState(true);
	const [loadingSchema, setLoadingSchema] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [dataSource, setDataSource] = useState([]);
	const [config, setConfig] = useState(false);
	const [error, setError] = useState([]);
	const [collapsed, setCollapsed] = useState(false);
	const [integrationSchema, setIntegrationSchema] = useState([]);
	const [selectedSchema, setSelectedSchema] = useState();
	const [seletedCustomField, setSelectedCustomField] = useState();

	useEffect(() => {
		if (loadingDataSource && currentSection === "Data Source") {
			getOrgIntegrationInstanceDataSource(integration.id, instance.id)
				.then((res) => {
					setLoadingDataSource(false);
					setDataSource(res.global_data_source);
					setConfig(
						res.org_integration_data_source || {
							user_directory_map: {
								map_user_with_email: {
									enabled: true,
									map_user_with_primary: true,
									map_user_with_alias: false,
								},
								map_user_with_custom: {
									enabled: false,
									add_email_alias: false,
								},
							},
						}
					);
				})
				.catch((err) => {
					TriggerIssue(
						"Error in fetching data sources of the instance",
						err
					);
					setLoadingDataSource(false);
					setError(true);
				});
		}
	}, [currentSection]);

	useEffect(() => {
		if (config?.user_directory_map?.map_user_with_custom?.enabled) {
			for (const key of Object.keys(
				config?.user_directory_map?.map_user_with_custom
			)) {
				const index = getUserTextTypeCustomFields().findIndex(
					(cf) => cf.id === key
				);
				if (index > -1) {
					setSelectedSchema(
						config?.user_directory_map?.map_user_with_custom?.[key]
					);
					setSelectedCustomField(
						getUserTextTypeCustomFields()?.[index]
					);
				}
			}
		}
	}, [customFields]);

	useEffect(() => {
		if (currentSection === "Data Source" && loadingSchema) {
			getOrgIntegrationSchema(instance.id)
				.then((res) => {
					setIntegrationSchema(
						res?.schema && Object.keys(res?.schema).length > 0
							? Object.keys(res?.schema)
							: []
					);
					setLoadingSchema(false);
				})
				.catch((err) => {
					TriggerIssue("Error in fetching integration schema", err);
					setLoadingSchema(false);
				});
		}
	}, [currentSection]);

	useEffect(() => {
		if (
			currentSection === "Data Source" &&
			!Object.keys(customFields).length
		) {
			dispatch(getAllCustomField());
		}
	}, [currentSection]);

	const handleRadioChange = (key) => {
		const temp = { ...config };
		if (key === "map_user_with_email") {
			temp.user_directory_map.map_user_with_email = {
				enabled: true,
				map_user_with_primary: false,
				map_user_with_alias: false,
			};
			temp.user_directory_map.map_user_with_custom = {
				enabled: false,
				add_email_alias: false,
			};
		} else {
			temp.user_directory_map.map_user_with_email = {
				enabled: false,
				map_user_with_primary: false,
				map_user_with_alias: false,
			};
			temp.user_directory_map.map_user_with_custom = {
				enabled: true,
				add_email_alias: false,
			};
		}
		setConfig({ ...temp });
	};

	const handleCheckboxChange = (key, parentKey) => {
		const temp = { ...config };
		temp.user_directory_map[parentKey][key] =
			!temp.user_directory_map[parentKey][key];
		setConfig({ ...temp });
	};

	const getUserTextTypeCustomFields = () => {
		const arr = [];
		if (Array.isArray(customFields?.users)) {
			for (const cf of customFields?.users) {
				if (cf.type === "text") {
					arr.push(cf);
				}
			}
		}
		return arr;
	};

	const handleSubmit = () => {
		setSubmitting(true);
		if (config.user_directory_map.map_user_with_custom.enabled) {
			config.user_directory_map.map_user_with_custom = {
				add_email_alias:
					config?.user_directory_map?.map_user_with_custom
						?.add_email_alias,
				[seletedCustomField.id]: selectedSchema,
				enabled: true,
			};
		}
		saveOrgIntegrationInstanceDataSource(instance.id, config)
			.then((res) => {
				ApiResponseNotification({
					responseType: apiResponseTypes.SUCCESS,
					title: "Data source settings saved successfully",
					description: "",
				});
				setSubmitting(false);
			})
			.catch((err) => {
				ApiResponseNotification({
					responseType: apiResponseTypes.ERROR,
					title: "Error while saving data source settings",
					errorObj: err,
				});
				setSubmitting(false);
			});
	};

	const saveIsDisabled = () => {
		if (config && config.user_directory_map.map_user_with_custom.enabled) {
			return !selectedSchema || !seletedCustomField;
		}

		if (config && config.user_directory_map.map_user_with_email.enabled) {
			return (
				!config.user_directory_map.map_user_with_email
					.map_user_with_primary &&
				!config.user_directory_map.map_user_with_email
					.map_user_with_alias
			);
		}
	};

	return (
		<>
			<div
				className="position-relative"
				style={{ height: "calc(100vh - 112px)", overflowY: "auto" }}
			>
				{loadingDataSource ||
				loadingSchema ||
				Object.keys(customFields).length === 0 ? (
					<>
						<Loader width={100} height={100} />
					</>
				) : (
					<>
						<div className="instance_data_sources_container">
							<div className="d-flex align-items-center">
								<div className="font-16 bold-600 grey">
									Data Sources Configuration
								</div>
								<Button
									disabled={saveIsDisabled() || submitting}
									onClick={handleSubmit}
									style={{
										width: "100px",
										height: "34px",
										marginLeft: "auto",
									}}
								>
									{submitting ? (
										<Spinner
											animation="border"
											role="status"
											variant="light"
											size="sm"
											style={{ borderWidth: 2 }}
										/>
									) : (
										"Save"
									)}
								</Button>
							</div>
							<div className="data_source_container">
								<div style={{ padding: "20px" }}>
									<div className="d-flex justify-content-between">
										<div className="font-13 bold-600">
											Map to users directory
										</div>
										{/* <img
											src={arrowdropdown}
											width={7.5}
											height={12}
											alt=""
											className="cursor-pointer"
											style={
												collapsed
													? {}
													: {
															transform:
																"rotate(180deg)",
													  }
											}
											onClick={() =>
												setCollapsed(!collapsed)
											}
										/> */}
									</div>
									<div className="font-11 gery-1">
										Define how Zluri maps users identified
										from this integration to users from
										primary source
									</div>
								</div>
								{!collapsed && (
									<>
										<hr className="m-0 w-100" />
										<div
											className="d-flex flex-column"
											style={{
												gap: "10px",
												padding: "20px",
											}}
										>
											<Form.Check
												type="radio"
												label={
													<div className="d-flex">
														<HeaderFormatter
															text="Map by email"
															tooltipContent="Maps users from this integration using the primary or alias email ID present in Zluri"
														/>
													</div>
												}
												name="directory_mapping_settings"
												id="map_user_with_email"
												checked={
													config?.user_directory_map
														?.map_user_with_email
														?.enabled
												}
												onClick={() =>
													handleRadioChange(
														"map_user_with_email"
													)
												}
											/>
											{config?.user_directory_map
												?.map_user_with_email
												?.enabled && (
												<div
													className="d-flex align-items-center"
													style={{
														gap: "20px",
														padding: "0 20px",
													}}
												>
													<Form.Check
														type="checkbox"
														label="Primary Email"
														value="map_user_with_primary"
														checked={
															config
																?.user_directory_map
																?.map_user_with_email
																?.map_user_with_primary
														}
														onClick={() =>
															handleCheckboxChange(
																"map_user_with_primary",
																"map_user_with_email"
															)
														}
													/>
													<Form.Check
														type="checkbox"
														label="Alias Email"
														value="map_user_with_alias"
														checked={
															config
																?.user_directory_map
																?.map_user_with_email
																?.map_user_with_alias
														}
														onClick={() =>
															handleCheckboxChange(
																"map_user_with_alias",
																"map_user_with_email"
															)
														}
													/>
													<div className="font-14">{`(Select at least one)`}</div>
												</div>
											)}
											<Form.Check
												type="radio"
												label={
													<div className="d-flex">
														<HeaderFormatter
															text="Map users with custom attribute"
															tooltipContent="Maps users based on the selected field in this integration using the custom field values in Zluri"
														/>
													</div>
												}
												name="directory_mapping_settings"
												id="map_user_with_custom"
												checked={
													config?.user_directory_map
														?.map_user_with_custom
														?.enabled
												}
												onClick={() =>
													handleRadioChange(
														"map_user_with_custom"
													)
												}
											/>
											{config?.user_directory_map
												?.map_user_with_custom
												?.enabled && (
												<div
													className="d-flex flex-column"
													style={{
														gap: "2px",
														padding: "0 20px",
													}}
												>
													<div className="d-flex align-items-center justify-content-between">
														{integrationSchema?.length >
														0 ? (
															<Dropdown
																toggler={
																	<div
																		className="d-flex align-items-center border-1 border-radius-4"
																		style={{
																			height: "34px",
																			width: "202px",
																			padding:
																				"0 8px",
																			borderColor:
																				"#dddddd !important",
																		}}
																	>
																		<div className="font-12 ml-1">
																			{selectedSchema ? (
																				<LongTextTooltip
																					text={
																						selectedSchema
																					}
																					maxWidth={
																						"150px"
																					}
																				/>
																			) : (
																				"Org Integration Schema"
																			)}
																		</div>
																		<img
																			src={
																				arrowdropdown
																			}
																			style={{
																				marginLeft:
																					"auto",
																			}}
																		/>
																	</div>
																}
																options={
																	integrationSchema
																}
																onOptionSelect={(
																	option
																) =>
																	setSelectedSchema(
																		option
																	)
																}
																localSearch={
																	true
																}
																optionFormatter={(
																	option
																) => (
																	<div
																		className="d-flex align-items-center font-12"
																		style={{
																			gap: "4px",
																		}}
																	>
																		<LongTextTooltip
																			text={
																				option
																			}
																			maxWidth={
																				"150px"
																			}
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
																	padding:
																		"0 8px",
																	borderColor:
																		"#dddddd !important",
																}}
															>
																No keys in
																integration
																schema
															</div>
														)}
														<img
															src={
																dataSourceMapping
															}
															width={24}
															height={24}
															alt=""
														/>
														{getUserTextTypeCustomFields()
															?.length > 0 ? (
															<Dropdown
																toggler={
																	<div
																		className="d-flex align-items-center border-1 border-radius-4"
																		style={{
																			height: "34px",
																			width: "202px",
																			padding:
																				"0 8px",
																			borderColor:
																				"#dddddd !important",
																		}}
																	>
																		<div className="font-12 ml-1">
																			{seletedCustomField?.name ? (
																				<LongTextTooltip
																					text={
																						seletedCustomField?.name
																					}
																					maxWidth={
																						"150px"
																					}
																				/>
																			) : (
																				"Zluri user custom field"
																			)}
																		</div>
																		<img
																			src={
																				arrowdropdown
																			}
																			style={{
																				marginLeft:
																					"auto",
																			}}
																		/>
																	</div>
																}
																options={getUserTextTypeCustomFields()}
																onOptionSelect={(
																	option
																) =>
																	setSelectedCustomField(
																		option
																	)
																}
																localSearch={
																	true
																}
																localSearchKey="name"
																optionFormatter={(
																	option
																) => (
																	<div
																		className="d-flex align-items-center font-12"
																		style={{
																			gap: "4px",
																		}}
																	>
																		<LongTextTooltip
																			text={
																				option.name
																			}
																			maxWidth={
																				"150px"
																			}
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
																	padding:
																		"0 8px",
																	borderColor:
																		"#dddddd !important",
																}}
															>
																No user custom
																fields added
															</div>
														)}
													</div>
													<Form.Check
														type="checkbox"
														label={
															<div className="d-flex">
																<HeaderFormatter
																	text="Add email as alias"
																	tooltipContent="Adds values from the selected field as an email alias for users in Zluri"
																/>
															</div>
														}
														value="add_email_alias"
														checked={
															config
																?.user_directory_map
																?.map_user_with_custom
																?.add_email_alias
														}
														onClick={() =>
															handleCheckboxChange(
																"add_email_alias",
																"map_user_with_custom"
															)
														}
													/>
												</div>
											)}
										</div>
									</>
								)}
							</div>
						</div>
					</>
				)}
			</div>
		</>
	);
}
