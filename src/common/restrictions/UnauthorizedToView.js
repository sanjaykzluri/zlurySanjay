import { PARTNER } from "modules/shared/constants/app.constants";
import React, { useContext } from "react";
import RoleContext from "services/roleContext/roleContext";
import restricted from "../../assets/restricted.png";

export default function UnauthorizedToView({ height }) {
	const { partner } = useContext(RoleContext);

	return (
		<div className="unauthorized_to_view_page" style={{ height: height }}>
			{partner?.name === PARTNER.ZLURI.name && <img src={restricted} />}
			<div className="upgrade__modal__title">
				You're not authorized to view this page.
			</div>
		</div>
	);
}
