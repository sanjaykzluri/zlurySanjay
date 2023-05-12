import React, { useEffect, useState } from "react";

import tick from "assets/green_tick.svg";
import restricted from "assets/applications/restricted.svg";
import _ from "underscore";
import { capitalizeFirstLetter } from "utils/common";
import moment from "moment";
import needsreview from "assets/applications/needsreview.svg";
import { NameBadge } from "common/NameBadge";

export function Compliances({ data, loading }) {
	return (
		<>
			{loading ? (
				<></>
			) : data?.length ? (
				<>
					<div className="font-14 black-1 mt-3"> Compliances</div>
					<div className="d-flex flex-wrap">
						{data?.map((compliance, index) => (
							<div className="compilance__item">
								<div className="compilance__item-name-wrap mt-auto">
									<div className="compilance_logo">
										{compliance.compliance_image ? (
											<img
												width={60}
												src={
													compliance.compliance_image
												}
												alt={compliance.compliance_name}
											/>
										) : (
											<NameBadge
												name={
													compliance.compliance_name
												}
												width={60}
												className="rounded-circle"
											/>
										)}
									</div>
									<div className="compliance_name text-center">
										{compliance.compliance_name}
									</div>
									<div className="compilance_status approved text-center">
										<img
											src={
												compliance.compliance_status ===
												"rejected"
													? restricted
													: compliance?.compliance_status ===
															"available" ||
													  compliance?.compliance_status ===
															"approved"
													? tick
													: needsreview
											}
											height="12"
											width="12"
											style={{
												marginBottom: "2.2px",
											}}
										/>{" "}
										{capitalizeFirstLetter(
											compliance.compliance_status
												? compliance.compliance_status
												: "Review Now"
										)}
									</div>
								</div>
								<div
									className={`compilance_expiray mt-auto ${
										!compliance.compliance_expires_on
											? "background-color-white"
											: ""
									}`}
								>
									{compliance.compliance_expires_on && (
										<>
											<span className="expiry">
												EXPIRES ON
											</span>
											<span className="expiry_date">
												{!compliance.compliance_expires_on ? (
													<div className="grey-1 font-1 value o-5">
														Data Unavailable
													</div>
												) : (
													moment(
														compliance.compliance_expires_on
													).format("DD MMM YYYY")
												)}
											</span>
										</>
									)}
								</div>
							</div>
						))}
					</div>
				</>
			) : null}
		</>
	);
}
