import React, { useContext } from "react";
import RoleContext from "../../services/roleContext/roleContext";
import {
	Accordion,
	Card,
	useAccordionToggle,
	AccordionContext,
} from "react-bootstrap";

import GettingStartedItemIcon from "./GettingStartedItemIcon.svg";
import CompletedIcon from "./completed-icon.svg";
import RightArrow from "../../assets/icons/arrow-right.svg";
import DownArrow from "../../assets/getting_started/down_arrow.svg";

function Toggle({ children, eventKey, callback, className, isCompleted }) {
	const currentEventKey = useContext(AccordionContext);

	const decoratedOnClick = useAccordionToggle(
		eventKey,
		() => callback && callback(eventKey)
	);
	const isActive = currentEventKey === eventKey;

	return (
		<div className={`${className} cursor-pointer`} onClick={!isCompleted ? decoratedOnClick : () => null}>
			{children(isActive)}
		</div>
	);
}

export default function GettingStartedItem(props) {

	const { isViewer } = useContext(RoleContext);


	return (
		<Accordion defaultActiveKey="0" className="getting__started-item">
			<Card>
				<Card.Header className="gettingstarted__item__header">
					<Toggle
						eventKey={props.title}
						className="gettingstarted__item__toggle"
						isCompleted={props.isCompleted}
					>
						{(isActive) => <><div className="gettingstarted__item__toggle-left__section">
							<img src={props.isCompleted ? CompletedIcon : props.icon} />
							<span>{props.title}</span>
						</div>
							<div className="gettingstarted__item__toggle-right__section">
								{props.isCompleted ? "Completed" : <><span>{props.timeToComplete}</span>
									<img src={isActive ? DownArrow : RightArrow} /></>}
							</div></>}
					</Toggle>
				</Card.Header>
				<Accordion.Collapse eventKey={props.title}>
					<Card.Body className="gettingstarted__item__body">
						<div className="gettingstarted__item__body__description">{props.description} </div>
						<div className="gettingstarted__item__body__steps">
							{props.steps?.map((step, index) => {
								return (
									<div className="d-flex">
										{index + 1}. <span className="ml-1">{step}</span>
									</div>
								);
							})}
						</div>
						{
							(!props.isCompleted && !isViewer) ?
								props.button
								:
								null
						}
					</Card.Body>
				</Accordion.Collapse>
			</Card>
		</Accordion>
	);
}
