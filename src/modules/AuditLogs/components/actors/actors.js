import React from "react";
import user from "../../../../assets/users/user_actor.svg";
import workflow from "../../../../assets/users/workflow_actor.svg";
import { Link } from "react-router-dom";
import integration from "../../../../assets/users/integration_actor.svg";
import "./actors.css";
import { fetchDetails } from "./fetch_actors_image";
export function Actors({ actor, actor_name, actor_role, actor_id }) {
	const { img_src, link } = fetchDetails(actor, actor_id);
	return (
		<div className="wrapper">
			<div>
				<img
					src={img_src}
					style={{
						marginRight: "4px",
						width: "27px",
						height: "27px",
					}}
				></img>
			</div>
			<div>
				<Link
					to={link}
					className="custom__app__name__css text-decoration-none"
				>
					<p className="actor_name">{actor_name}</p>
				</Link>
				<p className="actor">{actor_role || actor}</p>
			</div>
		</div>
	);
}
