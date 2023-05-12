import React from "react";
import { capitalizeFirstLetter } from "utils/common";
import overview1 from "assets/applications/overview1.svg";
import overview2 from "assets/applications/overview2.svg";
import overview3 from "assets/applications/overview3.svg";
import { kFormatter } from "constants/currency";
import overview_live_users from "assets/applications/overview_live_users.svg";
import { getTotalLicenseRowData } from "modules/licenses/utils/LicensesUtils";
import moment from "moment";
import ContractRenewal from "./ContractRenewal";
import { UTCDateFormatter } from "utils/DateUtility";
import { RENEWAL_TYPE } from "modules/renewals/constants/constant";

export default function ContractDetails({
	loading,
	data,
	entity,
	requestData,
}) {
	const contractId = window.location.pathname.split("/")[3];
	return (
		<>
			{loading ? (
				<div
					className="contract_details_section"
					style={{ width: "auto", height: "91px" }}
				/>
			) : (
				<div className="contract_details_section">
					<div className="contract_details_section_insights">
						<div className="overview__top__next__ins1">
							{capitalizeFirstLetter(entity)} Value
						</div>
						<div className="overview__top__next__ins2">
							<img src={overview2} />
							<div className="app_details_header_text">
								{kFormatter(data?.contract_value)}
							</div>
						</div>
					</div>
					<div className="contract_details_section_insights">
						<div className="overview__top__next__ins1">
							Total Licenses
						</div>
						<div className="overview__top__next__ins2">
							<img src={overview1} />
							<div className="app_details_header_text">
								{getTotalLicenseRowData(data).quantity}
							</div>
						</div>
					</div>
					<div className="contract_details_section_insights">
						<div className="overview__top__next__ins1">
							Assigned Licenses
						</div>
						<div className="overview__top__next__ins2">
							<img src={overview_live_users} />
							<div className="app_details_header_text">
								{getTotalLicenseRowData(data).in_use}
							</div>
						</div>
					</div>
					<div className="contract_details_section_insights">
						<div className="overview__top__next__ins1">
							Unassigned Licenses
						</div>
						<div className="overview__top__next__ins2">
							<img src={overview3} />
							<div className="app_details_header_text">
								{(getTotalLicenseRowData(data).user_quantity ||
									0) -
									(getTotalLicenseRowData(data).in_use || 0) >
								0
									? (getTotalLicenseRowData(data)
											.user_quantity || 0) -
									  (getTotalLicenseRowData(data).in_use || 0)
									: 0}
							</div>
						</div>
					</div>
					{data?.renewal && data?.renewal?.date && (
						<div className="contract_details_section_insights">
							<div className="overview__top__next__ins1">
								Upcoming{" "}
								{data?.renewal?.type === RENEWAL_TYPE.PAYMENT
									? capitalizeFirstLetter(data?.renewal?.type)
									: "Renewal"}
							</div>
							<div className="overview__top__next__ins2">
								<img src={overview2} />
								<div className="app_details_header_text">
									{UTCDateFormatter(data?.renewal?.date)}
								</div>
							</div>
							<ContractRenewal
								renewal={data?.renewal}
								requestData={requestData}
								contractId={contractId}
							/>
						</div>
					)}
				</div>
			)}
		</>
	);
}
