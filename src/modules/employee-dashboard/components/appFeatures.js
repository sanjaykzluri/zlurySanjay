import React, { useEffect, useState } from "react";
import greenTick from "assets/employee/greenTick.svg";
import ContentLoader from "react-content-loader";

export function AppFeatures({ data, loading }) {
	const [viewMore, setViewMore] = useState(false);
	return (
		<>
			{loading ? (
				<div className="d-flex ">
					{[1, 2, 3, 4].map(() => (
						<div className="mr-2">
							<ContentLoader
								width={150}
								height={135}
								backgroundColor={`#DDDDDD`}
							>
								<rect
									y={0}
									width={150}
									height={15}
									fill="#EBEBEB"
								/>
								<rect
									y={40}
									width={150}
									height={15}
									fill="#EBEBEB"
								/>
								<rect
									y={80}
									width={150}
									height={15}
									fill="#EBEBEB"
								/>
								<rect
									y={120}
									width={150}
									height={15}
									fill="#EBEBEB"
								/>
							</ContentLoader>{" "}
						</div>
					))}
				</div>
			) : data?.length ? (
				<>
					<div
						className="font-16 black-1 bold-600"
						style={{ marginTop: "20px" }}
						id="insights__c"
					>
						Features
					</div>
					<div className="features-grid">
						{data?.map((el, index) => {
							if (viewMore) {
								return (
									<div className="d-flex align-items-center">
										<img src={greenTick}></img>
										<div className="font-14 grey ml-2">
											{el.feature_name}
										</div>
									</div>
								);
							} else {
								if (index < 6) {
									return (
										<div className="d-flex align-items-center">
											<img src={greenTick}></img>
											<div className="font-14 grey ml-2">
												{el.feature_name}
											</div>
										</div>
									);
								}
							}
						})}
						{data?.length > 6 && (
							<div
								className="glow_blue cursor-pointer font-14"
								onClick={() => setViewMore(!viewMore)}
								style={{ width: "fit-content" }}
							>
								{viewMore ? `View Less` : `View More`}
							</div>
						)}
					</div>
				</>
			) : null}
		</>
	);
}
