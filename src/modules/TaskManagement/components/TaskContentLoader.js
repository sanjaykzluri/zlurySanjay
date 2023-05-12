import ContentLoader from "react-content-loader";
import React from "react";

const ContentLoaderHelper = ({ number, height }) => {
	return (
		<ContentLoader
			style={{
				/* white */
				width: "100%",
				height: height,
				background: "#FFFFFF",
				borderRadius: "10px",
				padding: "0px",
				marginBottom: "10px",
			}}
		>
			<circle cx="15" cy="15" r="10" />
			<rect x="6%" y="10" rx="6" ry="6" width="25%" height="13" />
			<rect x="72%" y="10" rx="6" ry="6" width="25%" height="13" />
			{Array.from(Array(number), (e, i) => {
				const y = (i + 1) * 30 + 12;
				const cy = (i + 1) * 30 + 17;
				return (
					<>
						<circle cx="23" cy={cy} r="8" />
						<rect
							x="8%"
							y={y}
							rx="6"
							ry="6"
							width="54%"
							height="13"
						/>
						<rect
							x="65%"
							y={y}
							rx="6"
							ry="6"
							width="15%"
							height="13"
						/>
						<rect
							x="82%"
							y={y}
							rx="6"
							ry="6"
							width="6%"
							height="13"
						/>
						<rect
							x="91%"
							y={y}
							rx="6"
							ry="6"
							width="6%"
							height="13"
						/>
					</>
				);
			})}
		</ContentLoader>
	);
};
export default function TaskContentLoader() {
	return (
		<>
			<div>
				<ContentLoaderHelper number={3} height="16%" />
				<ContentLoaderHelper number={1} height="9%" />
				<ContentLoaderHelper number={4} height="21%" />
				<ContentLoaderHelper number={1} height="9%" />
				<ContentLoaderHelper number={1} height="9%" />
			</div>
		</>
	);
}
