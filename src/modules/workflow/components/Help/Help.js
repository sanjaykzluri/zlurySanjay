import React from "react";
import "../WorkflowSidebar/WorkflowSidebar.css";
import HelpVideoLinkCard from "../HelpVideoLinkCard/HelpVideoLinkCard";
import HelpLinkCard from "../HelpLinkCard/HelpLinkCard";

function Help() {
	const workflowHelpItems = [
		{
			title: "Onboarding Workflows",
			description: "What are onboarding workflows & how to use them.",
			link: "https://help.zluri.com/en/articles/5800374-onboarding-workflows",
		},
		{
			title: "Offboarding Workflows",
			description: "What are offboarding workflows & how to use them",
			link: "https://help.zluri.com/en/articles/5800377-offboarding-workflows",
		},
	];

	return (
		<div className="tab_content">
			<div className="tab_content_header">Help</div>
			<div className="mt-2 d-flex flex-column">
				<video
					controls
					src="https://zluri-assets-new.s3.us-west-1.amazonaws.com/files/assets/logos/boarding-hero-79542a1dbc97c6489fa81dc14ec5ed01.mp4"
					width="100%"
				></video>
				{workflowHelpItems.map((helpItem, index) => (
					<HelpLinkCard
						key={index}
						title={helpItem.title}
						description={helpItem.description}
						link={helpItem.link}
					/>
				))}
			</div>
		</div>
	);
}

export default Help;
