import React from "react";
import ContentLoader from "react-content-loader";

function RectangleShimmer() {
	return (
		<div>
			<ContentLoader className="initial__setup__shimmer">
				<rect x="20" y="50" rx="4" ry="4" width="196" height="128" />
				<rect x="20" y="205" rx="4" ry="4" width="156" height="20" />
				<rect x="20" y="239" rx="2" ry="2" width="107" height="10" />
			</ContentLoader>
		</div>
	);
}

export default function Shimmer() {
	return (
		<div className="initial__setup__shimmer__container">
			<div className="initial__setup__shimmer__1__wrapper">
				{[0, 1, 2, 3].map((i) => (
					<RectangleShimmer key={i} />
				))}
			</div>
			<div className="initial__setup__shimmer__2__wrapper">
				<ContentLoader className="initial__setup__shimmer__2">
					<rect x="0" y="0" rx="4" ry="4" width="9000" height="900" />
				</ContentLoader>
			</div>
		</div>
	);
}
