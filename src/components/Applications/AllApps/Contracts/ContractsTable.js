import React, { useEffect, useRef, useState } from "react";
import "../../../../App.css";
import adobe from "../../../../assets/transactions/adobe.svg";
import { Table } from "../../../../common";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import profilephoto from "../../../../assets/applications/profilephoto.svg";
import check from "../../../../assets/applications/check.svg";
import { Link } from "react-router-dom";
import {
	getLicensesForLicenseContract,
	getSingleApplicationContractInfo,
	getSingleApplicationLicenseContracts,
} from "../../../../services/api/applications";
import { EmptyContracts } from "../../Contracts/EmptyContracts";
import { defaults } from "../../../../constants";
import inactivecheck from "../../../../assets/applications/inactivecheck.svg";
import { InfiniteTable } from "../../../Departments/InfiniteTable";
import { fetchSingleAppContractInfo } from "../../../../actions/applications-action";
import { useSelector } from "react-redux";
import ContentLoader from "react-content-loader";
import dayjs from "dayjs";
import { NameBadge } from "../../../../common/NameBadge";
import { OverlayTrigger, Row, Tooltip, Col } from "react-bootstrap";
import tabledownarrow from "../../../../assets/applications/tabledownarrow.svg";
import tableuparrow from "../../../../assets/applications/tableuparrow.svg";
import { currencySymbols } from "../../../../constants/currency";
import { Popover } from "../../../../UIComponents/Popover/Popover";
import { getDateDiff, timeSince } from "../../../../utils/DateUtility";
import { kFormatter } from "../../../../constants/currency";
import { EmptySearch } from "../../../../common/EmptySearch";
import { TriggerIssue } from "../../../../utils/sentry";
import addLicenseBtn from "../../../../assets/applications/addLicenseBtn.svg";
import { Loader } from "../../../../common/Loader/Loader";
import moment from "moment";
import tooltipdate from "../../../../assets/licenses/tooltipdate.svg";

export const periodAbbreviation = {
	monthly: "pm",
	weekly: "pw",
	daily: "pd",
	yearly: "py",
};

