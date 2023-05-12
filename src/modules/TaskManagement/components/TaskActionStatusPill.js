import React from "react";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import { getTaskActionPillProps } from "../util/TaskManagement.utils";
import { taskActionStatuses } from "../constants/TaskManagement.constants";

export default function TaskActionStatusPill({ action }) {
	return (
		<>
			<div className="d-flex ml-auto">
				<NumberPill
					pillWidth="fit-content"
					pillHeight="16px"
					borderRadius="99px"
					fontSize="8px"
					fontWeight="600"
					style={{
						padding:
							action.status === taskActionStatuses.failed.value
								? "4px 8px 4px 0px"
								: "4px 8px",
					}}
					{...getTaskActionPillProps(action)}
				/>
			</div>
		</>
	);
}
