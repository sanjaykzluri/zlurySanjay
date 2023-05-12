import React from "react";
import ContentLoader from "react-content-loader";
import NumberPill from "../../../../UIComponents/NumberPill/NumberPill";

export default function HowItWorks({ loading, agent }) {
	const howItWorksLabelAndContentDesktop = [
		{
			label: "Identifying as a SaaS app",
			content:
				"When an application is opened in the Desktop, We fetch the application name and identify the SaaS application from it.",
		},
		{
			label: "Each visit is counted as an activity",
			content:
				"Each time the application is opened is counted as an activity.",
		},
		{
			label: "Analysing the activity data",
			content:
				"Once we have the activities attributed to users, we aggregate that at least at a daily level for the organization & calculate how frequently the user is using an application compared to other users of the same application. This gives us a percentile score for a specific user for an application within that organization.",
		},
	];

	const howItWorksLabelAndContentBrowser = [
		{
			label: "Identifying as a SaaS app",
			content:
				"When an application is opened in the Browser, We track basic metadata of the application like application name, the server URL from where the data is fetched, etc., and identify the SaaS application from it.",
		},
		{
			label: "Each visit is counted as an activity",
			content:
				"Each time the application is opened is counted as an activity.",
		},
		{
			label: "Analysing the activity data",
			content:
				"Once we have the activities attributed to users, we aggregate that at least at a daily level for the organization & calculate how frequently the user is using an application compared to other users of the same application. This gives us a percentile score for a specific user for an application within that organization.",
		},
	];

	return (
		<>
			{loading ? (
				<div className="singleagent__cont__right__d2">
					<HowItWorksLoader />
				</div>
			) : (
				<div className="d-flex flex-column">
					<div className="font-18">How it works</div>
					<div className="singleagent__cont__right__d2">
						{agent?.type === "desktop" &&
							howItWorksLabelAndContentDesktop.map(
								(item, index) => (
									<div
										className="d-flex flex-column"
										style={{
											marginBottom:
												index <
												howItWorksLabelAndContentDesktop.length -
													1
													? "28px"
													: "0px",
										}}
									>
										<div className="d-flex align-items-center">
											<NumberPill number={index + 1} />
											<div
												className="bold-600 font-14"
												style={{ marginLeft: "18px" }}
											>
												{item.label}
											</div>
										</div>
										<div
											className="mt-1 font-12 grey-1"
											style={{ marginLeft: "41px" }}
										>
											{item.content}
										</div>
									</div>
								)
							)}
						{agent?.type === "browser" &&
							howItWorksLabelAndContentBrowser.map(
								(item, index) => (
									<div
										className="d-flex flex-column"
										style={{
											marginBottom:
												index <
												howItWorksLabelAndContentBrowser.length -
													1
													? "28px"
													: "0px",
										}}
									>
										<div className="d-flex align-items-center">
											<NumberPill number={index + 1} />
											<div
												className="bold-600 font-14"
												style={{ marginLeft: "18px" }}
											>
												{item.label}
											</div>
										</div>
										<div
											className="mt-1 font-12 grey-1"
											style={{ marginLeft: "41px" }}
										>
											{item.content}
										</div>
									</div>
								)
							)}
					</div>
				</div>
			)}
		</>
	);
}

function HowItWorksLoader() {
	return (
		<ContentLoader width={497} height={300}>
			<rect y={0} width={497} height={10} fill="#EBEBEB" />
			<rect y={25} width={362} height={10} fill="#EBEBEB" />
			<rect y={50} width={497} height={10} fill="#EBEBEB" />
			<rect y={75} width={362} height={10} fill="#EBEBEB" />
			<rect y={100} width={497} height={10} fill="#EBEBEB" />
			<rect y={125} width={362} height={10} fill="#EBEBEB" />
		</ContentLoader>
	);
}
