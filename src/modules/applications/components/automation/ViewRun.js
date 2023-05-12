import React from "react";
import linkArrow from "assets/linkArrow.svg";

const ViewRun = ({ onClicked, text }) => {
	return (
		<>
			<div
				className="d-flex flex-row cursor-pointer "
				onClick={(e) => {
					e.stopPropagation();
					e.preventDefault();
					onClicked();
				}}
			>
				<div className="mr-1 primary-color"> {text || "View Run"} </div>
				<img
					style={{
						filter: "invert(57%) sepia(92%) saturate(4164%) hue-rotate(198deg) brightness(94%) contrast(93%)",
					}}
					src={linkArrow}
					alt=""
				/>
			</div>
		</>
	);
};

export default ViewRun;
