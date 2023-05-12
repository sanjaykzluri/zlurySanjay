import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import InformationCircle from "../../assets/information-circle.svg";
import GetImageOrNameBadge from "../GetImageOrNameBadge";
import "./SuggestionChips.css";

export default function SuggestionChips({
	suggestions = [],
	imgKey,
	nameKey,
	onClick,
	showImg = true,
}) {
	return (
		<div className="d-flex">
			{Array.isArray(suggestions) &&
				suggestions.map((item, index) => (
					<div
						className="form-suggestion-chip"
						onClick={() => onClick(item, index)}
					>
						{showImg && (
							<GetImageOrNameBadge
								name={item[nameKey]}
								url={item[imgKey]}
								width={16}
								height={16}
							/>
						)}
						<OverlayTrigger
							overlay={<Tooltip>{item[nameKey]}</Tooltip>}
							placement="top"
						>
							<div className="ml-1 font-14 form-suggestion-name">
								{item[nameKey]}
							</div>
						</OverlayTrigger>
					</div>
				))}
		</div>
	);
}
