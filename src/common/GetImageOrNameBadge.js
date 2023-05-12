import React from "react";
import { NameBadge } from "./NameBadge";

export default function GetImageOrNameBadge({
	url,
	name,
	height,
	width,
	fontSize,
	borderRadius,
	imageClassName,
	nameClassName,
}) {
	return (
		<>
			{url ? (
				<img
					src={url}
					height={height}
					width={width}
					style={{ borderRadius: borderRadius }}
					className={imageClassName}
				/>
			) : (
				<NameBadge
					name={name}
					height={height || width}
					width={width || height}
					fontSize={fontSize}
					borderRadius={borderRadius}
					className={nameClassName}
				/>
			)}
		</>
	);
}
