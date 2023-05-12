import React from "react";
import "./OverviewTop.css";
import ContentLoader from "react-content-loader";
export function OverviewTop(props) {
	return (
		<>
			{props.loading ? (
				<>
					<div className="agentoverviewtop__box">
						<div className="agentoverviewtop__box__d1">
							<ContentLoader width={200} height={14}>
								<rect width={200} height={14} fill="#EBEBEB" />
							</ContentLoader>
						</div>
						<div
							className="agentoverviewtop__box__d2"
							style={{ marginTop: "15px" }}
						>
							<ContentLoader width={100} height={34}>
								<rect width={100} height={34} fill="#EBEBEB" />
							</ContentLoader>
						</div>
						<div
							className="agentoverviewtop__box__d3"
							style={{ marginTop: "15px" }}
						>
							<ContentLoader width={100} height={14}>
								<rect width={100} height={14} fill="#EBEBEB" />
							</ContentLoader>
						</div>
					</div>
					<div className="agentoverviewtop__box">
						<div className="agentoverviewtop__box__d1">
							<ContentLoader width={200} height={14}>
								<rect width={200} height={14} fill="#EBEBEB" />
							</ContentLoader>
						</div>
						<div
							className="agentoverviewtop__box__d2"
							style={{ marginTop: "15px" }}
						>
							<ContentLoader width={100} height={34}>
								<rect width={100} height={34} fill="#EBEBEB" />
							</ContentLoader>
						</div>
						<div
							className="agentoverviewtop__box__d3"
							style={{ marginTop: "15px" }}
						>
							<ContentLoader width={100} height={14}>
								<rect width={100} height={14} fill="#EBEBEB" />
							</ContentLoader>
						</div>
					</div>

					<div className="agentoverviewtop__box">
						<div className="agentoverviewtop__box__d1">
							<ContentLoader width={200} height={14}>
								<rect width={200} height={14} fill="#EBEBEB" />
							</ContentLoader>
						</div>
						<div
							className="agentoverviewtop__box__d2"
							style={{ marginTop: "15px" }}
						>
							<ContentLoader width={100} height={34}>
								<rect width={100} height={34} fill="#EBEBEB" />
							</ContentLoader>
						</div>
						<div
							className="agentoverviewtop__box__d3"
							style={{ marginTop: "15px" }}
						>
							<ContentLoader width={100} height={14}>
								<rect width={100} height={14} fill="#EBEBEB" />
							</ContentLoader>
						</div>
					</div>
				</>
			) : (
				<>
					<div className="agentoverviewtop__box">
						<div className="agentoverviewtop__box__d1">
							Atleast one Agent installed
						</div>
						<div className="agentoverviewtop__box__d2">
							<div className="agentoverviewtop__box__d2__d1">
								{Number(
									(
										props.data?.atleast_1_agent?.value || 0
									).toFixed(2)
								) || "0"}
								%
							</div>
						</div>
						<div className="agentoverviewtop__box__d3">
							{props.data?.atleast_1_agent?.users} of{" "}
							{props.data?.atleast_1_agent?.total_users} users
						</div>
					</div>
					<div className="agentoverviewtop__box">
						<div className="agentoverviewtop__box__d1">
							Atleast One Browser agent installed
						</div>
						<div className="agentoverviewtop__box__d2">
							<div className="agentoverviewtop__box__d2__d1">
								{Number(
									(
										props.data?.atleast_1__browser_agent
											.value || 0
									).toFixed(2)
								) || "0"}
								%
							</div>
						</div>
						<div className="agentoverviewtop__box__d3">
							{props.data?.atleast_1__browser_agent?.users} of{" "}
							{props.data?.atleast_1__browser_agent?.total_users}{" "}
							users
						</div>
					</div>

					<div className="agentoverviewtop__box">
						<div className="agentoverviewtop__box__d1">
							Atleast one Desktop Agent installed
						</div>
						<div className="agentoverviewtop__box__d2">
							<div className="agentoverviewtop__box__d2__d1">
								{Number(
									(
										props.data?.atleast_1_desktop_agent
											?.value || 0
									).toFixed(2)
								) || "0"}
								%
							</div>
						</div>
						<div className="agentoverviewtop__box__d3">
							{props.data?.atleast_1_desktop_agent?.users} of{" "}
							{props.data?.atleast_1_desktop_agent?.total_users}{" "}
							users
						</div>
					</div>
				</>
			)}
		</>
	);
}
