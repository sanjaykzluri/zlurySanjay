import React from "react";
import ContentLoader from "react-content-loader";

export function ReportCardLoader(props) {
	const list = [1, 2, 3, 4, 5, 6, 7, 8].map((res, index) => (
		<div
			key={index}
			className="z_i_card text-capitalize text-center border-1 border-radius-4 p-2 pointer mr-3 mb-3"
		>
			<ContentLoader
				style={{ marginRight: 8, marginBottom: 10 }}
				width={60}
				height={60}
			>
				<circle cx="30" cy="30" r="30" fill="#EBEBEB" />
			</ContentLoader>
			<br />
			<ContentLoader
				speed={2}
				width={108}
				height={14}
				viewBox="0 0 108 14"
				backgroundColor="#f3f3f3"
				foregroundColor="#ecebeb"
				{...props}
			>
				<rect width="108" height="14" />
			</ContentLoader>
			<br />
			<ContentLoader
				speed={2}
				width={76}
				height={9}
				viewBox="0 0 76 9"
				backgroundColor="#f3f3f3"
				foregroundColor="#ecebeb"
				{...props}
			>
				<rect width="76" height="9" />
			</ContentLoader>
			<ContentLoader
				style={{ marginTop: 5 }}
				speed={2}
				width={160}
				height={9}
				viewBox="0 0 160 9"
				backgroundColor="#f3f3f3"
				foregroundColor="#ecebeb"
				{...props}
			>
				<rect width="160" height="9" />
			</ContentLoader>
			<ContentLoader
				speed={2}
				width={132}
				height={9}
				viewBox="0 0 132 9"
				backgroundColor="#f3f3f3"
				foregroundColor="#ecebeb"
				{...props}
			>
				<rect width="132" height="9" />
			</ContentLoader>
			<ContentLoader
				style={{ marginTop: 5 }}
				speed={2}
				width={136}
				height={34}
				viewBox="0 0 136 34"
				backgroundColor="#f3f3f3"
				foregroundColor="#ecebeb"
				{...props}
			>
				<rect width="136" height="34" />
			</ContentLoader>
		</div>
	));

	return <>{list}</>;
}
