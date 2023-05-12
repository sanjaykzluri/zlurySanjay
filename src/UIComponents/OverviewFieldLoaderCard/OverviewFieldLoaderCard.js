import React from "react";
import ContentLoader from "react-content-loader";

export const OverviewFieldLoaderCard = () => (
	<div className="eventCard mb-3 ml-3 mr-3">
		<ContentLoader height="105" width="100%">
			<rect width="160" height="10" rx="2" fill="#EBEBEB" y="15" x="20" />
			<rect
				width="50%"
				height="17"
				rx="2"
				x={100}
				fill="#EBEBEB"
				y="35"
				x="20"
			/>
			<rect
				width="80%"
				height="12"
				rx="2"
				x={100}
				fill="#EBEBEB"
				y="63"
				x="20"
			/>
			<rect
				width="40%"
				height="12"
				rx="2"
				x={100}
				fill="#EBEBEB"
				y="85"
				x="20"
			/>
		</ContentLoader>
	</div>
);
