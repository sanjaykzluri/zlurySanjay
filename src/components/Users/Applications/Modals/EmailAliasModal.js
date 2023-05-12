import React, { useEffect, useState, useRef, useCallback } from "react";
import { Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import close from "../../../../assets/close.svg";
import AliasIcon from "../../../../assets/alias_icon.svg";
import downArrow from "../../../../assets/down_arrow_Active.svg";
import DirectSource from "../../../../modules/shared/components/ManualUsage/TableComponents/DirectSource";
import {
	fetchEmailAliases,
	setPrimaryEmail,
} from "../../../../services/api/users";
import { NameBadge } from "../../../../common/NameBadge";
import { CustomDropdown } from "../../../../UIComponents/Dropdown/Dropdown";
import { Loader } from "../../../../common/Loader/Loader";
import { displaySources } from "../../../Applications/ApplicationUtil";

export function EmailAliasModal({ user, setShowEmailAliasModal }) {
	let [emailAliases, setEmailAliases] = useState();
	let [isDataLoading, setIsDataLoading] = useState(false);

	async function getEmailAliasList() {
		setIsDataLoading(true);
		let data = await fetchEmailAliases(user?.user_id);
		setIsDataLoading(false);
		setEmailAliases(data.alternate_email_details);
	}

	useEffect(() => {
		!emailAliases?.length && getEmailAliasList();
	}, [emailAliases]);

	async function handlePrimaryAlias(email) {
		setIsDataLoading(true);
		let data = await setPrimaryEmail(user.user_id, email.email);
		setEmailAliases([]);
	}

	return (
		<>
			<div className="modal-backdrop show"></div>
			<div
				style={{ padding: "15px" }}
				className="addContractModal__TOP h-100"
			>
				<div
					style={{
						justifyContent: "space-between",
						alignItems: "center",
					}}
					className="flex"
				>
					<div
						style={{ alignItems: "center" }}
						className="flex flex-row py-4"
					>
						<div>
							{user.profile_img || user.user_profile ? (
								<img
									src={
										unescape(user.profile_img) ||
										unescape(user.user_profile)
									}
									alt={"user_name"}
									style={{
										height: "26px",
										width: "26px",
										borderRadius: "50%",
									}}
								/>
							) : (
								<NameBadge
									name={user.user_name}
									width={26}
									height={26}
									borderRadius={"50%"}
								/>
							)}
						</div>
						<div className="contracts__heading ml-2 truncate_name">
							{user.user_name}
						</div>
						<div
							style={{
								color: "#717171",
							}}
							className="ml-3"
						>
							Aliases
						</div>
					</div>
					<div style={{ float: "right" }}>
						<img
							alt="Close"
							onClick={() => setShowEmailAliasModal(false)}
							src={close}
							className="cursor-pointer mr-4"
						/>
					</div>
				</div>
				<div style={{ padding: 0 }} className=" border-bottom">
					<Form className="w-10">
						<Form.Group
							style={{ fontSize: 14 }}
							className="my-2"
						></Form.Group>
					</Form>
				</div>

				<div
					style={{
						height: "calc(100% - 160px)",
						overflowY: "auto",
					}}
				>
					<div>
						<table className="table table-hover mb-0">
							<thead className="">
								<tr className="table__header">
									<th
										className="selection-cell-header"
										data-row-selection="true"
										style={{ paddingLeft: "60px" }}
									>
										<div className="flex">Aliases</div>
									</th>
									<th
										className="selection-cell-header"
										data-row-selection="true"
									>
										<div className="flex">Sources</div>
									</th>
								</tr>
							</thead>
							<tbody style={{ width: "100%" }} id="scrollRoot">
								{isDataLoading && (
									<div style={{ marginLeft: "120px" }}>
										<Loader width={60} height={60} />
									</div>
								)}
								{!isDataLoading &&
									emailAliases &&
									emailAliases.map((alias, key) => (
										<tr className={`table__row`}>
											<td>
												<div className="d-flex align-items-center">
													<img src={AliasIcon} />
													<span
														style={{
															marginLeft: "5px",
														}}
													>
														{alias.email}
													</span>
													{alias.is_primary && (
														<span
															style={{
																backgroundColor:
																	"#5ABAFF",
																fontSize:
																	"10px",
																marginLeft:
																	"5px",
																marginRight:
																	"5px",
																padding: "4px",
																color: "white",
															}}
														>
															PRIMARY
														</span>
													)}
													{!alias.is_primary && (
														<span
															style={{
																cursor: "pointer",
															}}
														>
															<CustomDropdown
																options={[
																	{
																		label: "Set as Primary Alias",
																		handleCallToAction:
																			(
																				email
																			) =>
																				handlePrimaryAlias(
																					email
																				),
																	},
																]}
																row={alias}
															/>
														</span>
													)}
												</div>
											</td>
											<td>
												<div className="flex">
													{alias?.integration_ids &&
														displaySources(
															alias?.integration_ids
														)}
												</div>
											</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</>
	);
}
