import { Button } from "../../../../UIComponents/Button/Button";
import React from "react";

export default function WorkflowTableCTA(props) {
	const { title, onClick } = props;
	return (
		<div className="flex flex-row align-items-center workflow-action-component">
			<div className="d-flex flex-column workflow-action-container">
				<Button
					type="link"
					className="text-decoration-none font-13"
					onClick={(e) => {
						if (onClick) {
							onClick(e);
						}
					}}
				>
					{title}
				</Button>
			</div>
		</div>
	);
}
