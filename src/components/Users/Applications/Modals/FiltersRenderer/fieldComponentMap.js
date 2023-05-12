// import React from "react"
import StringField from "./StringField";
import AutoSuggestion from "./AutoSuggestion";
import SelectField from "./SelectField";
import RangeField from "./RangeField";
import SingleSelectField from "./SingleSelect";
import EntityAutosuggestion from "./EntityAutoSuggestion";
export const fieldComponentMap = {
	multi_string: StringField,
	string: StringField,
	autocomplete: AutoSuggestion,
	select: SelectField,
	range: RangeField,
	date_range: RangeField,
	single_select: SingleSelectField,
	entityautocomplete: EntityAutosuggestion,
};
