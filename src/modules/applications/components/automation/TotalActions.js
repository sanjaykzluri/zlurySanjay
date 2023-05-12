import React from "react";
import infoCircle from "assets/licenses/infocircle.svg";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const TotalActions = ({ playbook }) => {
	const customTooltip = (
		<div className="d-flex flex-column">
			<div className="">
				Automated Action : {playbook?.automated_action_count || 0}{" "}
			</div>
			<div className="">
				Manual Action : {playbook?.manual_action_count || 0}{" "}
			</div>
		</div>
	);
	return (
		<>
			<div className="d-flex flex-row ml-4 align-items-center">
				<div
					className="mr-2"
					style={{
						color: "#868686",
						minwidth: "10px",
						width: "auto",
					}}
				>
					{playbook?.action_count ||
						playbook?.workflow_action_count ||
						0}
				</div>
				<OverlayTrigger
					placement="bottom"
					overlay={<Tooltip>{customTooltip}</Tooltip>}
				>
					<img src={infoCircle} alt="" />
				</OverlayTrigger>
			</div>
		</>
	);
};

export default TotalActions;
