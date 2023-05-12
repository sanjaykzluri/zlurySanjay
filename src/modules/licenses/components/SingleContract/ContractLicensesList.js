import React from "react";
import ContentLoader from "react-content-loader";
import LicenseDetailsHeaders from "../ContractSteps/ContractStepsComponents/LicenseDetailsHeaders";
import LicenseDetailsInfoSection from "../ContractSteps/ContractStepsComponents/LicenseDetailsInfoSection";
import ReviewSetupDiscountTotal from "../ContractSteps/ContractStepsComponents/ReviewSetupDiscountTotal";

export default function ContractLicensesList({ data, loading, entity }) {
	return (
		<div
			className="d-flex flex-column"
			style={{ margin: "20px", overflowX: "auto" }}
		>
			<div className="contract-overview-license-list-container">
				{loading ? (
					<>
						<ContractLicensesListRowLoader />
						<ContractLicensesListRowLoader is_total_row={true} />
					</>
				) : (
					<>
						<LicenseDetailsHeaders
							entity={entity}
							overview={true}
						/>
						<LicenseDetailsInfoSection
							licenses={data?.licenses}
							entity={entity}
							overview={true}
						/>
						<ReviewSetupDiscountTotal
							data={data}
							entity={entity}
							overview={true}
						/>
					</>
				)}
			</div>
		</div>
	);
}

export function ContractLicensesListRowLoader({
	is_total_row = false,
	...props
}) {
	const loaderRows = [1, 2, 3].map((min_width, index) => (
		<div
			key={index}
			className="d-flex flex-row justify-content-between align-items-center border-1 p-3 border-radius-4 mb-2"
		>
			{["32.5%", "17.5%", "22.5%", "10%", "17.5%"].map((min_width) => (
				<div className="flex-fill" style={{ minWidth: min_width }}>
					<p className="bold-400 font-13 black-1 m-0  d-inline-block flex-fill">
						<ContentLoader
							speed={2}
							width={80}
							height={16}
							viewBox="0 0 80 16"
							backgroundColor="#f3f3f3"
							foregroundColor="#ecebeb"
							{...props}
						>
							<rect width="80" height="16" />
						</ContentLoader>
					</p>
				</div>
			))}
		</div>
	));

	const totalLoaderRow = (
		<div className="contract-overview-license-table-total-row px-3">
			{["50%", "22.5%", "10%", "17.5%"].map((min_width) => (
				<div className="flex-fill" style={{ minWidth: min_width }}>
					<p className="bold-400 font-13 black-1 m-0  d-inline-block flex-fill">
						<ContentLoader
							speed={2}
							width={80}
							height={16}
							viewBox="0 0 80 16"
							backgroundColor="#f3f3f3"
							foregroundColor="#ecebeb"
							{...props}
						>
							<rect width="80" height="16" />
						</ContentLoader>
					</p>
				</div>
			))}
		</div>
	);

	return is_total_row ? totalLoaderRow : loaderRows;
}
