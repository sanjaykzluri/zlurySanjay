import React from "react";
import ContentLoader from "react-content-loader";
import "./instance-card.css";
export function InstanceCardLoader() {
	return (
		<div className="card z_i_instance_card">
			<div className="card-body p-0 ">
				<ContentLoader width={320} height={54}>
					<circle cx="30" cy="24" r="13" />
					<rect x="170" y="10" rx="3" ry="3" width="26" height="26" />
					<rect x="200" y="10" rx="3" ry="3" width="26" height="26" />
					<rect x="230" y="10" rx="3" ry="3" width="90" height="26" />
				</ContentLoader>
				<div className="d-flex flex-column instance-info-bar">
					<div className="instance-details">
						<ContentLoader width={290} height={56}>
							<rect
								x="0"
								y="4"
								rx="3"
								ry="3"
								width="165"
								height="9"
							/>
							<rect
								x="0"
								y="16"
								rx="3"
								ry="3"
								width="107"
								height="6"
							/>
							<rect
								x="0"
								y="30"
								rx="3"
								ry="3"
								width="280"
								height="4"
							/>
							<rect
								x="0"
								y="40"
								rx="3"
								ry="3"
								width="250"
								height="4"
							/>
						</ContentLoader>
					</div>
					<div className="instance-discription">
						<ContentLoader width={290} height={130}>
							{/* first lable */}
							<rect
								x="0"
								y="4"
								rx="3"
								ry="3"
								width="50"
								height="9"
							/>
							<rect
								x="120"
								y="4"
								rx="3"
								ry="3"
								width="50"
								height="9"
							/>
							<rect
								x="240"
								y="4"
								rx="3"
								ry="3"
								width="50"
								height="9"
							/>
							{/* first values */}
							<rect
								x="0"
								y="20"
								rx="3"
								ry="3"
								width="50"
								height="3"
							/>
							<rect
								x="0"
								y="30"
								rx="3"
								ry="3"
								width="70"
								height="3"
							/>
							<rect
								x="120"
								y="20"
								rx="3"
								ry="3"
								width="50"
								height="3"
							/>
							<rect
								x="120"
								y="30"
								rx="3"
								ry="3"
								width="70"
								height="3"
							/>
							<rect
								x="240"
								y="20"
								rx="3"
								ry="3"
								width="50"
								height="3"
							/>
							<rect
								x="240"
								y="30"
								rx="3"
								ry="3"
								width="60"
								height="3"
							/>
							{/* second lbl */}
							<rect
								x="0"
								y="70"
								rx="3"
								ry="3"
								width="50"
								height="9"
							/>
							<rect
								x="0"
								y="85"
								rx="3"
								ry="3"
								width="70"
								height="3"
							/>
							<rect
								x="120"
								y="70"
								rx="3"
								ry="3"
								width="50"
								height="9"
							/>
							<rect
								x="120"
								y="85"
								rx="3"
								ry="3"
								width="70"
								height="3"
							/>
							<rect
								x="240"
								y="70"
								rx="3"
								ry="3"
								width="50"
								height="9"
							/>
							<rect
								x="0"
								y="90"
								rx="3"
								ry="3"
								width="50"
								height="3"
							/>
							<rect
								x="120"
								y="90"
								rx="3"
								ry="3"
								width="50"
								height="3"
							/>
							<rect
								x="240"
								y="90"
								rx="3"
								ry="3"
								width="50"
								height="3"
							/>
						</ContentLoader>
					</div>
				</div>
			</div>
		</div>
	);
}
