import React, { useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import close from "assets/close.svg";
import _ from "underscore";
import { Button } from "UIComponents/Button/Button";
import { PrimarySourceDropdown } from "components/Settings/General/PrimarySources";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";
import { updateApplicationPrimarySourceSettings } from "services/api/applications";
import ApplicationGroupLicenseMappings from "./ApplicationGroupLicenseMappings";
import { Beta } from "modules/shared/components/BetaTagAndModal/Beta/beta";
import { getValueFromLocalStorage } from "utils/localStorage";

export default function ApplicationSourceSettings({
	isOpen,
	handleClose,
	modalProps,
}) {
	const settingRows = [
		{
			k: "users",
			v: {
				label: "Users",
				description: "Select the source for users’ application status",
				sources_ids: modalProps.sources,
			},
			primarySourceKey: "is_primary",
			availabiltyKey: "source_status_available",
			availabilityWarning: `${
				getValueFromLocalStorage("partner")?.name
			} does not get user status from the selected source. Do you still want to continue?`,
			settingsKey: "user_primary_source",
		},
		{
			k: "licenses",
			v: {
				label: "Licenses",
				description: "Select the source for users’ licenses",
				sources_ids: modalProps.sources,
			},
			primarySourceKey: "is_license_primary",
			availabiltyKey: "license_info_available",
			availabilityWarning: `${
				getValueFromLocalStorage("partner")?.name
			} does not get license information from the selected source, selecting this will assign license to all active users. Do you still want to continue?`,
			settingsKey: "license_primary_source",
		},
	];

	return (
		<Modal
			centered
			show={isOpen}
			onHide={handleClose}
			dialogClassName="app_source_settings_modal"
		>
			<Modal.Header closeButton={false}>
				<Modal.Title
					className="d-flex align-items-center"
					style={{ fontWeight: "600" }}
				>
					<div className="font-18">
						Application Primary Source Settings
					</div>
					<Beta style={{ fontSize: "16px" }} />
				</Modal.Title>
				<img alt="Close" onClick={handleClose} src={close} />
			</Modal.Header>
			<hr />
			<Modal.Body
				style={{
					height: "fit-content",
					overflowY: "visible",
					margin: "20px",
				}}
			>
				{settingRows.map(
					(entity) =>
						entity.v.sources_ids && (
							<PrimarySourceRow
								sourceType={entity.v}
								sourceKey={entity.k}
								primarySourceKey={entity.primarySourceKey}
								availabiltyKey={entity.availabiltyKey}
								availabilityWarning={entity.availabilityWarning}
								appId={modalProps.appId}
								settings={modalProps.settings}
								settingsKey={entity.settingsKey}
							/>
						)
				)}
			</Modal.Body>
		</Modal>
	);
}

function PrimarySourceRow({
	sourceType,
	sourceKey,
	availabiltyKey,
	availabilityWarning,
	appId,
	settings,
	settingsKey,
}) {
	const [initialPrimarySource, setInitialPrimarySource] = useState(
		sourceType.sources_ids.find(
			(source) =>
				source.org_integration_id?._id &&
				source.org_integration_id?._id ===
					settings?.[settingsKey]?.org_integration_id
		) || null
	);
	const [primary, setPrimary] = useState(initialPrimarySource);
	const [saving, setSaving] = useState(false);
	const [initialMappings, setInitialMappings] = useState(
		Array.isArray(settings?.license_primary_source?.license_group_mappings)
			? settings?.license_primary_source?.license_group_mappings
			: []
	);
	const [mappings, setMappings] = useState([...initialMappings]);

	function handleSourceSave(source) {
		setSaving(true);
		const body = {
			key: settingsKey,
			value: {
				integration_id: primary.integration_id?._id,
				org_integration_id: primary.org_integration_id?._id,
			},
		};

		if (settingsKey === "license_primary_source") {
			body.value.license_group_mappings = mappings.map((mapping) => {
				return {
					group_id: mapping.group_id?._id,
					license_id: mapping.license_id?._id,
					license_name:
						mapping.license_id?.name || mapping?.license_name,
				};
			});
		}

		updateApplicationPrimarySourceSettings(appId, body)
			.then((res) => {
				if (res.status === apiResponseTypes.SUCCESS) {
					ApiResponseNotification({
						responseType: apiResponseTypes.SUCCESS,
						title: `Primary source successfully updated for ${sourceType.label}`,
					});
					setSaving(false);
					setInitialPrimarySource(source);
					if (settingsKey === "license_primary_source") {
						setInitialMappings([...mappings]);
					}
				}
			})
			.catch((error) => {
				ApiResponseNotification({
					responseType: apiResponseTypes.ERROR,
					title: `Error in setting primary source for ${sourceType.label}`,
					errorObj: error,
				});
				setSaving(false);
			});
	}

	function mappingsAreFilled() {
		let flag = true;
		for (const mapping of mappings) {
			if (!mapping?.group_id?._id) {
				flag = false;
			}
			if (!(mapping.license_id?.name || mapping?.license_name)) {
				flag = false;
			}
		}
		return flag;
	}

	function showSaveButton() {
		return (
			(!_.isEqual(primary, initialPrimarySource) ||
				!_.isEqual(initialMappings, mappings)) &&
			mappingsAreFilled()
		);
	}

	function showDataUnavailableWarning(key) {
		const index = primary?.integration_id?.integration_details?.findIndex(
			(details) => details.key === key
		);
		if (index > -1) {
			return !primary?.integration_id?.integration_details?.[index]
				?.value;
		} else {
			return true;
		}
	}

	return (
		<div className="primary_source_item">
			<div className="d-flex">
				<div style={{ width: "260px", marginRight: "8px" }}>
					<div className="font-12 bold-600">{sourceType.label}</div>
					<div className="font-11">{sourceType.description}</div>
				</div>
				<PrimarySourceDropdown
					options={sourceType.sources_ids}
					initialPrimarySource={initialPrimarySource}
					primary={primary}
					setPrimary={setPrimary}
					sourceIsNotSelectable={(source) =>
						!source?.org_integration_id
					}
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
				showDataUnavailableWarning(availabiltyKey) &&
				showSaveButton() && (
					<div className="d-flex font-11 mt-1 warningMessage w-100 padding_4">
						<div className="font-11">{availabilityWarning}</div>
					</div>
				)}

			{sourceKey === "licenses" &&
				primary?.org_integration_id?.process_groups && (
					<ApplicationGroupLicenseMappings
						appId={appId}
						mappings={mappings}
						setMappings={setMappings}
					/>
				)}
		</div>
	);
}
