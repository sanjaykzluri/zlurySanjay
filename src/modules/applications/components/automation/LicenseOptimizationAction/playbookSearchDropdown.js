import React, { useEffect, useState } from "react";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import { searchAllPlaybooks } from "../service/automation-api";
import arrowdropdown from "components/Transactions/Unrecognised/arrowdropdown.svg";
import { TriggerIssue } from "utils/sentry";
export function PlaybookSearchDropdown(props) {
	const [playbooks, setPlaybooks] = useState([]);
	useEffect(() => {
		searchAllPlaybooks("")
			.then((res) => {
				setPlaybooks(res.data);
			})
			.catch((err) => {
				TriggerIssue("Error in searching playbooks", err);
			});
	}, []);
	return (
		<>
			<div className="d-flex" style={{ width: "67%" }}>
				<div className="d-flex w-100 align-items-center">
					<Dropdown
						toggler={
							<div
								className="d-flex align-items-center border-1 border-radius-4"
								style={{
									height: "36px",
									padding: "19px",
									border: "1px solid #DDDDDD !important",
								}}
							>
								<div style={{ fontSize: "14px" }}>{`${
									props?.state[props.currentKey]?.name ||
									"Select a playbook"
								}`}</div>
								<img
									src={arrowdropdown}
									style={{
										right: "10px",
										position: "absolute",
									}}
								/>
							</div>
						}
						options={playbooks}
						apiSearch={true}
						apiSearchCall={(query, cancelToken) =>
							searchAllPlaybooks(query, cancelToken)
						}
						apiSearchDataKey="data"
						onOptionSelect={(option) => {
							props.handleSubSelect(
								option,
								props.parentKey,
								props.currentKey || "playbook"
							);
						}}
						optionFormatter={(option) => {
							return <div>{option?.name}</div>;
						}}
						optionStyle={{
							padding: "0px !important",
							flexDirection: "column",
							minHeight: "60px",
							alignItems: "flex-start",
							paddingTop: "6px",
							paddingBottom: "6px",
							fontSize: "14px",
						}}
						menuStyle={{
							width: "100%",
						}}
						dropdownWidth="100%"
						searchBoxStyle={{ width: "100%", position: "relative" }}
					/>
				</div>
			</div>
		</>
	);
}
