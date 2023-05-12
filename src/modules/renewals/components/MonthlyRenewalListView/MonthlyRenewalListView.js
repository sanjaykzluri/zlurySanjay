import React, { useContext } from "react";
import team from "../../../../assets/icons/team.svg";
import dollar from "../../../../assets/icons/dollar-refresh.svg";
import { MONTH } from "../../../../utils/DateUtility";
import { Reminder } from "../../containers/Reminder/Reminder";
import { Renewal } from "../../containers/Renewal/Renewal";
import { Link, useHistory } from "react-router-dom";
import {
	kFormatter,
	currencySymbols,
	currency,
} from "../../../../constants/currency";
import RoleContext from "../../../../services/roleContext/roleContext";
import { unescape } from "../../../../utils/common";
import { NameBadge } from "../../../../common/NameBadge";

const COLORS = ["#fdead9", "#e1e1f9"];

export function MonthlyRenewalListView(props) {
	const data = props.data;
	const renewals = data.clubedRenewal().map((applications, index) => {
		return (
			<DayWiseRenewalData
				key={index}
				applications={applications}
				eventColor={COLORS[index % COLORS.length]}
			/>
		);
	});
	const monthlySpend = data.spend();

	const INRFormatter = (str) => {
		const SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];
		var len = str.length;
		var suffix = isNaN(str.slice(len - 1)) ? str.slice(len - 1) : "";
		var tier = SI_SYMBOL.findIndex((v) => v === suffix);
		var number = parseFloat(str) * Math.pow(10, tier * 3);
		return kFormatter(number);
	};
	return (
		<div className="month-block mb-6">
			<div className="month-block__header">
				<div className="d-flex flex-row">
					<div className="mr-5" style={{ width: "150px" }}>
						<h3 className="z__header-primary font-18 bold-500">
							{" "}
							{data.getMonthYear()}{" "}
						</h3>
					</div>
					<div className="mr-4 text-uppercase">
						<h4 className="z__header-quaternary font-9 m-0">
							Renewals
						</h4>
						<p className="z__description-highlight grey bold-500">
							{data.count()}
						</p>
					</div>
					<div>
						<h4 className="z__header-quaternary text-uppercase font-9 m-0">
							Spend
						</h4>
						<p className="z__description-highlight grey bold-500">
							{INRFormatter(monthlySpend)}
						</p>
					</div>
				</div>
			</div>
			<div className="month-block__day-container">{renewals}</div>
		</div>
	);
}

function appName(application, eventColor) {
	const history = useHistory();
	return (
		<div
			className="d-flex flex-row align-items-center p-2"
			style={{
				backgroundColor: eventColor,
				width: "85%",
				borderRadius: "4px",
			}}
		>
			{application.logo ? (
				<img
					className="mr-2"
					style={{
						borderRadius: "50%",
						marginTop: "-2px",
						objectFit: "contain",
					}}
					width="15"
					src={unescape(application.logo)}
				/>
			) : (
				<NameBadge
					name={application.name}
					className="mr-2 rounded-circle"
					width={15}
					height={15}
				/>
			)}
			<p className="m-0 bold-500 d-inline-block flex-fill truncate_15vw">
				<Link
					to={
						application.renewal_has_application
							? `/applications/${encodeURI(
									application.id
							  )}#overview`
							: `applications/contracts/${encodeURI(
									application.id
							  )}`
					}
				>
					{application.name}
				</Link>
			</p>
			<div
				className={`ml-1 d-flex align-items-center cursor-pointer
								${
									application.isPaymentRenewal
										? "is-payment-renewal"
										: "is-not-payment-renewal "
								}
							`}
				onClick={(e) => {
					if (application.contract_id && application.contract_type) {
						e.preventDefault();
						e.stopPropagation();
						history.push(
							`/licenses/${application.contract_type}s/${application.contract_id}#overview`
						);
					}
				}}
			>
				{application.isPaymentRenewal ? "PAYMENT" : "CONTRACT"}
			</div>
		</div>
	);
}

function DayWiseRenewalData(props) {
	const applications = props.applications;
	const { isViewer } = useContext(RoleContext);
	const events = applications.map((application, index) => {
		return (
			<div
				className="day__body-event d-flex flex-row p-2 z__header-ternary align-items-center"
				key={application.renewalID}
			>
				<div style={{ width: "30%" }}>
					{application?.id ? (
						<div>{appName(application, props.eventColor)}</div>
					) : (
						appName(application, props.eventColor)
					)}
				</div>
				<div className=" grey-1" style={{ width: "14%" }}>
					<p className="m-0 text-capitalize">
						<img className="mr-2" src={dollar} />{" "}
						{application.interval}{" "}
					</p>
				</div>
				<div className=" grey-1" style={{ width: "14%" }}>
					<p className="m-0">
						<img className="mr-2" src={team} />{" "}
						{application.userCount} Users
					</p>
				</div>
				<div className=" bold-500" style={{ width: "14%" }}>
					<p className="m-0">
						{" "}
						{kFormatter(application.actualCost)}{" "}
					</p>
				</div>
				<div className=" position-relative" style={{ width: "19%" }}>
					<Reminder renewal={application} typeofview={"List"} />
				</div>
				{!isViewer && (
					<div
						className="  position-relative"
						style={{ width: "9%" }}
					>
						<Renewal renewal={application} />
					</div>
				)}
			</div>
		);
	});

	return (
		<div className="day-container__day d-flex flex-row pt-2 pb-2 align-items-center align-items-stretch">
			<div className="day__header text-uppercase text-center font-500 ">
				<div className="">
					<p className="z__description-secondary font-18 m-0">
						{applications[0]?.date.getDate()}
					</p>
					<p className="z__description-secondary m-0 mt-n1">
						{MONTH[applications[0]?.date.getMonth()]}
					</p>
				</div>
			</div>
			<div className="day__body flex-fill p-2 ">{events}</div>
		</div>
	);
}
