import React from "react";
import ContentLoader from "react-content-loader";
import "./RecommendedCardLoader.css";

export default function RecommendedCardLoader(props) {
	const cards = [1, 2, 3, 4, 5].map((res, index) => (
		<div className="d-flex flex-row recommendedItem mt-2" key={index}>
			<ContentLoader
				width={32}
				height={32}
				className="recommendedAppIcon"
			>
				<rect width="32" height="32" rx="2" fill="#EBEBEB" />
			</ContentLoader>
			<div className="d-flex flex-column align-self-center">
				<ContentLoader
					width={200}
					height={32}
					className="recommendedAppIcon"
				>
					<rect
						width="100"
						height="15"
						rx="2"
						fill="#EBEBEB"
						x="12"
					/>
					<rect
						width="200"
						height="11"
						rx="2"
						fill="#EBEBEB"
						y="21"
						x="12"
					/>
				</ContentLoader>
			</div>
		</div>
	));
	return <>{cards}</>;
}
