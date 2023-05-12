import React from "react";
import { YAxisLabel } from "./YAxisLabel";

export const RenderYAxis = ({ data, maxValue }) => {
	return (
		<>
			<div className="spendvscost__yaxis">
				{Array(5)
					.fill(null)
					?.map((el, i) => (
						<YAxisLabel
							maxvalue={maxValue === 0 ? 1000 : maxValue}
							num={i}
							key={i}
						/>
					))}
			</div>
		</>
	);
};
