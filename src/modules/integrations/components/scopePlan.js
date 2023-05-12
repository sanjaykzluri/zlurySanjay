import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { capitalizeFirstLetter } from "utils/common";

const ScopePlan = ({ scope }) => {
	return (
		<div className="flex">
			{scope.supported_plan_names?.length > 0 ? (
				<>
					<div>
						{Array.isArray(scope.supported_plan_names) &&
						scope.supported_plan_names.length > 0
							? scope.supported_plan_names
									?.slice(0, 1)
									.map((plan) => (
										<div className="mr-2 font-11">
											{capitalizeFirstLetter(plan)}
										</div>
									))
							: "All"}
					</div>
					<div>
						{Array.isArray(scope.supported_plan_names) &&
							scope?.supported_plan_names?.length > 1 && (
								<div>
									<OverlayTrigger
										placement="top"
										overlay={
											<Tooltip className={""}>
												<div className="text-capitalize">
													{scope.supported_plan_names?.join(
														", "
													)}
												</div>
											</Tooltip>
										}
									>
										<div className="grey-1 font-12">
											(+{" "}
											{scope.supported_plan_names.length -
												1}{" "}
											more)
										</div>
									</OverlayTrigger>
								</div>
							)}
					</div>
				</>
			) : (
				"All"
			)}
		</div>
	);
};

export default ScopePlan;
