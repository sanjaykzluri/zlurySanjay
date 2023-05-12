import React, { useState } from "react";
import _ from "underscore";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { TriggerIssue } from "utils/sentry";
import { Button } from "UIComponents/Button/Button";
import downarrow from "assets/auditlogs/downarrow.svg";
import { updatePrimarySource } from "services/api/settings";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import { HeaderFormatter } from "modules/licenses/utils/LicensesUtils";
import { Form, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import arrowdropdown from "components/Transactions/Unrecognised/arrowdropdown.svg";
import DefaultNotificationCard from "common/Notification/PusherNotificationCards/DefaultNotificationCard";

export default function PrimarySources({ primarySources }) {
	return (
		<div className="mb-4">
			<div className="font-14 bold-600 mt-3 mb-2">Primary Source</div>
			<div className="font-12 mb-3">
				The list of primary sources for various details.
			</div>
			{Array.isArray(primarySources) &&
				primarySources.map(
					(entity) =>
						entity.v.sources_ids && (
							<PrimarySourceRow
								sourceType={entity.v}
								sourceKey={entity.k}
								entity={entity}
							/>
						)
				)}
		</div>
	);
}

function PrimarySourceRow({ sourceType, sourceKey, entity }) {
	const [initialPrimarySource, setInitialPrimarySource] = useState(
		sourceType.sources_ids.find((source) => source.is_primary) || null
	);
	const [primary, setPrimary] = useState(initialPrimarySource);
	const [saving, setSaving] = useState(false);
	const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
	const [
		initial_all_sources_domain_employees,
		set_initial_all_sources_domain_employees,
	] = useState(sourceType?.all_sources_domain_employees);
	const [
		initial_primary_source_non_domain_employees,
		set_initial_primary_source_non_domain_employees,
	] = useState(sourceType?.primary_source_non_domain_employees);
	const [all_sources_domain_employees, set_all_sources_domain_employees] =
		useState(sourceType?.all_sources_domain_employees);
	const [
		primary_source_non_domain_employees,
		set_primary_source_non_domain_employees,
	] = useState(sourceType?.primary_source_non_domain_employees);

	function handleSourceSave(source) {
		setSaving(true);
		const body = {
			key: sourceKey,
			source_id: source?.org_integration_id?._id,
		};
		if (source.custom_path_key) {
			body.custom_path_key = source.custom_path_key;
		}
		if (source.custom_path) {
			body.custom_path = source.custom_path;
		}
		if (sourceKey === "users") {
			body.all_sources_domain_employees = all_sources_domain_employees;
			body.primary_source_non_domain_employees =
				primary_source_non_domain_employees;
		}

		updatePrimarySource(body)
			.then((res) => {
				setSaving(false);
				if (sourceKey === "departments") {
					toast(
						<DefaultNotificationCard
							notification={{
								title: "Department primary source updated",
								description:
									"Department primary source has been updated. Data population from the departments might take a few hours to complete.",
							}}
						/>
					);
				} else {
					toast(
						<DefaultNotificationCard
							notification={{
								title: "Primary source updated!",
								description: `Primary source has been updated successfully for ${sourceType.label}.`,
							}}
						/>
					);
				}
				setInitialPrimarySource(source);
				set_initial_all_sources_domain_employees(
					all_sources_domain_employees
				);
				set_initial_primary_source_non_domain_employees(
					primary_source_non_domain_employees
				);
			})
			.catch((error) => {
				TriggerIssue("error in setting primary source", error);
				setSaving(false);
			});
	}

	function setPrimarySource(primary) {
		const deptPathObj = primary?.integration_id?.custom_path_options?.[
			sourceKey
		]?.find((path) => path.is_default);
		const customPath = deptPathObj?.mappings_custom_path?.find(
			(mapping) => mapping.is_default
		)?.v;
		setPrimary({
			...primary,
			custom_path_key: deptPathObj?.v,
			custom_path: customPath,
		});
	}

	function setDataPath(path, custom_path) {
		setPrimary({
			...primary,
			custom_path_key: path,
			custom_path: custom_path,
		});
	}

	function setDataPathMappingKey(mappingKey) {
		setPrimary({ ...primary, custom_path: mappingKey });
	}

	function showSaveButton() {
		if (sourceKey === "users") {
			return (
				(!_.isEqual(primary, initialPrimarySource) ||
					primary_source_non_domain_employees !==
						initial_primary_source_non_domain_employees ||
					all_sources_domain_employees !==
						initial_all_sources_domain_employees) &&
				(!!primary.custom_path_key ? !!primary.custom_path : true)
			);
		} else
			return (
				!_.isEqual(primary, initialPrimarySource) &&
				(!!primary.custom_path_key ? !!primary.custom_path : true)
			);
	}

	return (
		<div className="primary_source_item">
			<div className="d-flex">
				<div style={{ width: "380px", marginRight: "8px" }}>
					<div className="d-flex align-items-center">
						<div className="font-12 bold-600">
							{sourceType.label === "Users"
								? "Employee Lifecycle Status"
								: sourceType.label}
						</div>
						{sourceKey === "users" && (
							<>
								<OverlayTrigger
									overlay={
										<Tooltip>
											{!showAdvancedSettings
												? "Show Advanced Settings"
												: "Hide Advanced Settings"}
										</Tooltip>
									}
									placement="top"
								>
									<img
										src={downarrow}
										alt=""
										className="cursor-pointer ml-1"
										onClick={() =>
											setShowAdvancedSettings(
												!showAdvancedSettings
											)
										}
										style={
											showAdvancedSettings
												? {
														transform:
															"rotate(180deg)",
												  }
												: {}
										}
									/>
								</OverlayTrigger>
								<div className="beta_text font-10">BETA</div>
							</>
						)}
					</div>
					<div className="font-11">{sourceType.description}</div>
				</div>
				<PrimarySourceDropdown
					options={sourceType.sources_ids}
					initialPrimarySource={initialPrimarySource}
					primary={primary}
					setPrimary={(primary) => setPrimarySource(primary)}
				/>
				{showSaveButton() && (
					<Button
						type="primary"
						className="d-flex align-items-center ml-2"
						style={{ height: "28px" }}
						onClick={() => handleSourceSave(primary)}
						disabled={saving}
					>
						{saving ? (
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
				)}
			</div>
			{primary &&
				primary.integration_id.custom_path_options &&
				primary.integration_id.custom_path_options[sourceKey] && (
					<PrimarySourceDataPath
						dataPaths={
							primary.integration_id.custom_path_options[
								sourceKey
							]
						}
						sourceKey={sourceKey}
						onChange={(path, customPath) =>
							setDataPath(path, customPath)
						}
						onMappingKeyChange={(key) => setDataPathMappingKey(key)}
						path={primary?.custom_path_key || null}
						pathMappingKey={
							typeof primary?.custom_path === "string"
								? primary?.custom_path
								: primary?.org_integration_id?.mappings
										?.custom_paths?.[sourceKey] || null
						}
					/>
				)}
			{sourceKey === "users" && showAdvancedSettings && (
				<UserProcessEmailSettings
					all_sources_domain_employees={all_sources_domain_employees}
					set_all_sources_domain_employees={
						set_all_sources_domain_employees
					}
					primary_source_non_domain_employees={
						primary_source_non_domain_employees
					}
					set_primary_source_non_domain_employees={
						set_primary_source_non_domain_employees
					}
				/>
			)}
		</div>
	);
}

export function PrimarySourceDropdown({
	options,
	primary,
	setPrimary,
	onSelect,
	sourceIsNotSelectable,
}) {
	return (
		<Dropdown
			onOptionSelect={(option) => {
				setPrimary({
					...option,
				});
				onSelect && onSelect();
			}}
			optionIsNotSelectable={(option) =>
				sourceIsNotSelectable && sourceIsNotSelectable(option)
			}
			options={options}
			toggler={
				<div className="primary_source_dropdown_toggle">
					<div className="d-flex align-items-center">
						{primary ? (
							<>
								<GetImageOrNameBadge
									url={
										primary.integration_id?.logo_url ||
										primary.logo
									}
									name={
										primary.org_integration_id?.name ||
										primary.integration_id?.name ||
										primary.name ||
										primary.keyword
									}
									height={15}
									width={15}
								/>
								<OverlayTrigger
									overlay={
										<Tooltip>
											{primary.org_integration_id?.name ||
												primary.integration_id?.name ||
												primary.name ||
												primary.keyword}
										</Tooltip>
									}
									placement="right"
								>
									<div className="font-12 primary_source_name_truncate">
										{primary.org_integration_id?.name ||
											primary.integration_id?.name ||
											primary.name ||
											primary.keyword}
									</div>
								</OverlayTrigger>
							</>
						) : (
							<div className="font-12" style={{ width: "170px" }}>
								Select Primary Source
							</div>
						)}
						<img src={arrowdropdown} />
					</div>
				</div>
			}
			optionFormatter={(option) => (
				<div className="d-flex">
					<GetImageOrNameBadge
						url={option.integration_id?.logo_url || option.logo}
						name={
							option.org_integration_id?.name ||
							option.integration_id?.name ||
							option.name ||
							option.keyword
						}
						height={15}
						width={15}
					/>
					<OverlayTrigger
						overlay={
							<Tooltip>
								{option.org_integration_id?.name ||
									option.integration_id?.name ||
									option.name ||
									option.keyword}
							</Tooltip>
						}
						placement="right"
					>
						<div className="font-12 primary_source_name_truncate">
							{option.org_integration_id?.name ||
								option.integration_id?.name ||
								option.name ||
								option.keyword}
						</div>
					</OverlayTrigger>
				</div>
			)}
			menuStyle={{ width: "190px" }}
			optionStyle={{ width: "188px", padding: "0 5px" }}
		/>
	);
}

function PrimarySourceDataPath({
	dataPaths,
	onChange,
	path,
	sourceKey,
	onMappingKeyChange,
	pathMappingKey,
}) {
	const checkedDataPath = dataPaths.find((dataPath) =>
		path ? dataPath.v === path : dataPath.is_default
	);

	const defaultMappingKey = checkedDataPath?.mappings_custom_path?.find(
		(mapping) => mapping.is_default
	)?.v;

	return (
		<div className="d-flex align-items-center mt-1">
			<div
				className="font-12 mr-3 d-flex align-items-center"
				style={{ paddingTop: "2px" }}
			>
				Data Source:
			</div>
			{dataPaths.map((dataPath) => (
				<Form.Check
					type="radio"
					className="d-flex align-items-center mr-2 font-12"
					style={{ paddingBottom: "2px" }}
					label={
						<div className="font-11" style={{ paddingTop: "1px" }}>
							{dataPath.k}
						</div>
					}
					name={`${sourceKey}_deptPath`}
					id={`${sourceKey}_deptPath_${dataPath.k}`}
					checked={path ? dataPath.v === path : dataPath.is_default}
					onClick={() =>
						onChange(
							dataPath.v,
							Array.isArray(dataPath?.mappings_custom_path)
								? dataPath?.mappings_custom_path?.find(
										(customPath) => customPath.is_default
								  )?.v || null
								: dataPath?.v
						)
					}
				/>
			))}
			{Array.isArray(checkedDataPath?.mappings_custom_path) && (
				<Dropdown
					onOptionSelect={(option) => onMappingKeyChange(option.v)}
					options={checkedDataPath.mappings_custom_path}
					toggler={
						pathMappingKey || defaultMappingKey ? (
							<div
								className="primary_source_dropdown_toggle mr-1"
								style={{ width: "120px" }}
							>
								<div
									className="font-11"
									style={{ width: "110px" }}
								>
									{
										checkedDataPath?.mappings_custom_path.find(
											(customPath) =>
												pathMappingKey
													? customPath.v ===
													  pathMappingKey
													: customPath.v ===
													  defaultMappingKey
										)?.k
									}
								</div>
								<img src={arrowdropdown} />
							</div>
						) : (
							<div
								className="primary_source_dropdown_toggle mr-1"
								style={{ width: "120px" }}
							>
								<div
									className="font-11"
									style={{ width: "110px" }}
								>
									Select data key
								</div>
								<img src={arrowdropdown} />
							</div>
						)
					}
					optionFormatter={(option) => option.k}
				/>
			)}
			<Form.Check
				type="radio"
				className="d-flex align-items-center mr-2 font-12"
				style={{ paddingBottom: "2px" }}
				label={
					<div className="font-11" style={{ paddingTop: "1px" }}>
						Custom Field
					</div>
				}
				name={`${sourceKey}_deptPath`}
				id={`${sourceKey}_deptPath_custom_field`}
				checked={path === "custom_field"}
				onClick={() => onChange("custom_field")}
			/>
			{path === "custom_field" && (
				<input
					maxlength="25"
					placeholder="Enter data key"
					type="text"
					className="pl-2"
					value={pathMappingKey}
					onChange={(e) => onMappingKeyChange(e.target.value)}
					style={{ width: "200px", height: "28px" }}
				/>
			)}
		</div>
	);
}

function UserProcessEmailSettings({
	all_sources_domain_employees,
	set_all_sources_domain_employees,
	primary_source_non_domain_employees,
	set_primary_source_non_domain_employees,
}) {
	const { org_beta_features } = useSelector((state) => state.userInfo);
	return (
		<div>
			<Form.Check
				type="checkbox"
				className="d-flex align-items-center font-11"
				label={
					<div
						className="font-11 d-flex"
						style={{ paddingTop: "1px" }}
					>
						<HeaderFormatter
							text="Process emails belonging to verified domains from all sources as employees"
							onClick={() =>
								window.open(
									`https://help.zluri.com/en/articles/6880876-employee-lifecycle-status-setting`
								)
							}
						/>
					</div>
				}
				value={all_sources_domain_employees}
				checked={all_sources_domain_employees}
				onClick={() =>
					set_all_sources_domain_employees(
						!all_sources_domain_employees
					)
				}
				disabled={
					!(
						Array.isArray(org_beta_features) &&
						org_beta_features?.includes("employee_lifecycle_status")
					)
				}
			/>
			<Form.Check
				type="checkbox"
				className="d-flex align-items-center font-11"
				label={
					<div
						className="font-11 d-flex"
						style={{ paddingTop: "1px" }}
					>
						<HeaderFormatter
							text="Process emails coming from primary source belonging to non-verified domains as employees"
							onClick={() =>
								window.open(
									`https://help.zluri.com/en/articles/6880876-employee-lifecycle-status-setting`
								)
							}
						/>
					</div>
				}
				value={primary_source_non_domain_employees}
				checked={primary_source_non_domain_employees}
				onClick={() =>
					set_primary_source_non_domain_employees(
						!primary_source_non_domain_employees
					)
				}
				disabled={
					!(
						Array.isArray(org_beta_features) &&
						org_beta_features?.includes("employee_lifecycle_status")
					)
				}
			/>
		</div>
	);
}
