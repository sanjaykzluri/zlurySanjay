import React from "react";
import riskRed from "../../../assets/risk_rating_red.svg";
import riskYellow from "../../../assets/risk_rating_yellow.svg";
import riskGreen from "../../../assets/risk_rating_green.svg";
import riskGrey from "../../../assets/risk_rating_grey.svg";
import scopeRed from "../../../assets/scope_rating_red.svg";
import scopeYellow from "../../../assets/scope_rating_yellow.svg";
import scopeGreen from "../../../assets/scope_rating_green.svg";
import scopeGrey from "../../../assets/scope_rating_grey.svg";

const getIcon = (type, rating) => {
	switch (type) {
		case "risk":
			return getRiskIconByRating(rating);
		case "scope":
		default:
			return getScopeIconByRating(rating);
	}
};

const getGreyIcon = (type) => {
	switch (type) {
		case "risk":
			return riskGrey;
		case "scope":
		default:
			return scopeGrey;
	}
};

const getRiskIconByRating = (rate) => {
	if (rate <= 2) {
		return riskGreen;
	} else if (rate === 3) {
		return riskYellow;
	} else if (rate >= 4) {
		return riskRed;
	}
};

const getScopeIconByRating = (rate) => {
	if (rate <= 2) {
		return scopeGreen;
	} else if (rate === 3) {
		return scopeYellow;
	} else if (rate >= 4) {
		return scopeRed;
	}
};

export const labelTypes = {
	level: ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"],
};

export default function Rating({
	rating,
	iconType,
	labelType,
	width,
	height,
	showValueInsideIcon,
	valueTopPosition,
	valueLeftPosition,
	singleIcon,
}) {
	return (
		<div className="d-flex align-items-center">
			{!!labelType && (
				<span className="mr-2 font-14">
					{labelTypes[labelType]?.[rating - 1]}
				</span>
			)}
			{showValueInsideIcon ? (
				<div
					style={{ marginRight: "1px", height: height }}
					className="position-relative"
				>
					<img
						src={getIcon(iconType, rating)}
						height={height}
						width={width}
					/>
					<div
						className="font-10 position-absolute text-white bold-700"
						style={{
							top: valueTopPosition || "1px",
							left: valueLeftPosition || "3px",
						}}
					>
						{rating}
					</div>
				</div>
			) : (
				<div className="d-flex">
					{singleIcon ? (
						<div>
							<img src={getRiskIconByRating(iconType, rating)} />
							<img src={getIcon(iconType, rating)} />
						</div>
					) : (
						[...Array(5)].map((_, index) => (
							<div style={{ marginRight: "1px" }}>
								<img
									src={
										index + 1 <= rating
											? getIcon(iconType, rating)
											: getGreyIcon(iconType)
									}
									height={height}
									width={width}
								/>
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
}
