import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import { screenEntity } from "modules/licenses/constants/LicenseConstants";
import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { UTCDateFormatter } from "utils/DateUtility";

export default function ReviewContractMiscDetails({ data, entity }) {
	return (
		<div
			className="d-flex justify-content-between mb-3"
			style={{ height: "73px" }}
		>
			<div className="d-flex flex-column mr-4">
				<div className="font-12 o-8 mb-3">Application</div>
				<div className="d-flex align-items-center">
					<GetImageOrNameBadge
						name={data.app_name}
						url={data.app_logo}
						height={28}
						width={28}
					/>
					<OverlayTrigger
						placement="top"
						overlay={<Tooltip>{data.app_name}</Tooltip>}
					>
						<div className="font-14 review-step-field-class ml-1">
							{data.app_name}
						</div>
					</OverlayTrigger>
				</div>
			</div>
			<div className="d-flex flex-column mr-4">
				<div className="font-12 o-8 mb-3">Vendor</div>
				<div className="flex flex-row align-items-center ">
					<GetImageOrNameBadge
						name={data.vendor_name}
						url={data.vendor_logo}
						height={28}
						width={28}
					/>
					<OverlayTrigger
						placement="top"
						overlay={<Tooltip>{data.vendor_name}</Tooltip>}
					>
						<div className="font-14 review-step-field-class ml-1">
							{data.vendor_name}
						</div>
					</OverlayTrigger>
				</div>
			</div>
			<div className="d-flex flex-column mr-4">
				<div className="font-12 o-8 mb-3">Owner</div>
				<div className="flex flex-row align-items-center">
					<GetImageOrNameBadge
						name={data.primary_owner_name}
						url={data.primary_owner_profile}
						height={28}
						width={28}
					/>
					<OverlayTrigger
						placement="top"
						overlay={<Tooltip>{data.primary_owner_name}</Tooltip>}
					>
						<div className="font-14 review-step-field-class ml-1">
							{data.primary_owner_name}
						</div>
					</OverlayTrigger>
				</div>
			</div>
			<div className="d-flex flex-column mr-4">
				<div className="font-12 o-8 mb-3">Start Date</div>
				<div className="font-14 mt-1">
					{UTCDateFormatter(data.start_date, "DD MMM 'YY")}
				</div>
			</div>
			{entity === screenEntity.CONTRACT && (
				<div className="d-flex flex-column mr-4">
					<div className="font-12 o-8 mb-3">End Date</div>
					<div className="font-14 mt-1">
						{UTCDateFormatter(data.end_date, "DD MMM 'YY")}
					</div>
				</div>
			)}
			{entity !== screenEntity.SUBSCRIPTION && (
				<div className="d-flex flex-column mr-4">
					<div className="font-12 o-8 mb-3">Payment Term</div>
					<div className="font-14 mt-1 text-capitalize">
						{data.payment_term === "one_time"
							? "One Time"
							: "Recurring"}
					</div>
					{data.payment_term === "recurring" && (
						<div className="font-10 o-8 mt-1 grey-1">
							Repeats on{" "}
							{UTCDateFormatter(
								data.payment_repeat_on,
								"DD MMM 'YY"
							)}
						</div>
					)}
				</div>
			)}
			{entity === screenEntity.SUBSCRIPTION && (
				<div className="d-flex flex-column mr-4">
					<div className="font-12 o-8 mb-3">Renewal Term</div>
					<div className="font-14 mt-1 text-capitalize">
						{`Every ${data.renewal_repeat_frequency} ${data.renewal_repeat_interval}`}
					</div>
					<div className="font-10 o-8 mt-1 grey-1">
						First Renewal on{" "}
						{UTCDateFormatter(data.next_renewal_date, "DD MMM 'YY")}
					</div>
				</div>
			)}
		</div>
	);
}
