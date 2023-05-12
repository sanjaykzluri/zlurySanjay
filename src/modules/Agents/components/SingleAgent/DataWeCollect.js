import React from "react";
import ContentLoader from "react-content-loader";
import greenTick from "../../../../assets/green_tick.svg";
import dataWeCollect from "../../../../assets/agents/dataWeCollect.svg";

export default function DataWeCollect({ loading, agent }) {
	const dataWeCollectDesktopContent = [
		"Device Information",
		"List of Applications running in the background",
		"All softwares / applications are installed on the device",
		"The time for the application has been running",
		"Launching & closing of an application",
	];

	const dataWeCollectBrowserContent = [
		"The URL opened in the tab",
		"The title of the webpage",
		"The timestamp of open/closing of the tab",
	];

	return (
		<>
			{loading ? (
				<div className="singleagent__cont__right__d2">
					<DataWeCollectLoader />
				</div>
			) : (
				<div className="d-flex flex-column">
					<div className="font-18" style={{ marginTop: "30px" }}>
						Data we collect
					</div>
					<div className="singleagent__cont__right__d2">
						<div className="d-flex">
							<img src={dataWeCollect} width={35} height={35} />
							<div
								className="d-flex flex-column justify-content-between"
								style={{ marginLeft: "12px" }}
							>
								<div className="bold-600 font-14">
									Data Collected
								</div>
								<div className="grey-1 font-10">
									We collect only non-sensitive information
									from your system, which is listed below.
								</div>
							</div>
						</div>
						<div className="data-we-collect-grid">
							<>
								{agent?.type === "desktop" &&
									dataWeCollectDesktopContent.map(
										(item, index) => (
											<div
												className="d-flex align-items-center"
												key={index}
												style={{ height: "auto" }}
											>
												<img
													src={greenTick}
													height={12}
													width={12}
												/>
												<div
													className="font-10"
													style={{
														marginLeft: "12px",
													}}
												>
													{item}
												</div>
											</div>
										)
									)}
								{agent?.type === "browser" &&
									dataWeCollectBrowserContent.map(
										(item, index) => (
											<div
												className="d-flex align-items-center"
												key={index}
												style={{ height: "auto" }}
											>
												<img
													src={greenTick}
													height={12}
													width={12}
												/>
												<div
													className="font-10"
													style={{
														marginLeft: "12px",
													}}
												>
													{item}
												</div>
											</div>
										)
									)}
							</>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

function DataWeCollectLoader() {
	return (
		<div className="d-flex flex-column">
			<ContentLoader height={50}>
				<circle cx="17.5" cy="17.5" r="17.5" fill="#EBEBEB" />
			</ContentLoader>
			<ContentLoader width={497} height={300}>
				<rect y={0} width={497} height={10} fill="#EBEBEB" />
				<rect y={25} width={362} height={10} fill="#EBEBEB" />
			</ContentLoader>
		</div>
	);
}
