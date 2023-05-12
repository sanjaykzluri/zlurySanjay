import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Loader } from "../../../../common/Loader/Loader";
import { MONTH } from "../../../../utils/DateUtility";
import { TriggerIssue } from "../../../../utils/sentry";
import { createWorkflow } from "../../service/api";
import WorkflowError from "../WorkflowError/WorkflowError";

export default function WorkflowLoader(props) {
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
			users_ids: state.users.map((user) => user.user_id),
			type: state.type,
			name: `${state.type} ${state.users[0].user_name?.trim()} ${
				state.users.length > 1
					? `and ${state.users.length - 1} others `
					: ""
			}on ${new Date().getDate()} ${MONTH[new Date().getMonth()]}`,
		};
		createWorkflow(data)
			.then((res) => {
				history.push(`/workflow/${res._id}`);
			})
			.catch((err) => {
				setError(true);
				TriggerIssue("CreateWorflow failed", err);
			});
	};

	return (
		<>
			{error && (
				<WorkflowError
					title={"Workflow Creation Failed"}
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
										Creating {state?.type} workflow for{" "}
										{state?.users[0]?.user_name}{" "}
										{state.users.length > 1
											? ` and  ${
													state.users.length - 1
											  } others`
											: ""}
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
