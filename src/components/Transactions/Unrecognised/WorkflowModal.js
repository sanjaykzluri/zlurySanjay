import React, { useState } from "react";
import PropTypes from "prop-types";
import "./Unrecognised.css";
import { useDispatch, useSelector } from "react-redux";
import arrowdropdown from "../Unrecognised/arrowdropdown.svg";
import master from "../../../assets/transactions/mastercard.svg";
import visa from "../../../assets/transactions/visa.svg";
import hyperlink from "../../../assets/transactions/hyperlink.svg";
import { WorkFlowModalins } from "../Modals/WorkFlowModal";

export default function WorkFlowModal(props) {
	const { id, data, cell } = props;
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [addModalOpen, setAddModalOpen] = useState(false);
	const clickedOnAssignButton = () => {
		setAddModalOpen(true);
		//Segment Implementation
		window.analytics.track("Assign to App Button clicked", {
			currentCategory: "Transactions",
			currentPageName: "Unrecognised-Transactions",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	return (
		<>
			<button
				className="assignapp__button"
				onClick={clickedOnAssignButton}
			>
				<img src={hyperlink} style={{ marginRight: "4px" }}></img>
				Assign to App
			</button>
			<WorkFlowModalins
				id={id}
				data={data}
				handleClose={() => setAddModalOpen(false)}
				isOpen={addModalOpen}
				setSelectedIds={props.setSelectedIds}
				rows={props.rows}
				page={props.page}
				cancelToken={props?.cancelToken}
				clearCache={props.clearCache}
				searchQuery={props.searchQuery}
				handleSearchRequests={props.handleSearchRequests}
			/>
		</>
	);
}
