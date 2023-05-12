import React from "react";
import ContentLoader from "react-content-loader";

const ActionLoader = () => {
	return (
		<div className="d-flex flex-column pl-4 pr-4 pt-4">
			<div className="d-flex flex-row align-items-center">
				<ContentLoader
					style={{ marginRight: 8 }}
					width={40}
					height={40}
				>
					<circle cx="20" cy="20" r="20" fill="#EBEBEB" />
				</ContentLoader>
				<ContentLoader width={250} height={30}>
					<rect width="250" height="30" rx="2" fill="#EBEBEB" />
				</ContentLoader>
			</div>
			<div className="d-flex flex-row align-items-center ml-5">
				<ContentLoader width={350} height={10}>
					<rect width="350" height="10" rx="2" fill="#EBEBEB" />
				</ContentLoader>
			</div>
			<div className="d-flex flex-row align-items-center ml-5 mt-2">
				<ContentLoader
					style={{ marginRight: 5 }}
					width={120}
					height={30}
				>
					<rect width="120" height="30" rx="2" fill="#EBEBEB" />
				</ContentLoader>
				<ContentLoader
					style={{ marginRight: 5 }}
					width={120}
					height={30}
				>
					<rect width="120" height="30" rx="2" fill="#EBEBEB" />
				</ContentLoader>
				<ContentLoader width={91} height={30}>
					<rect width="91" height="30" rx="2" fill="#EBEBEB" />
				</ContentLoader>
			</div>
			<div className="d-flex flex-row align-items-center ml-5 mt-2">
				<ContentLoader width={350} height={20}>
					<rect width="350" height="20" rx="2" fill="#EBEBEB" />
				</ContentLoader>
			</div>
			<div style={{ borderBottom: "1px solid #EBEBEB", marginTop: 16 }} />
		</div>
	);
};

export default ActionLoader;
