import React, { useContext } from "react";

import empty from "./empty.svg";
import { useHistory } from "react-router-dom";
import RoleContext from "../../../../services/roleContext/roleContext";

export function Empty() {
	const history = useHistory();
	const { isViewer } = useContext(RoleContext);

	return (
		<div 
			className="d-flex flex-column justify-content-center align-items-center"
			style={{ margin: "auto" }}
		>
			<img src={empty} width={200} />
			<div className="departments-empty-header">
				No transactions added
			</div>
			{
				!isViewer &&
				<>
					<div className="departments-empty-lower text-center">
						You can add transactions via uploading a csv file or an integration with your accounting system.
					</div>
					<div className="empty-lower" style={{ maxWidth: "unset" }}>
						Please check the possible integrations available here.
					</div>
					<button
						onClick={() => history.push("/integrations")}
						className="ov__button2"
						style={{ width: "unset" }}
					>
						View Integrations
					</button>
				</>
			}
		</div>
	);
}
