import React, { useContext, useState } from "react";
import { Button } from "../../../../UIComponents/Button/Button";
import { AddEditRenewal } from "../../components/AddEditRenewal/AddEditRenewal";
import { Popover } from "../../../../UIComponents/Popover/Popover";
import { RemoveRenewal } from "../../components/RemoveRenewal/RemoveRenewal";
import { useDispatch, useSelector } from "react-redux";
import {
	deleteRenewalFromCalender,
	editRenewalFromCalender,
} from "../../redux/renewal";
import RoleContext from "../../../../services/roleContext/roleContext";
import "./Renewal.css";
import { useHistory } from "react-router-dom";

export function Renewal(props) {
	const history = useHistory();
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const renewal = props.renewal;
	const [showAddRenewal, setShowAddRenewal] = useState(false);
	const [showRemoveRenewal, setShowRemoveRenewal] = useState(false);
	const dispatch = useDispatch();
	const { isViewer } = useContext(RoleContext);
	const clickOnEditButton = () => {
		//Segment Implementation
		window.analytics.track("clicked on edit button", {
			currentCategory: "Applications",
			currentPageName: "Renewals-List-View",
			orgId: orgId || "",
			orgName: orgName || "",
		});
		if (!isViewer) {
			setShowAddRenewal(true);
		}
	};
	return (
		<>
			<Button
				className={props.className}
				type={props.displayName ? "edit" : "link"}
				onClick={clickOnEditButton}
				editBtnStyle={{ paddingTop: "4px" }}
			>
				<div className="d-flex flex-row align-items-center">
					<div>{props.displayName ? renewal.name : "Edit"}</div>
					{props.displayName && (
						<div
							className={`ml-1 d-flex align-items-center
								${renewal.isPaymentRenewal ? "is-payment-renewal" : "is-not-payment-renewal "}
							`}
							onClick={(e) => {
								if (
									renewal.contract_id &&
									renewal.contract_type
								) {
									e.preventDefault();
									e.stopPropagation();
									history.push(
										`/licenses/${renewal.contract_type}s/${renewal.contract_id}#overview`
									);
								}
							}}
						>
							{renewal.isPaymentRenewal ? "PAYMENT" : "CONTRACT"}
						</div>
					)}
				</div>
			</Button>

			<Popover
				className={props.popoverClassName}
				align="right"
				show={showAddRenewal}
				onClose={() => setShowAddRenewal(false)}
				style={{ width: "320px" }}
			>
				<AddEditRenewal
					renewal={renewal}
					addRenewal={() => {}}
					editRenewal={(data) => {
						dispatch(editRenewalFromCalender(renewal, data));
						setShowAddRenewal(false);
					}}
					onRemove={() => {
						setShowAddRenewal(false);
						setShowRemoveRenewal(true);
					}}
					onCancel={() => setShowAddRenewal(false)}
				/>
			</Popover>
			<Popover
				className={props.popoverClassName}
				align="right"
				show={showRemoveRenewal}
				onClose={() => setShowRemoveRenewal(false)}
				style={{ width: "320px" }}
			>
				<RemoveRenewal
					renewal={renewal}
					onCancel={() => setShowRemoveRenewal(false)}
					onDelete={(data) => {
						dispatch(deleteRenewalFromCalender(renewal));
						setShowRemoveRenewal(false);
					}}
				/>
			</Popover>
		</>
	);
}
