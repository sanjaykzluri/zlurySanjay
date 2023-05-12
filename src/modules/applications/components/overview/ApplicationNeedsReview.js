import React from "react";
import arrowdropdown from "../../../../components/Transactions/Unrecognised/arrowdropdown.svg";
import ApplicationAuthStatusDropdown from "./ApplicationAuthStatusDropdown";
import needsreview from "../../../../assets/applications/overviewneedsreview.svg";

export default function ApplicationNeedsReview({ app, onAppChange }) {
	const selectAuthBtn = (
		<div className="application-needs-review-select-auth-btn">
			<div className="font-13">Select Authorization</div>
			<img
				src={arrowdropdown}
				height={6}
				className="application-needs-review-select-auth-btn-arrow"
			/>
		</div>
	);

	return (
		<div
			className="application-needs-review-section position-relative"
			style={{ color: "#FFFFFF" }}
		>
			<div className="bold-600">Set authorization for this app</div>
			<ApplicationAuthStatusDropdown
				app={app}
				onAppChange={onAppChange}
				toggler={selectAuthBtn}
				tagClassName="cursor-pointer text-decoration-none"
			/>
			<img
				src={needsreview}
				className="position-absolute"
				style={{ right: "-4px", bottom: "0px" }}
			></img>
		</div>
	);
}
