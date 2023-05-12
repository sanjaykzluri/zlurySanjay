import { trackActionSegment } from "modules/shared/utils/segment";
import React from "react";

export default function AgentDownloadButtons({ download_links, learn_more }) {
	return (
		<>
			<div className="singleagent__cont__d1__buttons">
				<div className="agent-download-btns-grid">
					{Array.isArray(download_links) &&
						download_links.map((url) => (
							<a
								href={url.link}
								target="blank"
								style={{
									textDecoration: "none",
								}}
							>
								<button
									className="singleagent__cont__d1__b1"
									onClick={() => {
										trackActionSegment(
											"Clicked on Download Button",
											{
												currentCategory: "Agents",
												currentPageName:
													"Single Agent Info",
											}
										);
									}}
								>
									{`Download${
										url.ext ? " ." + url.ext + " file" : ""
									}`}
								</button>
							</a>
						))}
					{Array.isArray(download_links) &&
						download_links.length % 2 !== 0 && (
							<a
								href={learn_more}
								target="blank"
								style={{
									textDecoration: "none",
								}}
							>
								<button
									className="singleagent__cont__d1__b2"
									onClick={() => {
										trackActionSegment(
											"Clicked on Learn More Button",
											{
												currentCategory: "Agents",
												currentPageName:
													"Single Agent Info",
											}
										);
									}}
								>
									Learn More
								</button>
							</a>
						)}
				</div>
			</div>
			{Array.isArray(download_links) && download_links.length % 2 === 0 && (
				<a
					href={learn_more}
					target="blank"
					style={{
						textDecoration: "none",
						marginTop: "5px",
						width: "285px",
					}}
				>
					<button className="singleagent__cont__d1__b2">
						Learn More
					</button>
				</a>
			)}
		</>
	);
}
