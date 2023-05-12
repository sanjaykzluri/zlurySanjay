import {
	FIELD_TYPE,
	KEY_FIELDS,
} from "modules/custom-fields/constants/constant";
import { InlineEditField } from "modules/shared/containers/InlineEditField/InlineEditField";
import React from "react";
export default function BooleanRenderer({
	entity_id,
	name,
	id,
	type,
	custom_field_id,
	custom_field_name,
	cfValue,
	options,
	handleRefresh,
	reference,
	referenceDisplayValue,
	selectedId,
	...rest
}) {
	return (
		<InlineEditField
			updateService={rest.patchAPI.bind(null, entity_id)}
			patch={{
				op: rest.field_value ? "replace" : "add",
				field: "custom_fields",
				value: rest.field_value,
				custom_field_id: id,
			}}
			title={custom_field_name}
			hideTitle={true}
			placeholder={`${
				type === FIELD_TYPE.TEXT.VALUE ? "Enter" : "Select"
			} ${name}`}
			inlineValueClassName="schedule-name-inline-edit"
			type={type}
			options={options.map((val) => ({ label: val, value: val }))}
			refreshPage={handleRefresh}
			reference={reference}
			referenceDisplayValue={referenceDisplayValue}
			keyFields={KEY_FIELDS[reference]}
			selectedId={selectedId}
		/>
	);
}
