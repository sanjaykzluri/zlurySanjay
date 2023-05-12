import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import orangewarning from "../../../assets/licenses/orangewarning.svg";
import orangedropdown from "../../../assets/licenses/orangedropdown.svg";
import { DatePicker } from "../../../UIComponents/DatePicker/DatePicker";
import { useOutsideClickListener } from "../../../utils/clickListenerHook";
import Calendar from "react-calendar";
import { Loader } from "../../../common/Loader/Loader";
import { editLicenseForAUser } from "../../../services/api/licenses";
import { kFormatter } from "../../../constants/currency";
import integrationmapping from "../../../assets/licenses/intconnect.svg";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "./LicensesComponents.css";
import licenseFromIntegration from "../../../assets/licenses/licenseFromIntegration.svg";
import GetImageOrNameBadge from "../../../common/GetImageOrNameBadge";
import { getLicenseTermText } from "../utils/LicensesUtils";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";

export default function LicenseCard({
	license,
	appId,
	userId,
	refresh,
	setIsEditing,
	showDateInfo = true,
}) {
	const licenseCardRef = useRef();
	const [showSingleLicensePopover, setShowSingleLicensePopover] =
		useState(false);
	const [showCalendar, setShowCalendar] = useState(false);
	const [loading, setLoading] = useState(false);
	const calendarRef = useRef();
	useOutsideClickListener(licenseCardRef, () => {
		setShowSingleLicensePopover(false);
		setShowCalendar(false);
	});

	useOutsideClickListener(calendarRef, () => {
		setShowCalendar(false);
	});

	useOutsideClickListener(calendarRef, () => {
		setShowCalendar(false);
	});

	const handleDateChange = (date) => {
		setLoading(true);
		editLicenseForAUser(
			{ new_start_date: date },
			license.license_id,
			appId,
			userId
		).then((res) => {
			if (res.status === "success") {
				setLoading(false);
				refresh();
			}
		});
	};
	return (
		<div
			style={{
				border: "1px solid #EBEBEB",
				height: "44px",
				minWidth: "144px",
				marginRight: "8px",
				padding: "6px 11px ",
			}}
			className="background-color-white d-flex flex-column"
			onClick={() => {
				setShowSingleLicensePopover(true);
				setIsEditing && setIsEditing(false);
			}}
		>
			<div className="d-flex align-items-center">
				<div className="font-13 mr-2 truncate-license-name-in-popover">
					{license.license_name || license.name}
				</div>
				{license.integration_id && (
					<img
						src={licenseFromIntegration}
						width={12}
						height={12}
						className="ml-1"
					/>
				)}
			</div>
			{showDateInfo && (
				<div className="grey-1 font-10">
					{license.license_assigned_on ? (
						`since ${moment(license.license_assigned_on).format(
							"DD MMM YYYY"
						)} `
					) : (
						<div className="d-flex">
							<img src={orangewarning}></img>
							<div
								className="font-10 ml-1 mr-1 text_orange "
								style={{ marginTop: "1px" }}
							>
								Add Start Date
							</div>
							<img src={orangedropdown}></img>
						</div>
					)}
				</div>
			)}
			{showSingleLicensePopover && (
				<>
					<div
						className="single__license__popover__container d-flex flex-column"
						ref={licenseCardRef}
					>
						{loading ? (
							<Loader height={50} width={50} />
						) : (
							<>
								{" "}
								<div
									className="d-flex flex-row"
									style={{ padding: "17px 17px 0px" }}
								>
									<OverlayTrigger
										placement="top"
										overlay={
											<Tooltip>
												{license?.license_name ||
													license?.name}
											</Tooltip>
										}
									>
										<div className="font-12 bold-600 truncate-license-name-in-popover">
											{license?.license_name ||
												license?.name}
										</div>
									</OverlayTrigger>
									<div className="ml-auto d-flex justify-content-end grey-1 font-12">
										{license?.cost_per_item
											?.amount_org_currency ? (
											<>
												{kFormatter(
													license.cost_per_item
														?.amount_org_currency
												)}{" "}
												{getLicenseTermText(
													license,
													license.cost_per_item,
													false,
													true
												)}
											</>
										) : (
											"NA"
										)}
									</div>
								</div>
								<hr
									style={{
										margin: "9px 0px 0px",
									}}
								></hr>
								{license?.license_assigned_on ? (
									<>
										<div
											className="d-flex align-items-center mt-3 mb-2"
											style={{
												marginTop: "6px",
												padding: "0px 17px",
											}}
										>
											<div className="font-8 grey-1 mr-1 ml-1">
												In Use Since
											</div>
											<div className="font-10 grey-1 o-8 mr-1">
												{moment(
													license.license_assigned_on
												).format("DD MMM YYYY")}
											</div>
											<div
												className="font-10 primary-color cursor-pointer position-relative"
												onClick={() =>
													setShowCalendar(true)
												}
											>
												Change Date
												{showCalendar && (
													<div
														className="position-absolute"
														ref={calendarRef}
													>
														<Calendar
															onChange={(
																date
															) => {
																handleDateChange(
																	date
																);
															}}
															value={
																new Date(
																	license.license_assigned_on
																)
															}
														/>
													</div>
												)}
											</div>
										</div>
									</>
								) : showDateInfo ? (
									<>
										<div className="d-flex flex-column mt-3 mb-2">
											<div
												className="bold-600 font-12 mb-2 o-8"
												style={{ padding: "0px 17px" }}
											>
												Set Start Date
											</div>
											<DatePicker
												placeholder="Date"
												onChange={(date) => {
													handleDateChange(date);
												}}
												calendarClassName="rangefilter-calendar"
												calendarContainerClassName="schedule-date-calendar"
												style={{
													width: "170px",
												}}
											/>
										</div>
									</>
								) : (
									""
								)}
								{license.integration_id ? (
									<>
										<div
											className="d-flex align-items-center"
											style={{
												backgroundColor:
													"rgba(235, 235, 235, 0.3)",
												paddingLeft: "19px",
												height: "32px",
												marginTop: "11px",
											}}
										>
											<div className="d-flex align-items-center font-8 grey-1">
												<img
													src={licenseFromIntegration}
													width={12}
													height={12}
													className="mr-1"
												/>
												<div className="mx-1">
													Automatically mapped from
												</div>
												<GetImageOrNameBadge
													url={
														license.integration_logo
													}
													name={
														license.integration_name
													}
													width={12}
													height={12}
												/>
												<div className="ml-1">
													<LongTextTooltip
														text={
															license.org_integration_name
														}
														maxWidth={"83px"}
													/>
												</div>
											</div>
										</div>
									</>
								) : license.updated_by_user_id ? (
									<>
										<div
											className="d-flex align-items-center"
											style={{
												backgroundColor:
													"rgba(235, 235, 235, 0.3)",
												paddingLeft: "19px",
												height: "32px",
												marginTop: "11px",
											}}
										>
											<div className="font-8 grey-1">{`Manually mapped by ${license.updated_by_user_name}`}</div>
										</div>
									</>
								) : null}
							</>
						)}
					</div>
				</>
			)}
		</div>
	);
}
