import React, { Component, useState, useEffect } from "react";
import "./Recommendations.css";
import navimage from "./navimage.svg";
import adobe from "../../../assets/transactions/adobe.svg";
import arrow from "./arrow.svg";
import empty from "./empty.svg";
import activitymanager from "./activitymanager.svg";
import ContentLoader from "react-content-loader";
import { kFormatter } from "../../../constants/currency";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import { useLocation } from "react-router-dom";

export function RecommendationFilter({
	application,
	appRecommendations,
	loadingRecommendations,
}) {
	const location = useLocation();
	const dispatch = useDispatch();
	const getRecommendationText = (recommendation, key, boldText = true) => {
		let textObject;
		if (boldText) {
			textObject = {
				no_activity_in_30_days: `No activity for ${
					recommendation.user_count > 1
						? `${recommendation.user_count} users in`
						: `${recommendation.user_count} user in`
				} the app in the last 30 days`,
				low_usage: `Low usage for ${
					recommendation.user_count > 1
						? `${recommendation.user_count} users in`
						: `${recommendation.user_count} user in`
				} the app in the last 30 days`,
				deprovisioned: `${
					recommendation.user_count > 1
						? `${recommendation.user_count} users `
						: `${recommendation.user_count} user`
				} not deprovisioned in the app`,
			};
		} else {
			textObject = {
				no_activity_in_30_days: `${
					recommendation.user_count > 1
						? `users have not used the app in the last 30 days`
						: `has not used the app in the last 30 days`
				}`,
				low_usage: `${
					recommendation.user_count > 1
						? `users have app usage < 30% in the last 30 days`
						: `has app usage < 30% in the last 30 days`
				}`,
				deprovisioned: `${
					recommendation.user_count > 1
						? `users are marked inactive in SSO but not in`
						: `is marked inactive in SSO but not in`
				} ${application?.app_name}`,
			};
		}

		return textObject[key];
	};

	const getUserCountInfoText = (recommendation, key) => {
		let lengthOfRemainingUsers = recommendation?.users?.length - 1;
		let text = ` ${
			recommendation?.user_count > 1
				? `${recommendation?.users?.[0]?.user_name} and ${lengthOfRemainingUsers} other`
				: `${recommendation?.users?.[0]?.user_name} `
		} `;
		return text;
	};
	const handleClickOnReview = (recommendation) => {
		let IdArray;
		IdArray = recommendation.users.map((el) => el.user_id);
		let metaData = {};
		metaData.filter_by = [
			{
				field_name: "User Id",
				filter_type: "objectId",
				field_values: IdArray,
				field_id: "user_id",
				negative: false,
				is_custom: false,
			},
		];
		dispatch(
			push(
				`${location.pathname}?metaData=${JSON.stringify(
					metaData
				)}#users`
			)
		);
	};
	return (
		<>
			{loadingRecommendations ? (
				<>
					<div className="Recomm__container">
						<div className="Recomm__container__ins1">
							<div className="Recomm__div1">
								<ContentLoader width={91} height={10}>
									<rect
										width="91"
										height="10"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<div className="Recomm__div2 bold-600">
								<ContentLoader width={91} height={10}>
									<rect
										width="91"
										height="10"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<div
								className="Recomm__div4"
								style={{ marginTop: "20px" }}
							>
								<ContentLoader width={200} height={20}>
									<rect
										width="200"
										height="20"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<div
								className="Recomm__div4"
								style={{ marginTop: "20px" }}
							>
								<ContentLoader width={200} height={20}>
									<rect
										width="200"
										height="20"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<div
								className="Recomm__div4"
								style={{ marginTop: "40px" }}
							>
								<ContentLoader width={120} height={20}>
									<rect
										width="120"
										height="20"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
						</div>
					</div>
				</>
			) : Array.isArray(appRecommendations) &&
			  appRecommendations.length > 0 ? (
				<div className="Recomm__container">
					{appRecommendations.map((recommendation, index) => (
						<>
							{!isNaN(
								recommendation?.[
									Object.keys(recommendation)?.[0]
								]?.user_count
							) &&
								recommendation?.[
									Object.keys(recommendation)?.[0]
								]?.user_count > 0 && (
									<div className="Recomm__container__ins1 position-relative">
										<div className="Recomm__div1">
											<img src={activitymanager}></img>
											<div className="grey-1 font-12 ml-1">
												Activity Manager
											</div>
										</div>
										<div className="Recomm__div2 bold-600">
											{getRecommendationText(
												appRecommendations?.[index][
													Object.keys(
														recommendation
													)[0]
												],
												Object.keys(recommendation)[0],
												true
											)}
										</div>
										<div className="Recomm__div4">
											{`${getUserCountInfoText(
												appRecommendations?.[index][
													Object.keys(
														recommendation
													)[0]
												],
												Object.keys(recommendation)[0]
											)} ${getRecommendationText(
												appRecommendations?.[index][
													Object.keys(
														recommendation
													)[0]
												],
												Object.keys(recommendation)[0],
												false
											)} `}
										</div>
										<div className="Recomm__div3">
											<div>
												<img src={arrow}></img>{" "}
											</div>
											<div className="Recomm__div3__text1 font-14">
												{kFormatter(
													appRecommendations?.[index][
														Object.keys(
															recommendation
														)[0]
													]?.savings
												)}
											</div>
											<div className="Recomm__div3__text2 font-14">
												in Potential Savings
											</div>
										</div>
										<button
											className="recomm__button2"
											type="sumbit"
										>
											<span
												id="recomm__textbutton"
												onClick={() =>
													handleClickOnReview(
														appRecommendations?.[
															index
														][
															Object.keys(
																recommendation
															)[0]
														]
													)
												}
											>
												Review Now
											</span>
										</button>
									</div>
								)}
						</>
					))}
				</div>
			) : (
				<div
					style={{
						width: "100%",
						display: "flex",
						justifyContent: "center",
						paddingTop: "147px",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<img src={empty}></img>
					<div className="empty__recomm__d1">
						You're all caught up!
					</div>
					<div className="empty__recomm__d2">
						There are no recommendations
					</div>
				</div>
			)}
		</>
	);
}
