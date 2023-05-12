import React from "react";
import { InlineEditField } from "modules/shared/containers/InlineEditField/InlineEditField";
import { patchApplication } from "services/api/applications";
import {
	FIELD_TYPE,
	KEY_FIELDS,
} from "modules/custom-fields/constants/constant";
export function convertArrayToBindSelect(arr, postLabelStr = "") {
	return arr.map((i) => {
		return { label: `${i} ${postLabelStr}`, value: i };
	});
}
export const InlineEditCFValue = ({
	name,
	id,
	type,
	field_value,
	options,
	reference,
	selectedId,
	referenceDisplayValue,
	handleRefresh,
	custom_field_id,
	patchAPI,
	...rest
}) => {
	return (
		<InlineEditField
			updateService={patchAPI.bind(null, rest.entity_id)}
			patch={{
				op: field_value ? "replace" : "add",
				field: "custom_fields",
				value: field_value,
				custom_field_id: id,
			}}
			title={name}
			hideTitle={true}
			placeholder={`${
				type === FIELD_TYPE.TEXT.VALUE ? "Enter" : "Select"
			} ${name}`}
			inlineValueClassName="schedule-name-inline-edit"
			type={type}
			options={convertArrayToBindSelect(options || [])}
			refreshPage={handleRefresh}
			reference={reference}
			referenceDisplayValue={rest.custom_field_name}
			keyFields={KEY_FIELDS[reference]}
			selectedId={selectedId}
			isColumnField
		/>
	);
};
