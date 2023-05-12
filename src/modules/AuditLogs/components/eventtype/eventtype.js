import React from "react";
import "./eventype.css";
import PropTypes from "prop-types";
EventType.propTypes = {
	event_type: PropTypes.string.isRequired,
};
export function EventType({ event_type }) {
	return (
		<div className={`event_type_wrapper event_type_${event_type}`}>
			{event_type}
		</div>
	);
}
