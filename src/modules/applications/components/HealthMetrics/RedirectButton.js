import React from "react";
import { getStringFromTemplate } from "utils/common";

const REDIRECT_ENTITY_MAP = {
	connect_integration: (meta) =>
		`/integrations/catalog/detail/${meta?.app_integration_id}#overview`,
	add_contract: () => `/contract/new`,
	application_renewal: (data) =>
		`/applications/${data?.app_id}?showRenewal=true#overview`,
};
export default function RedirectButton({ meta, label, redirect_entity, app }) {
	return (
		<a
			className="card__action_button cursor-pointer text-decoration-none"
			href={REDIRECT_ENTITY_MAP[redirect_entity]({ ...app, ...meta })}
			target="_self"
			rel="noreferrer"
		>
			{getStringFromTemplate(label, meta)}
		</a>
	);
}
