import React from "react";
import close from "assets/close.svg";
import { capitalizeFirstLetter } from "utils/common";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";

export function ApplicationSourceList({
	app,
	sourceArray,
	setOpenAppSourceList,
}) {
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
								url={app.app_logo}
								name={app.app_name}
								width={26}
								height={26}
								borderRadius="50%"
							/>
						</div>
						<div className="contracts__heading ml-2 truncate_name">
							{app.app_name}
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
							onClick={() => setOpenAppSourceList(false)}
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
					{Array.isArray(sourceArray) &&
						sourceArray.map((source, key) => (
							<React.Fragment key={key}>
								<div
									className="d-flex flex-column border-bottom"
									style={{ padding: "14px" }}
								>
									<div
										className={`d-flex align-items-center`}
									>
										<GetImageOrNameBadge
											url={source.logo}
											name={
												source.name ||
												(source.keyword
													? capitalizeFirstLetter(
															source.keyword
													  )
													: "Manual")
											}
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
													{source.name ||
														(source.keyword
															? capitalizeFirstLetter(
																	source.keyword
															  )
															: "Manual")}
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
										</div>
									</div>
								</div>
							</React.Fragment>
						))}
				</div>
			</div>
		</>
	);
}
