import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { convertArrayToBindSelect } from "../../../../utils/convertDataToBindSelect";
import {
	CUSTOM_FIELD_REFERENCE_KEYS,
	FIELD_TYPE,
	KEY_FIELDS,
} from "../../../custom-fields/constants/constant";
import { getAllCustomField } from "../../../custom-fields/redux/custom-field";
import { InlineEditField } from "../InlineEditField/InlineEditField";
import "./CustomFieldSectionInOverview.css";
import OverviewField from "components/Applications/SecurityCompliance/OverviewField";

export function CustomFieldSectionInOverview({
	loading,
	customFieldData,
	patchAPI,
	entityId,
	cfEntitiy,
	refresh,
}) {
	const dispatch = useDispatch();
	const { customFields } = useSelector((state) => state);
	const entityCustomFields = customFields[cfEntitiy];

	useEffect(() => {
		if (!Object.keys(customFields).length) dispatch(getAllCustomField());
	}, [customFields]);

	const inlineEditCFValue = (
		name,
		id,
		type,
		value,
		op,
		options,
		reference,
		selectedId,
		referenceDisplayValue
	) => (
		<InlineEditField
			updateService={patchAPI.bind(null, entityId)}
			patch={{
				op: op,
				field: "custom_fields",
				value: value,
				custom_field_id: id,
			}}
			title={name}
			hideTitle={true}
			placeholder={`${
				type === FIELD_TYPE.TEXT.VALUE ? "Enter" : "Select"
			} ${name}`}
			inlineValueClassName="schedule-name-inline-edit"
			type={type}
			options={convertArrayToBindSelect(options)}
			refreshPage={refresh}
			reference={reference}
			referenceDisplayValue={referenceDisplayValue}
			keyFields={KEY_FIELDS[reference]}
			selectedId={selectedId}
		/>
	);

	return (
		<div className="vendor_custom_fields_container">
			{!loading &&
				Array.isArray(entityCustomFields) &&
				entityCustomFields.map((field, index) => {
					let cfIndex =
						Array.isArray(customFieldData) &&
						Array.isArray(customFieldData)
							? customFieldData.findIndex(
									(dataCF) => dataCF.field_id === field.id
							  )
							: -1;
					let cfValue =
						cfIndex > -1
							? customFieldData[cfIndex].field_value
							: null;
					let customFieldEntity;
					if (Array.isArray(customFieldData) && cfIndex > -1) {
						customFieldEntity = customFieldData[cfIndex];
					}
					return (
						<OverviewField
							key={index}
							label={field.name}
							value={
								field.reference ===
									CUSTOM_FIELD_REFERENCE_KEYS.APPLICATIONS ||
								(field.reference ===
									CUSTOM_FIELD_REFERENCE_KEYS.USERS &&
									customFieldEntity)
									? inlineEditCFValue(
											field.name,
											field.id,
											field.type,
											customFieldEntity?.custom_field_name ||
												"",
											cfValue ? "replace" : "add",
											field.options,
											field.reference,
											customFieldEntity?.custom_field_id,
											field.custom_field_name
									  )
									: inlineEditCFValue(
											field.name,
											field.id,
											field.type,
											cfValue ? cfValue : "",
											cfValue ? "replace" : "add",
											field.options,
											field.reference
									  )
							}
							className="d-flex justify-content-between align-items-center mb-3"
						/>
					);
				})}
		</div>
	);
}
