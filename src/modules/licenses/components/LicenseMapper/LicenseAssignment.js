import React, { useEffect, useRef, useState } from "react";
import { Popover } from "../../../../UIComponents/Popover/Popover";
import { debounce } from "../../../../utils/common";
import { Loader } from "../../../../common/Loader/Loader";
import "./LicenseMapper.css";
import blueaddbutton from "../../../../assets/licenses/blueaddbutton.svg";
import orangewarning from "../../../../assets/licenses/orangewarning.svg";
import { useSelector } from "react-redux";
import orangedropdown from "../../../../assets/licenses/orangedropdown.svg";
import search from "../../../../assets/search.svg";
import { useOutsideClickListener } from "../../../../utils/clickListenerHook";
import moment from "moment";
import { DatePicker } from "../../../../UIComponents/DatePicker/DatePicker";
import Calendar from "react-calendar";
import blueTick from "../../../../assets/blueTick.svg";
import SameDateModal from "./SameDateModal";
import { kFormatter } from "../../../../constants/currency";
import integrationmapping from "../../../../assets/licenses/intconnect.svg";
import licenseFromIntegration from "../../../../assets/licenses/licenseFromIntegration.svg";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { getLicenseTermText } from "modules/licenses/utils/LicensesUtils";

export function LicenceCard(props) {
	const userInfo = useSelector((state) => state.userInfo);
	const defaultMetricCurrency = userInfo?.org_currency;

	return (
		<div
			className={`d-flex flex-column p-2 licenceCardDropdownItem mt-1 rounded bold-normal ${
				!props.isAlreadyAssigned && "cursor-pointer"
			}`}
			onClick={(e) => props.handleCardClick(e, props.licence)}
			style={
				props.isAlreadyAssigned
					? {
							background: "rgba(90, 186, 255, 0.1)",
					  }
					: {}
			}
		>
			<div className="d-flex flex-row justify-content-between">
				<div
					className={`d-flex font-14 ${
						props.isBulkAssign &&
						!props.isUsageOverview &&
						"justify-content-between w-100"
					} `}
				>
					<div className="d-flex align-items-center mr-2">
						<div>{props.licence.license_name}</div>
						{props.licence.integration_id && (
							<img
								src={licenseFromIntegration}
								width={12}
								height={12}
								className="ml-1"
							/>
						)}
					</div>
					<div className="d-flex">
						<div className="bold-600">
							{kFormatter(
								props.licence.cost_per_item
									?.amount_org_currency ||
									props.licence.cost_per_license
										?.amount_org_currency ||
									0
							)}{" "}
							{`${getLicenseTermText(
								props.licence,
								props.licence.cost_per_license ||
									props.licence.cost_per_item,
								false,
								true,
								true
							)}`}
						</div>
					</div>
				</div>
				{props.isAlreadyAssigned && <img src={blueTick} />}
			</div>
			<div className="d-flex flex-row mt-1 w-100 justify-content-between">
				<div className="font-10 d-flex">
					<div className="grey-1">Licenses Used</div>
					<div className="licenceItemValue d-flex ml-1">
						<div className="bold-600">
							{props.licence?.mapped_license_count -
								(props.licence?.difference || 0) || 0}
						</div>
						/{props.licence?.total_license_available || 0}
					</div>
				</div>
				<div className="dot mt-auto mb-auto ml-2 mr-2"></div>
				<div className="font-10 d-flex">
					<div className="grey-1">Auto Increment</div>
					<div className="licenceItemValue d-flex ml-1">
						{props.licence.auto_increment ? (
							<div className="autoIncrementStatus">ON</div>
						) : (
							<div className="red">OFF</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default function LicenseAssignment(props) {
	const [showLicensesPopover, setShowLicensesPopover] = useState(false);
	const [searchLicences, setSearchLicences] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [licenseIdArray, setLicenseIdArray] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedLicense, setSelectedLicense] = useState();
	const showAddButtonRef = useRef();
	const licenseCardRef = useRef();
	const calendarRef = useRef();
	const [showSingleLicensePopover, setShowSingleLicensePopover] =
		useState(false);
	const [showCalendar, setShowCalendar] = useState(false);
	const [licenses, setLicenses] = useState([]);
	const [showSameDateModal, setShowSameDateModal] = useState(false);
	const [usedDate, setUsedDate] = useState();
	useEffect(() => {
		if (props.licenses && Array.isArray(props.licenses)) {
			setLicenses(props.licenses);
			var tempLicenseIdArray = props.licenses.map(
				(license) => license.license_id
			);
			setLicenseIdArray(tempLicenseIdArray);
		}
	}, [props.licenses]);
	const stopBubblingEvent = (e) => {
		e.stopPropagation();
		e.preventDefault();
	};

	const defaultPopoverPosition = {
		position: "absolute",
		width: "270px",
		left: "134px",
		top: "25px",
		padding: "8px",
		maxHeight: "315px",
	};

	const handleSearchQuery = (event) => {
		setSearchTerm(event.target.value || "");
		if (event.target.value.trim().length == 1) {
			event.preventDefault();
		} else {
			let tempArray = [];
			props.allLicenses.forEach((el) => {
				if (
					el.license_name
						.toLowerCase()
						.includes(event.target.value.toLowerCase())
				) {
					tempArray.push(el);
				}
			});
			setSearchLicences(tempArray);
		}
	};

	const handleLicenceCardClick = (e, license) => {
		stopBubblingEvent(e);
		props.onLicenseClick(license, props.data.user_id);
	};

	useOutsideClickListener(showAddButtonRef, () => {
		setShowLicensesPopover(false);
	});

	useOutsideClickListener(licenseCardRef, () => {
		setShowSingleLicensePopover(false);
		setShowCalendar(false);
	});

	useOutsideClickListener(calendarRef, () => {
		setShowCalendar(false);
	});

	const handleDateChange = (date) => {
		setUsedDate(date);
		if (props.checked.length > 0) {
			setShowSameDateModal(true);
		} else {
			props.onChangeDate(date, selectedLicense, props.data.user_id);
		}
		setShowCalendar(false);
	};

	const multiUserOnChangeDate = () => {
		props.checked.forEach((row_id) => {
			props.onChangeDate(usedDate, selectedLicense, row_id);
		});
	};

	return (
		<>
			<div
				className="d-flex position-relative"
				ref={showAddButtonRef}
				style={{
					height: "100%",
					minWidth: "180px",
					maxWidth: "380px",
					width: "fit-content",
				}}
			>
				{licenses.length === 0 ? (
					<>
						<img src={blueaddbutton} className="cursor-pointer" />
						<div
							className="glow_blue bold-600 font-13 ml-2 cursor-pointer"
							onClick={() => {
								setShowLicensesPopover(true);
							}}
						>
							Add License
						</div>
					</>
				) : (
					<>
						<div className="license__assignment__all__licenses__cont">
							{licenses.map((el, i) => (
								<div
									style={{
										border: "1px solid #EBEBEB",
										height: "44px",
										minWidth: "144px",
										marginRight: "8px",
										padding: "6px 11px ",
									}}
									className="background-color-white d-flex flex-column "
									onClick={() => {
										setShowSingleLicensePopover(true);
										setSelectedLicense(el);
										setShowLicensesPopover(false);
									}}
								>
									<div className="d-flex align-items-center">
										<div className="font-13 mr-2">
											{el.license_name}
											{el.integration_id && (
												<img
													src={licenseFromIntegration}
													width={12}
													height={12}
													className="ml-1"
												/>
											)}
										</div>
									</div>
									<div className="grey-1 font-10">
										{el.license_assigned_on ? (
											`since ${moment(
												el.license_assigned_on
											).format("DD MMM YYYY")} `
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
								</div>
							))}
							<img
								className="cursor-pointer"
								src={blueaddbutton}
								onClick={() => {
									setShowLicensesPopover(true);
								}}
							></img>
						</div>
						{showSingleLicensePopover && (
							<>
								<div
									className="single__license__popover__container d-flex flex-column"
									ref={licenseCardRef}
								>
									<div
										className="d-flex flex-row"
										style={{
											padding: "17px 17px 0px",
										}}
									>
										<OverlayTrigger
											placement="top"
											overlay={
												<Tooltip>
													{
														selectedLicense?.license_name
													}
												</Tooltip>
											}
										>
											<div className="font-12 bold-600 truncate-license-name-in-popover">
												{selectedLicense.license_name}
											</div>
										</OverlayTrigger>

										<div className="w-100 d-flex justify-content-end grey-1 font-12">
											{selectedLicense.cost_per_item
												?.amount_org_currency
												? `${kFormatter(
														selectedLicense
															.cost_per_item
															?.amount_org_currency
												  )} ${getLicenseTermText(
														selectedLicense,
														selectedLicense.cost_per_item,
														false,
														true
												  )}`
												: "NA"}
										</div>
									</div>
									<hr
										style={{
											margin: "9px 0px 0px",
										}}
									></hr>
									{selectedLicense?.license_assigned_on ? (
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
														selectedLicense.license_assigned_on
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
																		selectedLicense.license_assigned_on
																	)
																}
															/>
														</div>
													)}
												</div>
											</div>
										</>
									) : (
										<>
											<div
												className="d-flex flex-column mt-3 mb-2"
												style={{
													padding: "0px 17px",
												}}
											>
												<div className="bold-600 font-12 mb-2 o-8">
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
									)}
									{selectedLicense.integration_id ? (
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
												<img
													src={integrationmapping}
													className="mr-1"
												></img>
												<div className="font-8 grey-1">{`Automatically mapped from ${selectedLicense.org_integration_name}`}</div>
											</div>
										</>
									) : selectedLicense.updated_by_user_id ? (
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
												<div className="font-8 grey-1">{`Manually mapped by ${selectedLicense.updated_by_user_name}`}</div>
											</div>
										</>
									) : null}
								</div>
							</>
						)}
					</>
				)}
				<Popover
					align="center"
					show={showLicensesPopover}
					style={props.popoverPositionStyle || defaultPopoverPosition}
				>
					<div className="d-flex flex-column">
						<div className="border rounded d-flex">
							<img
								src={search}
								aria-hidden="true"
								className="m-2"
							/>
							<input
								type="text"
								value={searchTerm}
								className="w-100 border-0"
								placeholder="Search Licenses"
								onChange={handleSearchQuery}
							/>
						</div>
					</div>
					{!loading ? (
						<div
							className="d-flex flex-column"
							style={{ maxHeight: "250px", overflowY: "auto" }}
							key={searchTerm}
						>
							{Array.isArray(
								searchTerm.length > 1
									? searchLicences
									: props.allLicenses
							) &&
							(searchTerm.length > 1
								? searchLicences
								: props.allLicenses
							).length > 0 ? (
								(searchTerm.length > 1
									? searchLicences
									: props.allLicenses
								)?.map((licence, index) => (
									<LicenceCard
										key={index}
										licence={licence}
										handleCardClick={handleLicenceCardClick}
										isAlreadyAssigned={licenseIdArray.includes(
											licence.license_id
										)}
									/>
								))
							) : (
								<div className="p-2 mr-auto grey-1 o-6 mt-2 text-left bold-normal">
									0 licenses available
								</div>
							)}
						</div>
					) : (
						<Loader height={50} width={50} />
					)}
				</Popover>
			</div>
			{showSameDateModal && (
				<SameDateModal
					handleModalSave={multiUserOnChangeDate}
					isOpen={showSameDateModal}
					closeModal={() => {
						props.onChangeDate(
							usedDate,
							selectedLicense,
							props.data.user_id
						);
						setShowSameDateModal(false);
					}}
					setShowSameDateModal={setShowSameDateModal}
				></SameDateModal>
			)}
		</>
	);
}
