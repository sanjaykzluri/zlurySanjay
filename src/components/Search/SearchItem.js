import React from "react";
import { Link } from "react-router-dom";
import greentick from "../../assets/green_tick.svg";
import inactivecheck from "../../assets/applications/inactivecheck.svg";
import "./Search.css";
import { NameBadge } from "../../common/NameBadge";
import { unescape } from "../../utils/common";

export default function SearchItem({ name, image, categoryName, status, url }) {
	return (
		<div className="search__result__card">
			<Link to={url}>
				<div className="logoWrapper">
					{image ? (
						<img
							alt={name}
							className="img-fluid"
							src={unescape(image)}
						/>
					) : (
						<NameBadge name={name} width={56} variant="round" />
					)}
				</div>
				<div
					className="search__result__card-app__name"
					data-toggle="tooltip"
					title={name}
				>
					{name}
				</div>
				<div className="search__item-subtitle">
					{categoryName && (
						<span
							style={{ margin: "0 7px" }}
							data-toggle="tooltip"
							title={categoryName}
						>
							{categoryName}
						</span>
					)}
					{categoryName &&
						typeof status === "string" &&
						status?.toLocaleLowerCase() === "active" &&
						"|"}
					{typeof status === "string" &&
						status?.toLocaleLowerCase() === "active" && (
							<div style={{ margin: "0 7px" }}>
								<img alt="active" src={greentick} /> Active
							</div>
						)}
					{typeof status === "string" &&
						status?.toLocaleLowerCase() === "inactive" && (
							<div style={{ margin: "0 7px" }}>
								<img alt="inactive" src={inactivecheck} />{" "}
								Inactive
							</div>
						)}
				</div>
			</Link>
		</div>
	);
}