export function LicenseCard(props) {
	const {
		license_name,
		license_used,
		license_count,
		license_details,
		license_cycle_cost,
		license_cycle_period,
	} = props.license;
	return (
		<div
			className={`${
				props.isOverview
					? "licenseCard_overview mb-2"
					: "licenseCard mr-2"
			}`}
		>
			<div
				className={`${
					props.isOverview
						? "licenseCard_overview__left__div border-right"
						: "licenseCard__left__div border-right"
				}`}
			>
				<div
					className={`${
						props.isOverview
							? "licenseCard_overview__row__1"
							: "licenseCard__row__1"
					}`}
				>
					<OverlayTrigger
						placement="top"
						overlay={<Tooltip>{license_name}</Tooltip>}
					>
						<span className="truncate_name">{license_name}</span>
					</OverlayTrigger>
				</div>
				<div
					className={`${
						props.isOverview
							? "licenseCard_overview__row__2"
							: "licenseCard__row__2"
					}`}
				>
					<div className="mr-1">{`${kFormatter(license_cycle_cost)} ${
						periodAbbreviation[license_cycle_period]
					}`}</div>
					<div
						hidden={
							license_details.length > 0 &&
							!!license_details[0].count_per_metric
						}
						className="dot mt-auto mb-auto mr-1"
					></div>
					<div
						hidden={
							license_details.length > 0 &&
							!!license_details[0].count_per_metric
						}
						style={{ display: "flex" }}
					>
						Auto Increment
						<div
							className={`${
								license_details.length > 0 &&
								license_details[0].auto_increment
									? "green"
									: "red"
							} ml-1`}
						>
							{license_details.length > 0 &&
							license_details[0].auto_increment
								? "ON"
								: "OFF"}
						</div>
					</div>
				</div>
			</div>
			<div
				className={`${
					props.isOverview
						? "licenseCard_overview__right__div"
						: "licenseCard__right__div"
				}`}
			>
				<div
					className={`${
						props.isOverview
							? "licenseCard_overview__right__row__1"
							: "licenseCard__right__row__1"
					}`}
				>
					{license_used}/{license_count}
				</div>
				<div
					className={`${
						props.isOverview
							? "licenseCard_overview__right__row__2"
							: "licenseCard__right__row__2"
					}`}
				>
					Licenses Used
				</div>
			</div>
		</div>
	);
}
export function LicenseRow({ activeId, setactiveId, row, tableData }) {
	const showLicenseRow = (row) => {
		if (row) {
			if (!activeId.includes(row)) {
				let tempId = [...activeId];
				tempId.push(row);
				setactiveId(tempId);
			} else {
				if (row === tableData[0]?.contract_id) {
					tableData[0].isAccessible = false;
				}
				let tempId = activeId.filter((el) => el !== row);
				setactiveId(tempId);
			}
		}
	};

	return (
		<>
			<img
				className="cursor-pointer"
				src={activeId.includes(row) ? tableuparrow : tabledownarrow}
				alt="down"
				onClick={() => showLicenseRow(row)}
			/>
		</>
	);
}
export function LicenseCardsContainer({ id }) {
	const [licenseArray, setLicenseArray] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showError, setShowError] = useState(false);
	useEffect(() => {
		if (loading) {
			getLicensesForLicenseContract(id)
				.then((res) => {
					if (
						res.results &&
						res.results.licenses &&
						Array.isArray(res.results.licenses)
					) {
						setLicenseArray(res.results.licenses);
						setLoading(false);
					} else {
						TriggerIssue("Unexpected response from the api");
						setShowError(true);
					}
				})
				.catch((err) => {
					TriggerIssue(
						"Error in fetching the licenses of the contract",
						err
					);
					setShowError(true);
				});
		}
	}, []);
	return (
		<>
			{loading ? (
				<div className="d-flex flex-row justify-content-center">
					<Loader height={60} width={60} />
				</div>
			) : (
				<>
					<div className="license__row">
						{licenseArray?.map(
							(license, index) =>
								index < 3 && <LicenseCard license={license} />
						)}
						{licenseArray.length > 3 && (
							<div className="licenseRow_end mr-2">
								+ {licenseArray.length - 3} more
							</div>
						)}
						{showError && (
							<div className="licenseCard mr-2 d-flex flex-row justify-content-center align-items-center">
								Server error
							</div>
						)}
						<Link to={`/licenses/contracts/${id}?edit`}>
							<img src={addLicenseBtn} />
						</Link>
					</div>
				</>
			)}
		</>
	);
}
export function DayProgressBar(props) {
	const { start, end, tooltipDate } = props;
	const contract_time = new Date(end) - new Date(start);
	let passed_contract_time;
	if (new Date(end) > new Date() && new Date() > new Date(start)) {
		passed_contract_time = new Date() - new Date(start);
	}
	let percentage = (passed_contract_time / contract_time) * 100;
	if (new Date() > new Date(end)) {
		percentage = 100;
	}
	if (new Date() < new Date(start)) {
		percentage = 0;
	}
	let remaining_contract_time = "Contract time elapsed";
	if (new Date() < new Date(end)) {
		if (new Date() < new Date(start)) {
			remaining_contract_time = timeSince(start, end);
		} else {
			remaining_contract_time = timeSince(end, new Date());
		}
	}
	let tooltip_percentage = 0;
	let tooltip_time;
	if (tooltipDate) {
		tooltip_time = new Date(tooltipDate) - new Date(start);
		tooltip_percentage = (tooltip_time / contract_time) * 100;
	}
	const containerStyles = {
		height: props.height || "6px",
		width: props.width || "90px",
		backgroundColor: "#e0e0de",
		borderRadius: "10px",
	};
	const fillerStyles = {
		height: "100%",
		width:
			moment(end).year() === 2100
				? "0%"
				: `${props.percentage || percentage}%`,
		backgroundColor: "#5ABAFF",
		borderRadius: "10px",
	};

	const tooltipStyles = {
		left:
			moment(end).year() === 2100
				? "0%"
				: tooltip_percentage > 80
				? ``
				: `${tooltip_percentage}%`,
		top: "5px",
		flexDirection:
			moment(end).year() === 2100
				? "0%"
				: tooltip_percentage > 80
				? "row-reverse"
				: "row",
		right:
			moment(end).year() === 2100
				? "0%"
				: tooltip_percentage > 80
				? `${100 - tooltip_percentage}%`
				: ``,
	};

	const dateStyles = {
		textAlign:
			moment(end).year() === 2100
				? "0%"
				: props.percentage || percentage > 80
				? `end`
				: ``,
	};
	return (
		<>
			{props.isTooltipRequired ? (
				<OverlayTrigger
					placement="top"
					className="flex flex-row"
					overlay={
						<Tooltip>
							{getDateDiff(end, new Date()) === ""
								? "Time elapsed"
								: `${getDateDiff(end, new Date())} left`}
						</Tooltip>
					}
				>
					<div className="mt-1" style={containerStyles}>
						<div style={fillerStyles}></div>
					</div>
				</OverlayTrigger>
			) : (
				<div className="mt-2" style={containerStyles}>
					<div style={fillerStyles}></div>
					{props.isContractTimeline && tooltipDate && (
						<>
							<div
								className="position-relative d-flex "
								style={tooltipStyles}
							>
								<img src={tooltipdate}></img>
								<div
									className="d-flex flex-column"
									style={{
										marginLeft: "5px",
										marginRight: "5px",
									}}
								>
									<div
										className="grey-1 o-8 bold-600 font-10"
										style={dateStyles}
									>
										{moment(new Date(tooltipDate)).format(
											"DD MMM YYYY"
										)}
									</div>
									<div className="grey o-8 bold-600 font-10">
										Upcoming Payment
									</div>
								</div>
							</div>
						</>
					)}
				</div>
			)}
		</>
	);
}

export const remainingContractTime = (start, end) => {
	let remaining_contract_time = "Contract time elapsed";
	if (new Date() < new Date(end)) {
		if (new Date() < new Date(start)) {
			remaining_contract_time = timeSince(end, start);
		} else {
			remaining_contract_time = timeSince(end, new Date());
		}
	}
	return remaining_contract_time;
};
