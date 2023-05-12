import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import { kFormatter } from "constants/currency";
import React, { useEffect, useState } from "react";
import { capitalizeFirstLetter } from "utils/common";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Button } from "UIComponents/Button/Button";
import yellowexclamation from "assets/employee/yellowexclamation.svg";
import discoverLogo from "assets/employee/discover.svg";

export const getPeriod = (data) => {
	return data.tier_is_per_month
		? "months"
		: data.tier_is_billed_annual
		? "years"
		: data.period
		? data.period
		: "months";
};
export function AlternateLicenseTypes({
	data,
	loading,
	editPresent = false,
	onButtonClick,
	inOrg,
}) {
	const getCostText = (data) => {
		return `${kFormatter(
			data?.tier_pricing_value || 0,
			data?.tier_currency || "USD"
		)} per ${getPeriod(data)?.slice(0, -1)}/license`;
	};

	const getCost = (el) => {
		let period = getPeriod(el);
		let cost = el?.tier_pricing_value || 0;
		if (period === "years") {
			cost = el?.license_cost * (1 / 12);
		}
		let value = (data?.quantity || 1) * cost;
		if (period === "years" || period === "months") {
			value = value * data?.subscription_duration_value;
			if (data?.subscription_duration_term === "years") {
				value = value * 12;
			}
		}

		return value;
	};
	return (
		<>
			<div
				style={{
					height: "fit-content",
					padding: "33px 30px",
				}}
				className="d-flex flex-column background-color-white border-radius-4 mt-3 w-100 "
			>
				<div
					className="font-14 bold-700 black-1 o-7"
					style={{
						alignSelf: "flex-start",
					}}
				>
					ALTERNATIVE LICENSE TYPES
				</div>
				<hr style={{ margin: "15px 10px " }} className="w-100 "></hr>
				<div
					className="d-flex flex-row align-items-center"
					style={{ overflowX: "auto", paddingBottom: "10px" }}
				>
					{data.alternate_licenses.map((el) => (
						<div
							className="d-flex flex-column mr-2"
							style={{
								minWidth: "380px",
								maxWidth: "380px",
								height: editPresent ? "219px" : "175px",
								background: "rgba(246, 247, 252, 0.75)",
								border: "1px solid #EBEBEB",
								padding: "20px 27px",
							}}
						>
							<div className="d-flex align-items-center">
								<GetImageOrNameBadge
									name={data?.app_name}
									url={data?.app_logo}
									width={26}
									height={"auto"}
								></GetImageOrNameBadge>
								<div className="d-flex flex-column ml-1">
									<OverlayTrigger
										placement="top"
										overlay={
											<Tooltip>{el.tier_name}</Tooltip>
										}
									>
										<div className="font-16 bold-600 truncate_request_contract_name">
											{el.tier_name}
										</div>
									</OverlayTrigger>
									{el.tier_pricing_value ? (
										<>
											<div className=" font-10 grey-1">
												{getCostText(el)}
											</div>
										</>
									) : null}
								</div>
								{el.tier_pricing_value ? (
									<>
										<div className="d-flex ml-auto flex-column">
											<div
												className="bold-600 font-16 "
												style={{ textAlign: "right" }}
											>
												{kFormatter(
													getCost(el),
													el.tier_currency
												)}{" "}
												/ {getPeriod(el)?.slice(0, -1)}
											</div>
											<div className="grey-1 font-10">{`for ${
												data.quantity || 1
											} requested license`}</div>
										</div>
									</>
								) : null}
							</div>
							{inOrg ? (
								<>
									<div className="d-flex align-items-center mt-2">
										<img src={discoverLogo}></img>
										<div className="glow_blue font-11 bold-500">
											License Type is already used in your
											Organization
										</div>
									</div>
								</>
							) : (
								<div className="d-flex align-items-center mt-2">
									<img src={yellowexclamation}></img>
									<div className=" font-11 bold-500 text_orange ">
										License Type is not used in your
										Organization
									</div>
								</div>
							)}
							<hr
								style={{
									border: "1px dashed #DDDDDD",
									marginRight: "0px",
									marginLeft: "0px",
									margingTop: el.tier_pricing_value
										? "15px"
										: "30px",
									marginBottom: el?.included_license_data
										? "15px"
										: "36px",
								}}
							></hr>
							{el.included_license_data && (
								<>
									<div className="d-flex align-items-center">
										<OverlayTrigger
											placement="top"
											overlay={
												<Tooltip>
													{el?.included_license_data
														?.contract_name ||
														"Contract Name"}
												</Tooltip>
											}
										>
											<div className="font-16 bold-600 truncate_request_contract_name">
												{el?.included_license_data
													?.contract_name ||
													"Contract Name"}
											</div>
										</OverlayTrigger>
										<div
											className="d-flex align-items-center glow_blue font-9 ml-2 bold-600"
											style={{
												background:
													"rgba(90, 186, 255, 0.1)",
												borderRadius: "2px",

												padding: "5px ",
											}}
										>
											{capitalizeFirstLetter(
												el.included_license_data?.type
											)}
										</div>
									</div>
									<div className="d-flex align-items-center mt-1">
										<div className="d-flex align-items-center">
											<div className="grey-1 font-11">
												Unassigned :
											</div>
											<div className="grey-1 font-12 bold-600">
												{
													el.included_license_data
														?.unassigned_license_count
												}
											</div>
										</div>
										<div className="d-flex align-items-center ml-1">
											<div className="grey-1 font-11">
												Total :
											</div>
											<div className="grey-1 font-12 bold-600">
												{
													el.included_license_data
														?.total_licenses_count
												}
											</div>
										</div>
										<div className="d-flex align-items-center ml-1">
											<div className="grey-1 font-11">
												Auto-Increment:
											</div>
											<div className="grey-1 font-12 bold-600">
												{el.included_license_data
													?.auto_increment
													? "Yes"
													: "No"}
											</div>
										</div>
									</div>
								</>
							)}
							{editPresent && (
								<>
									<Button
										onClick={() => {
											onButtonClick(el);
										}}
										type="link"
										style={{
											border: "1px solid #2266E2",
											width: "fit-content",
										}}
										className="mt-2"
									>
										Use this License Type
									</Button>
								</>
							)}
						</div>
					))}
				</div>
			</div>
		</>
	);
}
