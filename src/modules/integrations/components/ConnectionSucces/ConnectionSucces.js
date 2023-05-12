import React, { useState } from "react";
import { useContext } from "react";
import { useDispatch } from "react-redux";
import RoleContext from "services/roleContext/roleContext";
import check from "../../../../assets/icons/check-circle.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import { TriggerIssue } from "../../../../utils/sentry";
import { resetIntegration } from "../../redux/integrations";
import { editAccountDetails } from "../../service/api";
import AccountForm from "../AccountForm/AccountForm";
import "./ConnectionSucces.css";

export function ConnectionSucces(props) {
	const { showAccountForm = true } = { ...props };
	const { partner } = useContext(RoleContext);
	const dispatch = useDispatch();
	const [failedToSaveAccountMsg, setFailedToSaveAccountMsg] = useState();
	const [isAccountSaving, setIsAccountSaving] = useState(false);

	const saveAccountInfo = (account) => {
		setIsAccountSaving(true);
		try {
			editAccountDetails(
				props.orgIntegrationId, // need to send right id here
				account
			).then((res) => {
				if (res?.success) {
					setFailedToSaveAccountMsg();
					props.onClose && props.onClose();
				} else {
					setFailedToSaveAccountMsg(
						res?.error?.response?.data?.error || "some issue"
					);
				}
				setIsAccountSaving(false);
			});
		} catch (error) {
			setIsAccountSaving(false);
			setFailedToSaveAccountMsg("some issue");
			TriggerIssue("Error when editing orgIntegration details", error);
		}
	};

	return (
		<div className={"text-center " + props.className}>
			<div style={{ backgroundColor: "#EBEBEB" }} className="p-4 rounded">
				<img className="mb-3" width={46} src={check} />
				<p className="mb-3 font-18 bold-600 black-1">
					The connection was successful
				</p>
			</div>
			{showAccountForm && (
				<>
					<div className="p-4">
						{partner?.name} has successfully connected with{" "}
						{props.integrationName}!
					</div>
					<div
						className="ml-4 mr-4 mb-6 light-blue px-4 pb-4 rounded"
						style={{ border: "1px solid #2266e247" }}
					>
						<div className="p-3">Set a name for this account</div>
						<AccountForm
							accountName={props.accountName}
							isFailedMsg={failedToSaveAccountMsg}
							isLoading={isAccountSaving}
							onSave={saveAccountInfo}
						/>
					</div>
				</>
			)}
		</div>
	);
}
