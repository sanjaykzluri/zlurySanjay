import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import DirectSource from "../../modules/shared/components/ManualUsage/TableComponents/DirectSource";

export function displaySources(values) {
	if (!values || !values.length) return "No sources";
	if (values && values.length > 3) {
		return (
			<>
				<div className="d-flex align-items-center">
					{values.slice(0, 3).map((source) => (
						<DirectSource
							source={[source]}
							noActionOnClick={true}
						/>
					))}
					<OverlayTrigger
						placement="bottom"
						overlay={
							<Tooltip className="userMetaInfoCard">
								<div
									style={{
										padding: "10px",
									}}
								>
									{values.map((source) => (
										<DirectSource
											source={[source]}
											noActionOnClick={true}
										/>
									))}
								</div>
							</Tooltip>
						}
					>
						<div
							style={{
								fontWeight: 600,
								color: "#717171",
								cursor: "pointer",
								marginRight: "2px",
								border: "1px solid rgb(131 126 126 / 40%)",
								borderRadius: "50%",
								padding: "2px 4px",
								fontSize: "12px",
							}}
						>
							+{values.length}
						</div>
					</OverlayTrigger>
				</div>
			</>
		);
	}
	return values.map((source) => (
		<DirectSource source={[source]} noActionOnClick={true} />
	));
}
