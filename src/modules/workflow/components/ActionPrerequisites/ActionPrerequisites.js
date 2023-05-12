import React, { useState, useRef } from "react";
import { Tooltip } from "react-bootstrap";
import JsxParser from "react-jsx-parser";
import OverlayTooltip from "../../../../UIComponents/OverlayToolTip";
import blueInfo from "assets/workflow/blue-info.svg";
import "./ActionPrerequisites.css";

export default function ActionPrerequisites({ prerequisites, children }) {
	const ref = useRef();
	const [show, setShow] = useState(false);

	return (
		<div className="d-flex justify-content-start">
			<OverlayTooltip
				placement="bottom"
				isStickyTooltip
				overlay={
					<Tooltip bsPrefix="spend-cost-trend-tooltip">
						<AppDescriptionTooltipContent
							prerequisites={prerequisites}
						/>
					</Tooltip>
				}
				setTooltipArrowShow={setShow}
			>
				<div
					className="cursor-default d-flex justify-content-center"
					ref={ref}
					style={{ position: "relative" }}
				>
					{children}
					<div
						hidden={!show}
						style={{ top: "30px" }}
						className="app-description-tooltiparrow"
					></div>
				</div>
			</OverlayTooltip>
		</div>
	);
}

function AppDescriptionTooltipContent({ prerequisites }) {
	return (
		<div
			style={{
				backgroundColor: "rgba(225, 232, 248, 1)",
				minHeight: "20px",
			}}
			className="app-description-tooltip-content"
		>
			{prerequisites.map((prerequisite, index) => {
				return (
					<span
						key={index}
						className="d-flex action_prerequisites mb-2"
					>
						<img
							className="mt-1 mr-1"
							height={"16px"}
							width={"16px"}
							alt=""
							src={blueInfo}
						/>
						<JsxParser
							className="font-12 bold-400 mt-1"
							jsx={prerequisite.text}
						/>
					</span>
				);
			})}
		</div>
	);
}
