import React from "react";
import { Card } from "react-bootstrap";
import HelpIcon from "./help.svg";
export default function HelpCard(props) {
	return (
		<div className="getting__started__right__section">
			<Card>
				<Card.Body>
					<img src={HelpIcon} />
					<a
						target="_blank"
						rel="noreferrer"
						href="https://help.zluri.com"
					>
						Need Help ?
					</a>
				</Card.Body>
			</Card>
		</div>
	);
}
