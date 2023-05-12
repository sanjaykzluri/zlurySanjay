import React, { useContext } from "react";
import { useHistory } from "react-router-dom"
import empty from "../../../assets/applications/contractsempty.svg";
import RoleContext from "../../../services/roleContext/roleContext";

export function Empty() {
	const history = useHistory();
	const { isViewer } = useContext(RoleContext);

	return (
		<div className="d-flex flex-column justify-content-center align-items-center m-auto">
			<img src={empty} width={200} />
			<div className="empty-header">
				No transactions added
			</div>
			{
				!isViewer &&
				<>
					<div className="empty-lower">
						You can add transactions via a csv or an integration like
						Quickbooks
					</div>
					<button
						color="primary"
						className="ov__button2 empty-page-button"
						onClick={() => history.push("/transactions#recognised")}
					>
						Add Transactions
					</button>
				</>
			}
		</div>
	);
}
