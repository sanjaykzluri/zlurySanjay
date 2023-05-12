import React from "react";
import { useContext } from "react";
import { Card } from "react-bootstrap";
import RoleContext from "services/roleContext/roleContext";
import ArrowCorner from "./arrow-corner-right.svg";

export default function ResourcesCard(props) {
	const { partner } = useContext(RoleContext);
	const resourceLinks = [
		{
			title: `How to add users to ${partner?.name}`,
			url: "https://help.zluri.com/en/articles/5305875-how-to-add-a-new-user-on-zluri",
		},
		{
			title: `How much does ${partner?.name} cost`,
			url: "https://www.zluri.com/pricing",
		},
		{
			title: "Calculate return on investment",
			url: "https://www.zluri.com/return-on-investment-calculator/",
		},
		{
			title: `Add transactions to ${partner?.name}`,
			url: "https://help.zluri.com/en/collections/2823475-transactions",
		},
		{ title: `Why ${partner?.name}`, url: "https://www.zluri.com/" },
	];

	return (
		<div className="getting__started__right__section">
			<Card>
				<Card.Header className="resources-header">
					RESOURCES
				</Card.Header>
				<Card.Body>
					{resourceLinks.map(({ title, url }) => (
						<div
							key={url}
							className="getting__started-resource-link"
						>
							<a target="_blank" href={url} rel="noreferrer">
								{title} <img src={ArrowCorner} />
							</a>
						</div>
					))}
				</Card.Body>
			</Card>
		</div>
	);
}
