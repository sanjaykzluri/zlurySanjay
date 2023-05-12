import React from "react";
import GSuite from "../modules/shared/components/ManualUsage/TableComponents/GSuite";
import DirectSource from "../modules/shared/components/ManualUsage/TableComponents/DirectSource";

const sourceIconMap = {
	gsuite: <GSuite />,
};

export function SourceIconCell({ sources }) {
	return (
		<div className="d-flex">
			{sources
				.filter((src) => src !== "manual")
				.map((source, index) => {
					return (
						sourceIconMap[source] || (
							<div key={index}>
								<DirectSource source={source} />
							</div>
						)
					);
				})}
		</div>
	);
}
