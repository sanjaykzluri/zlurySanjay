import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "./DottedProgress.css";

export const Dots = (props) => (
	<div
		className="dotprogress__dot"
		style={{
			background: props.color,
			height: props.size ? props.size : 8,
			width: props.size ? props.size : 8,
		}}
	></div>
);

export function DottedProgress(props) {
	return (
		<OverlayTrigger
			placement="top"
			overlay={<Tooltip>{props.value?.toFixed(2) + "%" || "0%"}</Tooltip>}
		>
			<div
				className={`dotprogress__cont ${
					props.isNotActive ? "o-6" : ""
				}`}
			>
				{props.value === 0 && (
					<>
						<Dots color={"#DDDDDD"}></Dots>
						<Dots color={"#DDDDDD"}></Dots>
						<Dots color={"#DDDDDD"}></Dots>
						<Dots color={"#DDDDDD"}></Dots>
					</>
				)}
				{props.value > 0 && props.value <= 25 && (
					<>
						<Dots color={"#5ABAFF"}></Dots>
						<Dots color={"#DDDDDD"}></Dots>
						<Dots color={"#DDDDDD"}></Dots>
						<Dots color={"#DDDDDD"}></Dots>
					</>
				)}
				{props.value > 25 && props.value <= 50 && (
					<>
						<Dots color={"#5ABAFF"}></Dots>
						<Dots color={"#5ABAFF"}></Dots>
						<Dots color={"#DDDDDD"}></Dots>
						<Dots color={"#DDDDDD"}></Dots>
					</>
				)}
				{props.value > 50 && props.value <= 75 && (
					<>
						<Dots color={"#5ABAFF"}></Dots>
						<Dots color={"#5ABAFF"}></Dots>
						<Dots color={"#5ABAFF"}></Dots>
						<Dots color={"#DDDDDD"}></Dots>
					</>
				)}
				{props.value > 75 && props.value <= 100 && (
					<>
						<Dots color={"#5ABAFF"}></Dots>
						<Dots color={"#5ABAFF"}></Dots>
						<Dots color={"#5ABAFF"}></Dots>
						<Dots color={"#5ABAFF"}></Dots>
					</>
				)}
			</div>
		</OverlayTrigger>
	);
}
