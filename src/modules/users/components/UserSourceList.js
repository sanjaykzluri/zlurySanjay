import React, { useEffect, useState } from "react";
import close from "../../../assets/close.svg";
import { Loader } from "../../../common/Loader/Loader";
import {
	getUserSourceList,
	setAsPrimarySource,
} from "../../../services/api/users";
import GetImageOrNameBadge from "../../../common/GetImageOrNameBadge";
import lastActivity from "../../../assets/lastActivity.svg";
import lastSynced from "../../../assets/lastSynced.svg";
import moment from "moment";
import { TriggerIssue } from "../../../utils/sentry";
import { ChangeStatus } from "components/Users/Overview/ChangeStatus";

export function UserSourceList({
	setOpenUserSourceList,
	user,
	userId,
	refresh,
}) {
	const [loading, setLoading] = useState(true);
	const [sourceArray, setSourceArray] = useState([]);
	const setSourceAsPrimary = (sourceDetails) => {
		setLoading(true);
		setAsPrimarySource(userId, {
			keyword: sourceDetails.keyword,
			org_integration_id: sourceDetails.org_integration_id,
			integration_id: sourceDetails.integration_id,
		})
			.then((res) => {
				if (res.status === "success") {
					refresh && refresh();
				}
			})
			.catch((err) => {
				TriggerIssue("Error while setting source as primary", err);
				setLoading(false);
			});
	};

	useEffect(() => {
		if (loading) {
			getUserSourceList(userId)
				.then((response) => {
					setSourceArray(response.source_array);
					setLoading(false);
				})
				.catch((err) =>
					TriggerIssue("Cannot fetch user source list", err)
				);
		}
	}, []);

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
							<GetImageOrNameBadge
								url={user.profile_img || user.user_profile}
								name={user.user_name}
								width={26}
								height={26}
								borderRadius="50%"
							/>
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
							Primary Source
						</div>
					</div>
					<div style={{ float: "right" }}>
						<img
							alt="Close"
							onClick={() => setOpenUserSourceList(false)}
							src={close}
							className="cursor-pointer mr-4"
						/>
					</div>
				</div>
				<div style={{ padding: 0 }} className="border-bottom" />
				<div
					style={{
						height: "calc(100% - 100px)",
						overflowY: "auto",
					}}
				>
					{loading && (
						<div className="d-flex align-items-center justify-content-center w-100 h-100">
							<Loader width={60} height={60} />
						</div>
					)}
					{!loading &&
						sourceArray &&
						sourceArray.map((source, key) => (
							<>
								<div
									className="d-flex flex-column border-bottom"
									style={{ padding: "14px" }}
								>
									<div
										className={`d-flex align-items-center`}
									>
										<GetImageOrNameBadge
											url={source.logo}
											name={source.name || "Manual"}
											width={26}
											height={26}
											borderRadius="50%"
										/>
										<div
											className={`d-flex align-items-center w-100 ${
												!source.is_primary
													? "justify-content-between"
													: ""
											}`}
										>
											<div className="font-13 d-flex flex-column ml-2">
												<div className="font-13">
													{source.name || "Manual"}
												</div>
												<div className="font-8">
													{source.account_name}
												</div>
											</div>
											{source.is_primary && (
												<span
													style={{
														backgroundColor:
															"#5ABAFF",
														fontSize: "10px",
														marginLeft: "5px",
														marginRight: "5px",
														padding: "4px",
														color: "white",
													}}
												>
													PRIMARY
												</span>
											)}
											{!source.is_primary && (
												<div
													className="font-10 cursor-pointer"
													style={{
														color: "#2266E2",
													}}
													onClick={() =>
														setSourceAsPrimary(
															source
														)
													}
												>
													Set as Primary Source
												</div>
											)}
										</div>
									</div>
									<div className="d-flex justify-content-between w-100 mt-2">
										{source?.status && (
											<ChangeStatus
												status={source?.status}
												disableEdit={true}
											/>
										)}
										{source?.last_sync && (
											<div className="d-flex">
												<img
													src={lastSynced}
													alt="last synced"
													className="sourceCardIcon"
												/>
												<div className="sourceCardTime">
													last synced at
													<span className="ml-1 time">
														{source?.last_sync
															? moment(
																	source?.last_sync
															  ).format(
																	"DD MMM HH:mm"
															  )
															: "NA"}
													</span>
												</div>
											</div>
										)}
										{source?.last_used && (
											<div className="d-flex">
												<img
													src={lastActivity}
													alt="last synced"
													className="sourceCardIcon"
												/>
												<div className="sourceCardTime">
													last activity
													<span className="ml-1 time">
														{source?.last_used
															? moment(
																	source?.last_used
															  ).format(
																	"DD MMM HH:mm"
															  )
															: "NA"}
													</span>
												</div>
											</div>
										)}
									</div>
								</div>
							</>
						))}
				</div>
			</div>
		</>
	);
}
