import React from "react";
import workflow_help_icon from "../../../../assets/workflow/workflow_help_icon.svg";
import arrowRight from "../../../../assets/icons/arrow-right.svg";
import "./HelpLinkCard.css";

function HelpLinkCard(props) {
	return (
		<a
			className="help_link_container"
			href={props.link}
			target="_blank"
			rel="noreferrer"
		>
			<div className="image_box">
				<img src={workflow_help_icon} width={19.5} />
			</div>
			<div className="d-flex flex-column align-self-center ml-2">
				<div className="title text-decoration-none">{props.title}</div>
				<div className="description text-truncate text-decoration-none">
					{props.description}
				</div>
			</div>
			<img
				src={arrowRight}
				width={7}
				height={13}
				className="ml-auto mt-auto mb-auto"
			/>
		</a>
	);
}

export default HelpLinkCard;
