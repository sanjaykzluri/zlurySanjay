import React, { useCallback, useEffect, useState } from "react";
import "./OverviewBottom.css";
import { Link } from "react-router-dom";
import chrome from "../../../../../../assets/agents/chrome.svg";
import firefox from "../../../../../../assets/agents/firefox.svg";
import edge from "../../../../../../assets/agents/edge.svg";
import windows from "../../../../../../assets/agents/windows.svg";
import macos from "../../../../../../assets/agents/macos.svg";
import linux from "../../../../../../assets/agents/linux.svg";
import comingsoon from "../../../../../../assets/agents/comingsoon.svg";
import ContentLoader from "react-content-loader";
import { trackActionSegment } from "modules/shared/utils/segment";
function Card(props) {
	const { agent } = props;
	const agentImg = (width, className) => {
		switch (agent?.name) {
			case "Google Chrome":
				return <img src={chrome} width={width} className={className} />;
			case "Mozilla Firefox":
				return (
					<img src={firefox} width={width} className={className} />
				);
			case "Microsoft Edge":
				return <img src={edge} width={width} className={className} />;
			case "Windows":
				return (
					<img src={windows} width={width} className={className} />
				);
			case "MacOS":
				return <img src={macos} width={width} className={className} />;
			default:
				return <img src={linux} width={width} className={className} />;
		}
	};

	return (
		<>
			<Link
				to={`/agents/${agent._id}`}
				style={{ textDecoration: "none", marginRight: "16px" }}
				className={`custom__app__name__css d-flex`}
			>
				<div
					className={
						agent.type === "browser"
							? "agentsoverview__bottom__d2__box__browser"
							: "agentsoverview__bottom__d2__box__desktop"
					}
					onClick={() => {
						trackActionSegment("Clicked on Single Agent", {
							currentCategory: "Agents",
							currentPageName: "Agents-Overview",
							agentName: agent.name,
							agentId: agent._id,
						});
					}}
				>
					<div className="agentsoverview__bottom__d2__box__d1">
						{agent.is_published ? (
							<>
								<div className="agentoverviewtop__box__d1">
									In Use
								</div>
								<div
									className={
										agent.type === "browser"
											? "agentsoverview__bottom__d2__box__d1__d2__browser"
											: "agentsoverview__bottom__d2__box__d1__d2__desktop"
									}
								>
									{Number((agent.value || 0).toFixed(1)) || 0}
									%
								</div>
								<div className="agentoverviewtop__box__d3">
									{agent.users} of {agent.total_users} users
								</div>
							</>
						) : (
							<div style={{ position: "relative" }}>
								{agentImg(
									88,
									"agentoverviewtop__box__filteredimage"
								)}
								<img
									src={comingsoon}
									style={{
										position: "absolute",
										bottom: "0px",
										left: "-11px",
									}}
								></img>
							</div>
						)}
					</div>
					<hr
						style={{
							margin: "0px 2px",
							border: "1px solid #FFFFFF",
						}}
					></hr>
					<div className="agentsoverview__bottom__d2__box__d2">
						{agentImg(24)}
						<div className="agentsoverview__bottom__d2__box__d2__d2">
							<div className="agentsoverview__bottom__d2__box__d2__d2__d1">
								{agent.name}{" "}
							</div>
							<div className="agentsoverview__bottom__d2__box__d2__d2__d2">
								{agent.type} agent
							</div>
						</div>
					</div>
				</div>
			</Link>
		</>
	);
}
export function OverviewBottom(props) {
	function ContentLoaderViewer(width, height) {
		return (
			<>
				<ContentLoader width={width} height={height}>
					<rect width={width} height={height}></rect>
				</ContentLoader>
			</>
		);
	}
	const browserContainerLoader = [1, 2, 3].map(() => (
		<div
			className="agentsoverview__bottom__d2__box__browser"
			style={{ marginRight: "16px" }}
		>
			<div className="agentsoverview__bottom__d2__box__d1">
				<div className="agentoverviewtop__box__d1">
					{ContentLoaderViewer(50, 14)}
				</div>
				<div className="agentsoverview__bottom__d2__box__d1__d2__browser">
					{ContentLoaderViewer(80, 40)}
				</div>
				<div className="agentoverviewtop__box__d3">
					{ContentLoaderViewer(150, 14)}
				</div>
			</div>
			<hr
				style={{
					margin: "0px 2px",
					border: "1px solid #FFFFFF",
				}}
			></hr>
			<div className="agentsoverview__bottom__d2__box__d2">
				{ContentLoaderViewer(130, 14)}
			</div>
		</div>
	));
	const desktopContainerLoader = [1, 2, 3].map(() => (
		<div
			className="agentsoverview__bottom__d2__box__desktop"
			style={{ marginRight: "16px" }}
		>
			<div className="agentsoverview__bottom__d2__box__d1">
				<div className="agentoverviewtop__box__d1">
					{ContentLoaderViewer(50, 14)}
				</div>
				<div className="agentsoverview__bottom__d2__box__d1__d2__desktop">
					{ContentLoaderViewer(80, 40)}
				</div>
				<div className="agentoverviewtop__box__d3">
					{ContentLoaderViewer(150, 14)}
				</div>
			</div>
			<hr
				style={{
					margin: "0px 2px",
					border: "1px solid #FFFFFF",
				}}
			></hr>
			<div className="agentsoverview__bottom__d2__box__d2">
				{ContentLoaderViewer(130, 14)}
			</div>
		</div>
	));
	return (
		<>
			{Array.isArray(props.data) && props.data?.length > 0 && (
				<div className="agentsoverview__bottom__d1">Agents</div>
			)}
			{props.loading ? (
				<>
					<div className="agentsoverview__bottom__d1">Agents</div>
					<div className="agentsoverview__bottom__d2">
						{browserContainerLoader}
						{desktopContainerLoader}
					</div>
				</>
			) : (
				<div className="agentsoverview__bottom__d2">
					{Array.isArray(props.data) &&
						props.data?.length > 0 &&
						props.data?.map((el) => <Card agent={el}></Card>)}
				</div>
			)}
		</>
	);
}
