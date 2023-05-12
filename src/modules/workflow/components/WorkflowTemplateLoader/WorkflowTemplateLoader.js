import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Loader } from "../../../../common/Loader/Loader";
import { MONTH } from "../../../../utils/DateUtility";
import { TriggerIssue } from "../../../../utils/sentry";
import { createWorkflowTemplate } from "../../service/api";
import WorkflowError from "../WorkflowError/WorkflowError";

export default function WorkflowTemplateLoader(props) {
	const history = useHistory();
	const [state, setState] = useState(history?.location?.state);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (state) {
			create();
		}
	}, [state]);

	const create = () => {
		const data = {
			type: state.type,
			name: `${state.type} Playbook on ${new Date().getDate()} ${
				MONTH[new Date().getMonth()]
			}`,
		};
		createWorkflowTemplate({ workflow: data })
			.then((res) => {
				history.push(`/playbook/${res._id}`);
			})
			.catch((err) => {
				setError(true);
				TriggerIssue("Error on saving workplace playbook", err);
			});
	};

	return (
		<>
			{error && (
				<WorkflowError
					title={"Playbook Creation Failed"}
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
										Creating {state?.type} workflow
										playbook.
									</h3>
									<p className="grey-1 o-8 ">
										fetching apps..
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
