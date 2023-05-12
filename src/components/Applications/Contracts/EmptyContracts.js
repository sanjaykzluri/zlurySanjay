import React, { useContext } from "react";
import empty from "../../../assets/applications/contractsempty.svg";
import "../../../common/empty.css";
import add from "../../../assets/addwhite.svg";
import RoleContext from "../../../services/roleContext/roleContext";
import { useHistory } from "react-router-dom";

export function EmptyContracts(props) {
	const { isViewer } = useContext(RoleContext);
	const history = useHistory();
	return (
		<div
			className="d-flex flex-column justify-content-center align-items-center"
			style={{ margin: "auto" }}
		>
			<img src={empty} width={200} />
			<div className="empty-header">No contracts added</div>
			{!isViewer && (
				<>
					<div className="empty-lower">
						Add contracts to receive renewal reminders and
						recommendations
					</div>
					<button
						color="primary"
						className="ov__button2 empty-page-button"
						onClick={() => history.push(`/contract/new`)}
						style={{ width: "max-content" }}
					>
						<img style={{ paddingRight: "5px" }} src={add} />
						Add Contract
					</button>
				</>
			)}
		</div>
	);
}
