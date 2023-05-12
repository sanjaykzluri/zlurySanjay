import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import OptimizationSummaryTable from "./OptimizationSummaryTable";
import OptimizationSummaryMetaCards from "./OptimizationSummaryMetaCards";
import OptimizationSummaryTableFilter from "./OptimizationSummaryTableFilter";
import { checkAndFetchOptimizationSummary } from "../redux/Optimization-action";
import HeaderTitleBC from "components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import emptyOptimizationSummary from "assets/optimization/emptyOptimizationSummary.svg";

export default function OptimizationSummary() {
	const dispatch = useDispatch();
	const { summary, selected_filter, loaded, loading, error } = useSelector(
		(state) => state.optimization.optimization_summary
	);

	useEffect(() => {
		if (!loaded) dispatch(checkAndFetchOptimizationSummary());
	}, [loaded]);

	const optimizationIsAvailable = () => {
		if (loading) {
			return true;
		}
		let flag = false;
		if (
			typeof summary === "object" &&
			Array.isArray(Object.keys(summary)) &&
			Object.keys(summary)?.length > 0
		) {
			if (
				Object.keys(summary)?.some(
					(filterKey) =>
						Array.isArray(summary?.[filterKey]?.data) &&
						summary?.[filterKey]?.data?.length > 0
				)
			) {
				flag = true;
			}
		} else {
			flag = false;
		}
		return flag;
	};

	return (
		<>
			<HeaderTitleBC title="Optimization Summary" isBeta={true} />
			<div className="optimization_summary_container">
				{optimizationIsAvailable() ? (
					<div className="optimization_summary_meta_cards_and_table_container">
						<OptimizationSummaryMetaCards
							summary={summary}
							loading={loading}
							selected_filter={selected_filter}
						/>
						<div>
							<OptimizationSummaryTableFilter
								loaded={loaded}
								summary={summary}
								loading={loading}
								selected_filter={selected_filter}
							/>
							<OptimizationSummaryTable
								error={error}
								loaded={loaded}
								loading={loading}
								summary={summary}
								selected_filter={selected_filter}
							/>
						</div>
					</div>
				) : (
					<OptimizationIsUnavailable error={error} />
				)}
			</div>
		</>
	);
}

function OptimizationIsUnavailable({ error }) {
	return (
		<>
			<div className="optimization_summary_empty_table_and_meta_cards">
				<img
					src={emptyOptimizationSummary}
					alt="EMPTY"
					width={300}
					height={181}
				/>
				{error ? (
					<div>
						There was an error in fetching the optimization
						insights.
					</div>
				) : (
					<div>
						There is not enough data to process the optimization
						insights. Please connect applications & upload
						contracts.
					</div>
				)}
			</div>
		</>
	);
}
