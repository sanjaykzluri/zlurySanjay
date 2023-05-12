import React from "react";
import ContentLoader from "react-content-loader";

export function PRLoader(props) {
	const loader = [1, 2, 3, 4, 5, 6, 7].map((res, index) => (
		<div
			key={index}
			className="d-flex flex-row justify-content-between align-items-center border-1 p-3 border-radius-4 mb-2"
		>
			<div className="flex-fill" style={{ minWidth: "25%" }}>
				<ContentLoader
					speed={2}
					width={26}
					height={26}
					viewBox="0 0 30 30"
					backgroundColor="#f3f3f3"
					foregroundColor="#ecebeb"
					{...props}
				>
					<circle cx="13" cy="13" r="13" />
				</ContentLoader>
				<p className="bold-400 font-13 black-1 m-0  d-inline-block flex-fill">
					<ContentLoader
						speed={2}
						width={80}
						height={16}
						viewBox="0 0 80 16"
						backgroundColor="#f3f3f3"
						foregroundColor="#ecebeb"
						{...props}
					>
						<rect width="80" height="16" />
					</ContentLoader>
				</p>
			</div>
			<div className="flex-fill" style={{ minWidth: "12%" }}>
				<p className="bold-400 font-13 black-1 m-0 text-capitalize">
					<ContentLoader
						speed={2}
						width={80}
						height={16}
						viewBox="0 0 80 16"
						backgroundColor="#f3f3f3"
						foregroundColor="#ecebeb"
						{...props}
					>
						<rect width="80" height="16" />
					</ContentLoader>
				</p>
			</div>
			<div className="flex-fill" style={{ minWidth: "13%" }}>
				<p className="bold-400 font-13 black-1 m-0">
					<ContentLoader
						speed={2}
						width={90}
						height={16}
						viewBox="0 0 90 16"
						backgroundColor="#f3f3f3"
						foregroundColor="#ecebeb"
						{...props}
					>
						<rect width="90" height="16" />
					</ContentLoader>
				</p>
			</div>
			<div className="flex-fill" style={{ minWidth: "25%" }}>
				<p className="bold-400 font-13 grey-1 m-0">
					<ContentLoader
						speed={2}
						width={180}
						height={16}
						viewBox="0 0 180 16"
						backgroundColor="#f3f3f3"
						foregroundColor="#ecebeb"
						{...props}
					>
						<rect width="180" height="16" />
					</ContentLoader>
				</p>
			</div>
			<div className="flex-fill" style={{ minWidth: "25%" }}>
				<ul className="list-style-none p-0 m-0 d-flex justify-content-around">
					<li>
						<ContentLoader
							speed={2}
							width={80}
							height={16}
							viewBox="0 0 80 16"
							backgroundColor="#f3f3f3"
							foregroundColor="#ecebeb"
							{...props}
						>
							<rect width="80" height="16" />
						</ContentLoader>
					</li>
					<li>
						<ContentLoader
							speed={2}
							width={80}
							height={16}
							viewBox="0 0 80 16"
							backgroundColor="#f3f3f3"
							foregroundColor="#ecebeb"
							{...props}
						>
							<rect width="80" height="16" />
						</ContentLoader>
					</li>
				</ul>
			</div>
		</div>
	));

	return loader;
}
