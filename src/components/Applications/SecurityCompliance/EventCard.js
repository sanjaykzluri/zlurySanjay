import React from "react";
import "./EventCard.css";
import moment from "moment";
import ImpactStatus from "./ImpactStatus";
import ShowMoreText from "react-show-more-text";

export default function EventCard(props) {
	return (
		<div className="eventCard mt-2">
			<div className="d-flex flex-row">
				<div className="grey-1 font-11 o-5">
					{props.event.event_date
						? moment(props.event.event_date).format("DD MMMM YYYY")
						: "unavailable"}
				</div>
				{Number.isInteger(parseInt(props.event.impact)) ? (
					<>
						<hr
							className="mt-0 mb-0 ml-1 mr-1 o-5"
							style={{
								height: "auto",
								borderRight: "0.2px solid #717171",
							}}
						/>
						<div>
							<ImpactStatus impact={props.event.impact} />
						</div>
					</>
				) : null}
			</div>
			<div
				className={`font-16 bold-600 mt-2 ${
					props.isRecentEvent ? "grey" : "grey-1"
				}`}
			>
				{props.event.link ? (
					<a href={props.event.link} target="_blank" rel="noreferrer">
						{props.event.title}
					</a>
				) : (
					<>{props.event.title}</>
				)}
			</div>
			{props.event.description && (
				<div className="font-13 grey-1 mt-1">
					<ShowMoreText
						lines={2}
						more="Read more"
						less="View less"
						expanded={false}
					>
						{props.event.description}
					</ShowMoreText>
				</div>
			)}
		</div>
	);
}
