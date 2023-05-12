import React from "react";
import ContentLoader from "react-content-loader";

export function TemplateCardLoader(props) {
	const list = [1, 2, 3].map((res, index) => (
		<div
			key={index}
			className="d-flex flex-column workflow-template-card border-radius-4  p-3 mb-3"
		>
			<ContentLoader
				style={{ marginRight: 8, marginBottom: 10 }}
				width={26}
				height={26}
			>
				<circle cx="13" cy="13" r="13" fill="#EBEBEB" />
			</ContentLoader>

			<ContentLoader
				speed={2}
				width={108}
				height={14}
				viewBox="0 0 108 14"
				backgroundColor="#f3f3f3"
				foregroundColor="#ecebeb"
				{...props}
				style={{ marginBottom: 5 }}
			>
				<rect width="108" height="14" />
			</ContentLoader>

			<ContentLoader
				speed={2}
				width={80}
				height={10}
				viewBox="0 0 80 10"
				backgroundColor="#f3f3f3"
				foregroundColor="#ecebeb"
				{...props}
				style={{ marginBottom: 10 }}
			>
				<rect width="80" height="10" />
			</ContentLoader>

			<ContentLoader
				speed={2}
				width={132}
				height={8}
				viewBox="0 0 132 8"
				backgroundColor="#f3f3f3"
				foregroundColor="#ecebeb"
				{...props}
			>
				<rect width="132" height="9" />
			</ContentLoader>
		</div>
	));

	return <>{list}</>;
}
