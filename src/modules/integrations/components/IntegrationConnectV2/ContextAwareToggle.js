import React, { useState } from "react";
import { useAccordionToggle } from "react-bootstrap";
import downArrowIcon from "../../../../assets/arrowdropdown.svg";
import collapsedICon from "../../../../assets/collapsed_icon_log.svg";
export function ContextAwareToggle({ children, eventKey, callback }) {
	const [toggleState, setToggleState] = useState(false);

	const decoratedOnClick = useAccordionToggle(eventKey, () => {
		setToggleState(!toggleState);
		callback && callback(eventKey);
	});

	return (
		<span className="pl-1">
			<img
				onClick={decoratedOnClick}
				src={toggleState ? collapsedICon : downArrowIcon}
				width="10px"
				className="ml-2"
			/>
		</span>
	);
}
