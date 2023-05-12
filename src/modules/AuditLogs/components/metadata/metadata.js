import React, { useState, useRef, useEffect } from "react";
import close from "assets/close.svg";
import json_icon from "assets/auditlogs/json.svg";
import table_icon from "assets/auditlogs/table_icon.svg";
import "./metadata.css";
import moment from "moment";
import { useImagefromEntities } from "../custom_hooks/useImagefromEntities";
import { fetchDetails } from "../actors/fetch_actors_image";
export function Metadata({ show, onHide, setshowmetadata, data }) {
	const isCancelled = React.useRef(false);
	useEffect(() => {
		return () => {
			isCancelled.current = true;
		};
	}, []);
	const [image] = useImagefromEntities(data.entity, isCancelled);
	const [table, showTable] = useState(false);
	const { img_src, link } = fetchDetails(data.actor, data.actor_id);
	const metadata = data.meta_data || null;
	return show ? (
		<>
			<div className="modal-backdrop show"></div>
			<div className="addContractModal__TOP h-100">
				<div
					style={{
						justifyContent: "space-between",
						alignItems: "flex-start",
						textTransform: "capitalize",
					}}
					className="flex pt-4"
				>
					<div
						style={{
							alignItems: "flex-start",
							paddingLeft: "15px",
						}}
						className="flex flex-column"
					>
						<div
							className="d-flex"
							style={{
								width: "350px",
								whiteSpace: "break-spaces",
								wordBreak: "break-word",
							}}
						>
							<div
								className="d-flex"
								style={{ marginRight: "4px" }}
							>
								<img
									src={image}
									alt=""
									width="30px"
									height="30px"
								/>
							</div>
							<div>
								<div
									style={{ fontSize: "15px" }}
									dangerouslySetInnerHTML={{
										__html: data.event_title,
									}}
								/>
							</div>
						</div>
						<div className="d flex" style={{ gap: "10px" }}>
							<div className="wrapper_metadata">
								<div>
									<img
										src={img_src}
										style={{
											marginRight: "4px",
											width: "27px",
											height: "27px",
										}}
									></img>
								</div>
								<div>
									<p className="actor">
										{data.actor_role || data.actor_name}
									</p>
								</div>
							</div>
							<div className="wrapper_metadata">
								<div>
									{moment(
										new Date(data.event_timestamp)
									).format("DD MMM YYYY")}
								</div>
								<div
									style={{
										fontSize: "10px",
										color: "#717171",
									}}
								>
									,{data.event_time}
								</div>
							</div>
						</div>
					</div>
					<div>
						<img
							alt="Close"
							onClick={() => setshowmetadata(false)}
							src={close}
							className="cursor-pointer mr-4"
						/>
					</div>
				</div>
				<div
					style={{
						height: "35px",
						padding: "5px 0 0 20px",
						background: "#EBEBEB",
						opacity: "0.5",
						marginTop: "10px",
						width: "100%",
					}}
					className="additional_information"
				>
					ADDITIONAL INFORMATION
				</div>
				<div
					style={{
						width: "fit-content",
						border: " 1px solid #EBEBEB",
						borderRadius: "0px 3px 3px 0px",
						margin: "15px",
					}}
				>
					<img
						style={{
							background: table ? "#FFFFFF" : "#EBEBEB",
						}}
						src={json_icon}
						onClick={() => showTable(false)}
					/>
					<img
						style={{
							background: table ? "#EBEBEB" : "#FFFFFF",
						}}
						src={table_icon}
						onClick={() => showTable(true)}
					/>
				</div>
				<div className="content">
					{!metadata && <div>No Metadata Information Found</div>}
					{table && metadata && (
						<div>
							{Object.keys(metadata).map((key) => {
								return (
									<>
										{typeof metadata[key] === "string" ? (
											<div className="metadata_table">
												<div style={{ width: "50%" }}>
													{key}
												</div>
												<div style={{ width: "50%" }}>
													{metadata[key]}
												</div>
											</div>
										) : null}
										{typeof metadata[key] === "boolean" ? (
											<div className="metadata_table">
												<div style={{ width: "50%" }}>
													{key}
												</div>
												<div style={{ width: "50%" }}>
													{metadata[key] === true
														? "true"
														: "false"}
												</div>
											</div>
										) : null}
									</>
								);
							})}
						</div>
					)}
					{!table && metadata && (
						<div>
							<pre
								style={{
									whiteSpace: "break-spaces",
									fontSize: "10px",
									lineHeight: "13px",
								}}
							>
								{JSON.stringify(metadata, null, 2)}
							</pre>
						</div>
					)}
				</div>
			</div>
		</>
	) : null;
}
