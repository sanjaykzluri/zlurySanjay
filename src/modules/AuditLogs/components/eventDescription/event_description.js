import React from "react";
import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import useImage from "./useImage";
import { useImagefromEntities } from "../custom_hooks/useImagefromEntities";

EventDescription.propTypes = {
	event_title: PropTypes.string.isRequired,
	event_description: PropTypes.string.isRequired,
	id: PropTypes.string.isRequired,
	entity: PropTypes.string.isRequired,
	showdescription: PropTypes.array.isRequired,
};

export function EventDescription({
	event_title,
	event_description,
	showdescription,
	id,
	entity,
	setshowmetadata,
	setrowData,
	row_data,
}) {
	const isCancelled = React.useRef(false);
	useEffect(() => {
		return () => {
			isCancelled.current = true;
		};
	}, []);
	const [data] = useImage(event_description, isCancelled);
	const [image] = useImagefromEntities(entity, isCancelled);
	return (
		<div
			className="d-flex"
			style={{
				width: "350px",
				whiteSpace: "break-spaces",
				wordBreak: "break-word",
			}}
		>
			<div className="d-flex" style={{ marginRight: "4px" }}>
				<img src={image} alt="" width="20px" height="20px" />
			</div>
			<div style={{ position: "relative" }}>
				<div dangerouslySetInnerHTML={{ __html: event_title }} />
				{showdescription.includes(id) && (
					<>
						<div
							style={{
								fontSize: "10px",
								color: "#717171",
								background: "rgba(235, 235, 235, 0.2)",
								border: "0.5px solid #EBEBEB",
								borderRadius: "4px",
								padding: "4px 8px",
							}}
							dangerouslySetInnerHTML={{
								__html: data,
							}}
						/>
						<button
							style={{
								color: "#2266E2",
								backgroundRepeat: "no-repeat",
								border: "none",
								cursor: "pointer",
								overflow: "hidden",
								outline: "none",
								backgroundColor: "transparent",
								fontSize: "12px",
								fontFamily: "Sora",
							}}
							onClick={() => {
								setrowData(row_data);
								setshowmetadata(true);
							}}
						>
							More Info
						</button>
					</>
				)}
			</div>
		</div>
	);
}
