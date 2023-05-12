import React from "react";
import { kFormatter } from "../../../constants/currency";

export const YAxisLabel = ({ maxvalue, num }) => {
	const labelvalue = (num * maxvalue) / 4;
	return (
		<>
			<div className="spendvscost__yaxis__label">
				{kFormatter(labelvalue)}
			</div>
		</>
	);
};
