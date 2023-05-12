import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Loader } from "../../../../../common/Loader/Loader";
import { MONTH } from "../../../../../utils/DateUtility";
import WorkflowError from "../../../../workflow/components/WorkflowError/WorkflowError";

export default function AutomationRuleLoader(props) {
	const history = useHistory();

	const [state] = useState(history?.location?.state);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (state) {
			create();
		}
		return () => {};
	}, [state]);

	const create = () => {
		const data = {
			name: `${
				state?.type === "onboarding" ? "Onboarding" : "Offboarding"
			} rule on ${new Date().getDate()} ${MONTH[new Date().getMonth()]}`,
			description: `Automatic trigger for ${
				state?.type
			} rule on ${new Date().getDate()} ${
				MONTH[new Date().getMonth()]
			} Requires no approval`,
			tag: state?.type,
			trigger: "",
		};
	};

	return (
		<>
			{error && (
				<WorkflowError
					title={"Rule Creation Failed"}
					type={state.type}
					hash={state.hash}
				/>
			)}
			{!error && (
				<div className="container-fluid">
					<div className="row">
						<div className="col-md-12 position-relative  vh-100">
							{state && (
								<div className="position-center text-center">
									<div>
										<Loader height={75} width={75} />
									</div>
									<h3 className="bold-600 black-1 font-18 mb-2">
										Creating new {state?.type} rule{" "}
									</h3>
									<p className="grey-1 o-8 ">
										fetching rule..
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
