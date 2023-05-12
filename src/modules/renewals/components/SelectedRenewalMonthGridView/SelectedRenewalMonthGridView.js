import React, { useEffect, useState } from "react";
import { MONTH } from "../../../../utils/DateUtility";
import { Reminder } from "../../containers/Reminder/Reminder";
import { Renewal } from "../../containers/Renewal/Renewal";
import search from "../../../../assets/search.svg";
import calender from "../../../../assets/icons/calender.svg";
import "./SelectedRenewalMonthGridView.css";
import { kFormatter } from "../../../../constants/currency";
import { useDispatch, useSelector } from "react-redux";
import { NameBadge } from "../../../../common/NameBadge";
import { EmptySearch } from "../../../../common/EmptySearch";
const INRFormatter = (str) => {
	const SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];
	var len = str.length;
	var suffix = isNaN(str.slice(len - 1)) ? str.slice(len - 1) : "";
	var tier = SI_SYMBOL.findIndex((v) => v === suffix);
	var number = parseFloat(str) * Math.pow(10, tier * 3);
	return kFormatter(number);
};

const renewalFilters = {
	payment: "payment",
	renewal: "renewal",
	contract: "contract",
};

export function SelectedRenewalMonthGridView(props) {
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [renewalsList, setRenewalsList] = useState(
		props.data.clubedRenewal()
	);
	const [query, setQuery] = useState("");
	const [filterApplied, setFilterApplied] = useState();
	let days =
		renewalsList &&
		renewalsList.map((applications, index) => {
			let application =
				filterApplied === renewalFilters.contract
					? applications.filter((app) => !app.isPaymentRenewal)
					: filterApplied === renewalFilters.payment
					? applications.filter((app) => app.isPaymentRenewal)
					: applications;

			return applications && applications.length && application.length ? (
				<DayWiseRenewal
					applications={
						filterApplied === renewalFilters.contract
							? applications.filter(
									(app) => !app.isPaymentRenewal
							  )
							: filterApplied === renewalFilters.payment
							? applications.filter((app) => app.isPaymentRenewal)
							: applications
					}
					key={index}
				/>
			) : null;
		});
	const checkIfDaysAreNull = () => {
		let result = false;
		days.map((day) => {
			if (day) {
				result = true;
			}
		});
		return result;
	};

	const onSearching = (q) => {
		window.analytics.track("Search Renewals Results Displayed", {
			searchQuery: q,
			currentCategory: "Applications",
			currentPageName: "Renewals-Grid-View",
			orgId: orgId || "",
			orgName: orgName || "",
		});
		q = q?.trimStart();
		setQuery(q);
		let lists = props.data
			.clubedRenewal()
			.map((list) =>
				list.filter((renewal) =>
					renewal.name?.toLowerCase().includes(q.toLowerCase())
				)
			);
		setRenewalsList(lists);
	};

	useEffect(() => {
		setRenewalsList(props.data.clubedRenewal());
		setQuery("");
	}, [props]);

	const clickedOnSearch = () => {
		//Segment Implementation
		window.analytics.track("Clicked on Search Applications", {
			currentCategory: "Applications",
			currentPageName: "Renewals-Grid-View",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	return (
		<div className="block block__month">
			<div className="block__month--header p-3">
				<div className="d-flex align-items-center justify-content-between mb-3">
					<div className="font-18 bold-400">
						{props.data.getMonthYear()}
					</div>
					<div
						className="d-flex flex-column p-2"
						style={{ width: "95px", background: "#e9f3fa" }}
					>
						<div className="bold-400 font-10">Total Spend</div>
						<div className="bold-600 font-13">
							{INRFormatter(props.data.spend())}
						</div>
					</div>
				</div>
				{renewalsList.length ? (
					<div className="d-flex justify-content-center">
						<div
							className={
								!filterApplied
									? "active-renewal-filter"
									: "inactive-renewal-filter"
							}
							onClick={() => setFilterApplied()}
						>{`Show all (${
							props.data
								? props.data?.getApplications()?.length +
								  props.data?.getContracts()?.length
								: 0
						})`}</div>
						<div
							className={
								filterApplied === renewalFilters.payment
									? "active-renewal-filter"
									: "inactive-renewal-filter"
							}
							onClick={() =>
								setFilterApplied(renewalFilters.payment)
							}
						>{`Payments (${
							props.data
								? props.data?.getApplications().length
								: 0
						})`}</div>
						<div
							className={
								filterApplied === renewalFilters.contract
									? "active-renewal-filter"
									: "inactive-renewal-filter"
							}
							onClick={() =>
								setFilterApplied(renewalFilters.contract)
							}
						>{`Contracts (${
							props.data ? props.data.getContracts().length : 0
						})`}</div>
					</div>
				) : null}
			</div>
			<div className="block__month--body p-3 position-relative">
				{renewalsList.length ? (
					<div>
						<div className="block__month--search position-relative">
							<img src={search} />
							<input
								placeholder="Search"
								type="text"
								className="w-100"
								value={query}
								onChange={(e) => {
									onSearching(e.target.value);
								}}
								onClick={clickedOnSearch}
							/>
						</div>
						{checkIfDaysAreNull(days) ? (
							days
						) : query ? (
							<div className="renewals-empty-search-container">
								<EmptySearch
									minHeight={100}
									searchQuery={query}
								/>
							</div>
						) : (
							<div className="text-center position-center">
								<img src={calender} className="mb-2 ml-4" />
								<p className="font-14 bold-400 grey-1">
									No{" "}
									{filterApplied == renewalFilters.payment
										? "Payments"
										: "Renewals"}{" "}
									this month
								</p>
							</div>
						)}
					</div>
				) : (
					<div className="text-center position-center">
						<img src={calender} className="mb-2 ml-4" />
						<p className="font-14 bold-400 grey-1">
							No Renewals or Payments this month
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

function DayWiseRenewal(props) {
	const events = props.applications.map((app, index) => {
		return (
			<div className="block__month--date__body d-flex mb-3" key={index}>
				<div className="mr-2">
					{app.logo ? (
						<img src={app.logo} />
					) : (
						<NameBadge
							className="mt-1"
							name={app.name}
							width={16}
							height={16}
						/>
					)}
				</div>
				<div className="flex-grow-1 position-relative">
					<div>
						<Renewal
							popoverClassName="renewal-grid__popover"
							className="z__header-ternary text-left"
							renewal={app}
							displayName={true}
						/>
					</div>
					<div>
						<Reminder renewal={app} typeofview={"Grid"} />
					</div>
				</div>
				<div className="bold-500">
					<p className="font-13">{INRFormatter(app.cost)}</p>
				</div>
			</div>
		);
	});
	return (
		<div className="block__month--date mt-3 mb-5">
			<div className="block__month--date__header">
				<h4 className="z__header-quaternary text-uppercase">
					{" "}
					{MONTH[props.applications[0]?.date.getMonth()]}{" "}
					{props.applications[0]?.date.getDate()}
				</h4>
			</div>
			{events}
		</div>
	);
}
