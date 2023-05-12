import React from "react";
import playIcon from "../../../../assets/workflow/playIcon.png";
import workflowHelpBackground from "../../../../assets/workflow/workflowHelpBackground.png";
import "./HelpVideoLinkCard.css";

function HelpVideoLinkCard(props) {
	return (
		<div
			className="help_video_container d-flex"
			style={{
				backgroundImage: `url(${workflowHelpBackground})`,
			}}
		>
			<div className="text-white m-auto font-24 w-75 text-center">
				{props.name}
			</div>
			<a href={props.link} target="_blank" rel="noreferrer">
				<img src={playIcon} width={45} />
			</a>
		</div>
	);
}

export default HelpVideoLinkCard;
