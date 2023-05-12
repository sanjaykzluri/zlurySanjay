import React from "react";
import plusIcon from "../assets/icons/plus.svg";
import { CUSTOM_VIEW_NAME } from "../constants/views";

const SaveCustomView = ({
	group,
	groupByOptions,
	setShowCustomViewModal,
	setCustomViewSaved,
}) => {
	return (
		(group === CUSTOM_VIEW_NAME ||
			!groupByOptions.hasOwnProperty(CUSTOM_VIEW_NAME)) && (
			<>
				{" "}
				<hr
					style={{
						marginTop: "0px",
						marginBottom: "0px",
					}}
				/>
				<div
					onClick={() => {
						setShowCustomViewModal(true);
						setCustomViewSaved(false);
					}}
					className="px-2 py-3 font-12 cursor-pointer"
				>
					<span>
						<img width="18px" height="18px" src={plusIcon} />
					</span>
					Save Custom View
				</div>
				<hr className="m-0" />
			</>
		)
	);
};

export default SaveCustomView;
