import React, { useEffect, useState } from "react";
import ContentLoader from "react-content-loader";

export function OverviewDetails({ data, loading }) {
	return (
		<>
			{loading ? (
				<>
					<div className="mt-2 d-flex flex-column">
						<ContentLoader
							width={497}
							height={140}
							backgroundColor={`#DDDDDD`}
						>
							<rect
								y={0}
								width={497}
								height={10}
								fill="#EBEBEB"
							/>
							<rect
								y={25}
								width={362}
								height={10}
								fill="#EBEBEB"
							/>
							<rect
								y={50}
								width={497}
								height={10}
								fill="#EBEBEB"
							/>
							<rect
								y={75}
								width={362}
								height={10}
								fill="#EBEBEB"
							/>
							<rect
								y={100}
								width={497}
								height={10}
								fill="#EBEBEB"
							/>
							<rect
								y={125}
								width={362}
								height={10}
								fill="#EBEBEB"
							/>
						</ContentLoader>
						<div className="mt-1 d-flex">
							<ContentLoader
								width={900}
								height={170}
								backgroundColor={`#DDDDDD`}
							>
								{[1, 2, 3].map((el, index) => (
									<rect
										x={260 * index + 10 * index}
										width={260}
										height={170}
										fill="#EBEBEB"
									/>
								))}
							</ContentLoader>
						</div>
					</div>
				</>
			) : (
				<>
					<div
						className="d-flex flex-column"
						style={{ marginTop: "15px" }}
					>
						<div className="font-14 grey">{data?.description}</div>
						<div
							className="d-flex align-items-center flex-wrap"
							style={{ marginTop: "15px" }}
						>
							{Array.isArray(data?.images) &&
								data?.images?.length > 0 &&
								data?.images.map((el, index) => (
									<div
										className={`${
											index > 0 ? "ml-2" : ""
										} `}
										style={{ width: " fit-content" }}
									>
										<img src={el}></img>
									</div>
								))}
						</div>
					</div>
				</>
			)}
		</>
	);
}
