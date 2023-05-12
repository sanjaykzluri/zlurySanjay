import React from "react";
import { useEffect } from "react";
import { sourceInfo } from "../constants/completed";

const PlaybookSourceType = ({ source, userName, workflowName }) => {
	return (
		<div className="flex flex-row align-items-center workflow-status-component">
			<div className="d-flex flex-column workflow-status-container">
				<div
					className="truncate_10vw workflow-status-user"
					style={{ margin: "auto" }}
				>
					<div className="d-flex">
						<img
							className="mr-1"
							alt=""
							src={sourceInfo(userName)?.[source]?.image}
						/>
						<div className="d-flex flex-column">
							<span>{sourceInfo(userName)?.[source]?.title}</span>

							<div style={{ display: "flex", width: "auto" }}>
								<span className="truncate_10vw created-at-user grey-1 font-8">
									{sourceInfo(userName)?.[source]?.subscript}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PlaybookSourceType;
