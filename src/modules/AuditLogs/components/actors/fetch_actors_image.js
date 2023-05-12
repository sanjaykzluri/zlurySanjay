import user from "../../../../assets/users/user_actor.svg";
import workflow from "../../../../assets/users/workflow_actor.svg";
import integration from "../../../../assets/users/integration_actor.svg";
export function fetchDetails(actor, actor_id) {
	let img_src, link;
	if (actor === "workflow") {
		img_src = workflow;
		link = `/workflow/${actor_id}/runs`;
	} else if (actor === "integration") {
		img_src = integration;
		link = `/integrations/catalog/detail/${actor_id}#overview`;
	} else {
		img_src = user;
		link = `/users/${actor_id}#overview`;
	}
	return { img_src, link };
}
