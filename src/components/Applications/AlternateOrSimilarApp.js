import React from "react";
import ContentLoader from "react-content-loader";
import { Link } from "react-router-dom";
import { unescape } from "../../utils/common";
import { useDispatch } from "react-redux";
import { allowScroll } from "actions/ui-action";

export default function AlternateOrSimilarApp(props) {
	const dispatch = useDispatch();

	return props.loaded ? (
		<div className="similarapps__d2 white_bg similarAndAlternateContainer">
			<div className="similarapps__d2__d1 similarAndAlternateImageContainer">
				<img
					src={
						props.image
							? unescape(props.image)
							: `https://ui-avatars.com/api/?name=${props.name}`
					}
				></img>
			</div>
			<div
				className={
					props.show_view_button
						? "similarapps__d2__d2 fixed_width"
						: "similarapps__d2__d2"
				}
			>
				<div className="similarapps__d2__d2__d1">{props.name}</div>
				<div className="similarapps__d2__d2__d2">
					{props.small_description}
				</div>
			</div>
			{props.show_view_button ? (
				<div className="similarapps__d2__d2__d2__d2">
					<Link
						to={`/applications/${props.appId}#overview`}
						onClick={() => dispatch(allowScroll())}
					>
						View
					</Link>
				</div>
			) : null}
		</div>
	) : (
		<ContentLoader
			width={400}
			viewBox="0 0 460"
			fill="#EBEBEB"
			style={{ height: "90px" }}
		>
			<circle cx="35" cy="48" r="25" />
			<rect x="80" y="24" rx="2" width="143" height="22" />
			<rect x="80" y="57" rx="2" width="257" height="16" />
		</ContentLoader>
	);
}
