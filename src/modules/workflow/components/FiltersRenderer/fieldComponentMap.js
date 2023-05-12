// import React from "react"
import StringField from "./StringField";
import AutoSuggestion from "./AutoSuggestion";
import SelectField from "./SelectField";
import RangeField from "./RangeField";
export const fieldComponentMap = {
	multi_string: StringField,
	string: StringField,
	autocomplete: AutoSuggestion,
	select: SelectField,
	range: RangeField,
	date_range: RangeField,
};
