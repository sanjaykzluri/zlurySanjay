import React from "react";
import { kFormatter } from "constants/currency";
import ContentLoader from "react-content-loader";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import { HeaderFormatter } from "modules/licenses/utils/LicensesUtils";
import {
	optimizationSummaryBlogLink,
	optimizationSummaryMetaCardTypes,
} from "../constants/OptimizationConstants";

export default function OptimizationSummaryMetaCards({
	summary,
	loading,
	selected_filter,
}) {
	return (
		<>
			{loading ? (
				<OptimizationSummaryMetaCardsLoader />
			) : (
				<div className="optimization_summary_meta_cards_container">
					<div className="optimization_summary_meta_title">
						<div className="font-14 bold-700">
							Savings Opportunity
						</div>
						<div className="font-11">
							Here is a snapshot of optimization summary of the
							applications in your organization based on past
							usage. Please generate optimization report for each
							application individually for detailed insights.
						</div>
					</div>
					{optimizationSummaryMetaCardTypes.map(
						(cardDetails, index) => (
							<div
								className="optimization_summary_meta_card"
								key={index}
							>
								<NumberPill
									number={kFormatter(
										summary?.[selected_filter]?.[
											cardDetails.amountKey
										]
									)}
									pillHeight={42}
									pillWidth={"fit-content"}
									borderRadius={32}
									fontSize={24}
									style={{
										padding: "8px",
									}}
									pillBackGround={cardDetails.pillBackground}
									fontColor={cardDetails.numberColor}
								/>
								<div>
									<div className="d-flex font-14 bold-600">
										<HeaderFormatter
											text={cardDetails.title}
											onClick={() =>
												window.open(
													optimizationSummaryBlogLink
												)
											}
										/>
									</div>
									<div className="font-10 grey">
										{cardDetails.desc}
									</div>
								</div>
							</div>
						)
					)}
				</div>
			)}
		</>
	);
}

function OptimizationSummaryMetaCardsLoader() {
	return (
		<div className="optimization_summary_meta_cards_container">
			<div className="optimization_summary_meta_title">
				<ContentLoader width={250} height={40}>
					<rect width="250" height="14" fill="#EBEBEB" />
					<rect width="250" height="11" y="16" fill="#EBEBEB" />
					<rect width="250" height="11" y="29" fill="#EBEBEB" />
				</ContentLoader>
			</div>
			{[1, 2, 3].map((index) => (
				<div className="optimization_summary_meta_card" key={index}>
					<ContentLoader width={"100%"} height={80}>
						<rect width="100%" height="42" fill="#EBEBEB" />
						<rect width="100%" height="14" y="50" fill="#EBEBEB" />
						<rect width="100%" height="10" y="66" fill="#EBEBEB" />
					</ContentLoader>
				</div>
			))}
		</div>
	);
}
