import React from "react";
import ContentLoader from "react-content-loader";

export function CategoryLoader(props) {
	const list = [1, 2, 3, 4, 5, 6].map((res, index) => (
		<li key={index} className="pointer font-14 black-1 mt-1 p-2 pl-3">
			<ContentLoader
				speed={2}
				width={128}
				height={15}
				viewBox="0 0 108 14"
				backgroundColor="#f3f3f3"
				foregroundColor="#ecebeb"
				{...props}
			>
				<rect width="128" height="15" />
			</ContentLoader>
		</li>
	));

	return <>{list}</>;
}
