import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Loader } from "common/Loader/Loader";
import { MONTH } from "utils/DateUtility";
import { TriggerIssue } from "utils/sentry";
import { createAutomationRule } from "modules/workflow/service/api";
import { trackActionSegment } from "modules/shared/utils/segment";

export default function EmployeeAutomationRuleLoader(props) {
	const history = useHistory();
	const location = useLocation();
	const dispatch = useDispatch();

	const [state, setState] = useState(history?.location?.state);

	useEffect(() => {
		if (state) {
			create();
		}
		return () => {};
	}, [state]);

	const create = () => {
		const data = {
			name: `New Approval Rule`,
			description: `Automatic trigger for Approval rule on ${new Date().getDate()} ${
				MONTH[new Date().getMonth()]
			} Requires no approval`,
			status: "inactive",
			tag: "apprequisition",
			//Tag Needs to be changed
			priority_order: 1,
			trigger: "",
		};
		createAutomationRule(data)
			.then((res) => {
				// dispatch(setEditAutomationRule(res));
				trackActionSegment(`New Rule Created `, {
					currentCategory: "Admin View - Workflows",
					currentPageName: "Automation Rules",
				});
				history.push({
					pathname: `/apprequisition/rule/${res._id}`,
					state: {
						type: state?.type,
					},
				});
			})
			.catch((err) => {
				TriggerIssue("CreateWorflow failed", err);
			});
	};

	return (
		<>
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
								<p className="grey-1 o-8 ">fetching rule..</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
