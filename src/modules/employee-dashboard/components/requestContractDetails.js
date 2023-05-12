import React from "react";
import { capitalizeFirstLetter } from "utils/common";
import overview1 from "assets/applications/overview1.svg";
import overview2 from "assets/applications/overview2.svg";
import overview3 from "assets/applications/overview3.svg";
import { kFormatter } from "constants/currency";
import overview_live_users from "assets/applications/overview_live_users.svg";
import { getTotalLicenseRowData } from "modules/licenses/utils/LicensesUtils";
import moment from "moment";
import { UTCDateFormatter } from "utils/DateUtility";
import "./overview.css";
import "modules/licenses/components/LicensesComponents.css";
import StatusPillAndDropdown from "modules/licenses/components/StatusPillAndDropdown/StatusPillAndDropdown";

export default function RequestContractDetails({
	loading,
	data,
	entity,
	requestData,
}) {
	const contractId = window.location.pathname.split("/")[3];
	return (
		<div
			className="request-contract-details"
			style={{ margin: "0px 10px" }}
		>
			{loading ? (
				<></>
			) : (
				<>
					<div className="d-flex flex-column mt-14px">
						<div className="overview__top__next__ins1">Status</div>
						<div className="overview__top__next__ins2">
							<StatusPillAndDropdown
								status={data?.contract_status}
							/>
						</div>
					</div>
					<div className="d-flex flex-column mt-14px">
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
					<div className="d-flex flex-column mt-14px">
						<div className="overview__top__next__ins1">
							Total Licenses
						</div>
						<div className="overview__top__next__ins2">
							<img src={overview1} />
							<div className="app_details_header_text">
								{data.total_licenses_count}
							</div>
						</div>
					</div>
					<div className="d-flex flex-column mt-14px">
						<div className="overview__top__next__ins1">
							Assigned Licenses
						</div>
						<div className="overview__top__next__ins2">
							<img src={overview_live_users} />
							<div className="app_details_header_text">
								{data.assigned_license_count}
							</div>
						</div>
					</div>
					<div className="d-flex flex-column mt-14px">
						<div className="overview__top__next__ins1">
							Unassigned Licenses
						</div>
						<div className="overview__top__next__ins2">
							<img src={overview3} />
							<div className="app_details_header_text">
								{data.unassigned_license_count}
							</div>
						</div>
					</div>
					{data?.payment_repeat_on && (
						<div className="d-flex flex-column mt-14px">
							<div className="overview__top__next__ins1">
								Upcoming Renewal
							</div>
							<div className="overview__top__next__ins2">
								<img src={overview2} />
								<div className="app_details_header_text">
									{UTCDateFormatter(data?.payment_repeat_on)}
								</div>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
