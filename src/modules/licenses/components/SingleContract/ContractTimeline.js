import {
	getContractNextPaymentDate,
	getContractPaymentDateArray,
} from "modules/licenses/utils/LicensesUtils";
import React from "react";
import { getDateDiff, UTCDateFormatter } from "../../../../utils/DateUtility";
import { ContractProgressBar } from "./ContractProgressBar";

export default function ContractTimeline(props) {
	const { data, loading } = props;
	let remaining_contract_time =
		getDateDiff(data?.end_date, new Date()) === ""
			? "Contract Time Elapsed"
			: getDateDiff(data?.end_date, new Date());

	let payment_date_array = [];
	if (data?.payment_term === "one_time") {
		payment_date_array =
			new Date(data?.payment_date) >= new Date(data?.start_date)
				? [data?.payment_date]
				: [];
	} else {
		payment_date_array = getContractPaymentDateArray(data);
	}

	return (
		<>
			<div className="contract-timeline-container">
				<div>Contract Timeline</div>
				<div className="d-flex justify-content-between">
					<div className="font-12 grey-1 o-8">Start Date</div>
					<div className="font-12 grey-1 o-8">End Date</div>
				</div>
				<div className="d-flex justify-content-between align-items-center">
					<div className="font 14" style={{ whiteSpace: "nowrap" }}>
						{UTCDateFormatter(data?.start_date)}
					</div>
					<hr className="m-0 w-25" />
					<div className="font-12 o-8 text-align-center">
						{`${
							remaining_contract_time === "Contract Time Elapsed"
								? "Contract Time Elapsed"
								: remaining_contract_time + " left"
						}`}
					</div>
					<hr className="m-0 w-25" />
					<div className="font 14" style={{ whiteSpace: "nowrap" }}>
						{UTCDateFormatter(data?.end_date)}
					</div>
				</div>
				<ContractProgressBar
					height={38}
					width={"100%"}
					start={data?.start_date}
					end={data?.end_date}
					isContractTimeline={true}
					upcoming_payment={getContractNextPaymentDate(data)}
					cancel_by={data?.cancel_by}
					payment_date_array={payment_date_array}
					data={data}
				/>
			</div>
		</>
	);
}
